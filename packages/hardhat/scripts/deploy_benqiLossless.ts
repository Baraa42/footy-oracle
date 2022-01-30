import { 
  Contract, 
} from "ethers"
import { ethers } from "hardhat"

const hre = require("hardhat");
const main = async(): Promise<any> => {
  
   /**
     * Fuji Testnet : 0x219990FA1f91751539c65aE3f50040C6701cF219
     * Avax Mainnet : 0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c
  */
  const qiToken = "0x219990FA1f91751539c65aE3f50040C6701cF219";
  const LosslessManager = await ethers.getContractFactory("LosslessManager");
  const losslessManager: Contract = await LosslessManager.deploy(qiToken);

  await losslessManager.deployed();
  console.log(`LosslessManager deployed to: ${losslessManager.address}`);

}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error)
  process.exit(1)
})
