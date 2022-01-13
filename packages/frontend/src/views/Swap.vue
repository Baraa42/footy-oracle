<template>
  <div class="w-full rounded shadow-sm lg:max-w-screen-xl m-auto bg-gray-800 p-6">
    <h1 class="text-4xl font-semibold text-gray-50 mb-2 ml-6">Swap</h1>
    <div class="relative flex flex-col space-y-1 w-full sm:w-8/12 m-auto mb-4">
      <SwapItemVue v-model="from" mode="from" @onSelectToken="toggleFromToken()" class="transform translate-y-5" />

      <button @click="switchTokens()" class="border-[4px] border-gray-800 mx-auto flex bg-gray-200 w-10 h-10 items-center justify-center rounded-lg z-50">
        <RefreshIcon class="w-5 h-5 text-gray-800 hover:transform hover:rotate-180 transition-transform" />
      </button>

      <SwapItemVue v-model="to" mode="to" @onSelectToken="toggleToToken()" class="transform -translate-y-5" />

      <div>
        <button
          @click="onSwap()"
          class="w-full shadow-md bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-xl text-xl font-bold py-4 text-gray-100 focus:outline-none transition-all hover:bg-gradient-to-t border-2 border-indigo-500 focus:ring-2 focus:ring-indigo-500 ring-offset-4 ring-offset-gray-800"
        >
          Swap
        </button>
      </div>
    </div>

    <TokenDialog :mode="activeMode" :isOpen="isToggled" @onClick="onDialog" @onClose="toggle()" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch } from "vue";
import { RefreshIcon } from "@heroicons/vue/solid";
import { useToggle } from "../modules/layout/toggle";
import useDex from "../modules/moralis/dex";
import { SwapItem } from "../interfaces/SwapItem";
import { Token } from "../interfaces/Token";
import SwapItemVue from "../components/dex/SwapItem.vue";
import TokenDialog from "../components/dialogs/TokenDialog.vue";
import { useCurrency } from "../modules/settings/currency";
import { useMoralis } from "../modules/moralis/moralis";
import { useRoute } from "vue-router";
export default defineComponent({
  async setup() {
    const route = useRoute();
    const { Moralis } = useMoralis();
    const { toggle, isToggled } = useToggle();
    const { getSupportedTokens, getQuote, trySwap, tokens, getTokenPrice } = useDex();
    const { convertCurrency } = useCurrency();

    const quote = ref();

    const from: SwapItem = reactive({
      token: undefined,
      value: undefined,
      price: undefined,
    });
    const to: SwapItem = reactive({
      token: undefined,
      value: undefined,
      price: undefined,
    });
    const activeMode = ref("");

    const loadQuote = async () => {
      quote.value = await getQuote(from, to);
      to.value = convertCurrency(quote.value.toTokenAmount);
    };

    const onDialog = async (token: Token) => {
      if (activeMode.value == "from") {
        from.token = token;
        from.price = await getTokenPrice(token.address);
      } else if (activeMode.value == "to") {
        to.token = token;
        to.price = await getTokenPrice(token.address);
      }

      if (to.token && to.value && from.token) {
        loadQuote();
      }

      //activeMode.value = "";
    };

    // add debounce
    watch(
      () => from.value,
      async () => {
        if (to.token && from.token) {
          loadQuote();
        }
      }
    );

    const onSwap = async () => {
      console.log("swap");
      await trySwap(from, to);
    };

    const switchTokens = () => {
      const temp = Object.assign({}, to);
      to.token = from.token;
      to.value = from.value;
      to.price = from.price;
      from.token = temp.token;
      from.value = temp.value;
      from.price = temp.price;
    };

    const toggleFromToken = () => {
      activeMode.value = "from";
      toggle();
    };

    const toggleToToken = () => {
      activeMode.value = "to";
      toggle();
    };

    await getSupportedTokens();

    /**
     * Handle query parms
     */
    const setFromQueryParms = async () => {
      const sourceTokenSymbol = route.query.from;
      const sourceToken = tokens.value?.find((item) => item.symbol === sourceTokenSymbol);
      from.token = sourceToken;
      if (from.token) {
        from.price = await getTokenPrice(from.token.address);
      }
    };

    if (route.query) {
      await setFromQueryParms();
    }

    watch(
      () => route.query,
      async () => {
        await setFromQueryParms();
      }
    );

    /**
     * Set Matic as default destionstion
     */
    to.token = tokens.value?.find((item) => item.symbol === "MATIC");
    if (to.token) {
      to.price = await getTokenPrice(to.token?.address);
    }

    return {
      to,
      from,
      switchTokens,
      toggle,
      activeMode,
      isToggled,
      getSupportedTokens,
      getQuote,
      trySwap,
      tokens,
      onDialog,
      toggleFromToken,
      toggleToToken,
      onSwap,
    };
  },
  components: { TokenDialog, RefreshIcon, SwapItemVue },
});
</script>
