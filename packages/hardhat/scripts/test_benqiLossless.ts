import { 
  Contract, 
} from "ethers"
import { ethers } from "hardhat"

const hre = require("hardhat");
const Web3 = require('web3');

const main = async(): Promise<any> => {
  
  const LosslessManager = await ethers.getContractFactory("LosslessManager");
  const losslessManager = LosslessManager.attach("0x46755c45ed5bcEd2C7E40958D119417039db6E0d");

  const gameId1 = "710806"; // Arsenal vs Brentford
  const gameId2 = "710797"; // Burnley vs Liverpool
  const gameId3 = "710794"; // Liverpool vs Leicester
  const gameId4 = "710805"; // Watford vs Brighton
  const gameId5 = "710804"; // Tottenham vs Wolves

  var currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 15);
  
  var fifteenDays = currentDate.getTime();
  console.log(currentDate, ", ", fifteenDays);

  currentDate.setDate(currentDate.getDate() + 1);
  var sixteenDays = currentDate.getTime();
  console.log(currentDate, ", ", sixteenDays);
  
//  console.log ((sixteenDays - fifteenDays) / (24 * 60 * 60))
  
  await losslessManager.create(gameId1, fifteenDays, sixteenDays);
  await losslessManager.create(gameId2, fifteenDays, sixteenDays);
  await losslessManager.create(gameId3, fifteenDays, sixteenDays);
  await losslessManager.create(gameId4, fifteenDays, sixteenDays);
  await losslessManager.create(gameId5, fifteenDays, sixteenDays);

  // Place a Bet
  var depositAmount = ethers.utils.parseEther("0.15");
  await losslessManager.placeBet(gameId1, 2,  {value: depositAmount });

  var tokenBalance = await losslessManager.getQiTokenBalance(gameId1);
  console.log("tokenBalance = ", tokenBalance);
  
  /* 
   Chainlink Test with old match (no bets).
   Fund contract with LINK before making this call.
  */
  /*
  const gameIdChainlinkTest = "710580"
  await losslessManager.create(gameIdChainlinkTest, fifteenDays, sixteenDays);
  await losslessManager.requestResult(gameIdChainlinkTest);
  */
  // New event will be generated "ChainlinkReply"
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error)
  process.exit(1)
})
