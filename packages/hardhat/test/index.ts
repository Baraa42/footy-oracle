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
} from "./helpers";
import { BettingContract } from "../typechain";
const { deployContract } = waffle;

describe("BettingContract", function () {
  let accounts: Signer[];
  let bettingContract: BettingContract;
  let randomOdds: string;
  let randomAmount: string;
  let randomBetType: number;
  let randomSelection: number;

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    bettingContract = await deployBettingContract();
    randomOdds = utils.formatUnits(crypto.randomInt(110, 500).toString(), 2); // random odds from 1.10 to 5
    randomAmount = utils.formatUnits(crypto.randomInt(11, 200).toString(), 2); // random amount from 0.01 to 2
    randomBetType = crypto.randomInt(0, 100); // random bet type from 0 to 100
    randomSelection = crypto.randomInt(0, 10); // random bet type from 0 to 10
  });

  it("Should match 1 lay bet with 1 back bet", async function () {
    const backBet = generateBet(
      0,
      randomBetType,
      randomSelection,
      randomOdds,
      randomAmount,
      accounts[0]
    );
    const layBet = generateBet(
      1,
      randomBetType,
      randomSelection,
      randomOdds,
      randomAmount,
      accounts[1]
    );

    /**
     * Set back bet and check for event
     */
    const backExpectation = getBetExpectation(bettingContract, backBet);
    await checkBetEventFromExpectation(
      backExpectation,
      bettingContract,
      "UnmatchedBetPlaced",
      backBet
    );

    /**
     * Set lay bet and check for events
     */
    const layExpectation = getBetExpectation(bettingContract, layBet);
    await checkBetEventFromExpectation(
      layExpectation,
      bettingContract,
      "MatchedBetPlaced",
      backBet
    );
    await checkBetEventFromExpectation(
      layExpectation,
      bettingContract,
      "MatchedBetPlaced",
      layBet
    );
  });

  it("Should match 1 back bet with 1 lay bet", async function () {
    const layBet = generateBet(
      1,
      randomBetType,
      randomSelection,
      randomOdds,
      randomAmount,
      accounts[1]
    );
    const backBet = generateBet(
      0,
      randomBetType,
      randomSelection,
      randomOdds,
      randomAmount,
      accounts[0]
    );

    /**
     * Set lay bet and check for event
     */
    const layExpectation = getBetExpectation(bettingContract, layBet);
    await checkBetEventFromExpectation(
      layExpectation,
      bettingContract,
      "UnmatchedBetPlaced",
      layBet
    );

    /**
     * Set back bet and check for events
     */
    const backExpectation = getBetExpectation(bettingContract, backBet);
    await checkBetEventFromExpectation(
      backExpectation,
      bettingContract,
      "MatchedBetPlaced",
      layBet
    );
    await checkBetEventFromExpectation(
      backExpectation,
      bettingContract,
      "MatchedBetPlaced",
      backBet
    );
  });

  it("Should match 1 lay bet with 3 back bets", async function () {
    let index = 0;
    const backBets: Bet[] = [];

    // Generate back bets and check for events
    while (index < 3) {
      backBets[index] = generateBet(
        0,
        randomBetType,
        randomSelection,
        randomOdds,
        randomAmount,
        accounts[index]
      );

      const backExpectation = getBetExpectation(
        bettingContract,
        backBets[index]
      );
      await checkBetEventFromExpectation(
        backExpectation,
        bettingContract,
        "UnmatchedBetPlaced",
        backBets[index]
      );

      index++;
    }

    // Generate lay bets and check for events
    const amountMul = utils.formatEther(
      utils.parseUnits(randomAmount).mul(index)
    );
    const layBet = generateBet(
      1,
      randomBetType,
      randomSelection,
      randomOdds,
      amountMul,
      accounts[index + 1]
    );
    const layExpectation = getBetExpectation(bettingContract, layBet);

    for (let i = 0; i < index; i++) {
      await checkBetEventFromExpectation(
        layExpectation,
        bettingContract,
        "MatchedBetPlaced",
        backBets[i]
      );
    }
    await checkBetEventFromExpectation(
      layExpectation,
      bettingContract,
      "MatchedBetPlaced",
      layBet
    );
  });

  it("Should match 1 back bet with 3 lay bets", async function () {
    let index = 0;
    const layBets: Bet[] = [];

    // Generate back bets and check for events
    while (index < 3) {
      layBets[index] = generateBet(
        1,
        randomBetType,
        randomSelection,
        randomOdds,
        randomAmount,
        accounts[index]
      );

      const layExpectation = getBetExpectation(bettingContract, layBets[index]);
      await checkBetEventFromExpectation(
        layExpectation,
        bettingContract,
        "UnmatchedBetPlaced",
        layBets[index]
      );

      index++;
    }

    // Generate lay bets and check for events
    const amountMul = utils.formatEther(
      utils.parseUnits(randomAmount).mul(index)
    );
    const backBet = generateBet(
      0,
      randomBetType,
      randomSelection,
      randomOdds,
      amountMul,
      accounts[index + 1]
    );
    const backExpectation = getBetExpectation(bettingContract, backBet);

    for (let i = 0; i < index; i++) {
      await checkBetEventFromExpectation(
        backExpectation,
        bettingContract,
        "MatchedBetPlaced",
        layBets[i]
      );
    }
    await checkBetEventFromExpectation(
      backExpectation,
      bettingContract,
      "MatchedBetPlaced",
      backBet
    );
  });

  it("Should partly match new back bet on existing lay bet", async function () {
    /**
     * Generate lay bet with random values
     */
    const layBet = generateBet(
      1,
      randomBetType,
      randomSelection,
      randomOdds,
      randomAmount,
      accounts[0]
    );

    /**
     * Set lay bet and check for event
     */
    const layExpectation = getBetExpectation(bettingContract, layBet);
    await checkBetEventFromExpectation(
      layExpectation,
      bettingContract,
      "UnmatchedBetPlaced",
      layBet
    );

    /**
     * Generate back bet with double the amount
     */
    const amountDouble = utils.formatEther(
      utils.parseUnits(randomAmount).mul(2)
    );
    const backBet = generateBet(
      0,
      randomBetType,
      randomSelection,
      randomOdds,
      amountDouble,
      accounts[1]
    );

    /**
     * Set back bet and check for event
     */
    const backExpectation = getBetExpectation(bettingContract, backBet);
    await checkBetEventFromExpectation(
      backExpectation,
      bettingContract,
      "MatchedBetPlaced",
      layBet
    );

    await checkBetEventFromExpectation(
      backExpectation,
      bettingContract,
      "MatchedBetPlaced",
      Object.assign(backBet, { amountParsed: layBet.amountParsed }) // modify amount by half
    );

    await checkBetEventFromExpectation(
      backExpectation,
      bettingContract,
      "UnmatchedBetPlaced",
      Object.assign(backBet, { amountParsed: layBet.amountParsed }) // modify amount by half
    );
  });

  it("Should partly match new lay bet on existing back bet", async function () {
    /**
     * Generate lay bet with random values
     */
    const backBet = generateBet(
      0,
      randomBetType,
      randomSelection,
      randomOdds,
      randomAmount,
      accounts[0]
    );

    /**
     * Set lay bet and check for event
     */
    const backExpectation = getBetExpectation(bettingContract, backBet);
    await checkBetEventFromExpectation(
      backExpectation,
      bettingContract,
      "UnmatchedBetPlaced",
      backBet
    );

    /**
     * Generate back bet with double the amount
     */
    const amountDouble = utils.formatEther(
      utils.parseUnits(randomAmount).mul(2)
    );
    const layBet = generateBet(
      1,
      randomBetType,
      randomSelection,
      randomOdds,
      amountDouble,
      accounts[1]
    );

    /**
     * Set back bet and check for event
     */
    const layExpectation = getBetExpectation(bettingContract, layBet);
    await checkBetEventFromExpectation(
      layExpectation,
      bettingContract,
      "MatchedBetPlaced",
      backBet
    );

    await checkBetEventFromExpectation(
      layExpectation,
      bettingContract,
      "MatchedBetPlaced",
      Object.assign(layBet, { amountParsed: backBet.amountParsed }) // modify amount by half
    );

    await checkBetEventFromExpectation(
      layExpectation,
      bettingContract,
      "UnmatchedBetPlaced",
      Object.assign(layBet, { amountParsed: backBet.amountParsed }) // modify amount by half
    );
  });

  it("Should partly match existing lay bet with new back bet", async function () {
    /**
     * Generate lay bet with double amount
     */
    const amountDouble = utils.formatEther(
      utils.parseUnits(randomAmount).mul(2)
    );

    const layBet = generateBet(
      1,
      randomBetType,
      randomSelection,
      randomOdds,
      amountDouble,
      accounts[0]
    );

    /**
     * Set lay bet and check for event
     */
    const layExpectation = getBetExpectation(bettingContract, layBet);
    await checkBetEventFromExpectation(
      layExpectation,
      bettingContract,
      "UnmatchedBetPlaced",
      layBet
    );

    /**
     * Generate back bet with half the amount of lay bet
     */
    const backBet = generateBet(
      0,
      randomBetType,
      randomSelection,
      randomOdds,
      randomAmount,
      accounts[1]
    );

    /**
     * Set back bet and check for event
     */
    const backExpectation = getBetExpectation(bettingContract, backBet);

    await checkBetEventFromExpectation(
      backExpectation,
      bettingContract,
      "MatchedBetPlaced",
      Object.assign(layBet, { amountParsed: backBet.amountParsed }) // modify amount by half
    );

    await checkBetEventFromExpectation(
      backExpectation,
      bettingContract,
      "UnmatchedBetUpdated",
      Object.assign(layBet, { amountParsed: backBet.amountParsed }) // modify amount by half
    );
  });
});
