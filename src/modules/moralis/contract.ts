const abi =
    '[ { "inputs": [ { "internalType": "string", "name": "_objectId", "type": "string" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "AmountToLow", "type": "error" }, { "inputs": [], "name": "GameAlreadyEnded", "type": "error" }, { "inputs": [ { "internalType": "uint256", "name": "odds", "type": "uint256" } ], "name": "OddsToLow", "type": "error" }, { "inputs": [], "name": "OnlyOwner", "type": "error" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "_addr", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_odds", "type": "uint256" }, { "indexed": false, "internalType": "enum Cmodds.Selection", "name": "_selection", "type": "uint8" }, { "indexed": false, "internalType": "enum Cmodds.BetType", "name": "_betType", "type": "uint8" }, { "indexed": false, "internalType": "uint256", "name": "betId", "type": "uint256" } ], "name": "BetObjectCreated", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "bytes32", "name": "id", "type": "bytes32" } ], "name": "ChainlinkCancelled", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "bytes32", "name": "id", "type": "bytes32" } ], "name": "ChainlinkFulfilled", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "bytes32", "name": "id", "type": "bytes32" } ], "name": "ChainlinkRequested", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "string", "name": "eventId", "type": "string" }, { "indexed": false, "internalType": "address", "name": "addr", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "odds", "type": "uint256" }, { "indexed": false, "internalType": "enum Cmodds.Selection", "name": "selection", "type": "uint8" }, { "indexed": false, "internalType": "enum Cmodds.BetType", "name": "betType", "type": "uint8" }, { "indexed": false, "internalType": "uint256", "name": "betId", "type": "uint256" } ], "name": "MatchedBetPlaced", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "string", "name": "eventId", "type": "string" }, { "indexed": false, "internalType": "address", "name": "addr", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "odds", "type": "uint256" }, { "indexed": false, "internalType": "enum Cmodds.Selection", "name": "selection", "type": "uint8" }, { "indexed": false, "internalType": "enum Cmodds.BetType", "name": "betType", "type": "uint8" } ], "name": "UnmatchedBetPlaced", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "string", "name": "eventId", "type": "string" }, { "indexed": false, "internalType": "address", "name": "addr", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "odds", "type": "uint256" }, { "indexed": false, "internalType": "enum Cmodds.Selection", "name": "selection", "type": "uint8" }, { "indexed": false, "internalType": "enum Cmodds.BetType", "name": "betType", "type": "uint8" } ], "name": "UnmatchedBetRemoved", "type": "event" }, { "inputs": [], "name": "betCount", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "bytes32", "name": "_bytes32", "type": "bytes32" } ], "name": "bytes32ToString", "outputs": [ { "internalType": "string", "name": "", "type": "string" }, { "internalType": "enum Cmodds.Selection", "name": "", "type": "uint8" } ], "stateMutability": "pure", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_odds", "type": "uint256" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "enum Cmodds.Selection", "name": "_selection", "type": "uint8" } ], "name": "createBackBet", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_odds", "type": "uint256" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "enum Cmodds.Selection", "name": "_selection", "type": "uint8" } ], "name": "createLayBet", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "data", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "bytes32", "name": "_requestId", "type": "bytes32" }, { "internalType": "bytes32", "name": "_data", "type": "bytes32" } ], "name": "fulfill", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getGameDetails", "outputs": [ { "internalType": "string", "name": "", "type": "string" }, { "internalType": "enum Cmodds.Selection", "name": "", "type": "uint8" }, { "internalType": "enum Cmodds.GameStatus", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "nftBet", "outputs": [ { "internalType": "contract BetNFT", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "nftTokenCount", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_odds", "type": "uint256" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "enum Cmodds.Selection", "name": "_selection", "type": "uint8" }, { "internalType": "enum Cmodds.BetType", "name": "_betType", "type": "uint8" } ], "name": "removeUnmatchedBet", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "requestResult", "outputs": [ { "internalType": "bytes32", "name": "requestId", "type": "bytes32" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "resultString", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "enum Cmodds.Selection", "name": "_winner", "type": "uint8" } ], "name": "setWinner", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "s", "type": "string" } ], "name": "stringToUint", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "pure", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_betId", "type": "uint256" }, { "internalType": "string", "name": "tokenURI", "type": "string" } ], "name": "transferBetToNFT", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "withdrawWithNFT", "outputs": [], "stateMutability": "payable", "type": "function" } ]';

export const useContract = () => {
    return { abi }
}