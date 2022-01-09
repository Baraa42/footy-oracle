import Moralis from "moralis/dist/moralis.js";
import { LeagueModel } from "./LeagueModel";

export interface CountryModel extends Moralis.Object<Moralis.Attributes> {
  attributes: {
    name: string;
    code: string;
    flag: string;
    isActive: boolean;
  };
  leagues?: Array<LeagueModel>;
}
