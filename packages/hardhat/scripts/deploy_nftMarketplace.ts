import { 
  Contract, 
} from "ethers"
import { ethers } from "hardhat"

const hre = require("hardhat");
const main = async(): Promise<any> => {
  const NFTMarketPlace = await ethers.getContractFactory("NFTMarketPlace");
  //Frank's address is default for the cloud
  const nftMarketPlace: Contract = await NFTMarketPlace.deploy("0x55C2fC277f27e915cB9C7cE40ed744d5CA04C660");

  await nftMarketPlace.deployed();
  console.log(`NFTMarketPlace deployed to: ${nftMarketPlace.address}`);

  var userBalance = await nftMarketPlace.viewBalances("0x55C2fC277f27e915cB9C7cE40ed744d5CA04C660")
  console.log('userBalance = ' + userBalance);
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error)
  process.exit(1)
})
