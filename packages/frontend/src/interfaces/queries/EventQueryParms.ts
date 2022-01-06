import { LeagueModel } from "../models/LeagueModel";
import { InnerQuery, QueryParms } from "./QueryParms";

export interface EventQueryParms extends QueryParms {
  select?: string[];
  filter?: {
    id?: string;
    apiId?: number;
    league?: LeagueModel;
    onlyFutureEvents?: boolean;
  };
  sort?: {
    key: string;
    direction: "ASC" | "DESC";
  };
  limit?: number;
  skip?: number;
  inlcude?: string[];
  innerQuery?: InnerQuery[];
}
