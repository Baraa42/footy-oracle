<template>
  <div class="bg-gray-200 rounded-xl flex flex-col w-full px-4 pt-4 pb-4">
    <div class="mb-1 ml-1">
      <span class="text-sm text-gray-600 font-semibold" v-if="mode == 'to'">To</span>
      <span class="text-sm text-gray-600 font-semibold" v-else-if="mode == 'from'">From</span>
    </div>
    <div class="flex flex-row items-center">
      <button
        @click="emitSelectToken()"
        type="button"
        class="
          inline-flex
          justify-between
          items-center
          px-4
          py-2
          w-72
          border border-gray-300
          rounded-lg
          shadow-sm
          text-md
          font-medium
          text-white
          bg-gray-600
          hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
          transition-colors
        "
      >
        <span v-if="!modelValue.token">Select a Token</span>
        <span class="flex items-center space-x-2" v-else
          ><img :src="modelValue.token.logoURI" class="w-6 h-6" /> <span>{{ modelValue.token.symbol }}</span></span
        >
        <ChevronDownIcon class="-mr-1 ml-2 h-5 w-5 text-gray-500" />
      </button>
      <input
        v-model="modelValue.value"
        class="text-2xl font-bold placeholder-gray-400 text-gray-700 text-number bg-transparent px-4 w-full appearance-none focus:outline-none text-right"
        placeholder="0.0"
      />
    </div>
    <div class="flex w-full mt-1">
      <div v-if="mode == 'from' && modelValue.token?.symbol && isAuthenticated" class="w-full flex flex-row flex-grow space-x-1">
        <span class="text-gray-800">Balance:</span>
        <span>{{ balance }} {{ modelValue.token.symbol }}</span>
        <button v-if="balance != '0'" @click="selectMaxBalance()" class="text-indigo-500">(MAX)</button>
      </div>
      <div v-if="modelValue.value && modelValue.price" class="text-gray-500 w-full justify-end flex pr-4">
        ~ <span class="font-semibold text-gray-600">{{ fiatPrice }}$</span>
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
export default defineComponent({
  props: ["mode", "modelValue"],
  emits: ["update:modelValue", "onSelectToken"],
  setup(props, { emit }) {
    const { tokens, isAuthenticated } = useMoralis();
    const { convertCurrency } = useCurrency();
    const { round } = useMath();

    const fiatPrice = computed((): number => round(Number(props.modelValue.value) * Number(props.modelValue.price?.usdPrice), 4));
    const balance = computed((): string | undefined => {
      if (isAuthenticated && tokens.value) {
        const token = tokens.value.find((item) => item?.symbol === props.modelValue.token.symbol);
        if (token) {
          return convertCurrency(token.balance);
        }
      }
      return "0";
    });

    const emitSelectToken = () => {
      emit("onSelectToken");
    };

    const selectMaxBalance = () => {
      emit("update:modelValue", Object.assign(props.modelValue, { value: balance }));
    };

    return { fiatPrice, emitSelectToken, tokens, convertCurrency, selectMaxBalance, balance, isAuthenticated };
  },
  components: { ChevronDownIcon },
});
</script>
