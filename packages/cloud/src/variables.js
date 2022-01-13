const account = "0x55C2fC277f27e915cB9C7cE40ed744d5CA04C660";
const chain = "0x13881";
const web3 = Moralis.web3ByChain(chain);
const chainlinkAddr = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
const chainlinkAbi =
  '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"transferAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"data","type":"bytes"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}]';
const chainlink = new web3.eth.Contract(
  JSON.parse(chainlinkAbi),
  chainlinkAddr
);

const Event = Moralis.Object.extend("Event");
const League = Moralis.Object.extend("League");
const Country = Moralis.Object.extend("Country");
const Team = Moralis.Object.extend("Team");
const Sport = Moralis.Object.extend("Sport");
const PolygonNFTOwners = Moralis.Object.extend("PolygonNFTOwners");

const MumbaiMatchedBets = Moralis.Object.extend("MumbaiMatchedBets");
const MumbaiUnmatchedBets = Moralis.Object.extend("MumbaiUnmatchedBets");
const MumbaiUnmatchedBetsUpdated = Moralis.Object.extend(
  "MumbaiUnmatchedBetsUpdated"
);
const MumbaiUnmatchedBetsRemoved = Moralis.Object.extend(
  "MumbaiUnmatchedBetsRemoved"
);
const MumbaiPlacedOfferings = Moralis.Object.extend("MumbaiPlacedOfferings");

const FujiMatchedBets = Moralis.Object.extend("FujiMatchedBets");
const FujiUnmatchedBets = Moralis.Object.extend("FujiUnmatchedBets");
const FujiUnmatchedBetsUpdated = Moralis.Object.extend(
  "FujiUnmatchedBetsUpdated"
);
const FujiUnmatchedBetsRemoved = Moralis.Object.extend(
  "FujiUnmatchedBetsRemoved"
);
const FujiPlacedOfferings = Moralis.Object.extend("FujiPlacedOfferings");

const nft_market_place_address = "0xDC81312829E51220e1882EE26f5976d432CC7a43";
const nft_market_place_abi = [
  {
    inputs: [{ internalType: "address", name: "_operator", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
    name: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "BalanceWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "offeringId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
    ],
    name: "OfferingClosed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "offeringId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "hostContract",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "offerer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      { indexed: false, internalType: "string", name: "uri", type: "string" },
    ],
    name: "OfferingPlaced",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "previousOperator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newOperator",
        type: "address",
      },
    ],
    name: "OperatorChanged",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "_newOperator", type: "address" },
    ],
    name: "changeOperator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "_offeringId", type: "bytes32" }],
    name: "closeOffering",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_offerer", type: "address" },
      { internalType: "address", name: "_hostContract", type: "address" },
      { internalType: "uint256", name: "_tokenId", type: "uint256" },
      { internalType: "uint256", name: "_price", type: "uint256" },
    ],
    name: "placeOffering",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_address", type: "address" }],
    name: "viewBalances",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "_offeringId", type: "bytes32" }],
    name: "viewOfferingNFT",
    outputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "bool", name: "", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawBalance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const marketPlace = new web3.eth.Contract(
  nft_market_place_abi,
  nft_market_place_address
);
