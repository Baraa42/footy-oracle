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
  getRandomObjectId,
  mintBet,
  placeBet,
  setOracleResult,
} from "./helpers";
import { Betting } from "../typechain/Betting";
import { BetNFT, MockOracle, SoccerResolver } from "../typechain";

describe("BettingContract", function () {
  let objectId: string;
  let resolver: SoccerResolver;
  let betNFT: BetNFT;
  let bettingContract: Betting;
  let bets: BetFactory;
  let oracle: MockOracle;
  let account: Signer;
  const maxBets = 5;

  before(async function () {
    objectId = getRandomObjectId();
    const {
      resolver: _resolver,
      betNFT: _betNFT,
      oracle: _oracle,
    } = await deployContracts();
    resolver = _resolver;
    betNFT = _betNFT;
    oracle = _oracle;
  });

  beforeEach(async function () {
    const [owner] = await ethers.getSigners();
    account = owner;
    bettingContract = await deployBettingContract(objectId, resolver, betNFT);
    bets = await betFactory(maxBets);
  });

  it("Should payout a full match with one back and lay bet", async function () {
    await placeBet(bettingContract, bets.backBets[0]);
    await placeBet(bettingContract, bets.layBets[0]);

    await setOracleResult(oracle, objectId, bets.backBets[0].selection);

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

    await setOracleResult(oracle, objectId, bets.backBets[0].selection);

    const payoutExpectation = expect(
      await bettingContract.connect(account).withdraw()
    );

    for (let i = 0; i < maxBets; i++) {
      // check winnig back bets
      if (bets.backBets[0].selection === bets.backBets[i].selection) {
        await payoutExpectation.to.changeEtherBalance(
          bets.backBets[i].account,
          bets.backBets[i].liabilityParsed
        );
      }
      // check winnig lay bets
      if (bets.backBets[0].selection !== bets.layBets[i].selection) {
        await payoutExpectation.to.changeEtherBalance(
          bets.layBets[i].account,
          bets.layBets[i].amountParsed
        );
      }
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
