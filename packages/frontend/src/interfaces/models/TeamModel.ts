import Moralis from "moralis/dist/moralis.js";
import { CountryModel } from "./CountryModel";

export interface TeamModel extends Moralis.Object<Moralis.Attributes> {
  attributes: {
    name: string;
    logo: string;
    primaryColor: string;
    secondaryColor?: string;
    country?: CountryModel;
    isNational: boolean;
  };
}
