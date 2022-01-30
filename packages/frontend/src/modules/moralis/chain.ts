import { useAlert } from "./../layout/alert";
import { Chain } from "@/interfaces/Chain";
import Polygon from "@/assets/svg/polygon.svg";
import PolygonRounded from "@/assets/svg/polygon-rounded.svg";
import Benqi from "@/assets/svg/benqi.svg";
import AAVE from "@/assets/svg/aave.svg";
import AvaxRounded from "@/assets/svg/avax-rounded.svg";
import { computed, markRaw, Ref, ref } from "vue";
import Moralis from "moralis/dist/moralis.js";
import { useOneInchDex } from "./dex/oneInchDex";
import { useYieldYakDex } from "./dex/yieldYakDex";
import useDex from "./dex/dex";
import Web3 from "web3";

const avalancheTestnet: Chain = {
  name: "Avalanche Fuji Testnet",
  chainId: 43113,
  chain: "0xa869",
  iconRounded: markRaw(AvaxRounded as {}),
  icon: markRaw(AvaxRounded as {}),
  iconClass: "",
  currencyName: "AVAX",
  currencySymbol: "AVAX",
  rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
  blockExplorerUrl: "https://testnet.snowtrace.io/",
  classPrefix: "Fuji",
  classPrefixMoralis: "Avax",
  attributePrefix: "fuji",
  nativePriceFrom: "avalanche",
  nativePriceAddress: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
  priceChain: "avalanche",
  defiProviders: [
    {
      name: "BENQI",
      logo: markRaw(Benqi as {}),
      depositApy: 4.71,
      rewardApy: 2.59,
    },
  ],
};

const avalancheMainet: Chain = {
  name: "Avalanche Mainet",
  chainId: 43114,
  chain: "0xa86a",
  iconRounded: markRaw(AvaxRounded as {}),
  icon: markRaw(AvaxRounded as {}),
  iconClass: "",
  currencyName: "AVAX",
  currencySymbol: "AVAX",
  rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
  blockExplorerUrl: "https://snowtrace.io",
  classPrefix: "Fuji",
  classPrefixMoralis: "Avax",
  attributePrefix: "fuji",
  nativePriceFrom: "avalanche",
  nativePriceAddress: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
  priceChain: "avalanche",
  defiProviders: [
    {
      name: "BENQI",
      logo: markRaw(Benqi as {}),
      depositApy: 4.71,
      rewardApy: 2.59,
    },
  ],
};

const polygonTestnet: Chain = {
  name: "Polygon Testnet Mumbai",
  chainId: 80001,
  chain: "0x13881",
  iconRounded: markRaw(PolygonRounded as {}),
  icon: markRaw(Polygon as {}),
  iconClass: "",
  currencyName: "MATIC",
  currencySymbol: "MATIC",
  rpcUrl: "https://rpc-mumbai.maticvigil.com/",
  blockExplorerUrl: "https://mumbai.polygonscan.com/",
  classPrefix: "Mumbai",
  classPrefixMoralis: "Polygon",
  attributePrefix: "mumbai",
  nativePriceFrom: "eth",
  nativePriceAddress: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
  priceChain: "polygon",
  settings: {
    oneInchChain: "polygon",
  },
  defiProviders: [
    {
      name: "AAVE",
      logo: markRaw(AAVE as {}),
      depositApy: 0.22,
      rewardApy: 0,
    },
  ],
};

const chains: Array<Chain> = [polygonTestnet, avalancheTestnet];
const activeChain = <Ref<Chain>>ref(chains[1]);
const chainsWithoutActive = computed((): Chain[] => chains.filter((chain) => chain.chainId != activeChain.value.chainId));
const moralisClassList = [
  "Balance",
  "BalancePending",
  "NFTOwners",
  "NFTOwnersPending",
  "NFTTransfers",
  "TokenBalance",
  "TokenBalancePending",
  "TokenTransfers",
  "Transactions",
];

