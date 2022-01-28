import { SelectionEnum } from "./../enums/SelectionEnum";
import Moralis from "moralis/dist/moralis.js";
import { EventModel } from "./EventModel";

export interface ResultModel extends Moralis.Object<Moralis.Attributes> {
  attributes: {
    apiId: string;
    result: SelectionEnum;
    isWithdrawn?: boolean;
    event?: EventModel;
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
