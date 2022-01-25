import { InnerQuery, QueryParms } from "./QueryParms";

export interface NFTTQueryParms extends QueryParms {
  select?: string[];
  filter?: {
    id?: string;
    tokenId?: string;
    hasOffer?: boolean;
    hasBet?: boolean;
    hasLP?: boolean;
    hasBetOrLP?: boolean;
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
