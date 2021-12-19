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
  divMathSave,
  generateBet,
  getBetExpectation,
  mulMathSave,
  placeBet,
} from "./helpers";
import { Betting } from "../typechain/Betting";
const { deployContract } = waffle;

describe("BettingContract", function () {
  let accounts: Signer[];
  let bettingContract: Betting;
  let randomOdds: string;
  let randomAmount: string;
  /**
   * Generate accounts, random values and deploys the contract for each test
   */
  beforeEach(async function () {
    accounts = await ethers.getSigners();
    bettingContract = await deployBettingContract();
    randomOdds = utils.formatUnits(crypto.randomInt(110, 500).toString(), 2); // random odds from 1.10 to 5
    randomAmount = utils.formatUnits(crypto.randomInt(11, 200).toString(), 2); // random amount from 0.01 to 2
  });

  it("Should payout a full match with one back and lay bet", async function () {
    /**
     * Create two bets that can fully match with random values
     */
    const winningBet = generateBet(
      0,
      0,
      0,
      randomOdds,
      randomAmount,
      accounts[0]
    );

    const loosingBet = generateBet(
      1,
      0,
      0,
      randomOdds,
      randomAmount,
      accounts[1]
    );

    /**
     * Places and matched the two bets
     */
    await placeBet(bettingContract, winningBet);
    await placeBet(bettingContract, loosingBet);

    /**
     * Call withdraw function and wrapp it inside expect
     */
    const payoutExpectation = expect(
      await bettingContract.connect(accounts[3]).withdraw()
    );

    /**
     * Expect ether balances changed for the winning account
     */
    await payoutExpectation.to.changeEtherBalances(
      [winningBet.account, loosingBet.account],
      [loosingBet.liabilityParsed, 0]
    );
  });

  it("Should payout full matches with many back and lay bets", async function () {
    let index = 0;

    const backBets: Bet[] = [];
    const layBets: Bet[] = [];

    while (index < 3) {
      // random odds from 1.10 to 5
      const randomOdds = utils.formatUnits(
        crypto.randomInt(110, 500).toString(),
        2
      );
      // random amount from 0.01 to 2
      const randomAmount = utils.formatUnits(
        crypto.randomInt(11, 200).toString(),
        2
      );

      const backBet = generateBet(
        0,
        0,
        0,
        randomOdds,
        randomAmount,
        accounts[index]
      );
      backBets.push(backBet);
      await placeBet(bettingContract, backBet);

      const layBet = generateBet(
        1,
        0,
        0,
        randomOdds,
        randomAmount,
        accounts[index]
      );

      layBets.push(layBet);
      await placeBet(bettingContract, layBet);

      index++;
    }

    /**
     * Call withdraw function and wrapp it inside expect
     */
    const payoutExpectation = expect(
      await bettingContract.connect(accounts[10]).withdraw()
    );

    for (let i = 0; i < backBets.length; i++) {
      await payoutExpectation.to.changeEtherBalance(
        backBets[i].account,
        backBets[i].liabilityParsed
      );
    }
  });
});
