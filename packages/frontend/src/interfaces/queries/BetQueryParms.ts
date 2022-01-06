import { InnerQuery, QueryParms } from "./QueryParms";

export interface BetQueryParms extends QueryParms {
  select?: string[];
  filter?: {
    id?: string;
    betType?: number;
    betSide?: number;
    selection?: number;
    odds?: string;
    amount?: string;
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