/**
 * Changes chain and adding chain to metasmask and tries again, if its fail
 * Resets dex tokens, for refetching
 *
 * @param  {Chain} chain
 * @returns Promise
 */
const setActiveChain = async (chain: Chain): Promise<void> => {
  await switchNetwork(chain);
  const { tokens } = useDex();
  tokens.value = undefined;
  activeChain.value = chain;
};

/**
 * Checks current connected chain and sets active chain to it if avalible
 * otherwise switches to active chain
 *
 * @param  {Moralis.Web3} web3
 * @returns Promise
 */
const checkCurrentChain = async (web3: Moralis.Web3): Promise<any> => {
  const { showError } = useAlert();

  const chainId = await web3.eth.getChainId();

  if (chainId !== activeChain.value.chainId) {
    const avalibleChain = chains.find((chain) => chain.chainId === chainId);
    if (avalibleChain) {
      await setActiveChain(avalibleChain);
    } else {
      showError("You are connected to the wrong network");
      await switchNetwork(activeChain.value);
    }
  }
};

/**
 * Switches network and tries to add, if it isn't configurated
 *
 * @param  {Chain} chain
 * @returns Promise
 */
const switchNetwork = async (chain: Chain): Promise<void> => {
  const { showError } = useAlert();
  try {
    await Moralis.Web3.switchNetwork(chain.chainId);
  } catch (err: any) {
    if (err.code == 4902) {
      showError(`You don't have ${chain.name} as network configurated.`);
      await addNetwork(chain);
      await switchNetwork(chain);
    }
  }
};

/**
 * Adds network to web3 provider
 *
 * @param  {Chain} chain
 */
const addNetwork = async (chain: Chain) => {
  try {
    await Moralis.Web3.addNetwork(chain.chainId, chain.name, chain.currencyName, chain.currencySymbol, chain.rpcUrl, chain.blockExplorerUrl);
  } catch (err: any) {
    console.log(err);
  }
};

/**
 * Get prefixed class name for active chain
 *
 * @param  {string} className
 * @returns string
 */
const getClassName = (className: string): string => {
  if (moralisClassList.includes(className)) {
    return `${activeChain.value.classPrefixMoralis}${className}`;
  } else {
    return `${activeChain.value.classPrefix}${className}`;
  }
};

/**
 * Get prefixed attribute name for active chain
 *
 * @param  {string} attributeName
 * @returns string
 */
const getAttributeName = <T>(attributeName: string): keyof T => {
  return `${activeChain.value.attributePrefix}${attributeName.charAt(0).toUpperCase() + attributeName.slice(1)}` as keyof T;
};

/**
 * Get prefixed config name for active chain
 *
 * @param  {string} configName
 * @returns string
 */
const getConfigName = (configName: string): string => {
  return `${activeChain.value.attributePrefix}_${configName.toLowerCase()}`;
};

/**
 * Gets the right dex implementation for the active chain
 *
 * @returns
 */
const getDex = () => {
  if (activeChain.value.chainId === polygonTestnet.chainId) {
    const { getSupportedTokens, getQuote, trySwap, tokens, getTokenPrice, findToken } = useOneInchDex();
    return {
      getSupportedTokens,
      getQuote,
      trySwap,
      tokens,
      getTokenPrice,
      findToken,
    };
  } else {
    const { getSupportedTokens, getQuote, trySwap, tokens, getTokenPrice, findToken } = useYieldYakDex();
    return {
      getSupportedTokens,
      getQuote,
      trySwap,
      tokens,
      getTokenPrice,
      findToken,
    };
  }
};

export const useChain = () => {
  return {
    chains,
    avalancheTestnet,
    avalancheMainet,
    polygonTestnet,
    activeChain,
    chainsWithoutActive,
    switchNetwork,
    setActiveChain,
    getClassName,
    getAttributeName,
    getDex,
    checkCurrentChain,
    getConfigName,
  };
};
