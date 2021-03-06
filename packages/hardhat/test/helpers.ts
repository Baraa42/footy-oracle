/* eslint-disable node/no-missing-import */
/* eslint-disable no-undef */
import { ethers } from "hardhat";
import { BigNumberish, Event, Signer, utils } from "ethers";
import { expect } from "chai";
import { Betting } from "../typechain/Betting";
import { SoccerResolver } from "../typechain/SoccerResolver";
import {
  BetNFT,
  ERC721,
  LinkToken,
  MockOracle,
  MarketMaker,
  LPNFT,
  BenqiLosslessDummy
} from "../typechain";
import crypto from "crypto";
import { formatEther } from "ethers/lib/utils";

export interface Bet {
  betSide: BigNumberish;
  betType: BigNumberish;
  selection: BigNumberish;
  amount: string;
  odds: string;
  amountParsed: BigNumberish;
  oddsParsed: BigNumberish;
  liabilityParsed: BigNumberish;
  account: Signer;
  copyWithNewAmount(amount: string): Bet;
}

export interface BetFactory {
  backBets: Bet[];
  layBets: Bet[];
}

/**
 * Deploy BetNFT Contract helper
 *
 * @param eventId
 * @returns
 */
export const deployBetNFTContract = async (): Promise<BetNFT> => {
  const BetNFTContract = await ethers.getContractFactory("BetNFT");
  const betNFTContract: BetNFT = await BetNFTContract.deploy("BetNFT", "BET");
  await betNFTContract.deployed();
  return betNFTContract;
};

/**
 * Deploy LPNFT Contract helper
 *
 * @param eventId
 * @returns
 */
export const deployLPNFTContract = async (): Promise<LPNFT> => {
  const LPNFTContract = await ethers.getContractFactory("LPNFT");
  const lpNFTContract: LPNFT = await LPNFTContract.deploy("LP NFT!", "LPNFT1");
  await lpNFTContract.deployed();
  return lpNFTContract;
};

/**
 * Deploy Link Token Contract helper
 *
 * @param eventId
 * @returns
 */
export const deployLinkToken = async (): Promise<LinkToken> => {
  const LinkToken = await ethers.getContractFactory("LinkToken");
  const linkToken: LinkToken = await LinkToken.deploy();
  await linkToken.deployed();
  return linkToken;
};

/**
 * Deploy Oracle Test Client
 *
 * @param eventId
 * @returns
 */
export const deployOracleContract = async (
  linkToken: LinkToken
): Promise<MockOracle> => {
  const MockOracle = await ethers.getContractFactory("MockOracle");
  const mockOracle: MockOracle = await MockOracle.deploy(linkToken.address);
  await mockOracle.deployed();
  return mockOracle;
};

/**
 * Deploy SoccerResolver Contract helper
 *
 * @param eventId
 * @returns
 */
export const deploySoccerResolverContract = async (
  oracle: MockOracle,
  linkToken: LinkToken
): Promise<SoccerResolver> => {
  const ResolverContract = await ethers.getContractFactory("SoccerResolver");
  const resolverContract: SoccerResolver = await ResolverContract.deploy(
    oracle.address,
    ethers.utils.toUtf8Bytes("29fa9aa13bf1468788b7cc4a500a45b8"), // localhost jobId -> https://github.com/smartcontractkit/hardhat-starter-kit/blob/main/helper-hardhat-config.js
    linkToken.address
  );
  await resolverContract.deployed();
  return resolverContract;
};

/**
 * Deploy Betting Contract helper
 *
 * @param eventId
 * @returns
 */
export const deployBettingContract = async (
  eventId: string = "123456",
  resolver: SoccerResolver,
  betNFT: BetNFT
): Promise<Betting> => {
  const BettingContract = await ethers.getContractFactory("Betting");
  const bettingContract: Betting = await BettingContract.deploy(
    eventId,
    resolver.address,
    betNFT.address
  );
  await bettingContract.deployed();
  return bettingContract;
};

export const deployMarketMakerContract = async (
  lpNFT: LPNFT
): Promise<MarketMaker> => {
  const MarketMakerContract = await ethers.getContractFactory("MarketMaker");
  const marketMakerContract: MarketMaker = await MarketMakerContract.deploy(
    lpNFT.address
  );
  await marketMakerContract.deployed();
  return marketMakerContract;
};

