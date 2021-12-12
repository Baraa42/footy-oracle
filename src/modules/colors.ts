import Color from "color";
import { ColorPalette } from "../interfaces/ColorPalette";

/**
 * Generate tailwind inspired color palette from input color
 *
 * @param  {string} input
 * @param  {number=0.08} stepsUp
 * @param  {number=0.11} stepsDown
 * @returns ColorPalette
 */
const generatePalette = (input: string, stepsUp: number = 0.08, stepsDown: number = 0.11): ColorPalette => {
  const color = Color(input);
  const palette: ColorPalette = {
    50: color.lighten(stepsUp * 5).hex(),
    100: color.lighten(stepsUp * 4).hex(),
    200: color.lighten(stepsUp * 3).hex(),
    300: color.lighten(stepsUp * 2).hex(),
    400: color.lighten(stepsUp * 1).hex(),
    500: color.hex(),
    600: color.darken(stepsDown * 1).hex(),
    700: color.darken(stepsDown * 2).hex(),
    800: color.darken(stepsDown * 3).hex(),
    900: color.darken(stepsDown * 4).hex(),
  };
  return palette;
};

/**
 * Generate css gradient with two colors
 *
 * @param  {any} color1
 * @param  {any} color2
 * @param  {string="top"} direction
 * @returns string
 */
const getGradient = (color1: any, color2: any, direction: string = "top"): string => {
  const gradient = `linear-gradient(to ${direction}, ${Color(color1).rgb().string()}, ${Color(color2).rgb().string()})`;
  return gradient;
};

export const useColors = () => {
  return { generatePalette, getGradient };
};
