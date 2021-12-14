import { LeagueModel } from "./models/LeagueModel";

export interface EventQueryParms {
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
}
