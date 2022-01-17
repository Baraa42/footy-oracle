<template>
  <div class="bg-gray-700 rounded-xl flex flex-col w-full p-3 pb-5 md:p-4 md:pb-6">
    <div class="mb-3 md:mb-4 ml-1 flex justify-between items-center">
      <span class="text-sm text-gray-200 font-semibold" v-if="mode == 'to'">To</span>
      <span class="text-sm text-gray-200 font-semibold" v-else-if="mode == 'from'">From</span>

      <div v-if="mode == 'from' && modelValue.token?.symbol && isAuthenticated" class="flex flex-row space-x-2 text-xs items-center">
        <span class="text-indigo-300 text-sm font-semibold">{{ balance }} {{ modelValue.token.symbol }}</span>
        <button
          class="bg-gray-800 text-gray-300 hover:text-gray-100 transition-colors shadow-sm shadow-gray-500/20 rounded-md px-2 py-1"
          @click="selectMaxBalance()"
        >
          MAX
        </button>
        <button
          class="bg-gray-800 text-gray-300 hover:text-gray-100 transition-colors shadow-sm shadow-gray-500/20 rounded-md px-2 py-1"
          @click="selectHalfBalance()"
        >
          HALF
        </button>
      </div>
    </div>
    <div class="flex flex-row items-center justify-between space-x-4">
      <button
        @click="emitSelectToken()"
        type="button"
        class="inline-flex justify-between items-center px-3 h-12 md:h-14 w-10/12 md:w-60 border border-gray-500 rounded-lg text-md font-medium text-white focus:outline-none focus:ring-2 ring-offset-transparent focus:ring-offset-2 focus:ring-gray-600 transition-colors"
      >
        <span v-if="!modelValue.token">
          <span class="md:block hidden">Select a Token</span>
          <span class="block md:hidden">Select</span>
        </span>
        <span class="flex items-center space-x-2" v-else
          ><img :src="modelValue.token.logoURI" class="w-6 h-6 md:w-8 md:h-8 rounded-full" />
          <span class="md:text-lg">{{ modelValue.token.symbol }}</span></span
        >
        <ChevronDownIcon class="-mr-1 ml-2 h-5 w-5 text-gray-400" />
      </button>

      <div class="flex flex-col justify-between items-center">
        <input
          :disabled="mode == 'to'"
          :value="computedModelValue"
          @input="debouncedEmit($event)"
          class="text-2xl font-bold placeholder-gray-400 text-gray-50 text-number bg-transparent w-full appearance-none focus:outline-none text-right"
          placeholder="0.0"
        />

        <div
          v-if="mode == 'from'"
          :class="{ 'text-gray-400': !fiatPrice, 'text-gray-50': fiatPrice }"
          class="w-full justify-end flex items-baseline font-semibold"
        >
          &#8776; ${{ fiatPrice || 0 }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { ChevronDownIcon } from "@heroicons/vue/solid";
import { useMath } from "../../modules/math";
import { useMoralis } from "../../modules/moralis/moralis";
import { useCurrency } from "../../modules/settings/currency";
import { useDebounce } from "@/modules/layout/debounce";
export default defineComponent({
  props: ["mode", "modelValue"],
  emits: ["update:modelValue", "onSelectToken"],
  setup(props, { emit }) {
    const { tokens, isAuthenticated, balance: nativeBalance } = useMoralis();
    const { convertCurrency } = useCurrency();
    const { round } = useMath();

    /**
     * Show proper from value and rounds to value to approximate
     */
    const computedModelValue = computed((): string | undefined => {
      if (props.mode === "from") {
        return props.modelValue.value;
      } else {
        if (props.modelValue.value) {
          return "≈ " + String(round(Number(props.modelValue.value), 4));
        }
      }
      return undefined;
    });

    /**
     * Calculates fiat price based on the input
     * Round to 4 digits
     */
    const fiatPrice = computed((): number => round(Number(props.modelValue.value) * Number(props.modelValue.price?.usdPrice), 4));

    /**
     * Get native or token balance for current token
     * Round to 4 digits
     */
    const balance = computed((): string | undefined => {
      if (isAuthenticated && tokens.value) {
        if (props.modelValue.token.address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
          return String(round(nativeBalance.value.available, 4));
        } else {
          const token = tokens.value.find((item) => item?.symbol === props.modelValue.token.symbol);
          if (token) {
            const amount = Number(convertCurrency(Number(token.balance)));
            return String(round(amount, 4));
          }
        }
      }
      return "0";
    });

    const emitSelectToken = () => {
      emit("onSelectToken");
    };

    const emitUpdateValue = (value: any) => {
      emit("update:modelValue", Object.assign(props.modelValue, { value: value }));
    };

    const updateValue = (event: any) => {
      emitUpdateValue(event.target.value);
    };

    const selectMaxBalance = () => {
      emitUpdateValue(balance.value);
    };

    const selectHalfBalance = () => {
      const half = Number(balance.value) / 2;
      emitUpdateValue(half.toString());
    };

    /**
     * Debounce input event to reduce api requests
     */
    const { debounceFunction } = useDebounce();
    const debouncedEmit = debounceFunction(updateValue, 500);

    return {
      fiatPrice,
      emitSelectToken,
      updateValue,
      tokens,
      convertCurrency,
      computedModelValue,
      selectMaxBalance,
      debouncedEmit,
      selectHalfBalance,
      balance,
      isAuthenticated,
    };
  },
  components: { ChevronDownIcon },
});
</script>
