import Moralis from "moralis/dist/moralis.js";
import { CountryModel } from "../../interfaces/models/CountryModel";
import { useMoralisObject } from "./moralisObject";

const { Object: Country, createQuery } = useMoralisObject("Country");

/**
 * Get country by its name
 *
 * @param  {string} name
 * @param  {boolean} onlyActive=true
 * @returns Promise
 */
const getCountry = async (name: string, onlyActive: boolean = true): Promise<CountryModel | undefined> => {
  const query = createQuery() as Moralis.Query<CountryModel>;

  if (onlyActive) {
    query.equalTo("isActive", true);
  }

  query.equalTo("name", name);
  return await query.first();
};

/**
 * Get all countries
 *
 * @param  {boolean} onlyActive=true
 */
const getCountries = async (onlyActive: boolean = true): Promise<Array<CountryModel>> => {
  const query = createQuery() as Moralis.Query<CountryModel>;
  if (onlyActive) {
    query.equalTo("isActive", true);
  }
  return await query.find();
};

export const useCountry = () => {
  return { Country, getCountry, getCountries };
};
