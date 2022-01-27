import { NftOwnerModel } from "./NftOwnerModel";
import Moralis from "moralis/dist/moralis.js";

export interface DepositLP extends Moralis.Object<Moralis.Attributes> {
  attributes: {
    tokenId: string;
    uri: string;
    depositAmount: string;
    nft?: NftOwnerModel;
    address?: string;
    block_hash?: string;
    block_timestamp?: Date;
    transaction_hash?: string;
    transaction_index?: number;
    log_index?: number;
    confirmed: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
