/// <reference types="vite/client" />

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "moralis/dist/moralis.js";
declare module "@heroicons/vue/solid";
declare module "@heroicons/vue/outline";
declare module "body-scroll-lock";
declare module "timezones-list";
declare module "moralis";
declare module "color";
declare module "footy-oracle-contract";

declare module "dom-to-image-more" {
  import domToImage = require("dom-to-image");
  export = domToImage;
}
interface Window {
  ethereum: any;
}
