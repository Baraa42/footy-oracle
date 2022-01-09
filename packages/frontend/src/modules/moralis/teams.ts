import Moralis from "moralis/dist/moralis.js";
import { useMoralisObject } from "./moralisObject";
import { TeamModel } from "../../interfaces/models/TeamModel";

const { Object: Team, createQuery } = useMoralisObject("Team");

/**
 * Get team by its name
 *
 * @param  {string} name
 * @returns Promise
 */
const getTeamByName = async (name: string): Promise<TeamModel | undefined> => {
  const query = createQuery() as Moralis.Query<TeamModel>;
  query.equalTo("name", name);
  return await query.first();
};

/**
 * Get team by its id
 *
 * @param  {string} name
 * @returns Promise
 */
const getTeamById = async (id: string): Promise<TeamModel | undefined> => {
  const query = createQuery() as Moralis.Query<TeamModel>;
  query.equalTo("objectId", id);
  return await query.first();
};

/**
 * Get all teams
 *
 */
const getTeams = async (): Promise<Array<TeamModel> | undefined> => {
  const query = createQuery() as Moralis.Query<TeamModel>;
  return await query.find();
};

export const useTeams = () => {
  return { Team, getTeamByName, getTeamById, getTeams };
};
