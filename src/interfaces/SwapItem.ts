import { Token } from "./Token";
import { TokenPrice } from "./web3/TokenPrice";

export interface SwapItem {
  token?: Token;
  value?: string;
  price?: TokenPrice;
}
