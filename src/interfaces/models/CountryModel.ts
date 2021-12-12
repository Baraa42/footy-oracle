import { Moralis as MoralisTypes } from "moralis/types";
import { LeagueModel } from "./LeagueModel";

export interface CountryModel extends MoralisTypes.Object<MoralisTypes.Attributes> {
  attributes: {
    name: string;
    code: string;
    flag: string;
    isActive: boolean;
  };
  leagues?: Array<LeagueModel>;
}
