// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultTheme = require("tailwindcss/defaultTheme");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const colors = require("tailwindcss/colors");

module.exports = {
  mode: "jit",
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: colors.white,
      black: colors.black,
      gray: colors.coolGray,
      red: colors.rose,
      blue: colors.lightBlue,
      indigo: colors.indigo,
      yellow: colors.amber,
      green: colors.emerald,
    },
    extend: {
      screens: {
        "3xl": "2016px",
      },
      width: {
        110: "26rem",
        "with-sidebar": "calc(100% - 664px)",
      },
      spacing: {
        18: "4.5rem",
      },
      fontFamily: {
        inter: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      gridTemplateColumns: {
        table:
          "minmax(176px, 200px) minmax(400px, 558px) minmax(88px, 124px) minmax(88px, 124px) minmax(88px, 124px) minmax(88px, 124px) minmax(88px, 124px) minmax(88px, 124px)",
      },
      gridTemplateRows: {
        table: "200px minmax(900px, 1fr) 100px",
        "horizontal-scroll": "minmax(80px, 1fr)",
      },
      animation: {
        move: "move 1s linear infinite",
        "spin-slow": "spin 2s linear infinite",
      },
      keyframes: {
        move: {
          "0%": { left: "-50%" },
          "100%": { left: "100%" },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
