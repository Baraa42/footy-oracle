import Moralis from "moralis/dist/moralis.js";

export interface BalancePendingModel extends Moralis.Object<Moralis.Attributes> {
  attributes: {
    address: string;
    block_number: string;
    balance: string;
  };
}
