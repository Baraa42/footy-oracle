import { Moralis as MoralisTypes } from "moralis/types";

export interface BalancePendingModel extends MoralisTypes.Object<MoralisTypes.Attributes> {
  attributes: {
    address: string;
    block_number: string;
    balance: string;
  };
}
