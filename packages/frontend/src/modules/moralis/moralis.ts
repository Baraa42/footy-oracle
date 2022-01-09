import { computed, Ref, ref, toRef } from "vue";
import { useFavorites } from "./favorites";
import { Betslip } from "../../interfaces/Betslip";
import { useBet } from "./bets";
import { NftOwnerModel, ListedNftModel } from "../../interfaces/models/NftOwnerModel";
import { User } from "../../interfaces/User";
import { FavoriteModel } from "../../interfaces/models/FavoriteModel";
import { UnmatchedBetModel } from "../../interfaces/models/UnmatchedBetModel";
import { MatchedBetModel } from "../../interfaces/models/MatchedBetModel";
import { useNFTs } from "./nfts";
import { useBalance } from "./balance";
import { TokenBalance } from "../../interfaces/TokenBalance";
import Moralis from "moralis/dist/moralis.js";
import Web3 from "web3";

/**
 * The user object where all relevant information were stored
 */
const user: Ref<User> = ref({
  isAuthenticated: false,
  balances: {
    available: 0,
    liability: 0,
    tokens: [],
  },
  moralis: undefined,
  favorites: [],
  betslip: [],
  unmatchedBets: [],
  matchedBets: [],
  listedNfts: [],
  nfts: [],
});

/**
 * Chached Web3 Provider
 */
const web3 = <Ref<Moralis.Web3>>ref();

/**
 * Reference for all favorite events for logged in user
 */
const favorites: Ref<Array<FavoriteModel> | undefined> = toRef(user.value, "favorites");
/**
 * Reference for betslip
 */
const betslip: Ref<Array<Betslip> | undefined> = toRef(user.value, "betslip");
/**
 * Reference for owned NFTs
 */
const nfts: Ref<Array<NftOwnerModel> | undefined> = toRef(user.value, "nfts");

/**
 * Reference for NFTs Listed in Marketplace
 */
const listedNfts: Ref<Array<ListedNftModel> | undefined> = toRef(user.value, "listedNfts");

const isAuthenticated = computed((): boolean => user.value.isAuthenticated); // read only access to is authenticated state
const moralisUser = computed((): Moralis.User | undefined => user.value.moralis); // read only access to the moralis user
const balance = computed(() => user.value.balances);
const tokens = computed((): Array<TokenBalance> => user.value.balances.tokens);
const unmatchedBets = computed((): Array<UnmatchedBetModel> | undefined => user.value.unmatchedBets);
const matchedBets = computed((): Array<MatchedBetModel> | undefined => user.value.matchedBets);
const userAddress = computed((): string | undefined => user.value.moralis?.get("ethAddress"));

const chainOptions: any = {
  chain: "mumbai",
};

/**
 * Logges the user in and load all relevant data for the user
 * TODO add live queries to user
 */
const login = async (): Promise<void> => {
  if (!web3.value) {
    web3.value = await Moralis.Web3.enableWeb3();
  }
  const moralisUser = await Moralis.Web3.authenticate();
  if (moralisUser) {
    user.value.moralis = moralisUser as Moralis.User;
    user.value.isAuthenticated = true;
    await Promise.all([loadNativeBalance(), loadTokenBalance(), loadNfts(), loadUnmatchedBets(), loadMatchedBets(), loadFavorites()]); // load all user specific data
  }
};

/**
 * Init user from cache and load all relevant data for the user
 * TODO add live queries to user
 */
const initUserFromCache = async (): Promise<void> => {
  if (!web3.value) {
    web3.value = await Moralis.Web3.enableWeb3();
  }

  const currentUser = Moralis.User.current();
  if (currentUser) {
    user.value.moralis = currentUser as Moralis.User;
    user.value.isAuthenticated = true;
    await Promise.all([loadNativeBalance(), loadTokenBalance(), loadNfts(), loadUnmatchedBets(), loadMatchedBets(), loadFavorites()]); // load all user specific data
  }
};

/**
 * Get native balance from user
 *
 * @returns Promise
 */
const loadNativeBalance = async (): Promise<void> => {
  const { getNativeBalance } = useBalance();
  const balance: Ref<string | undefined> = await getNativeBalance();
  if (balance.value) {
    user.value.balances.available = Number(balance.value);
  }
};

/**
 * Get token balance from user
 *
 * @returns Promise
 */
const loadTokenBalance = async (): Promise<void> => {
  const { getTokenBalances } = useBalance();
  const tokens: Ref<Array<TokenBalance> | undefined> = await getTokenBalances();
  if (tokens.value) {
    user.value.balances.tokens = tokens.value;
  }
};

/**
 * Get current nfts from user
 *
 * @returns Promise
 */
const loadNfts = async (): Promise<void> => {
  const { getNFTs } = useNFTs();
  const localNfts: Ref<Array<NftOwnerModel> | undefined> = await getNFTs();
  if (localNfts.value) {
    user.value.nfts = localNfts.value;
  }
};

const loadFavorites = async () => {
  const { getFavorites } = useFavorites();
  user.value.favorites = await getFavorites();
};

const loadMatchedBets = async () => {
  const { getMatchedBets } = useBet();
  const matchedBets: Ref<Array<MatchedBetModel> | undefined> = await getMatchedBets();
  if (matchedBets.value) {
    user.value.matchedBets = matchedBets.value;
  }
};

const loadUnmatchedBets = async () => {
  const { getUnmatchedBets } = useBet();
  const unmatchedBets: any = await getUnmatchedBets();
  user.value.unmatchedBets = unmatchedBets;
};

export const useMoralis = () => {
  return {
    Moralis,
    web3,
    userAddress,
    chainOptions,
    login,
    initUserFromCache,
    isAuthenticated,
    betslip,
    moralisUser,
    favorites,
    balance,
    loadNativeBalance,
    unmatchedBets,
    matchedBets,
    tokens,
    nfts,
    loadNfts,
    listedNfts,
  };
};
