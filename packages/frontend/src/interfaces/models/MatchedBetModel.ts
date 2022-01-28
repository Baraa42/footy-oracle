import Moralis from "moralis/dist/moralis.js";
import { BetTypeEnum } from "../enums/BetTypeEnum";
import { NFTMintStatus } from "../enums/NFTMintStatus";
import { SelectionEnum } from "../enums/SelectionEnum";
import { EventModel } from "./EventModel";
import { NftOwnerModel } from "./NftOwnerModel";
import { UserModel } from "./UserModel";

export interface MatchedBetModel extends Moralis.Object<Moralis.Attributes> {
  attributes: {
    apiId: string;
    betType: number;
    betSide: BetTypeEnum;
    selection: SelectionEnum;
    odds: string;
    amount: string;
    isMinted: boolean;
    won?: boolean;
    nft?: NftOwnerModel;
    from: string; // from user
    address: string; // from contract
    block_hash: string;
    block_timestamp: Date;
    transaction_hash: string;
    transaction_index: number;
    log_index: number;
    confirmed: boolean;
    mintStatus?: NFTMintStatus;
    tokenId?: string;
    event?: EventModel;
    user?: UserModel;
    createdAt: Date;
    updatedAt: Date;
  };
}
