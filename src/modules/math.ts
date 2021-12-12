/**
 * Convert % to deciaml e.g. 20% -> 0.2
 *
 * @param percentage
 */
const getDecimalPercentage = (percentage: number): number => percentage / 100;

/**
 * Hopefully robust rounding method
 *
 * @param number
 * @param decimals
 */
const round = (number: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.round(number * factor) / factor;
};

/**
 * Count decimals
 *
 * @param number
 * @param decimals
 */
const countDecimals = (number: number): number => {
  if (Math.floor(number.valueOf()) === number.valueOf()) return 0;
  return number.toString().split(".")[1].length || 0;
};

/**
 * Calculate liability with givin params
 *
 * @param layValue
 * @param odds
 */
const getLiability = (layValue: number, layOdds: number): number => layValue * (layOdds - 1);

/**
 * Calculate liability with givin params
 *
 * @param layValue
 * @param odds
 */
const getProfit = (backValue: number, backOdds: number): number => backValue * (backOdds - 1);
/**
 * Get rating from back and lay odds
 *
 * @param backOdds
 * @param layOdds
 */
const getOddsRating = (backOdds: number, layOdds: number): number => {
  const rating = ((layOdds - backOdds) / backOdds) * 100;
  return round(100 - rating, 2);
};

/**
 * Generate random number
 *
 * @param min
 * @param max
 */
const getRandomNumber = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const useMath = () => {
  return {
    getProfit,
    getDecimalPercentage,
    round,
    getLiability,
    getOddsRating,
    getRandomNumber,
    countDecimals,
  };
};
