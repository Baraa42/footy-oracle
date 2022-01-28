<template>
  <div class="w-full rounded shadow-sm lg:max-w-screen-xl m-auto bg-gray-800 md:pb-8 pb-2">
    <div class="p-4">
      <div class="flex flex-row justify-between items-center">
        <h1 class="text-4xl font-semibold text-gray-50">Swap</h1>
        <button @click="onSettings()">
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
            <span>1 {{ from.token?.symbol }} = {{ swapRate }} {{ to.token?.symbol }}</span>
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

        <div class="text-sm text-gray-200 bg-gray-800 border-gray-700 border-2 rounded-xl flex flex-col w-full p-3 md:p-4" v-if="quote && quote.adapters">
          <div class="flex flex-col space-y-1">
            <span v-for="(adapter, id) in quote.adapters" :key="id" class="flex space-x-2 items-center justify-between">
              <span class="flex flex-row items-center w-1/2"
                >{{ id + 1 }}. From {{ adapter.fromToken?.symbol }} to {{ adapter.toToken?.symbol }} via {{ adapter.name }}</span
              >

              <div class="flex items-center justify-between space-x-2 w-max">
                <img :src="adapter.fromToken?.logoURI" class="w-6 h-6 rounded-full" />
                <div>
                  <ArrowRightIcon class="w-3 h-3 text-gray-200" />
                </div>
                <img :src="adapter.toToken?.logoURI" class="w-6 h-6 rounded-full" />
              </div>
            </span>
          </div>
        </div>

        <div>
          <button
            @click="onSwap()"
            class="w-full shadow-md mt-3 shadow-indigo-800/30 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-xl text-xl font-bold py-4 text-gray-100 focus:outline-none transition-all hover:bg-gradient-to-t border-2 border-indigo-500 focus:ring-2 focus:ring-indigo-500 ring-offset-4 ring-offset-gray-800"
          >
            Swap
          </button>
        </div>
      </div>
    </div>

    <TokenDialog :mode="activeMode" :isOpen="isToggled" :hideToken="hideToken" @onClick="onDialog" @onClose="toggle()" />
    <teleport to="#app">
      <ConfirmationDialog
        :type="confirmDialog.type"
        :color="confirmDialog.color"
        :icon="confirmDialog.icon"
        :title="confirmDialog.title"
        :description="confirmDialog.description"
        :buttonText="confirmDialog.buttonText"
        :isOpen="confirmDialog.isToggled"
        @onConfirm="confirmDialog.onConfirm"
        @onClose="confirmDialog.toggle()"
      >
      </ConfirmationDialog>
    </teleport>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, Ref, ref, watch } from "vue";
import { RefreshIcon, CogIcon, ArrowRightIcon } from "@heroicons/vue/solid";
import { useToggle } from "../modules/layout/toggle";
import { SwapItem } from "../interfaces/SwapItem";
import { Token } from "../interfaces/Token";
import SwapItemVue from "../components/dex/SwapItem.vue";
import TokenDialog from "../components/dialogs/TokenDialog.vue";
import { useCurrency } from "../modules/settings/currency";
import { LocationQueryValue, useRoute } from "vue-router";
import { useMath } from "@/modules/math";
import { TokenPrice } from "@/interfaces/web3/TokenPrice";
import { useChain } from "@/modules/moralis/chain";
import { useMoralis } from "@/modules/moralis/moralis";
import { useAlert } from "@/modules/layout/alert";
import { useConfirmDialog } from "@/modules/layout/confirmDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog.vue";
import { Quote } from "@/interfaces/Quote";
export default defineComponent({
  setup() {
    const { toggle, isToggled } = useToggle();
    const { activeChain, getDex } = useChain();
    const { isAuthenticated } = useMoralis();
    const { showError } = useAlert();
    const confirmDialog = useConfirmDialog();

    const onSettings = () => {
      confirmDialog.icon = CogIcon;
      confirmDialog.title = "Swap Settings";
      confirmDialog.description = "";
      confirmDialog.color = "gray";
      confirmDialog.onConfirm = async () => {};

      confirmDialog.toggle();
    };

    const { getSupportedTokens, getQuote, trySwap, tokens, getTokenPrice } = getDex();

    const { convertCurrency } = useCurrency();
    const { round } = useMath();

    // load supported tokens
    getSupportedTokens().then(() => {
      // set matic as default destionstion
      if (!to.token) {
        to.token = tokens.value?.find((item) => item.symbol === activeChain.value.currencySymbol);
      }
    });

    const swapRate = computed((): string => {
      return String(round(Number(to.value) / Number(from.value), 4));
    });

    const quote = <Ref<Quote | undefined>>ref();
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
      quote.value = undefined;
      if (to.token && from.value && from.token) {
        to.value = undefined;
        const quoteResult = await getQuote(from, to);
        if (quoteResult) {
          quote.value = quoteResult;
          to.value = convertCurrency(quote.value.toTokenAmount);
        }
      }
    };

    const onDialog = async (token: Token) => {
      if (activeMode.value == "from") {
        from.token = token;
      } else if (activeMode.value == "to") {
        to.token = token;
      }
    };

    watch(
      () => to.token,
      () => {
        if (to.token) {
          getTokenPrice(to.token.address).then((price: TokenPrice | undefined) => (to.price = price));
        }
      }
    );

    watch(
      () => from.token,
      () => {
        if (from.token) {
          getTokenPrice(from.token.address).then((price: TokenPrice | undefined) => (from.price = price));
        }
      }
    );

    watch(
      () => [to.token, from.token, from.value],
      () => {
        loadQuote();
      }
    );

    const onSwap = async () => {
      if (isAuthenticated.value) {
        await trySwap(from, to);
      } else {
        showError("You need to connect your wallet");
      }
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
      confirmDialog,
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
      swapRate,
      onSettings,
    };
  },
  components: { TokenDialog, RefreshIcon, CogIcon, SwapItemVue, ConfirmationDialog, ArrowRightIcon },
});
</script>
