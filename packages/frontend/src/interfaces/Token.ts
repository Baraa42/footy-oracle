export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  logoURI: string;
  permitSupported?: boolean;
}
