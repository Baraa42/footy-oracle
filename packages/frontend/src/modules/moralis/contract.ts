import Moralis from "moralis/dist/moralis.js";
import BettingContractJson from "footy-oracle-contract/artifacts/contracts/BettingAIO.sol/BettingAIO.json";
import MarketMakerContractJson from "footy-oracle-contract/artifacts/contracts/MarketMakerAIO.sol/MarketMakerAIO.json";

import { Ref, ref, watch } from "vue";
import { AbiItem } from "web3-utils";
import { useChain } from "./chain";

const bettingContract = <Ref<string>>ref();
const marketMakerContract = <Ref<string>>ref();
const nftMarketplaceContract = <Ref<string>>ref();

export const useContract = () => {
  const { getConfigName, activeChain } = useChain();

  // reset contracts after network switch
  watch(activeChain, () => {
    bettingContract.value = "";
    marketMakerContract.value = "";
    nftMarketplaceContract.value = "";
  });

  const getBettingContract = async (): Promise<string> => {
    if (!bettingContract.value || bettingContract.value === "") {
      const config = await Moralis.Config.get({ useMasterKey: false });
      bettingContract.value = config.get(getConfigName("betting_contract"));
    }
    return bettingContract.value;
  };

  const getMarketMakerContractAddress = async (): Promise<string> => {
    if (!marketMakerContract.value || marketMakerContract.value === "") {
      const config = await Moralis.Config.get({ useMasterKey: false });
      marketMakerContract.value = config.get(getConfigName("market_maker_contract"));
    }
    return marketMakerContract.value;
  };

  const getNFTMarketplaceContract = async (): Promise<string> => {
    if (!nftMarketplaceContract.value || nftMarketplaceContract.value === "") {
      const config = await Moralis.Config.get({ useMasterKey: false });
      nftMarketplaceContract.value = config.get(getConfigName("nft_marketplace_contract"));
    }
    return nftMarketplaceContract.value;
  };

  return {
    getBettingContract,
    getMarketMakerContractAddress,
    getNFTMarketplaceContract,
    bettingAbi: BettingContractJson.abi as AbiItem[],
    marketMakerAbi: MarketMakerContractJson.abi as AbiItem[],
  };
};
