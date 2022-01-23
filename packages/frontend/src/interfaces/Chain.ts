import { Component } from "vue";

export interface DefiProvider {
  name: string;
  logo: Component;
  depositApy: number;
  rewardApy: number;
}

export type Chains =
  | "eth"
  | "0x1"
  | "ropsten"
  | "0x3"
  | "rinkeby"
  | "0x4"
  | "goerli"
  | "0x5"
  | "kovan"
  | "0x2a"
  | "polygon"
  | "0x89"
  | "mumbai"
  | "0x13881"
  | "bsc"
  | "0x38"
  | "bsc testnet"
  | "0x61"
  | "avalanche"
  | "0xa86a"
  | "avalanche testnet"
  | "0xa869"
  | "fantom"
  | "0xfa";

export interface Chain {
  name: string;
  chainId: number;
  chain: Chains;
  currencyName: string;
  currencySymbol: string;
  nativePriceFrom: Chains;
  rpcUrl: string;
  blockExplorerUrl: string;
  iconRounded: Component;
  icon: Component;
  iconClass?: string;
  classPrefix: string;
  classPrefixMoralis: string;
  attributePrefix: string;
  settings?: any;
  nativePriceAddress: string;
  priceChain: Chains;
  defiProviders?: DefiProvider[];
}
