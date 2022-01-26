import Moralis from "moralis/dist/moralis.js";
import BettingContractJson from "footy-oracle-contract/artifacts/contracts/BettingAIO.sol/BettingAIO.json";
import MarketMakerContractJson from "footy-oracle-contract/artifacts/contracts/MarketMakerAIO.sol/MarketMakerAIO.json";

import { Ref, ref } from "vue";
import { AbiItem } from "web3-utils";
import { useMoralis } from "./moralis";
import { useChain } from "./chain"

const mumbaiContract = <Ref<string>>ref();
const fujiContract = <Ref<string>>ref();
const mumbaiMarketMakerContract = <Ref<string>>ref();
const fujiMarketMakerContract = <Ref<string>>ref();
const nftMarketplaceContract = <Ref<string>>ref();
const { activeChain, polygonTestnet, avalancheTestnet } = useChain();

const getBettingContract = async (): Promise<string> => {
  if (activeChain.value.chainId === polygonTestnet.chainId) {
    return getMumbaiBettingContract();
  }
  else if (activeChain.value.chainId === avalancheTestnet.chainId) {
    return getFujiBettingContract();
  }
  else {
    return getFujiBettingContract();
  }
};

const getFujiBettingContract = async (): Promise<string> => {
  if (!fujiContract.value) {
    const config = await Moralis.Config.get({ useMasterKey: false });
    fujiContract.value = config.get("avax_contract");
  }
  return fujiContract.value;
};

const getMumbaiBettingContract = async (): Promise<string> => {
  if (!mumbaiContract.value) {
    const config = await Moralis.Config.get({ useMasterKey: false });
    mumbaiContract.value = config.get("polygon_contract");
  }
  return mumbaiContract.value;
};

const getMarketMakerContractAddress = async (): Promise<string> => {
  if (activeChain.value.chainId === polygonTestnet.chainId) {
    return getMumbaiMarketMakerContractAddress();
  }
  else if (activeChain.value.chainId === avalancheTestnet.chainId) {
    return getFujiMarketMakerContractAddress();
  }
  else {
    return getFujiMarketMakerContractAddress();
  }
};

const getMumbaiMarketMakerContractAddress = async (): Promise<string> => {
  if (!mumbaiMarketMakerContract.value) {
    const config = await Moralis.Config.get({ useMasterKey: false });
    mumbaiMarketMakerContract.value = config.get("polygonMarketMakerAIOContract");
  }
  return mumbaiMarketMakerContract.value;
};

const getFujiMarketMakerContractAddress = async (): Promise<string> => {
  if (!fujiMarketMakerContract.value) {
    const config = await Moralis.Config.get({ useMasterKey: false });
    fujiMarketMakerContract.value = config.get("avaxMarketMakerAIOContract");
  }
  return fujiMarketMakerContract.value;
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
