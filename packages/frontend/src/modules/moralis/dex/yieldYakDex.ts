import useDex from "./dex";
import { SwapItem } from "../../../interfaces/SwapItem";
import { Token } from "@/interfaces/Token";
import avaxTokens from "@/assets/yieldyak/tokens.json";

export const useYieldYakDex = () => {
  const { tokens, findToken, getTokenPrice } = useDex();

  const getSupportedTokens = async (): Promise<Token[]> => {
    tokens.value = avaxTokens.map((token) => {
      return {
        symbol: token.symbol,
        name: token.symbol,
        decimals: token.decimals,
        address: token.address,
        logoURI: "https://storage.googleapis.com/yak/tokens/" + token.address + ".png",
        permitSupported: token.permitSupported,
      };
    });
    return tokens.value;
  };

  const getQuote = async (from: SwapItem, to: SwapItem) => {};
  const trySwap = async (from: SwapItem, to: SwapItem, chain: string = "polygon") => {};

  return { getSupportedTokens, getQuote, trySwap, tokens, getTokenPrice, findToken };
};
