<template>
  <div class="grid grid-cols-table p-5" v-if="bet.event">
    <div class="flex items-center">{{ bet.get("updatedAt") }}</div>
    <div class="flex flex-col">
      <span class="text-lg font-medium">{{ bet.event.getName() }}</span>
      <div class="flex flex-row space-x-2">
        <span class="font-semibold" v-if="bet.get('selection') == '1'">{{ bet.event.get("home") }}</span>
        <span class="font-semibold" v-if="bet.get('selection') == '2'">Draw</span>
        <span class="font-semibold" v-if="bet.get('selection') == '3'">{{ bet.event.get("away") }}</span>
        <span>Match Odds</span>
      </div>
      <span class="text-sm mt-1">Placed: {{ bet.get("createdAt") }}</span>
    </div>
    <div class="flex items-center text-red-600 font-semibold" v-if="bet.get('betType') == '1'">Lay</div>
    <div class="flex items-center text-blue-600 font-semibold" v-if="bet.get('betType') == '0'">Back</div>
    <div class="flex items-center">{{ convertOdds(bet.get("odds")) }}</div>
    <div class="flex items-center">{{ convertCurrency(bet.get("amount")) }} ETH</div>
    <div class="flex items-center" v-if="bet.get('betType') == '0'">{{ convertCurrency(bet.get("amount")) }} ETH</div>
    <div class="flex items-center" v-if="bet.get('betType') == '1'">
      {{ new BigNumber(convertCurrency(bet.get("amount"))).times(new BigNumber(convertOdds(bet.get("odds"))).minus(1)).toNumber() }}
      ETH
    </div>
    <div class="flex items-center" v-if="bet.get('won') == true">{{ convertCurrency(bet.get("amount")) }} ETH</div>
    <div class="flex items-center" v-if="bet.get('won') == false && bet.get('betType') == '0'">- {{ convertCurrency(bet.get("amount")) }} ETH</div>
    <div class="flex items-center" v-if="bet.get('won') == false && bet.get('betType') == '1'">
      -{{ new BigNumber(convertCurrency(bet.get("amount"))).times(new BigNumber(convertOdds(bet.get("odds"))).minus(1)).toNumber() }}
      ETH
    </div>
    <div class="flex items-center text-green-600 font-semibold" v-if="bet.get('won') == true">Won</div>
    <div class="flex items-center text-red-600 font-semibold" v-if="bet.get('won') == false">Lose</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useCurrency } from "../../modules/settings/currency";
import { BigNumber } from "bignumber.js";
import { useOdds } from "../../modules/settings/odds";

export default defineComponent({
  props: {
    bet: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const { convertCurrency } = useCurrency();
    const { convertOdds } = useOdds();

    return { convertOdds, convertCurrency, BigNumber };
  },
});
</script>
