import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";
import path from "path";
import pluginEnv from "vite-plugin-vue-env";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), svgLoader(), pluginEnv(), vueJsx()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "/src"),
    },
  },
  define: {
    "process.env": process.env,
  },
  build: {
    rollupOptions: {
      // https://rollupjs.org/guide/en/#big-list-of-options
    },
  },
});
