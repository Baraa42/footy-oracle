const fujiChain = "0xa869";
const fujiWeb3 = Moralis.web3ByChain(fujiChain);

const AvaxNFTOwners = Moralis.Object.extend("AvaxNFTOwners");
const FujiMatchedBets = Moralis.Object.extend("FujiMatchedBets");
const FujiUnmatchedBets = Moralis.Object.extend("FujiUnmatchedBets");
const FujiUnmatchedBetsUpdated = Moralis.Object.extend(
  "FujiUnmatchedBetsUpdated"
);
const FujiUnmatchedBetsRemoved = Moralis.Object.extend(
  "FujiUnmatchedBetsRemoved"
);
const FujiDepositLP = Moralis.Object.extend("FujiDepositLP");
const FujiPlacedOfferings = Moralis.Object.extend("FujiPlacedOfferings");
