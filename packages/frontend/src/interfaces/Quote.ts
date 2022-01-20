import { Token } from "./Token";

export interface Quote {
  fromToken: Token;
  toToken: Token;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: any[][][];
  estimatedGas: number;
}
