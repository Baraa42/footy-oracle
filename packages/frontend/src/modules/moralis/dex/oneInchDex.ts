import useDex from "./dex";
import { SwapItem } from "../../../interfaces/SwapItem";
import { useChain } from "../chain";
import Moralis from "moralis/dist/moralis.js";
import { useMoralis } from "../moralis";

export const useOneInchDex = () => {
  const { tokens, findToken, getTokenPrice } = useDex();
  const { activeChain } = useChain();

  const getSupportedTokens = async () => {
    if (tokens.value) {
      return tokens.value;
    }

    return Moralis.Web3.initPlugins().then(async () => {
      const tokenList = await Moralis.Plugins.oneInch.getSupportedTokens({ chain: activeChain.value.settings?.oneInchChain });
      console.log(tokenList);
      tokens.value = Object.keys(tokenList.tokens).map((key) => tokenList.tokens[key]);
      return tokens.value;
    });
  };

  /**
   * Get Quote
   *
   * @param from
   * @param to
   * @param chain
   * @returns
   */
  const getQuote = async (from: SwapItem, to: SwapItem) => {
    try {
      if (from.value && from.token) {
        const quote = await Moralis.Plugins.oneInch.quote({
          chain: activeChain.value.settings?.oneInchChain, // The blockchain you want to use (eth/bsc/polygon)
          fromTokenAddress: from.token?.address, // The token you want to swap
          toTokenAddress: to.token?.address, // The token you want to receive
          amount: Moralis.Units.Token(from.value, from.token.decimals).toString(),
        });

        return quote;
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  /**
   *
   * @param from
   * @param to
   * @param chain
   */
  async function trySwap(from: SwapItem, to: SwapItem, chain: string = "polygon") {
    const { userAddress } = useMoralis();
    if (from.token?.address !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
      await Moralis.Plugins.oneInch
        .hasAllowance({
          chain: activeChain.value.settings?.oneInchChain, // The blockchain you want to use (eth/bsc/polygon)
          fromTokenAddress: from.token?.address, // The token you want to swap
          fromAddress: userAddress.value, // Your wallet address
          amount: Number(from.value),
        })
        .then(async (allowance: any) => {
          console.log(allowance);
          if (!allowance) {
            await Moralis.Plugins.oneInch.approve({
              chain: activeChain.value.settings?.oneInchChain, // The blockchain you want to use (eth/bsc/polygon)
              tokenAddress: from.token?.address, // The token you want to swap
              fromAddress: userAddress.value, // Your wallet address
            });
          }
        })
        .catch((e: any) => console.error(e.message));
    }
    await doSwap(from, to, chain)
      .then((receipt) => {
        if (receipt.statusCode !== 400) {
          console.log("Swap Complete");
        }
        console.log(receipt);
      })
      .catch((e) => console.error(e.message));
  }

  /**
   *
   * @param from
   * @param to
   * @param chain
   * @returns
   */
  async function doSwap(from: SwapItem, to: SwapItem, chain: any) {
    try {
      const { userAddress } = useMoralis();
      if (from.value && from.token) {
        return await Moralis.Plugins.oneInch.swap({
          chain: chain, // The blockchain you want to use (eth/bsc/polygon)
          fromTokenAddress: from.token?.address, // The token you want to swap
          toTokenAddress: to.token?.address, // The token you want to receive
          amount: Moralis.Units.Token(from.value, from.token.decimals).toString(),
          fromAddress: userAddress.value, // Your wallet address
          slippage: 1,
        });
      }
    } catch (err: any) {
      console.error(err);
    }
  }

  return { getSupportedTokens, getQuote, trySwap, tokens, getTokenPrice, findToken };
};
