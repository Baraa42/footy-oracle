import { 
  Contract, 
} from "ethers"
import { ethers } from "hardhat"

const hre = require("hardhat");
const Web3 = require('web3');

const main = async(): Promise<any> => {
  
  const LosslessManager = await ethers.getContractFactory("LosslessManager");
  const losslessManager = LosslessManager.attach("0xaB8551150C996716B795802C60eC9C3bc9F7EDbc");

  const gameId = "710806"; // Arsenal vs Brentford

  var currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 15);
  
  var fifteenDays = currentDate.getTime();
  console.log(currentDate, ", ", fifteenDays);

  currentDate.setDate(currentDate.getDate() + 1);
  var sixteenDays = currentDate.getTime();
  console.log(currentDate, ", ", sixteenDays);
  
//  console.log ((sixteenDays - fifteenDays) / (24 * 60 * 60))

  
  await losslessManager.create(gameId, fifteenDays, sixteenDays);

  var tokenBalance = await losslessManager.getQiTokenBalance(gameId);
  console.log("tokenBalance = ", tokenBalance);
  
  var gameAddress = await losslessManager.getGameAddress(gameId);
  console.log("gameAddress = ", gameAddress);

  var depositAmount = ethers.utils.parseEther("0.13");
  await losslessManager.placeBetDummy(gameId, 1,  {value: depositAmount });

  var tokenBalance = await losslessManager.getQiTokenBalance(gameId);
  console.log("tokenBalance = ", tokenBalance);
  
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error)
  process.exit(1)
})
