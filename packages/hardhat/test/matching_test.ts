/* eslint-disable no-unused-vars */
/* eslint-disable node/no-missing-import */
import { BigNumber, BigNumberish, Signer, utils } from "ethers";
import { waffle, ethers } from "hardhat";
import { expect } from "chai";
import crypto, { randomInt } from "crypto";

import {
  Bet,
  checkBetEventFromExpectation,
  deployBettingContract,
  generateBet,
  getBetExpectation,
  mulMathSave,
} from "./helpers";
import { Betting } from "../typechain/Betting";
const { deployContract } = waffle;

describe("BettingContract", function () {
  let accounts: Signer[];
  let bettingContract: Betting;
  let randomBetSide: number;
  let randomOdds: string;
  let randomAmount: string;
  let randomBetType: number;
  let randomSelection: number;

  /**
   * Generate accounts, random values and deploys the contract for each test
   */
  beforeEach(async function () {
    accounts = await ethers.getSigners();
    bettingContract = await deployBettingContract();
    randomBetSide = Math.random() >= 0.5 ? 1 : 0;
    randomOdds = utils.formatUnits(crypto.randomInt(110, 500).toString(), 2); // random odds from 1.10 to 5
    randomAmount = utils.formatUnits(crypto.randomInt(11, 200).toString(), 2); // random amount from 0.01 to 2
    randomBetType = 0; // random bet type from 0 to 100
    randomSelection = crypto.randomInt(0, 2); // random bet type from 0 to 10
  });

  it("Should full match a bet with an other", async function () {
    /**
     * Create two bets that can fully match with random values
     */
    const firstBet = generateBet(
      randomBetSide,
      randomBetType,
      randomSelection,
      randomOdds,
      randomAmount,
      accounts[0]
    );
    const secondBet = generateBet(
      Number(!randomBetSide),
      randomBetType,
      randomSelection,
      randomOdds,
      randomAmount,
      accounts[1]
    );

    /**
     * Places first bet and expect UnmatchedBetPlaced event emited with first bet values
     */
    const firstExpectation = getBetExpectation(bettingContract, firstBet);
    await checkBetEventFromExpectation(
      firstExpectation,
      bettingContract,
      "UnmatchedBetPlaced",
      firstBet
    );

    /**
     * Places second opposide bet
     */
    const secondExpectation = getBetExpectation(bettingContract, secondBet);

    /**
     * Expect first event MatchedBetPlaced for first bet
     */
    await checkBetEventFromExpectation(
      secondExpectation,
      bettingContract,
      "MatchedBetPlaced",
      firstBet
    );

    /**
     * Expect second event UnmatchedBetRemoved for first bet
     */
    await checkBetEventFromExpectation(
      secondExpectation,
      bettingContract,
      "UnmatchedBetRemoved",
      firstBet
    );

    /**
     * Expect third event MatchedBetPlaced for second bet
     */
    await checkBetEventFromExpectation(
      secondExpectation,
      bettingContract,
      "MatchedBetPlaced",
      secondBet
    );
  });

  it("Should full match a bet with three others", async function () {
    let index = 0;
    const bets: Bet[] = [];

    /**
     * Generate three bets and expect UnmatchedBetPlaced event
     */
    while (index < 3) {
      bets[index] = generateBet(
        randomBetSide,
        randomBetType,
        randomSelection,
        randomOdds,
        randomAmount,
        accounts[index]
      );

      const betExpectation = getBetExpectation(bettingContract, bets[index]);
      await checkBetEventFromExpectation(
        betExpectation,
        bettingContract,
        "UnmatchedBetPlaced",
        bets[index]
      );
      index++;
    }

    /**
     * Generate matching bet with amount of all three previus bets
     */
    const matchingBet = generateBet(
      Number(!randomBetSide),
      randomBetType,
      randomSelection,
      randomOdds,
      mulMathSave(randomAmount, 3),
      accounts[index + 1]
    );
    const matchingExpectation = getBetExpectation(bettingContract, matchingBet);

    /**
     * Expect MatchedBetPlaced and UnmatchedBetRemoved event for all three bets
     */
    for (let i = 0; i < index; i++) {
      await checkBetEventFromExpectation(
        matchingExpectation,
        bettingContract,
        "MatchedBetPlaced",
        bets[i]
      );
      await checkBetEventFromExpectation(
        matchingExpectation,
        bettingContract,
        "UnmatchedBetRemoved",
        bets[i]
      );
    }

    /**
     * Expect MatchedBetPlaced event for matching bet
     */
    await checkBetEventFromExpectation(
      matchingExpectation,
      bettingContract,
      "MatchedBetPlaced",
      matchingBet
    );
  });

  it("Should partly match a bet with an higher amount then the other bet", async function () {
    /**
     * Generate first bet with random values
     */
    const firstBet = generateBet(
      randomBetSide,
      randomBetType,
      randomSelection,
      randomOdds,
      randomAmount,
      accounts[0]
    );

    /**
     * Places first bet and expect UnmatchedBetPlaced event emited with first bet values
     */
    const betExpectation = getBetExpectation(bettingContract, firstBet);
    await checkBetEventFromExpectation(
      betExpectation,
      bettingContract,
      "UnmatchedBetPlaced",
      firstBet
    );

    /**
     * Generate matching bet with double the amount
     */
    const matchingBet = generateBet(
      Number(!randomBetSide),
      randomBetType,
      randomSelection,
      randomOdds,
      mulMathSave(randomAmount, 2),
      accounts[1]
    );
    const matchingExpectation = getBetExpectation(bettingContract, matchingBet);

    /**
     * Expect first event MatchedBetPlaced for first bet with full amount
     */
    await checkBetEventFromExpectation(
      matchingExpectation,
      bettingContract,
      "MatchedBetPlaced",
      firstBet
    );

    /**
     * Expect second event MatchedBetPlaced for matching bet with half amount
     */
    await checkBetEventFromExpectation(
      matchingExpectation,
      bettingContract,
      "MatchedBetPlaced",
      matchingBet.copyWithNewAmount(randomAmount)
    );

    /**
     * Expect third event UnmatchedBetPlaced for matching bet with half amount
     */
    await checkBetEventFromExpectation(
      matchingExpectation,
      bettingContract,
      "UnmatchedBetPlaced",
      matchingBet.copyWithNewAmount(randomAmount)
    );
  });

  it("Should partly match a bet with an lower amount then the other bet", async function () {
    /**
     * Generate first bet with random values and double the amount
     */
    const firstBet = generateBet(
      randomBetSide,
      randomBetType,
      randomSelection,
      randomOdds,
      mulMathSave(randomAmount, 2),
      accounts[0]
    );

    /**
     * Places first bet and expect UnmatchedBetPlaced event emited with first bet values
     */
    const betExpectation = getBetExpectation(bettingContract, firstBet);
    await checkBetEventFromExpectation(
      betExpectation,
      bettingContract,
      "UnmatchedBetPlaced",
      firstBet
    );

    /**
     * Generate matching bet with half the amount
     */
    const matchingBet = generateBet(
      Number(!randomBetSide),
      randomBetType,
      randomSelection,
      randomOdds,
      randomAmount,
      accounts[1]
    );
    const matchingExpectation = getBetExpectation(bettingContract, matchingBet);

    /**
     * Expect first event MatchedBetPlaced for first bet with half amount
     */
    await checkBetEventFromExpectation(
      matchingExpectation,
      bettingContract,
      "MatchedBetPlaced",
      firstBet.copyWithNewAmount(randomAmount)
    );

    /**
     * Expect second event UnmatchedBetUpdated for matching bet with half amount
     */
    await checkBetEventFromExpectation(
      matchingExpectation,
      bettingContract,
      "UnmatchedBetUpdated",
      firstBet.copyWithNewAmount(randomAmount)
    );

    /**
     * Expect third event UnmatchedBetPlaced for matching bet with full amount
     */
    await checkBetEventFromExpectation(
      matchingExpectation,
      bettingContract,
      "MatchedBetPlaced",
      matchingBet
    );
  });
});
