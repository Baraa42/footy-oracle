/* eslint-disable node/no-missing-import */
/* eslint-disable no-undef */
import { ethers } from "hardhat";
import { BigNumberish, Signer, utils } from "ethers";
import { expect } from "chai";
import { BettingContract } from "../typechain";

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

/**
 * Deploy contract helper
 *
 * @param eventId
 * @returns
 */
export const deployBettingContract = async (
  eventId: string = "123456"
): Promise<BettingContract> => {
  const BettingContract = await ethers.getContractFactory("BettingContract");
  const bettingContract = await BettingContract.deploy(eventId);
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
 * Places the bet and wrappes it into an expectation
 *
 * @param  {BettingContract} contract
 * @param  {Bet} bet
 * @returns Chai
 */
export const getBetExpectation = (
  contract: BettingContract,
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
 * @param  {BettingContract} contract
 * @param  {string} event
 * @param  {Bet} bet
 * @returns Promise
 */
export const checkBetEventFromExpectation = async (
  expectation: Chai.Assertion,
  contract: BettingContract,
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
