import { BetTypeEnum } from "./enums/BetTypeEnum";
import { SelectionEnum } from "./enums/SelectionEnum";
import { EventModel } from "./models/EventModel";

export interface Betslip {
  event: EventModel;
  selection: SelectionEnum;
  type: BetTypeEnum;
  odds: number;
  stake: number;
  liability: number;
  profit: number;
}
