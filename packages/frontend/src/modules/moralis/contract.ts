import Moralis from "moralis/dist/moralis.js";
import BettingContractJson from "footy-oracle-contract/artifacts/contracts/BettingAIO.sol/BettingAIO.json";
import MarketMakerContractJson from "footy-oracle-contract/artifacts/contracts/MarketMakerAIO.sol/MarketMakerAIO.json";

import { Ref, ref } from "vue";
import { AbiItem } from "web3-utils";
import { useMoralis } from "./moralis";

const mumbaiContract = <Ref<string>>ref();
const fujiContract = <Ref<string>>ref();
const marketMakerContract = <Ref<string>>ref();
const nftMarketplaceContract = <Ref<string>>ref();

const getBettingContract = async (): Promise<string> => {
  //TODO ask other module which network is active
  if (!mumbaiContract.value) {
    const config = await Moralis.Config.get({ useMasterKey: false });
    mumbaiContract.value = config.get("polygon_contract");
  }
  return mumbaiContract.value;
};

const getMarketMakerContractAddress = async (): Promise<string> => {
  //TODO ask other module which network is active
  if (!marketMakerContract.value) {
    const config = await Moralis.Config.get({ useMasterKey: false });
    marketMakerContract.value = config.get("polygonMarketMakerAIOContract");
  }
  return marketMakerContract.value;
};

const getNFTMarketplaceContract = async (): Promise<string> => {
  //TODO ask other module which network is active
  if (!nftMarketplaceContract.value) {
    const config = await Moralis.Config.get({ useMasterKey: false });
    nftMarketplaceContract.value = config.get("polygonNFTMarketPlaceContract");
  }
  return nftMarketplaceContract.value;
};

export const useContract = () => {
  return {
    bettingAbi: BettingContractJson.abi as AbiItem[],
    getBettingContract,
    marketMakerAbi: MarketMakerContractJson.abi as AbiItem[],
    getMarketMakerContractAddress,
  };
};
