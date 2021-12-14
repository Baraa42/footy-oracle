<template>
  <div id="nonPrintable" ref="printMe" v-if="data" class="w-full h-full hidden pb-4 px-4">
    <h1>{{ data.event.get("home") }} vs. {{ data.event.get("away") }}</h1>
    <h1 v-if="data.get('selection') == selections.HOME">
      {{ data.event.get("home") }}
    </h1>
    <h1 v-if="data.get('selection') == selections.AWAY">
      {{ data.event.get("away") }}
    </h1>
    <h1 v-if="data.get('selection') == selections.DRAW">Draw</h1>
    <h1 v-if="data.get('betTye') == types.BACK">Back</h1>
    <h1 v-if="data.get('betTye') == types.LAY">Lay</h1>
    <h1>Odds = {{ new BigNumber(convertOdds(data.get("odds"))).toNumber() }}</h1>
    <h1>
      Stake =
      {{ new BigNumber(convertCurrency(data.get("amount"))).toNumber() }}
    </h1>
    <h1 v-if="types.BACK === (data.get('betType') == 0 ? types.BACK : types.LAY)">
      PROFIT =
      {{ new BigNumber(convertCurrency(data.get("amount"))).times(new BigNumber(convertCurrency(data.get("odds"))).minus(1)).toNumber() }}
    </h1>
    <h1 v-if="types.LAY === (data.get('betType') == 0 ? types.BACK : types.LAY)">
      LIABILITY =
      {{ new BigNumber(convertCurrency(data.get("amount"))).times(new BigNumber(convertCurrency(data.get("odds"))).minus(1)).toNumber() }}
    </h1>
    <h1>NFT Bet</h1>
  </div>
</template>

<script lang="ts">
import { useCurrency } from "../../modules/settings/currency";
import { BigNumber } from "bignumber.js";
import { useBetslip } from "../../modules/moralis/betslip";
import { ref, onMounted, Ref } from "vue";
import { useOdds } from "../../modules/settings/odds";

export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  setup(props: any, { emit }: any) {
    const { selections, types } = useBetslip();
    const { convertCurrency } = useCurrency();
    const { convertOdds } = useOdds();
    const printMe: Ref<HTMLElement | null> = ref(null);

    onMounted(() => {
      if (printMe.value) {
        /**
        html2canvas(printMe.value, {
          onclone: function (clonedDoc: any) {
            clonedDoc.getElementById("nonPrintable").style.display = "block";
          },
        }).then((canvas: any) => {
          if (canvas) {
            console.log(canvas);
            emit("converted", canvas.toDataURL());
          }
        });
         */
      }
    });

    return {
      printMe,
      convertOdds,
      convertCurrency,
      BigNumber,
      selections,
      types,
    };
  },
};
</script>
