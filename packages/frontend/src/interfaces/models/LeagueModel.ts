import Moralis from "moralis/dist/moralis.js";
import { CountryModel } from "./CountryModel";

export interface LeagueModel extends Moralis.Object<Moralis.Attributes> {
  attributes: {
    name: string;
    logo: string;
    country: CountryModel;
    type: string;
    season: number;
    apiId: number;
    isActive: boolean;
  };
}
