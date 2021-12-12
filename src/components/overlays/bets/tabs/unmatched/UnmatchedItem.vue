<template>
  <div class="m-2 px-3 py-3 bg-gray-100 border border-gray-200 flex flex-col space-y-3 rounded-sm">
    <div class="flex flex-col space-y-1 text-gray-800" v-if="data.event">
      <span class="text-sm font-bold">{{ data.event.get("home") }} vs. {{ data.event.get("away") }}</span>
      <span class="text-xs font-semibold text-gray-800" v-if="data.get('selection') == selections.HOME">{{ data.event.get("home") }}</span>
      <span class="text-xs font-semibold text-gray-800" v-if="data.get('selection') == selections.AWAY">{{ data.event.get("away") }}</span>
      <span class="text-xs font-semibold text-gray-800" v-if="data.get('selection') == selections.DRAW">Draw</span>
    </div>
    <div class="flex flex-row pt-1 w-full space-x-3 justify-between">
      <OddsInput disabled :modelValue="new BigNumber(convertOdds(data.get('odds'))).toNumber()" :type="data.get('betType') == 0 ? types.BACK : types.LAY" />
      <CurrencyInput
        disabled
        label="STAKE"
        :modelValue="new BigNumber(convertCurrency(data.get('amount'))).toNumber()"
        :type="data.get('betType') == 0 ? types.BACK : types.LAY"
      />
      <CurrencyInput
        disabled
        v-if="types.BACK === (data.get('betType') == 0 ? types.BACK : types.LAY)"
        :modelValue="new BigNumber(convertCurrency(data.get('amount'))).times(new BigNumber(convertCurrency(data.get('odds'))).minus(1)).toNumber()"
        label="PROFIT"
        :type="data.get('betType') == 0 ? types.BACK : types.LAY"
      />
      <CurrencyInput
        disabled
        v-if="types.LAY === (data.get('betType') == 0 ? types.BACK : types.LAY)"
        label="LIABILITY"
        :modelValue="new BigNumber(convertCurrency(data.get('amount'))).times(new BigNumber(convertCurrency(data.get('odds'))).minus(1)).toNumber()"
        :type="data.get('betType') == 0 ? types.BACK : types.LAY"
      />
      <button
        v-if="data.get('confirmed')"
        @click="removeUnmatchedBet(data)"
        class="
          inline-flex
          items-center
          justify-center
          py-2
          px-4
          border border-gray-600
          shadow-sm
          text-sm
          font-medium
          rounded-sm
          text-gray-700
          hover:text-white
          bg-transparent
          hover:bg-gray-500
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
          transition-colors
        "
      >
        X
      </button>
    </div>
    <div v-if="!data.get('confirmed')">
      <WaitingButton text="Waiting for confirmation" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import OddsInput from "../../../../inputs/OddsInput.vue";
import CurrencyInput from "../../../../inputs/CurrencyInput.vue";
import { useBetslip } from "../../../../../modules/moralis/betslip";
import { useCurrency } from "../../../../../modules/settings/currency";
import { BigNumber } from "bignumber.js";
import SoccerBall from "../../../../../assets/svg/soccer_ball.svg";
import { useOdds } from "../../../../../modules/settings/odds";
import { UnmatchedBetModel } from "../../../../../interfaces/models/UnmatchedBetModel";
import WaitingButton from "../../../../buttons/WaitingButton.vue";

export default defineComponent({
  props: {
    data: { type: Object as () => UnmatchedBetModel, required: true },
  },
  setup(props) {
    const { removeUnmatchedBet, selections, types } = useBetslip();
    const { convertCurrency } = useCurrency();
    const { convertOdds } = useOdds();

    return {
      removeUnmatchedBet,
      convertOdds,
      convertCurrency,
      selections,
      types,
      BigNumber,
    };
  },
  components: { OddsInput, CurrencyInput, SoccerBall, WaitingButton },
});
</script>
