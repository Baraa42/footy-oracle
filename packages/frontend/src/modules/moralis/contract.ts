import BettingContractJson from "footy-oracle-contract/artifacts/contracts/Betting.sol/Betting.json";

export const useContract = () => {
  return { bettingAbi: BettingContractJson.abi };
};
