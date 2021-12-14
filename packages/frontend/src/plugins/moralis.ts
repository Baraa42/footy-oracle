import Moralis from "moralis/dist/moralis.js";
import { Moralis as MoralisTypes } from "moralis/types";

Moralis.start({
  serverUrl: process.env.moralisServerlUrl,
  appId: process.env.moralisAppId,
});

const MoralisPlugin: MoralisTypes = Moralis;

export default MoralisPlugin;
