/* eslint-disable no-unused-vars */
/* eslint-disable node/no-missing-import */
import { BigNumber, BigNumberish, Signer, utils } from "ethers";
import { waffle, ethers } from "hardhat";
import { expect } from "chai";
import {
  Bet,
  betFactory,
  BetFactory,
  deployBettingContract,
  deployContracts,
  mintBet,
  placeBet,
} from "./helpers";
import { Betting } from "../typechain/Betting";
import { BetNFT, SoccerResolver } from "../typechain";

describe("BettingContract", function () {
  let resolver: SoccerResolver;
  let betNFT: BetNFT;
  let bettingContract: Betting;
  let bets: BetFactory;
  let account: Signer;
  const maxBets = 5;

  before(async function () {
    const { resolver: _resolver, betNFT: _betNFT } = await deployContracts();
    resolver = _resolver;
    betNFT = _betNFT;
  });

  beforeEach(async function () {
    const [owner] = await ethers.getSigners();
    account = owner;
    bettingContract = await deployBettingContract("123213", resolver, betNFT);
    bets = await betFactory(maxBets);
  });

  it("Should payout a full match with one back and lay bet", async function () {
    await placeBet(bettingContract, bets.backBets[0]);
    await placeBet(bettingContract, bets.layBets[0]);

    const payoutExpectation = expect(
      await bettingContract.connect(account).withdraw()
    );

    await payoutExpectation.to.changeEtherBalances(
      [bets.backBets[0].account, bets.layBets[0].account],
      [bets.layBets[0].liabilityParsed, 0]
    );
  });

  it("Should payout full matches with many back and lay bets", async function () {
    for (let i = 0; i < maxBets; i++) {
      await placeBet(bettingContract, bets.backBets[i]);
      await placeBet(bettingContract, bets.layBets[i]);
    }

    const payoutExpectation = expect(
      await bettingContract.connect(account).withdraw()
    );

    for (let i = 0; i < maxBets; i++) {
      await payoutExpectation.to.changeEtherBalance(
        bets.backBets[i].account,
        bets.backBets[i].liabilityParsed
      );
    }
  });

  it("Should not payout minted bets", async function () {
    await placeBet(bettingContract, bets.backBets[0]);
    await placeBet(bettingContract, bets.layBets[0]);

    const backTokenId = await mintBet(bettingContract, bets.backBets[0]);
    const layTokenId = await mintBet(bettingContract, bets.layBets[0]);

    const payoutExpectation = expect(
      await bettingContract.connect(account).withdraw()
    );

    await payoutExpectation.to.changeEtherBalances(
      [bets.backBets[0].account, bets.layBets[0].account],
      [0, 0]
    );
  });
});
