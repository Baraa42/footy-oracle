const mumbaiChain = "0x13881";
const mumbaiWeb3 = Moralis.web3ByChain(mumbaiChain);

const PolygonNFTOwners = Moralis.Object.extend("PolygonNFTOwners");
const MumbaiMatchedBets = Moralis.Object.extend("MumbaiMatchedBets");
const MumbaiUnmatchedBets = Moralis.Object.extend("MumbaiUnmatchedBets");
const MumbaiUnmatchedBetsUpdated = Moralis.Object.extend(
  "MumbaiUnmatchedBetsUpdated"
);
const MumbaiUnmatchedBetsRemoved = Moralis.Object.extend(
  "MumbaiUnmatchedBetsRemoved"
);
const MumbaiDepositLP = Moralis.Object.extend("MumbaiDepositLP");
const MumbaiPlacedOfferings = Moralis.Object.extend("MumbaiPlacedOfferings");
