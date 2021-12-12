export interface TokenPrice {
  nativePrice: {
    value: string;
    decimals: number;
    name: string;
    symbol: string;
  };
  usdPrice: number;
  exchangeAddress: string;
  exchangeName: string;
}
