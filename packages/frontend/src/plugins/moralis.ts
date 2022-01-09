import Moralis from "moralis/dist/moralis.js";
import { App } from "vue";

export default {
  install: (app: App, options?: any) => {
    Moralis.start({
      serverUrl: process.env.moralisServerlUrl,
      appId: process.env.moralisAppId,
    });
  },
};
