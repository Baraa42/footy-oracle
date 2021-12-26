import { Moralis as MoralisTypes } from "moralis/types";
import { BetTypeEnum } from "../enums/BetTypeEnum";
import { SelectionEnum } from "../enums/SelectionEnum";

export interface UnmatchedBetModel extends MoralisTypes.Object<MoralisTypes.Attributes> {
  attributes: {
    apiId: string;
    betType: number;
    betSide: BetTypeEnum;
    selection: SelectionEnum;
    odds: string;
    amount: string;
    isMatched?: boolean;
    isPartMatched?: boolean;
    isCanceld?: boolean;
    from?: string;
    address?: string; // from contract
    block_hash?: string;
    block_timestamp?: Date;
    transaction_hash?: string;
    transaction_index?: number;
    log_index?: number;
    confirmed: boolean;
  };
  event?: any;
}
