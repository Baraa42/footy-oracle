import { Ref, ref } from "vue";
import Moralis from "moralis/dist/moralis.js";
import { BigNumber } from "bignumber.js";
import { SelectOption } from "../../interfaces/layout/SelectOption";
import { useMoralis } from "../moralis/moralis";

/**
 * Odds formats settings array
 */
const oddsFormats: Array<SelectOption> = [
  { value: "eu", label: "EU Odds (1.50)" },
  // { value: "uk", label: "UK Odds (1/2)" },
  // { value: "us", label: "US Odds (-200)" },
];

/**
 * Selected odds format, could also be save in moralis for saved settings
 */
const selectedOddsFormat: Ref<SelectOption> = ref(oddsFormats[0]);

/**
 * Definied min odds
 */
const minOdds: number = 1.01;

/**
 * Definied odds decimals
 */
const oddsDecimals: number = 2;

/**
 * Convert odds
 * Possible add converting with other odds formats
 *
 * @param  {string|number} amount
 * @returns string
 */
const encodeOdds = (odds: string | number): string => {
  const web3 = new Moralis.Web3();
  return web3.utils.toWei(String(odds), "kwei");
};

const decodeOdds = (odds: string | number): string => {
  const web3 = new Moralis.Web3();
  return web3.utils.fromWei(String(odds), "kwei");
};

export const useOdds = () => {
  return {
    minOdds,
    oddsDecimals,
    encodeOdds,
    decodeOdds,
    oddsFormats,
    selectedOddsFormat,
  };
};
