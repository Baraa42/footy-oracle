import { 
  Contract, 
  ContractFactory 
} from "ethers"
import { ethers } from "hardhat"

const hre = require("hardhat");
const main = async(): Promise<any> => {


  const LPNFT = await ethers.getContractFactory("LPNFT");
  const lpnft: Contract = await LPNFT.deploy("LP NFT", "LPNFT");

  await lpnft.deployed();
  console.log(`LPNFT deployed to: ${lpnft.address}`);

  var tokenId = await lpnft.getNextFreeTokenId();

  const MarketMaker = await ethers.getContractFactory("MarketMakerAIO");
  const marketMaker = await MarketMaker.deploy(lpnft.address);
  await marketMaker.deployed();
  console.log('MarketMakerAIO contract deployed ', marketMaker.address);
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error)
  process.exit(1)
})
