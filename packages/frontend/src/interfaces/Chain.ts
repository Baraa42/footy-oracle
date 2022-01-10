import { Component } from "vue";

export interface Chain {
  name: string;
  chainId: number;
  chain:
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
  currencyName: string;
  currencySymbol: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  icon: Component;
  iconClass?: string;
  classPrefix: string;
  attributePrefix: string;
}
