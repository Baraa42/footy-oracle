/* eslint-disable no-unused-vars */
/* eslint-disable node/no-missing-import */
import { BigNumber, BigNumberish, Signer, utils } from "ethers";
import { waffle, ethers } from "hardhat";
import { expect } from "chai";
import crypto, { randomInt } from "crypto";

import {
  Bet,
  betFactory,
  checkBetEventFromExpectation,
  deployBettingContract,
  deployContracts,
  generateBet,
  getBetExpectation,
  mulMathSave,
  deployMarketMakerContract,
  getDepositExpectation,
  getWithdrawExpectation,
  checkDepositEventFromExpectation,
  checkWithdrawEventFromExpectation,
  getCreateOpposingBetExpectation,
  checkCreateOpposingBetEventFromExpectation
} from "./helpers";
import { Betting } from "../typechain/Betting";
import { BetNFT, SoccerResolver, LPNFT, MarketMaker } from "../typechain";
const { deployContract } = waffle;

describe("MarketMakerContract", function () {
  let accounts: Signer[];
  let bettingContract: Betting;
  let resolver: SoccerResolver;
  let betNFT: BetNFT;
  let lpNFT: LPNFT;
  let marketMakerContract: MarketMaker;

  /**
   * Generate resolver and betNFT Contract only once for all tests
   */
  before(async function () {
    const { resolver: _resolver, betNFT: _betNFT, lpNFT : _lpNFT } = await deployContracts();
    resolver = _resolver;
    betNFT = _betNFT;
    lpNFT = _lpNFT;
    accounts = await ethers.getSigners();
  });

  /**
   * Generate accounts, random values and deploys the contract for each test
   */
  beforeEach(async function () {
    accounts = await ethers.getSigners();
    bettingContract = await deployBettingContract("12345", resolver, betNFT);
    //create a marketMaker to test matching unmatched bets with marketMakers funds.
    marketMakerContract = await deployMarketMakerContract(lpNFT);    
    console.log('marketMakerContract address = ', marketMakerContract.address);
  });

  it("deposit and withdraw funds from MarketMaker", async function () {

    var tokenId = await lpNFT.getNextFreeTokenId();
    var depositAmount = ethers.utils.parseEther("1.0");
    var dummyURI = "uri3";

    const depositExpectation = getDepositExpectation(
                                 marketMakerContract,
                                 accounts[0],
                                 dummyURI,
                                 depositAmount);
    await checkDepositEventFromExpectation(
      depositExpectation,
      marketMakerContract,
      "DepositCompleted",
      tokenId,
      dummyURI,
      depositAmount,
    );

    const withdrawExpectation = getWithdrawExpectation(
                                  marketMakerContract,
                                  accounts[0],
                                  tokenId);
    await checkWithdrawEventFromExpectation(
      withdrawExpectation,
      marketMakerContract,
      "WithdrawalCompleted",
      tokenId,
      depositAmount,
    );
  });
  
  it("use deposited funds to match an unmatched bet", async function () {

    //Deposit a certain amount to be used for betting.
    var tokenId = await lpNFT.getNextFreeTokenId();
    // var depositAmount = ethers.utils.parseEther("1.53");
    var depositAmount = ethers.utils.parseEther("10");
    var dummyURI = "uri3";
    const depositExpectation = getDepositExpectation(
                                 marketMakerContract,
                                 accounts[0],
                                 dummyURI,
                                 depositAmount);
    await checkDepositEventFromExpectation(
      depositExpectation,
      marketMakerContract,
      "DepositCompleted",
      tokenId,
      dummyURI,
      depositAmount,
    );

    // Create a Lay bet by a user. 
    const bets = await betFactory(4);
    const layBetExpectation = getBetExpectation(bettingContract, bets.layBets[0]);
    await checkBetEventFromExpectation(
      layBetExpectation,
      bettingContract,
      "UnmatchedBetPlaced",
      bets.layBets[0]
    );

    // Now MarketMaker will create a matching bet
    var maxAmountForAnyBet = ethers.utils.parseEther(".01");
    const createOpposingBackBetExpectation = getCreateOpposingBetExpectation(
                                              marketMakerContract,
                                              bettingContract,
                                              bets.layBets[0]);

    await checkCreateOpposingBetEventFromExpectation(
      createOpposingBackBetExpectation,
      marketMakerContract,
      bettingContract,
      "MarketMakerCreateBackBet",
      bets.layBets[0],
      maxAmountForAnyBet
    );

    // Create a Back bet by a user. 
    const backBetExpectation = getBetExpectation(bettingContract, bets.backBets[1]);
    await checkBetEventFromExpectation(
      backBetExpectation,
      bettingContract,
      "UnmatchedBetPlaced",
      bets.backBets[1]
    );
    
    // Now MarketMaker will create a matching bet (lay bet)
    console.log('liabilityParse = ', bets.backBets[1].liabilityParsed);
    console.log('oddsParsed = ', bets.backBets[1].oddsParsed)
    const createOpposingLayBetExpectation = getCreateOpposingBetExpectation(
                                              marketMakerContract,
                                              bettingContract,
                                              bets.backBets[1]);
    await checkCreateOpposingBetEventFromExpectation(
      createOpposingLayBetExpectation,
      marketMakerContract,
      bettingContract,
      "MarketMakerCreateLayBet",
      bets.backBets[1],
      bets.backBets[1].liabilityParsed
    ); 
  });
});