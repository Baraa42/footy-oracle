import Moralis from "moralis/dist/moralis.js";
import { EventModel } from "../../interfaces/models/EventModel";
import { useTimezone } from "../settings/timezone";
import { useMoralisObject } from "./moralisObject";
import { Moralis as MoralisTypes } from "moralis/types";
import { EventQueryParms } from "../../interfaces/EventQueryParms";
import { EventClass } from "../../interfaces/classes/EventClass";

const { Object: Event, createQuery, handleQuery } = useMoralisObject("Event");
Moralis.Object.registerSubclass("Event", EventClass);

const getEventQuery = (parms: EventQueryParms): MoralisTypes.Query => {
  const query: MoralisTypes.Query = createQuery();

  handleQuery(query, parms);
  if (parms.filter?.onlyFutureEvents) {
    const { currentTimestamp } = useTimezone();
    query.greaterThan("start", currentTimestamp);
  }

  if (parms.filter?.apiId) {
    query.equalTo("apiId", parms.filter?.apiId);
  }

  if (parms.filter?.league) {
    query.equalTo("league", parms.filter?.league);
  }

  return query;
};

/**
 * Get single event by its api id
 *
 * @param apiId
 * @returns Promise
 */
const getEventByApiId = async (apiId: number): Promise<EventModel | undefined> => {
  const query = getEventQuery({ filter: { apiId: apiId } });
  return (await query.first()) as EventModel;
};

/**
 * Event search by home and away name
 *
 * @param  {string} search
 * @returns Promise
 */
const search = async (search: string): Promise<Array<EventModel>> => {
  if (!search) {
    return [];
  }
  const { currentTimestamp } = useTimezone();

  const homeQuery = createQuery();
  const awayQuery = createQuery();

  homeQuery.startsWith("home", search.charAt(0).toUpperCase() + search.slice(1));
  awayQuery.startsWith("away", search.charAt(0).toUpperCase() + search.slice(1));
  const matchQuery = Moralis.Query.or(homeQuery, awayQuery);

  const futureQuery = createQuery();
  futureQuery.greaterThan("start", currentTimestamp);

  const mainQuery = Moralis.Query.and(matchQuery, futureQuery);
  mainQuery.limit(10);
  mainQuery.include(["home", "away", "league.country"]);

  const results: Array<EventModel> = await mainQuery.find();
  return results;
};

export const useEvents = () => {
  return {
    Event,
    getEventQuery,
    getEventByApiId,
    search,
  };
};
