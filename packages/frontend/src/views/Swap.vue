<template>
  <div class="w-full rounded shadow-sm lg:max-w-screen-xl m-auto bg-gray-800 md:pb-8 pb-2">
    <div class="p-4">
      <div class="flex flex-row justify-between items-center">
        <h1 class="text-4xl font-semibold text-gray-50">Swap</h1>
        <button>
          <CogIcon class="w-8 h-8 md:w-10 md:h-10 text-gray-500 hover:text-gray-50 transition-colors" />
        </button>
      </div>
      <div class="relative flex flex-col space-y-1 w-full sm:w-8/12 m-auto mt-4">
        <SwapItemVue v-model="from" mode="from" @onSelectToken="toggleFromToken()" class="transform translate-y-5" />

        <button @click="switchTokens()" class="outline outline-gray-400/70 mx-auto flex bg-gray-700 w-12 h-12 items-center justify-center rounded-xl z-50">
          <RefreshIcon class="w-5 h-5 md:w-6 text-gray-400/70 hover:transform hover:rotate-180 transition-transform" />
        </button>

        <SwapItemVue v-model="to" mode="to" @onSelectToken="toggleToToken()" class="transform -translate-y-5" />

        <div
          class="text-sm text-gray-200 space-y-2 bg-gray-800 border-gray-700 border-2 rounded-xl flex flex-col w-full p-3 md:p-4 transform -translate-y-2"
          v-if="quote"
        >
          <div class="flex flex-row justify-between">
            <span>Rate</span>
            <span>1 {{ from.token?.symbol }} = {{ String(Number(to.value) / Number(from.value)) }} {{ to.token?.symbol }}</span>
          </div>
          <div class="flex flex-row justify-between">
            <span>Swap fee</span>
            <span>1 %</span>
          </div>
          <div class="flex flex-row justify-between">
            <span>Estimated Gas</span>
            <span>{{ quote.estimatedGas }}</span>
          </div>
        </div>

        <div>
          <button
            @click="onSwap()"
            class="w-full shadow-md mt-1 shadow-indigo-800/30 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-xl text-xl font-bold py-4 text-gray-100 focus:outline-none transition-all hover:bg-gradient-to-t border-2 border-indigo-500 focus:ring-2 focus:ring-indigo-500 ring-offset-4 ring-offset-gray-800"
          >
            Swap
          </button>
        </div>
      </div>
    </div>
    <TokenDialog :mode="activeMode" :isOpen="isToggled" :hideToken="hideToken" @onClick="onDialog" @onClose="toggle()" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from "vue";
import { RefreshIcon, CogIcon } from "@heroicons/vue/solid";
import { useToggle } from "../modules/layout/toggle";
import useDex from "../modules/moralis/dex";
import { SwapItem } from "../interfaces/SwapItem";
import { Token } from "../interfaces/Token";
import SwapItemVue from "../components/dex/SwapItem.vue";
import TokenDialog from "../components/dialogs/TokenDialog.vue";
import { useCurrency } from "../modules/settings/currency";
import { LocationQueryValue, useRoute } from "vue-router";
export default defineComponent({
  setup() {
    const { toggle, isToggled } = useToggle();
    const { getSupportedTokens, getQuote, trySwap, tokens, getTokenPrice } = useDex();
    const { convertCurrency } = useCurrency();

    // load supported tokens
    getSupportedTokens().then(() => {
      // set matic as default destionstion
      if (!to.token) {
        to.token = tokens.value?.find((item) => item.symbol === "MATIC");
      }
    });

    const quote = ref();
    const activeMode = ref("");
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

    const hideToken = computed((): Token | undefined => {
      if (to.token && activeMode.value === "from") {
        return to.token;
      } else if (from.token && activeMode.value === "to") {
        return from.token;
      }
    });

    const loadQuote = async () => {
      if (to.token && from.value && from.token) {
        console.log("loadQuote");
        to.value = undefined;
        quote.value = await getQuote(from, to);
        to.value = convertCurrency(quote.value.toTokenAmount);
      }
    };

    const onDialog = async (token: Token) => {
      if (activeMode.value == "from") {
        from.token = token;
        from.price = await getTokenPrice(token.address);
      } else if (activeMode.value == "to") {
        to.token = token;
        to.price = await getTokenPrice(token.address);
      }
    };

    watch(
      () => [to.token, from.token, from.value],
      () => {
        loadQuote();
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

    const setFromQueryParms = async (symbol: LocationQueryValue | LocationQueryValue[]) => {
      const sourceToken = tokens.value?.find((item) => item.symbol === (symbol as string));
      from.token = sourceToken;
      if (from.token) {
        from.price = await getTokenPrice(from.token.address);
      }
    };

    const route = useRoute();
    watch(
      () => route.query.from,
      (value, oldValue) => {
        if (value && value != oldValue) {
          setFromQueryParms(value);
        }
      }
    );

    return {
      to,
      from,
      quote,
      switchTokens,
      hideToken,
      toggle,
      activeMode,
      isToggled,
      onDialog,
      toggleFromToken,
      toggleToToken,
      onSwap,
      convertCurrency,
    };
  },
  components: { TokenDialog, RefreshIcon, CogIcon, SwapItemVue },
});
</script>
