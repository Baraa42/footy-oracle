import Moralis from "moralis/dist/moralis.js";
import BettingContractJson from "footy-oracle-contract/artifacts/contracts/BettingAIO.sol/BettingAIO.json";
import MarketMakerContractJson from "footy-oracle-contract/artifacts/contracts/MarketMakerAIO.sol/MarketMakerAIO.json";
import NFTMarketplaceContractJson from "footy-oracle-contract/artifacts/contracts/MarketMakerAIO.sol/MarketMakerAIO.json";
import LosslessManagerContractJson from "footy-oracle-contract/artifacts/contracts/LosslessManager.sol/LosslessManager.json";

import { Contract } from "web3-eth-contract";
import { Ref, ref, watch } from "vue";
import { AbiItem } from "web3-utils";
import { useChain } from "./chain";
import { useMoralis } from "./moralis";

const bettingContractAddress = <Ref<string>>ref();
const marketMakerContractAddress = <Ref<string>>ref();
const nftMarketplaceContractAddress = <Ref<string>>ref();
const losslessManagerContractAddress = <Ref<string>>ref();

const bettingContract = <Ref<Contract>>ref();
const marketMakerContract = <Ref<Contract>>ref();
const nftMarketplaceContract = <Ref<Contract>>ref();
const losslessManagerContract = <Ref<Contract>>ref();

const isLoaded = ref(false);

export const useContract = () => {
  const { web3, isWeb3Enabled } = useMoralis();
  const { activeChain, getConfigName } = useChain();

  const loadBettingContract = async (): Promise<void> => {
    const config = await Moralis.Config.get({ useMasterKey: false });
    const result = config.get(getConfigName("betting_contract"));
    if (result) {
      bettingContractAddress.value = result.toLowerCase();
      if (isWeb3Enabled.value) {
        bettingContract.value = new web3.value.eth.Contract(BettingContractJson.abi as AbiItem[], bettingContractAddress.value);
      }
    }
  };

  const loadMarketMakerContractAddress = async (): Promise<void> => {
    const config = await Moralis.Config.get({ useMasterKey: false });
    const result = config.get(getConfigName("market_maker_contract"));
    if (result) {
      marketMakerContractAddress.value = result.toLowerCase();
      if (isWeb3Enabled.value) {
        marketMakerContract.value = new web3.value.eth.Contract(MarketMakerContractJson.abi as AbiItem[], marketMakerContractAddress.value);
      }
    }
  };

  const loadNFTMarketplaceContract = async (): Promise<void> => {
    const config = await Moralis.Config.get({ useMasterKey: false });
    const result = config.get(getConfigName("nft_marketplace_contract"));
    if (result) {
      nftMarketplaceContractAddress.value = result.toLowerCase();
      if (isWeb3Enabled.value) {
        nftMarketplaceContract.value = new web3.value.eth.Contract(NFTMarketplaceContractJson.abi as AbiItem[], nftMarketplaceContractAddress.value);
      }
    }
  };

  const loadLosslessManagerContract = async (): Promise<void> => {
    const config = await Moralis.Config.get({ useMasterKey: false });
    const result = config.get(getConfigName("lossless_manager_contract"));

    //console.log('loadLosslessManagerContract result = ' , result);
    if (result) {
      losslessManagerContractAddress.value = result.toLowerCase();
      if (isWeb3Enabled.value) {
        losslessManagerContract.value = new web3.value.eth.Contract(LosslessManagerContractJson.abi as AbiItem[], losslessManagerContractAddress.value);
      }
    }
  };

  const loadAll = async () => {
    await Promise.all([loadBettingContract(), loadMarketMakerContractAddress(), loadNFTMarketplaceContract(), loadLosslessManagerContract()]);
  };

  // reset contracts after network switch
  watch(activeChain, () => {
    if (isLoaded.value) {
      //console.log("changed");
      isLoaded.value = false;
      loadAll().then(() => (isLoaded.value = true));
    }
  });

  if (!isLoaded.value) {
    loadAll().then(() => (isLoaded.value = true));
  }

  return {
    bettingContract,
    marketMakerContract,
    nftMarketplaceContract,
    bettingContractAddress,
    marketMakerContractAddress,
    nftMarketplaceContractAddress,
    bettingAbi: BettingContractJson.abi as AbiItem[],
    marketMakerAbi: MarketMakerContractJson.abi as AbiItem[],
    losslessManagerContract,
    losslessManagerContractAddress,
  };
};
