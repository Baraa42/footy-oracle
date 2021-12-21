/* eslint-disable node/no-missing-import */
/* eslint-disable no-undef */
import { ethers } from "hardhat";
import { BigNumberish, Event, Signer, utils } from "ethers";
import { expect } from "chai";
import { Betting } from "../typechain/Betting";
import { SoccerResolver } from "../typechain/SoccerResolver";
import { BetNFT } from "../typechain";
import crypto, { randomInt } from "crypto";

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
 * Deploy SoccerResolver Contract helper
 *
 * @param eventId
 * @returns
 */
export const deploySoccerResolverContract =
  async (): Promise<SoccerResolver> => {
    const ResolverContract = await ethers.getContractFactory("SoccerResolver");
    const resolverContract: SoccerResolver = await ResolverContract.deploy();
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
 * After 5 their will be duplicated accounts, which can resolve in problems
 *
 * @param  {number=3} count
 * @returns Promise
 */
export const betFactory = async (count: number = 5): Promise<BetFactory> => {
  const factory: BetFactory = { backBets: [], layBets: [] };
  const accounts = await ethers.getSigners();

  for (let i = 0; i < count; i++) {
    const betType = 0;
    const selection = crypto.randomInt(0, 2);
    const odds = utils.formatUnits(crypto.randomInt(110, 500).toString(), 2); // random odds from 1.10 to 5
    const amount = utils.formatUnits(crypto.randomInt(11, 200).toString(), 2); // random amount from 0.01 to 2
    factory.backBets.push(
      generateBet(0, betType, selection, odds, amount, accounts[i])
    );
    factory.layBets.push(
      generateBet(1, betType, selection, odds, amount, accounts[10 - i])
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