export const deployLosslessContract = async (): Promise<BenqiLosslessDummy> => {
  const BenqiLosslessDummyContract = await ethers.getContractFactory("BenqiLosslessDummy");
  const benqiLosslessDummyContract: BenqiLosslessDummy = await BenqiLosslessDummyContract.deploy();
  await benqiLosslessDummyContract.deployed();
  return benqiLosslessDummyContract;
};

export const deployContracts = async () => {
  const linkToken = await deployLinkToken();
  const oracle = await deployOracleContract(linkToken);
  const resolver = await deploySoccerResolverContract(oracle, linkToken);

  await linkToken.functions.transfer(resolver.address, "1000000000000000000");

  const betNFT = await deployBetNFTContract();
  const lpNFT = await deployLPNFTContract();

  return {
    linkToken,
    oracle,
    resolver,
    betNFT,
    lpNFT,
  };
};

/**
 * Creates bet object for consistent usage insides test
 *
 * @param  {number} betSide
 * @param  {number} betType
 * @param  {number} selection
 * @param  {string} odds
 * @param  {string} amount
 * @param  {Signer} account
 * @returns Bet
 */
export const generateBet = (
  betSide: number,
  betType: number,
  selection: number,
  odds: string,
  amount: string,
  account: Signer
): Bet => {
  const amountParsed = utils.parseUnits(amount.toString(), "ether");
  const oddsParsed = utils.parseUnits(odds.toString(), 3);
  const liabilityParsed = amountParsed.mul(oddsParsed.sub(1000)).div(1000);

  const bet: Bet = {
    betSide: betSide,
    betType: betType,
    selection: selection,
    odds: odds,
    amount: amount,
    amountParsed: amountParsed,
    oddsParsed: oddsParsed,
    liabilityParsed: liabilityParsed,
    account: account,
    copyWithNewAmount: function (newAmount: string): Bet {
      return generateBet(betSide, betType, selection, odds, newAmount, account);
    },
  };

  return bet;
};

/**
 * Creates random bets that can match
 * Same index in lay and back array can match
 *
 * After 4 their will be duplicated accounts, which can resolve in problems
 *
 * @param  {number=4} count
 * @returns Promise
 */
export const betFactory = async (count: number = 4): Promise<BetFactory> => {
  const factory: BetFactory = { backBets: [], layBets: [] };
  const accounts = await ethers.getSigners(); // accounts[0] is reserved as account for testing

  for (let i = 0; i < count; i++) {
    const betType = 0;
    const selection = 1;
    const odds = utils.formatUnits(crypto.randomInt(110, 500).toString(), 2); // random odds from 1.10 to 5
    const amount = utils.formatUnits(crypto.randomInt(11, 200).toString(), 2); // random amount from 0.01 to 2
    factory.backBets.push(
      generateBet(0, betType, selection, odds, amount, accounts[i + 1])
    );
    factory.layBets.push(
      generateBet(1, betType, selection, odds, amount, accounts[10 - (i - 1)])
    );
  }
  return factory;
};

/**
 * Places bet and wait for it
 *
 * @param  {Betting} contract
 * @param  {Bet} bet
 * @returns Promise
 */
export const placeBet = async (contract: Betting, bet: Bet): Promise<void> => {
  let betTx: any;
  if (bet.betSide === 0) {
    betTx = await contract
      .connect(bet.account)
      .createBackBet(
        bet.betType,
        bet.selection,
        bet.oddsParsed,
        bet.amountParsed,
        {
          value: bet.amountParsed,
        }
      );
  } else {
    betTx = await contract
      .connect(bet.account)
      .createLayBet(
        bet.betType,
        bet.selection,
        bet.oddsParsed,
        bet.amountParsed,
        {
          value: bet.liabilityParsed,
        }
      );
  }
  await betTx.wait();
};

/**
 * Mint bet and wait for it
 *
 * @param  {Betting} contract
 * @param  {Bet} bet
 * @returns Promise
 */
export const mintBet = async (
  contract: Betting,
  bet: Bet
): Promise<BigNumberish> => {
  const mintTx = await contract
    .connect(bet.account)
    .transferBetToNFT(
      bet.betSide,
      bet.betType,
      bet.selection,
      bet.oddsParsed,
      ""
    );
  const waited = await mintTx.wait();

  const event = waited.events?.filter(
    (event: Event) => event.event === "BetMinted"
  )[0];

  const tokenId = event?.args?.tokenId;
  return tokenId;
};

/**
 * Mint bet and wrappes it into an expectation
 *
 * @param  {Betting} contract
 * @param  {Bet} bet
 * @returns Chai
 */
