import { Moralis as MoralisTypes } from "moralis/types";
import { MatchedBetModel } from "./MatchedBetModel";

export interface NftMetadataAttribute {
  [key: string]: string;
  value: any;
}

export interface NftMetadata {
  name: string;
  description: string;
  external_url: string;
  image: string;
  attributes: NftMetadataAttribute[];
}

export interface NftOwnerModel extends MoralisTypes.Object<MoralisTypes.Attributes> {
  attributes: {
    token_id: string;
    amount: string;
    owner_of: string;
    block_number: string;
    token_address: string;
    block_number_minted: string;
    contract_type: string;
    token_uri: string;
    synced_at: Date;
    name: string;
    symbol: string;
    metadata?: NftMetadata;
    bet?: MatchedBetModel;
    offer?: ListedNftModel;
    closedOffer?: ListedNftModel;
  };
}

export interface NftOwnerPendingModel extends MoralisTypes.Object<MoralisTypes.Attributes> {
  attributes: {
    token_id: string;
    amount: string;
    owner_of: string;
    block_number: string;
    contract_type: string;
    token_uri: string;
    name: string;
    symbol: string;
  };
}

export interface ListedNftModel extends MoralisTypes.Object<MoralisTypes.Attributes> {
  attributes: {
    createdAt: string;
    updatedAt: string;
    transaction_hash: string;
    log_index: number;
    offeringId: string;
    hostContract: string;
    offerer: string;
    tokenId: string;
    price: string;
    uri: string;
    address: string;
    block_hash: string;
    block_number: string;
    transaction_index: number;
    block_timestamp: string;
    confirmed: boolean;
  };
  parsed_metadata?: NftMetadata;
}

export interface MumbaiDepositLPModel extends MoralisTypes.Object<MoralisTypes.Attributes> {
  attributes: {
    uri: string;
    address: string;
    tokenId: string;
    depositAmount: string;
  };
}
