import { Token } from "./Token";

export interface Adapter {
  name: string;
  address: string;
  fromToken?: Token;
  toToken?: Token;
}

export interface Quote {
  fromToken: Token;
  toToken: Token;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: any[][][];
  adapters?: Adapter[];
  estimatedGas: number;
}
