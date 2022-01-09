import Moralis from "moralis/dist/moralis.js";
export interface InnerQuery {
  relation: string;
  query: Moralis.Query;
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