export const getMintExpectation = (
  contract: Betting,
  bet: Bet,
  overrideAccount?: Signer
): Chai.Assertion => {
  return expect(
    contract
      .connect(overrideAccount || bet.account)
      .transferBetToNFT(
        bet.betSide,
        bet.betType,
        bet.selection,
        bet.oddsParsed,
        ""
      )
  );
};

/**
 * Places the bet and wrappes it into an expectation
 *
 * @param  {Betting} contract
 * @param  {Bet} bet
 * @returns Chai
 */
export const getBetExpectation = (
  contract: Betting,
  bet: Bet
): Chai.Assertion => {
  if (bet.betSide === 0) {
    return expect(
      contract
        .connect(bet.account)
        .createBackBet(
          bet.betType,
          bet.selection,
          bet.oddsParsed,
          bet.amountParsed,
          {
            value: bet.amountParsed,
          }
        )
    );
  } else {
    return expect(
      contract
        .connect(bet.account)
        .createLayBet(
          bet.betType,
          bet.selection,
          bet.oddsParsed,
          bet.amountParsed,
          {
            value: bet.liabilityParsed,
          }
        )
    );
  }
};

/**
 * Checks inside expectation, if event is emited with with args from bet
 *
 * @param  {Chai.Assertion} expectation
 * @param  {Betting} contract
 * @param  {string} event
 * @param  {Bet} bet
 * @returns Promise
 */
export const checkBetEventFromExpectation = async (
  expectation: Chai.Assertion,
  contract: Betting,
  event: string,
  bet: Bet
): Promise<Chai.AsyncAssertion> => {
  return await expectation?.to
    .emit(contract, event)
    .withArgs(
      bet.betSide,
      bet.betType,
      bet.selection,
      bet.oddsParsed,
      bet.amountParsed,
      await bet.account.getAddress()
    );
};

/**
 * Deposit Amount in LP
 *
 * @param  {MarketMaker} contract
 * @param  {string} IPFS URI
 * @param  {uint} depsoit amount
 * @returns Chai
 */
export const getDepositExpectation = (
  contract: MarketMaker,
  account: Signer,
  uri: string,
  depositAmount: BigNumberish
): Chai.Assertion => {
  return expect(
    contract.connect(account).deposit(uri, { value: depositAmount })
  );
};

/**
 * Checks inside expectation, if event is emited with with args from MarketMaker
 *
 * @param  {Chai.Assertion} expectation
 * @param  {MarketMaker} contract
 * @param  {string} event
 * @param  {BigNumberish} tokenId
 * @param  {string} IPFS URI
 * @param  {uint} depsoit amount
 * @returns Promise
 */
export const checkDepositEventFromExpectation = async (
  expectation: Chai.Assertion,
  contract: MarketMaker,
  event: string,
  tokenId: BigNumberish,
  uri: string,
  depositAmount: BigNumberish
): Promise<Chai.AsyncAssertion> => {
  return await expectation?.to
    .emit(contract, event)
    .withArgs(tokenId, uri, depositAmount);
};

/**
 * Withdraw Amount from LP
 *
 * @param  {MarketMaker} contract
 * @param  {number} tokenId
 * @returns Chai
 */
export const getWithdrawExpectation = (
  contract: MarketMaker,
  account: Signer,
  tokenId: BigNumberish
): Chai.Assertion => {
  return expect(contract.connect(account).withdraw(tokenId));
};

/**
 * Checks inside expectation, if event is emited with with args from MarketMaker
 *
 * @param  {Chai.Assertion} expectation
 * @param  {MarketMaker} contract
 * @param  {string} event
 * @param  {BigNumberish} tokenId
 * @param  {uint} depsoit amount
 * @returns Promise
 */
export const checkWithdrawEventFromExpectation = async (
  expectation: Chai.Assertion,
  contract: MarketMaker,
  event: string,
  tokenId: BigNumberish,
  depositAmount: BigNumberish
): Promise<Chai.AsyncAssertion> => {
  return await expectation?.to
    .emit(contract, event)
    .withArgs(tokenId, depositAmount);
};

/**
 * Withdraw Amount from LP
 *
 * @param  {MarketMaker} marketMakercontract
 * @param  {Betting} bettingContract
 * @param  {Bet} bet
 * @returns Chai
 */
