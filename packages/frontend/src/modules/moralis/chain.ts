import { Chain } from "@/interfaces/Chain";
import Matic from "@/assets/svg/matic.svg";
import Avax from "@/assets/svg/avax.svg";
import { computed, markRaw, Ref, ref } from "vue";

const avalanche: Chain = {
  name: "Avalanche",
  chainId: "fuji",
  icon: markRaw(Avax as {}),
  iconClass: "",
};

const polygon: Chain = {
  name: "Polygon",
  chainId: "mumbai",
  icon: markRaw(Matic as {}),
  iconClass: "bg-polygon rounded-full text-white p-2",
};

const chains: Array<Chain> = [polygon, avalanche];
const activeChain: Ref<Chain> = ref(chains[0]);
const chainsWithoutActive = computed((): Chain[] => chains.filter((chain) => chain.chainId != activeChain.value.chainId));

const setActiveChain = (chain: Chain) => {
  activeChain.value = chain;
};

export const useChain = () => {
  return { chains, activeChain, chainsWithoutActive, setActiveChain };
};
