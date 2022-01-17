import { Ref, ref } from "vue";
import { Token } from "../../../interfaces/Token";
import { TokenPrice } from "../../../interfaces/web3/TokenPrice";
import { useChain } from "../chain";
import Moralis from "moralis/dist/moralis.js";

const tokens: Ref<Array<Token> | undefined> = ref();

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
const getTokenPrice = async (address: string, exchange?: string): Promise<TokenPrice | undefined> => {
  try {
    const { activeChain } = useChain();

    if (address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
      const tokenPrice = (await Moralis.Web3API.token.getTokenPrice({
        address: activeChain.value.nativePriceAddress,
        chain: activeChain.value.nativePriceFrom,
        exchange,
      })) as TokenPrice;
      return tokenPrice;
    } else {
      const tokenPrice = (await Moralis.Web3API.token.getTokenPrice({ address, chain: activeChain.value.settings?.oneInchChain, exchange })) as TokenPrice;
      return tokenPrice;
    }
  } catch (e: any) {
    console.error(e);
  }
};

const useDex = () => {
  return {
    tokens,
    findToken,
    getTokenPrice,
  };
};

export default useDex;
