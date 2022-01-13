import Moralis from "moralis/dist/moralis.js";
import BettingContractJson from "footy-oracle-contract/artifacts/contracts/BettingAIO.sol/BettingAIO.json";
import MarketMakerContractJson from "footy-oracle-contract/artifacts/contracts/MarketMaker.sol/MarketMaker.json";

import { Ref, ref } from "vue";
import { AbiItem } from "web3-utils";
import { useMoralis } from "./moralis";

const mumbaiContract = <Ref<string>>ref();
const fujiContract = <Ref<string>>ref();

const getBettingContract = async (): Promise<string> => {
  //TODO ask other module which network is active
  if (!mumbaiContract.value) {
    const config = await Moralis.Config.get({ useMasterKey: false });
    mumbaiContract.value = config.get("polygon_contract");
  }
  return mumbaiContract.value;
};

export const useContract = () => {
  return { bettingAbi: BettingContractJson.abi as AbiItem[], getBettingContract };
};

export const useMarketMaker = () => {
  return { marketMakerAbi: MarketMakerContractJson.abi as AbiItem[] };
};
