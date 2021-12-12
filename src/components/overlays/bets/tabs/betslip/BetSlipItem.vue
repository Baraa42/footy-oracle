<template>
  <div class="m-2 px-3 py-3 bg-gray-100 border border-gray-200 flex flex-col space-y-3 rounded">
    <div class="flex flex-col space-y-1 text-gray-800">
      <span class="text-sm font-bold">{{ betslip.event.get("home") }} vs. {{ betslip.event.get("away") }}</span>
      <span class="text-xs font-semibold text-gray-800" v-if="betslip.selection == selections.HOME">{{ betslip.event.get("home") }}</span>
      <span class="text-xs font-semibold text-gray-800" v-if="betslip.selection == selections.AWAY">{{ betslip.event.get("away") }}</span>
      <span class="text-xs font-semibold text-gray-800" v-if="betslip.selection == selections.DRAW">Draw</span>
    </div>
    <div class="flex flex-row pt-1 w-full space-x-3 justify-between">
      <OddsInput v-model="betslip.odds" :type="betslip.type" />
      <CurrencyInput label="STAKE" v-model="betslip.stake" :type="betslip.type" />
      <CurrencyInput v-if="types.BACK === betslip.type" v-model="betslip.profit" label="PROFIT" :type="betslip.type" />
      <CurrencyInput v-if="types.LAY === betslip.type" v-model="betslip.liability" label="LIABILITY" :type="betslip.type" />
    </div>
    <div class="flex flex-row w-full space-x-3">
      <button
        @click="acceptBet(betslip)"
        class="
          inline-flex
          w-full
          justify-center
          py-2
          px-4
          border border-transparent
          shadow-sm
          rounded
          text-sm
          font-medium
          text-white
          bg-gray-500
          hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
          transition-colors
        "
      >
        Accept
      </button>
      <button
        @click="removeFromBetslip(betslip)"
        class="
          inline-flex
          w-full
          justify-center
          py-2
          px-4
          border border-gray-600
          shadow-sm
          text-sm
          font-medium
          rounded
          text-gray-700
          hover:text-white
          bg-transparent
          hover:bg-gray-500
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
          transition-colors
        "
      >
        Remove
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, PropType, toRefs, watch, Ref } from "vue";
import OddsInput from "../../../../inputs/OddsInput.vue";
import CurrencyInput from "../../../../inputs/CurrencyInput.vue";
import { Betslip } from "../../../../../interfaces/Betslip";
import { useBetslip } from "../../../../../modules/moralis/betslip";
import { BigNumber } from "bignumber.js";

export default defineComponent({
  props: {
    data: { type: Object as () => Betslip, required: true },
  },
  setup(props) {
    const { removeFromBetslip, selections, types, acceptBet } = useBetslip();
    const betslip = ref(props.data) as Ref<Betslip>;

    watch(
      () => betslip.value.odds,
      (newOdds) => {
        if (betslip.value.odds) {
          const oddsTimes = new BigNumber(newOdds).minus(1);
          if (betslip.value.type === types.BACK) {
            betslip.value.profit = new BigNumber(betslip.value.stake).times(oddsTimes).toNumber();
          } else if (betslip.value.type === types.LAY) {
            betslip.value.liability = new BigNumber(betslip.value.stake).times(oddsTimes).toNumber();
          }
        }
      }
    );

    watch(
      () => betslip.value.profit,
      (newProfit) => {
        if (betslip.value.odds) {
          const oddsDivided = new BigNumber(betslip.value.odds).minus(1);
          betslip.value.stake = new BigNumber(newProfit).dividedBy(oddsDivided).toNumber();
        }
      }
    );

    watch(
      () => betslip.value.stake,
      (newStake) => {
        if (betslip.value.odds) {
          const oddsTimes = new BigNumber(betslip.value.odds).minus(1);
          if (betslip.value.type === types.BACK) {
            betslip.value.profit = new BigNumber(newStake).times(oddsTimes).toNumber();
          } else if (betslip.value.type === types.LAY) {
            betslip.value.liability = new BigNumber(newStake).times(oddsTimes).toNumber();
          }
        }
      }
    );

    watch(
      () => betslip.value.liability,
      (newLiability) => {
        if (betslip.value.odds) {
          const oddsDivided = new BigNumber(betslip.value.odds).minus(1);
          betslip.value.stake = new BigNumber(newLiability).dividedBy(oddsDivided).toNumber();
        }
      }
    );

    return { removeFromBetslip, selections, types, betslip, acceptBet };
  },
  components: { OddsInput, CurrencyInput },
});
</script>
