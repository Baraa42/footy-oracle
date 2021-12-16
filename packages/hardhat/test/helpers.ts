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
 * Generate bet helper
 *
 * @param betSide
 * @param betType
 * @param selection
 * @param odds
 * @param amount
 * @param address
 * @returns
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
  };
  return bet;
};

/**
 * Bet event expectation helper
 *
 * @param contract
 * @param bet
 * @returns
 */
export const getBetExpectation = (contract: BettingContract, bet: Bet) => {
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
 * Check event from expectation helper
 *
 * @param expectation
 * @param contract
 * @param event
 * @param bet
 * @returns
 */
export const checkBetEventFromExpectation = async (
  expectation: Chai.Assertion,
  contract: BettingContract,
  event: string,
  bet: Bet
) => {
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
