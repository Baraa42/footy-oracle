import { Moralis as MoralisTypes } from "moralis/types";
import { CountryModel } from "./CountryModel";

export interface TeamModel extends MoralisTypes.Object<MoralisTypes.Attributes> {
  attributes: {
    name: string;
    logo: string;
    primaryColor: string;
    secondaryColor?: string;
    country?: CountryModel;
    isNational: boolean;
  };
}
