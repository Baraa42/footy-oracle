import { Moralis as MoralisTypes } from "moralis/types";

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
    block_number_minted: string;
    contract_type: string;
    token_uri: string;
    synced_at: Date;
    name: string;
    symbol: string;
  };
  parsed_metadata?: NftMetadata;
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
  parsed_metadata?: NftMetadata;
}
