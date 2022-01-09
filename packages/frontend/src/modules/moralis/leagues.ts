import Moralis from "moralis/dist/moralis.js";
import { LeagueModel } from "../../interfaces/models/LeagueModel";
import { useMoralisObject } from "./moralisObject";
import { CountryModel } from "../../interfaces/models/CountryModel";

const { Object: League, createQuery } = useMoralisObject("League");

/**
 * Get league by its name
 *
 * @param  {string} name
 * @param  {boolean} onlyActive=true
 * @param  {string} country?
 * @returns Promise
 */
const getLeagueByName = async (name: string, onlyActive: boolean = true, country?: CountryModel): Promise<LeagueModel | undefined> => {
  const query = createQuery() as Moralis.Query<LeagueModel>;

  if (onlyActive) {
    query.equalTo("isActive", true);
  }

  if (country) {
    query.equalTo("country", country);
  }

  query.equalTo("name", name);
  return await query.first();
};

/**
 * Get league by its id
 *
 * @param  {string} name
 * @param  {boolean} onlyActive=true
 * @param  {string} country?
 * @returns Promise
 */
const getLeagueById = async (id: string, onlyActive: boolean = true, country?: CountryModel): Promise<LeagueModel | undefined> => {
  const query = createQuery() as Moralis.Query<LeagueModel>;

  if (onlyActive) {
    query.equalTo("isActive", true);
  }
  if (country) {
    query.equalTo("country", country);
  }

  query.equalTo("objectId", id);
  return await query.first();
};

/**
 * Get all leagues
 *
 * @param  {boolean} onlyActive=true
 * @param  {CountryModel} country?
 */
const getLeagues = async (onlyActive: boolean = true, country?: CountryModel): Promise<Array<LeagueModel> | undefined> => {
  const query = createQuery() as Moralis.Query<LeagueModel>;

  if (onlyActive) {
    query.equalTo("isActive", true);
  }
  if (country) {
    query.equalTo("country", country);
  }

  return await query.find();
};

export const useLeagues = () => {
  return { League, getLeagueByName, getLeagueById, getLeagues };
};
