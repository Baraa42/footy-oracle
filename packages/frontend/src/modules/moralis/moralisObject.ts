import { InnerQuery, QueryParms } from "@/interfaces/queries/QueryParms";
import Moralis from "moralis/dist/moralis.js";

export const useMoralisObject = (object: string) => {
  const Object = Moralis.Object.extend(object);

  const createQuery = () => {
    return new Moralis.Query(Object);
  };

  const handleQuery = (query: Moralis.Query, parms: QueryParms): Moralis.Query => {
    if (parms.select) {
      query.select(parms.select);
    }
    if (parms.filter?.id) {
      query.equalTo("objectId", parms.filter?.id);
    }

    if (parms.sort) {
      if (parms.sort.direction == "ASC") {
        query.ascending(parms.sort.key);
      } else if (parms.sort.direction == "DESC") {
        query.descending(parms.sort.key);
      }
    }

    if (parms.skip) {
      query.skip(parms.skip);
    }

    if (parms.limit) {
      query.limit(parms.limit);
    }

    if (parms.inlcude) {
      query.include(parms.inlcude);
    }

    if (parms.innerQuery) {
      parms.innerQuery.forEach((inner: InnerQuery) => {
        query.matchesQuery(inner.relation, inner.query);
      });
    }

    return query;
  };

  return { Object, createQuery, handleQuery };
};
