import { Ref, ref } from "vue";
import { SwapItem } from "../../interfaces/SwapItem";
import { Token } from "../../interfaces/Token";
import { TokenPrice } from "../../interfaces/web3/TokenPrice";
import { useMoralis } from "./moralis";

const tokens: Ref<Array<Token> | undefined> = ref();

const useDex = () => {
  const { Moralis, moralisUser }: { Moralis: any; moralisUser: any } = useMoralis();

  const getSupportedTokens = async (chain: string = "polygon") => {
    if (tokens.value) {
      return tokens.value;
    }
    await new Promise((r) => setTimeout(r, 1000)); // dont know what the problem is, plugins needs to init?
    const tokenList = await Moralis.Plugins.oneInch.getSupportedTokens({ chain });
    tokens.value = Object.keys(tokenList.tokens).map((key) => tokenList.tokens[key]);
    return tokens.value;
  };

  /**
   * Search for token by symbol in supported token list
   *
   * @param symbol
   * @returns
   */
  const findToken = (symbol: string): Token | undefined => {
    return tokens.value?.find((item) => item?.symbol === symbol);
  };

  /**
   *
   * Get token price form moralis web3 api
   *
   * @param address
   * @param chain
   * @param exchange
   */
  const getTokenPrice = async (address: string, chain: string = "polygon", exchange?: string): Promise<TokenPrice | undefined> => {
    try {
      const tokenPrice: TokenPrice = await Moralis.Web3API.token.getTokenPrice({ address, chain, exchange });
      return tokenPrice;
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Get Quote
   *
   * @param from
   * @param to
   * @param chain
   * @returns
   */
  const getQuote = async (from: SwapItem, to: SwapItem, chain: string = "polygon") => {
    try {
      const quote = await Moralis.Plugins.oneInch.quote({
        chain: chain, // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: from.token?.address, // The token you want to swap
        toTokenAddress: to.token?.address, // The token you want to receive
        amount: Moralis.Units.Token(from.value, from.token?.decimals).toString(),
      });
      console.log(quote);
      return quote;
    } catch (e) {
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
    console.log({
      chain, // The blockchain you want to use (eth/bsc/polygon)
      fromTokenAddress: from.token?.address, // The token you want to swap
      fromAddress: moralisUser.value?.get("ethAddress"), // Your wallet address
      amount: Number(from.value),
    });

    if (from.token?.address !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
      await Moralis.Plugins.oneInch
        .hasAllowance({
          chain, // The blockchain you want to use (eth/bsc/polygon)
          fromTokenAddress: from.token?.address, // The token you want to swap
          fromAddress: moralisUser.value?.get("ethAddress"), // Your wallet address
          amount: Number(from.value),
        })
        .then(async (allowance: any) => {
          console.log(allowance);
          if (!allowance) {
            await Moralis.Plugins.oneInch.approve({
              chain, // The blockchain you want to use (eth/bsc/polygon)
              tokenAddress: from.token?.address, // The token you want to swap
              fromAddress: moralisUser.value?.get("ethAddress"), // Your wallet address
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
  async function doSwap(from: SwapItem, to: SwapItem, chain: string = "polygon") {
    return await Moralis.Plugins.oneInch.swap({
      chain: chain, // The blockchain you want to use (eth/bsc/polygon)
      fromTokenAddress: from.token?.address, // The token you want to swap
      toTokenAddress: to.token?.address, // The token you want to receive
      amount: Moralis.Units.Token(from.value, from.token?.decimals).toString(),
      fromAddress: moralisUser.value?.get("ethAddress"), // Your wallet address
      slippage: 1,
    });
  }

  return { getSupportedTokens, getQuote, trySwap, tokens, getTokenPrice, findToken };
};

export default useDex;
