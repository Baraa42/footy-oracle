import { Moralis as MoralisTypes } from "moralis/types";
import { BetTypeEnum } from "../enums/BetTypeEnum";
import { NFTMintStatus } from "../enums/NFTMintStatus";
import { SelectionEnum } from "../enums/SelectionEnum";
import { EventModel } from "./EventModel";
import { NftOwnerModel } from "./NftOwnerModel";

export interface MatchedBetModel extends MoralisTypes.Object<MoralisTypes.Attributes> {
  attributes: {
    eventId: string;
    betType: BetTypeEnum;
    selection: SelectionEnum;
    odds: string;
    amount: string;
    isMinted: boolean;
    won?: boolean;
    nft?: NftOwnerModel;
    addr: string; // from user
    address: string; // from contract
    block_hash: string;
    block_timestamp: Date;
    transaction_hash: string;
    transaction_index: number;
    log_index: number;
    confirmed: boolean;
    mintStatus?: NFTMintStatus;
  };
  event?: EventModel;
}