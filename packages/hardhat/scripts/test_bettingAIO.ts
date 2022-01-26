import { 
  Contract, 
} from "ethers"
import { ethers } from "hardhat"

const hre = require("hardhat");
const Web3 = require('web3');

const main = async(): Promise<any> => {

  const BettingAIO = await ethers.getContractFactory("BettingAIO");

  let bettingAIO = BettingAIO.attach("0x412a24323f2074dA097934DCA6cdE5F8ca0bb9c4");

  var x = await bettingAIO.bytes32ToString('0x3731303538303100000000000000000000000000000000000000000000000000');
  console.log("matchId = " + x[0]);
  console.log("result = " + x[1]);

  await bettingAIO.requestResult("710580");
  
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error)
  process.exit(1)
})
