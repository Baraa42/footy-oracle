import { onMounted, reactive } from "vue";

const screens = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

const xs = (val: number) => val >= screens.xs && val <= screens.sm;
const sm = (val: number) => val >= screens.sm && val <= screens.md;
const md = (val: number) => val >= screens.md && val <= screens.lg;
const lg = (val: number) => val >= screens.lg && val <= screens.xl;
const xl = (val: number) => val >= screens.xl;

const getBreakpoint = (w: number) => {
  if (xs(w)) return "xs";
  else if (sm(w)) return "sm";
  else if (md(w)) return "md";
  else if (lg(w)) return "lg";
  else if (xl(w)) return "xl";
  else return "all";
};

const breakpoints = reactive({ w: 0, h: 0, is: "xs" });

const getFromWindowSize = () => {
  breakpoints.w = window.innerWidth;
  breakpoints.h = window.innerHeight;
  breakpoints.is = getBreakpoint(window.innerWidth);
};

export const useBreakpoint = () => {
  onMounted(() => {
    getFromWindowSize();
    window.addEventListener("resize", () => {
      getFromWindowSize();
    });
  });

  return {
    breakpoints,
  };
};
