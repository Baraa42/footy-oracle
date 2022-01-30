import Moralis from "moralis/dist/moralis.js";
import { Ref, ref } from "vue";
import { useMoralisObject } from "./moralisObject";
import { useMoralis } from "./moralis";
import { TokenBalance } from "../../interfaces/TokenBalance";
import { useChain } from "./chain";
import { BalancePendingModel } from "@/interfaces/models/BalancePendingModel";
import { useSubscription } from "./subscription";

const nativeBalance: Ref<string | undefined> = ref(); // globaly stored once
const nativeBalanceSubscription: Ref<Moralis.LiveQuerySubscription | undefined> = ref(); // globaly stored once

const tokenBalances: Ref<Array<TokenBalance> | undefined> = ref(); // globaly stored once
const tokenBalancesSubscription: Ref<Moralis.LiveQuerySubscription | undefined> = ref(); // globaly stored once

/**
 * Get native balance from address, based on active chain
 *
 * @returns Promise
 */
const loadNativeBalance = async (address: string): Promise<string> => {
  const { activeChain } = useChain();
  const balance = await Moralis.Web3API.account.getNativeBalance({
    chain: activeChain.value.chain,
    address: address,
  });

  if (balance.balance == "0") {
    return balance.balance;
  }

  const { web3 } = useMoralis();
  return web3.value.utils.fromWei(balance.balance);
};

/**
 * Get native balance from chain and subscribe to updates
 *
 * @returns Promise
 */
const getNativeBalance = async (): Promise<Ref<string | undefined>> => {
  const { userAddress } = useMoralis();

  if (!userAddress.value) {
    return nativeBalance;
  }
  nativeBalance.value = await loadNativeBalance(userAddress.value);

  // Create subscription query if not already subscribed
  if (!nativeBalanceSubscription.value) {
    const { getClassName } = useChain();
    const { createQuery } = useMoralisObject(getClassName("BalancePending"));
    const query = createQuery() as Moralis.Query<BalancePendingModel>;
    query.equalTo("address", userAddress.value);

    // Create live subscriptions
    const { subscribe } = useSubscription();
    subscribe(query).then((subscription: Moralis.LiveQuerySubscription) => {
      nativeBalanceSubscription.value = subscription;
      nativeBalanceSubscription.value.on("create", async () => {
        nativeBalance.value = await loadNativeBalance(userAddress.value || "");
      });
    });
  }

  return nativeBalance;
};

/**
 * Get token balances from address, based on active chain
 *
 * @returns Promise
 */
const loadTokenBalances = async (address: string): Promise<Array<TokenBalance> | undefined> => {
  const { activeChain } = useChain();
  const balances = await Moralis.Web3API.account.getTokenBalances({
    chain: activeChain.value.chain,
    address: address,
  });
  return balances;
};

/**
 * Get token balance from chain and subscribe to updates
 *
 * @returns Promise
 */
const getTokenBalances = async (): Promise<Ref<Array<TokenBalance> | undefined>> => {
  const { userAddress } = useMoralis();

  if (!userAddress.value) {
    return tokenBalances;
  }
  tokenBalances.value = await loadTokenBalances(userAddress.value);

  // Create subscription query if not already subscribed
  if (!tokenBalancesSubscription.value) {
    const { getClassName } = useChain();
    const { createQuery } = useMoralisObject(getClassName("TokenBalance"));
    const query = createQuery();
    query.equalTo("address", userAddress.value);

    const onSubscription = async () => {
      tokenBalances.value = await loadTokenBalances(userAddress.value || "");
    };

    // Create live subscriptions
    const { subscribe } = useSubscription();
    subscribe(query).then((subscription: Moralis.LiveQuerySubscription) => {
      tokenBalancesSubscription.value = subscription;
      tokenBalancesSubscription.value.on("create", onSubscription);
      tokenBalancesSubscription.value.on("update", onSubscription);
    });
  }

  console.log(tokenBalances);

  return tokenBalances;
};

export const useBalance = () => {
  return { getNativeBalance, getTokenBalances };
};
