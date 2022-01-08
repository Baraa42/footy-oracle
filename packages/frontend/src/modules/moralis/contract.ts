import BettingContractJson from "footy-oracle-contract/artifacts/contracts/BettingAIO.sol/BettingAIO.json";
import { Ref, ref } from "vue";
import { useMoralis } from "./moralis";

const polygonContract = <Ref<String>>ref();

const getBettingContract = async (): Promise<String> => {
  //TODO ask other module which network is active
  if (!polygonContract.value) {
    const { Moralis } = useMoralis();
    const config = await Moralis.Config.get({ useMasterKey: false });
    polygonContract.value = config.get("polygon_contract");
  }
  return polygonContract.value;
};

export const useContract = () => {
  return { bettingAbi: BettingContractJson.abi, getBettingContract };
};
