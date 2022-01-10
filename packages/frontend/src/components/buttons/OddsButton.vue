<template>
  <button
    :class="{
      'bg-blue-200 hover:bg-blue-300 rounded-l': type === betTypes.BACK && bet,
      'bg-red-200 hover:bg-red-300 rounded-r': type === betTypes.LAY && bet,
      'bg-blue-100 hover:bg-blue-200 rounded-l': type === betTypes.BACK && !bet,
      'bg-red-100 hover:bg-red-200 rounded-r': type === betTypes.LAY && !bet,
    }"
    class="group flex flex-col w-20 items-center h-12 justify-evenly transition-colors focus:outline-none"
  >
    <span class="flex flex-col" v-if="bet">
      <span class="text-gray-700 group-hover:text-gray-800 text-sm font-bold tracking-wide">{{ decodeOdds(bet.attributes.odds) }}</span>
      <div class="text-xs text-gray-600 font-medium flex flex-row items-center group-hover:text-gray-800">
        <span>{{ new BigNumber(convertCurrency(bet.attributes.amount)).toFixed(2) }}</span>
        <component :is="activeChain.icon" class="w-[10px] h-[11px] ml-[3px]" />
      </div>
    </span>
    <span v-else class="uppercase text-xs font-semibold tracking-thight text-gray-400 group-hover:text-gray-600 transition-color">Make<br />Offer</span>
  </button>
</template>

<script lang="ts">
import BigNumber from "bignumber.js";
import { defineComponent, PropType } from "vue";
import { BetTypeEnum } from "../../interfaces/enums/BetTypeEnum";
import { useCurrency } from "../../modules/settings/currency";
import { useOdds } from "../../modules/settings/odds";
import { UnmatchedBetModel } from "../../interfaces/models/UnmatchedBetModel";
import { useChain } from "@/modules/moralis/chain";

export default defineComponent({
  props: {
    type: { type: Number as PropType<BetTypeEnum>, required: true },
    bet: { type: Object as () => UnmatchedBetModel, required: false },
  },
  setup() {
    const { activeChain } = useChain();
    const { convertCurrency } = useCurrency();
    const { decodeOdds } = useOdds();
    const betTypes = BetTypeEnum;
    return { betTypes, decodeOdds, convertCurrency, BigNumber, activeChain };
  },
});
</script>
