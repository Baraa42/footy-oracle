import BettingContractJson from "footy-oracle-contract/artifacts/contracts/BettingAIO.sol/BettingAIO.json";
import Moralis from "moralis/dist/moralis.js";
import { Ref, ref } from "vue";
import { AbiItem } from "web3-utils";
import { useMoralis } from "./moralis";

const polygonContract = <Ref<string>>ref();

const getBettingContract = async (): Promise<string> => {
  //TODO ask other module which network is active
  if (!polygonContract.value) {
    const { Moralis } = useMoralis();
    const config = await Moralis.Config.get({ useMasterKey: false });
    polygonContract.value = config.get("polygon_contract");
  }
  return polygonContract.value;
};

export const useContract = () => {
  return { bettingAbi: BettingContractJson.abi as AbiItem[], getBettingContract };
};
