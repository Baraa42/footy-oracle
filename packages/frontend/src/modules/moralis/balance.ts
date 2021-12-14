import Moralis from "moralis/dist/moralis.js";
import { Ref, ref } from "vue";
import { Moralis as MoralisTypes } from "moralis/types";
import { useMoralisObject } from "./moralisObject";
import { BalancePendingModel } from "../../interfaces/models/BalancePendingModel";
import { useMoralis } from "./moralis";
import { TokenBalance } from "../../interfaces/TokenBalance";

const nativeBalance: Ref<number | undefined> = ref();
const nativeBalanceSubscription: Ref<MoralisTypes.LiveQuerySubscription | undefined> = ref();

const tokenBalances: Ref<Array<TokenBalance> | undefined> = ref();
const tokenBalancesSubscription: Ref<MoralisTypes.LiveQuerySubscription | undefined> = ref();

export const useBalance = () => {
  const { moralisUser, chainOptions, web3 } = useMoralis();

  /**
   * Get native balance from chain and subscribe to updates
   *
   * @returns Promise
   */
  const getNativeBalance = async (): Promise<Ref<number | undefined>> => {
    if (!moralisUser.value) {
      return nativeBalance;
    }

    /**
     * Save native balance
     */
    nativeBalance.value = await loadNativeBalance();

    /**
     * Create live subscription for pending balances
     */
    const { Object: PolygonBalance, createQuery } = useMoralisObject("PolygonBalancePending");
    const subscriptionQuery: MoralisTypes.Query = createQuery();
    console.log(moralisUser.value.get("ethAddress"));
    subscriptionQuery.equalTo("address", moralisUser.value.get("ethAddress"));

    if (!nativeBalanceSubscription.value) {
      console.log("subsribe");
      nativeBalanceSubscription.value = await subscriptionQuery.subscribe();
    }

    /**
     * Reload balance if new pedding transaction is registred
     */
    nativeBalanceSubscription.value.on("create", async () => {
      // TODO add this balance or whait after completion
      nativeBalance.value = await loadNativeBalance();
      console.log("Subscription: Native balance updated");
    });

    return nativeBalance;
  };

  /**
   * Get native balance from chain
   *
   * @returns Promise
   */
  const loadNativeBalance = async (): Promise<number> => {
    const balance = await Moralis.Web3API.account.getNativeBalance(chainOptions);
    return web3.value.utils.fromWei(balance.balance);
  };

  /**
   * Get token balance from chain and subscribe to updates
   *
   * @returns Promise
   */
  const getTokenBalances = async (): Promise<Ref<Array<TokenBalance> | undefined>> => {
    if (!moralisUser.value) {
      return tokenBalances;
    }

    /**
     * Save token balance
     */
    tokenBalances.value = await loadTokenBalances();

    /**
     * Create live subscription for pending balances
     */
    const { Object: PolygonTokenBalance, createQuery } = useMoralisObject("PolygonTokenBalance");
    const subscriptionQuery: MoralisTypes.Query = createQuery();
    subscriptionQuery.equalTo("address", moralisUser.value.get("ethAddress"));

    if (!tokenBalancesSubscription.value) {
      console.log("subsribe2");
      tokenBalancesSubscription.value = await subscriptionQuery.subscribe();
    }

    /**
     * Reload balance on event
     */
    tokenBalancesSubscription.value.on("update", async () => {
      tokenBalances.value = await loadTokenBalances();
      console.log("Subscription: Token balance updated");
    });
    tokenBalancesSubscription.value.on("create", async () => {
      tokenBalances.value = await loadTokenBalances();
      console.log("Subscription: Token balance created");
    });

    return tokenBalances;
  };

  /**
   * Get token balance from chain
   *
   * @returns Promise
   */
  const loadTokenBalances = async (): Promise<Array<TokenBalance> | undefined> => {
    const balances = await Moralis.Web3API.account.getTokenBalances(chainOptions);
    return balances;
  };

  return { getNativeBalance, getTokenBalances };
};
