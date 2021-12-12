import { Moralis as MoralisTypes } from "moralis/types";
import { CountryModel } from "./CountryModel";

export interface LeagueModel extends MoralisTypes.Object<MoralisTypes.Attributes> {
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
