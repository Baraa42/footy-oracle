import BettingContractJson from "footy-oracle-contract/artifacts/contracts/BettingAIO.sol/BettingAIO.json";

export const useContract = () => {
  return { bettingAbi: BettingContractJson.abi };
};
