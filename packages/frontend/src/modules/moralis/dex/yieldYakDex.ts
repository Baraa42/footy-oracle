import { useAlert } from "./../../layout/alert";
import { Adapter } from "./../../../interfaces/Quote";
import { useMoralis } from "./../moralis";
import useDex from "./dex";
import { SwapItem } from "../../../interfaces/SwapItem";
import { Token } from "@/interfaces/Token";
import { AbiItem } from "web3-utils";
import avaxTokens from "@/assets/yieldyak/tokens.json";
import YakRouterAbi from "avax-aggregator/abis/YakRouter.json";
import yieldYak from "@/assets/yieldyak/yieldyak.json";
import Moralis from "moralis/dist/moralis.js";
import { useChain } from "../chain";
import { Quote } from "@/interfaces/Quote";

const yakRouterAddr = "0xC4729E56b831d74bBc18797e0e17A295fA77488c";

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

  const getQuote = async (from: SwapItem, to: SwapItem): Promise<Quote | undefined> => {
    if (from.value && from.token && to.token) {
      const { web3 } = useMoralis();
      const yakRouterContract: any = new web3.value.eth.Contract(YakRouterAbi as AbiItem[], yakRouterAddr);

      try {
        //const { avalancheMainet, switchNetwork } = useChain();
        // await switchNetwork(avalancheMainet);

        const fromTokenAddr =
          from.token.address === "0x0000000000000000000000000000000000000000" ? "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7" : from.token.address;
        const toTokenAddr = to.token.address === "0x0000000000000000000000000000000000000000" ? "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7" : to.token.address;

        const result = await yakRouterContract.methods
          .findBestPathWithGas(Moralis.Units.Token(from.value, from.token.decimals).toString(), fromTokenAddr, toTokenAddr, 3, 225000000000)
          .call();
        console.log(result);

        const adapters = result.adapters.map((item: string, index: number) => {
          let fromToken = tokens.value?.find((token) => token.address == result.path[index]);
          let toToken = tokens.value?.find((token) => token.address == result.path[index + 1]);

          if (!fromToken) {
            fromToken = tokens.value?.find((token) => token.address == result.path[index - 1]);
          }
          if (!toToken) {
            toToken = tokens.value?.find((token) => token.address == toTokenAddr);
          }

          if (item in yieldYak.adapters) {
            const names: any = yieldYak.adapters;
            const name: string = names[item].platform.charAt(0).toUpperCase() + names[item].platform.slice(1);

            return {
              address: item,
              name: name,
              fromToken: fromToken,
              toToken: toToken,
            };
          } else {
            return {
              address: item,
              name: "Unknown Dex",
              fromToken: fromToken,
              toToken: toToken,
            };
          }
        });

        const quote: Quote = {
          fromToken: from.token,
          toToken: to.token,
          toTokenAmount: result.amounts[result.amounts.length - 1],
          fromTokenAmount: result.amounts[0],
          protocols: [],
          adapters: adapters,
          estimatedGas: result.gasEstimate,
          raw: result,
        };

        console.log(quote);

        return quote;
      } catch (err: any) {
        console.log(err);
      }
    }
  };
  const trySwap = async (from: SwapItem, to: SwapItem, quote?: Quote) => {
    const { web3, userAddress } = useMoralis();
    const { showSuccess } = useAlert();
    if (quote?.raw && userAddress.value) {
      const yakRouterContract: any = new web3.value.eth.Contract(YakRouterAbi as AbiItem[], yakRouterAddr);

      const trade: Array<any> = [];

      yakRouterContract.methods
        .swapNoSplit([quote.raw.amounts[0], quote.raw.amounts[quote.raw.amounts.length - 1], quote.raw.path, quote.raw.adapters], userAddress.value, 0)
        .send(
          {
            from: userAddress.value,
          },
          async (err: any, result: any) => {
            if (!err) {
              showSuccess("Tokens successfully placed");
            }
            console.log(result);
          }
        );
    }
  };

  return { getSupportedTokens, getQuote, trySwap, tokens, getTokenPrice, findToken };
};
