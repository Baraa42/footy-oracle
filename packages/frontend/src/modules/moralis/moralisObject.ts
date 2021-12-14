import Moralis from "moralis/dist/moralis.js";

export const useMoralisObject = (object: string) => {
  const Object = Moralis.Object.extend(object);

  const createQuery = () => {
    return new Moralis.Query(Object);
  };

  return { Object, createQuery };
};
