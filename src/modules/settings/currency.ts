import { ref } from "vue";
import Moralis from "moralis/dist/moralis.js";
import { BigNumber } from "bignumber.js";
import { SelectOption } from "../../interfaces/layout/SelectOption";
import { Ref } from "vue";

/**
 * Currencies settings array
 */
const currencies: Array<SelectOption> = [
  //{ value: "eth", label: "Ethereum (ETH)" },
  { value: "matic", label: "Polygon (MATIC)" },
  //{ value: "usd", label: "US Dollar (USD)" },
  //{ value: "eur", label: "Euro (EUR)" },
  //{ value: "gbp", label: "Pfound (GBP)" },
  //{ value: "jyp", label: "Yen (JPY)" },
];

/**
 * Selected odds format, could also be save in moralis for saved settings
 */
const selectedCurrency: Ref<SelectOption> = ref(currencies[0]);

/**
 * Convert currency
 * Possible live prices and display in other currencies
 *
 * @param  {string} amount
 * @returns string
 */
const convertCurrency = (amount: string): string => {
  console.log(amount);
  const web3 = new Moralis.Web3();
  return web3.utils.fromWei(amount, "ether");
};

/**
 * Convert token currency
 *
 * @param  {string} amount
 * @param  {number} decimals
 * @returns string
 */
const convertTokenCurrency = (amount: string | number, decimals: number): string => {
  return Moralis.Units.Token(amount, decimals).toString();
};

export const useCurrency = () => {
  return {
    convertTokenCurrency,
    convertCurrency,
    currencies,
    selectedCurrency,
  };
};
