import { Chain } from "@/interfaces/Chain";
import Polygon from "@/assets/svg/polygon.svg";
import PolygonRounded from "@/assets/svg/polygon-rounded.svg";
import AvaxRounded from "@/assets/svg/avax-rounded.svg";
import { computed, markRaw, Ref, ref } from "vue";
import Moralis from "moralis/dist/moralis.js";

const avalanche: Chain = {
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
};

const polygon: Chain = {
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
  settings: {
    oneInchChain: "polygon",
  },
};

const chains: Array<Chain> = [polygon, avalanche];
const activeChain = <Ref<Chain>>ref(chains[0]);
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
 *
 * @param  {Chain} chain
 * @returns Promise
 */
const setActiveChain = async (chain: Chain): Promise<void> => {
  try {
    await Moralis.Web3.switchNetwork(chain.chainId);
  } catch (err: any) {
    console.log(err);
    await Moralis.Web3.addNetwork(chain.chainId, chain.name, chain.currencyName, chain.currencySymbol, chain.rpcUrl, chain.blockExplorerUrl);
    await Moralis.Web3.switchNetwork(chain.chainId);
  }
  activeChain.value = chain;
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

export const useChain = () => {
  return { chains, activeChain, chainsWithoutActive, setActiveChain, getClassName, getAttributeName };
};
