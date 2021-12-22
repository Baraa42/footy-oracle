/* eslint-disable no-unused-vars */
/* eslint-disable node/no-missing-import */
import {
  BetFactory,
  betFactory,
  deployBetNFTContract,
  deployBettingContract,
  deploySoccerResolverContract,
  getMintExpectation,
  mintBet,
  placeBet,
} from "./helpers";
import { waffle, ethers } from "hardhat";
import { Betting } from "../typechain/Betting";
import { BetNFT, SoccerResolver } from "../typechain";
import { Signer } from "ethers";
import { expect } from "chai";

describe("BettingContract", function () {
  let bettingContract: Betting;
  let resolver: SoccerResolver;
  let betNFT: BetNFT;
  let bets: BetFactory;
  let account: Signer;

  before(async function () {
    resolver = await deploySoccerResolverContract();
    betNFT = await deployBetNFTContract();
  });

  beforeEach(async function () {
    const [owner] = await ethers.getSigners();
    account = owner;
    bettingContract = await deployBettingContract("abdg321", resolver, betNFT);
    bets = await betFactory(1);
  });

  it("Should mint two NFTs from a matched bet", async function () {
    await placeBet(bettingContract, bets.backBets[0]);
    await placeBet(bettingContract, bets.layBets[0]);

    await mintBet(bettingContract, bets.backBets[0]);
    await mintBet(bettingContract, bets.layBets[0]);
  });

  it("Should revert when mint a unmatched bet", async function () {
    await placeBet(bettingContract, bets.backBets[0]);
    const mintExpectation = getMintExpectation(
      bettingContract,
      bets.backBets[0]
    );
    await mintExpectation.to.be.revertedWith("No Matched Bet");
  });

  it("Should revert when mint the same NFT again", async function () {
    await placeBet(bettingContract, bets.backBets[0]);
    await placeBet(bettingContract, bets.layBets[0]);

    await mintBet(bettingContract, bets.backBets[0]); // first mint
    const mintExpectation = getMintExpectation(
      bettingContract,
      bets.backBets[0]
    ); // second mint
    await mintExpectation.to.be.revertedWith("ERC721: token already minted");
  });

  it("Should revert when mint NFT from other user", async function () {
    await placeBet(bettingContract, bets.backBets[0]);
    await placeBet(bettingContract, bets.layBets[0]);

    const mintExpectation = getMintExpectation(
      bettingContract,
      bets.backBets[0],
      bets.layBets[0].account
    );
    await mintExpectation.to.be.revertedWith("No Matched Bet");
  });

  it("Should withdraw winning NFT bet", async function () {
    await placeBet(bettingContract, bets.backBets[0]);
    await placeBet(bettingContract, bets.layBets[0]);

    const backTokenId = await mintBet(bettingContract, bets.backBets[0]);
    const layTokenId = await mintBet(bettingContract, bets.layBets[0]);

    const withdrawTx = await bettingContract.connect(account).withdraw();
    await withdrawTx.wait();

    const withdrawNFTExpectation = expect(
      await bettingContract
        .connect(bets.backBets[0].account)
        .withdrawWithNFT(backTokenId)
    );

    await withdrawNFTExpectation.to.changeEtherBalance(
      bets.backBets[0].account,
      bets.backBets[0].liabilityParsed
    );
  });

  it("Should revert withdraw with lost NFT bet", async function () {
    await placeBet(bettingContract, bets.backBets[0]);
    await placeBet(bettingContract, bets.layBets[0]);

    const backTokenId = await mintBet(bettingContract, bets.backBets[0]);
    const layTokenId = await mintBet(bettingContract, bets.layBets[0]);

    const withdrawTx = await bettingContract.connect(account).withdraw();
    await withdrawTx.wait();

    const withdrawNFTExpectation = expect(
      bettingContract
        .connect(bets.layBets[0].account)
        .withdrawWithNFT(layTokenId)
    );

    await withdrawNFTExpectation.to.be.revertedWith("Bet lost");
  });
});
