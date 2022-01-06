import { Moralis as MoralisTypes } from "moralis/types";
export interface InnerQuery {
  relation: string;
  query: MoralisTypes.Query;
}

export interface QueryParms {
  select?: string[];
  filter?: {
    id?: string;
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
