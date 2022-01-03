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
}