export const getCreateOpposingBetExpectation = (
  marketMakercontract: MarketMaker,
  bettingContract: Betting,
  bet: Bet
): Chai.Assertion => {
  //if user bet is lay, market maker should create back bet
  if (bet.betSide === 1) {
    return expect(
      marketMakercontract
        .connect(bet.account)
        .createOpposingBackBet(
          bettingContract.address,
          bet.betType,
          bet.selection,
          bet.oddsParsed
        )
    );
  } else {
    return expect(
      marketMakercontract
        .connect(bet.account)
        .createOpposingLayBet(
          bettingContract.address,
          bet.betType,
          bet.selection,
          bet.oddsParsed,
          bet.amountParsed,
          bet.liabilityParsed
        )
    );
  }
};

/**
 * Checks inside expectation, if event is emited with with args from MarketMaker
 *
 * @param  {Chai.Assertion} expectation
 * @param  {MarketMaker} contract
 * @param  {string} event
 * @param  {Bet} bet
 * @param  {BigNumberish} amount
 * @returns Promise
 */
export const checkCreateOpposingBetEventFromExpectation = async (
  expectation: Chai.Assertion,
  marketMakercontract: MarketMaker,
  bettingContract: Betting,
  event: string,
  bet: Bet,
  amount: BigNumberish
): Promise<Chai.AsyncAssertion> => {
  /*
// Unable verify event generated by createBackBet call made by MarketMaker. 
// Verified by adding console.log 
// Creating back bet  1000000000000153
// createOpposingBackBet completed. Amount= 1000000000000153
  var backBet = ethers.utils.parseEther("0");
  var bettingEvent = await expectation?.to
    .emit(bettingContract, "MatchedBetPlaced")
    .withArgs(
      backBet,
      bet.selection,
      bet.oddsParsed,
      amount);
*/
  //if user bet is lay, market maker should create back bet
  if (bet.betSide === 1) {
    return await expectation?.to
      .emit(marketMakercontract, event)
      .withArgs(bet.betType, bet.selection, bet.oddsParsed, amount);
  } else {
    return await expectation?.to
      .emit(marketMakercontract, event)
      .withArgs(bet.betType, bet.selection, bet.oddsParsed, amount);
  }
};

/**
 * Send ERC721 Token
 *
 * @param  {ERC721} contract
 * @param  {number} tokenId
 * @param  {Signer} from
 * @param  {Signer} to
 * @returns Promise
 */
export const sendERC721 = async (
  contract: ERC721,
  from: Signer,
  to: Signer,
  tokenId: BigNumberish
): Promise<any> => {
  const fromAddr = await from.getAddress();
  const toAddr = await to.getAddress();
  return await contract.connect(from).transferFrom(fromAddr, toAddr, tokenId);
};

/**
 * Sets result base on bet selection
 * Currently only works with BetType 0 Match Winners
 *
 * @param  {MockOracle} contract
 * @param  {string} event
 * @param  {BigNumberish} selection
 * @returns Promise
 */
export const setOracleResult = async (
  contract: MockOracle,
  event: string,
  selection: BigNumberish
): Promise<any> => {
  let parsedSelection;
  if (selection === 0) {
    parsedSelection = 1;
  } else if (selection === 1) {
    parsedSelection = 3;
  } else {
    parsedSelection = 2;
  }
  const resultTx = await contract.functions.setResult(event, parsedSelection);
  await resultTx.wait();
  return parsedSelection;
};

export const getRandomObjectId = (): string => {
  return String(crypto.randomInt(100000, 999999));
};

/**
 * Muliplies math save a number with decimals inside a string
 *
 * @param  {string} value
 * @param  {number} mul
 * @returns string
 */
export const mulMathSave = (value: string, mul: number): string => {
  return utils.formatEther(utils.parseUnits(value).mul(mul));
};

/**
 * Divides math save a number with decimals inside a string
 *
 * @param  {string} value
 * @param  {number} div
 * @returns string
 */
export const divMathSave = (value: string, div: number): string => {
  return utils.formatEther(utils.parseUnits(value).div(div));
};

/**
 * Adds math save a number with decimals inside a string
 *
 * @param  {string} value
 * @param  {number} add
 * @returns string
 */
export const addMathSave = (value: string, add: number): string => {
  return utils.formatEther(utils.parseUnits(value).add(add));
};

/**
 * Subtracts math save a number with decimals inside a string
 *
 * @param  {string} value
 * @param  {number} sub
 * @returns string
 */
export const subMathSave = (value: string, sub: number): string => {
  return utils.formatEther(utils.parseUnits(value).sub(sub));
};
