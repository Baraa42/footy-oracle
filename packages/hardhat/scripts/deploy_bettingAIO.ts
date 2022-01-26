import { 
  Contract, 
} from "ethers"
import { ethers } from "hardhat"

const hre = require("hardhat");
const main = async(): Promise<any> => {
  const BetNFT = await ethers.getContractFactory("BetNFT");
  const betnft: Contract = await BetNFT.deploy("Bet NFT", "BetNFT");

  await betnft.deployed();
  console.log(`BetNFT deployed to: ${betnft.address}`);

  // Fuji Testnet 
  /*
  const _link = "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846";
  const oracle = "0xD5c4D9Fe36d09e71940676b312D1500078E24C6a";
  const jobId = "0xfee82cce27ec45c3af4d2ba0b9e2dd02";
  */

  const BettingAIO = await ethers.getContractFactory("BettingAIO");
  const bettingAIO = await BettingAIO.deploy(betnft.address);
  await bettingAIO.deployed();
  console.log('BettingAIO contract deployed ', bettingAIO.address);
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error)
  process.exit(1)
})
