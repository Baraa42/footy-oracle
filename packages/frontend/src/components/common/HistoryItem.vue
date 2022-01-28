<template>
  <div class="grid grid-cols-table p-5 text-gray-800" v-if="bet.attributes.event">
    <div class="flex flex-col space-y-1">
      <div class="flex flex-row space-x-2 items-center">
        <img class="w-4 h-4 rounded" :src="bet.attributes.event.attributes.league.attributes.country.attributes.flag" />
        <router-link
          :to="{
            name: 'league',
            params: { sport: 'soccer', league: bet.attributes.event.attributes.league?.id },
          }"
          class="text-xs font-medium text-gray-800 hover:text-indigo-800 transition-colors"
          >{{ bet.attributes.event.attributes.league?.attributes.name }}
        </router-link>
      </div>
      <router-link :to="bet.attributes.event.getDetailLink()" class="font-semibold text-gray-800 hover:text-indigo-800 transition-colors"
        >{{ bet.attributes.event.getName() }}
      </router-link>
    </div>

    <!-- DETAILS -->
    <div class="flex flex-col space-y-1">
      <div class="flex items-center text-red-600 font-semibold" v-if="bet.get('betSide') == '1'">Lay - {{ getBetSelection }}</div>
      <div class="flex items-center text-blue-600 font-semibold" v-if="bet.get('betSide') == '0'">Back - {{ getBetSelection }}</div>

      <span class="text-xs font-semibold">Placed at: {{ getDateTime(Number(bet.attributes.createdAt)) }}</span>
    </div>

    <!-- ODDS -->
    <div class="flex items-center">{{ decodeOdds(bet.get("odds")) }}</div>

    <!-- STAKE -->
    <div class="flex items-center">{{ convertCurrency(bet.get("amount")) }} {{ activeChain.currencySymbol }}</div>

    <div class="flex items-center font-semibold">{{ getProfitLoss }}</div>
    <!-- Status -->
    <div
      v-if="getBetStatus"
      class="flex items-center font-semibold"
      :class="{ 'text-gray-800': getBetStatus == 'Open', 'text-green-600': getBetStatus == 'Won', 'text-red-600 ': getBetStatus == 'Lost' }"
    >
      {{ getBetStatus }}
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useCurrency } from "../../modules/settings/currency";
import { BigNumber } from "bignumber.js";
import { useOdds } from "../../modules/settings/odds";
import { MatchedBetModel } from "../../interfaces/models/MatchedBetModel";
import { useChain } from "@/modules/moralis/chain";
import { ResultModel } from "@/interfaces/models/ResultModel";
import { BetTypeEnum } from "@/interfaces/enums/BetTypeEnum";
import { useTimezone } from "@/modules/settings/timezone";

export default defineComponent({
  props: {
    bet: { type: Object as () => MatchedBetModel, required: true },
  },
  setup(props) {
    const { convertCurrency } = useCurrency();
    const { decodeOdds } = useOdds();
    const { activeChain, getAttributeName } = useChain();
    const { format, getDateTime } = useTimezone();

    const getBetStatus = computed(() => {
      const result = props.bet.attributes.event?.attributes[getAttributeName("result")] as unknown as ResultModel;
      if (result?.attributes?.isWithdrawn) {
        if (result.attributes.result == props.bet.attributes.selection) {
          if (props.bet.attributes.betSide === BetTypeEnum.BACK) {
            return "Won";
          } else {
            return "Lost";
          }
        } else {
          if (props.bet.attributes.betSide === BetTypeEnum.LAY) {
            return "Won";
          } else {
            return "Lost";
          }
        }
      } else {
        return "Open";
      }
    });

    const getBetSelection = computed(() => {
      if (props.bet?.get("selection") == "1") {
        return props.bet?.attributes.event?.get("home").attributes.name;
      } else if (props.bet?.get("selection") == "2") {
        return "Draw";
      } else if (props.bet?.get("selection") == "3") {
        return props.bet?.attributes.event?.get("away").attributes.name;
      } else {
        return "";
      }
    });

    const getProfitLoss = computed(() => {
      if (props.bet?.attributes.event?.attributes.isCompleted) {
        if (props.bet?.get("won")) {
          return convertCurrency(props.bet?.get("amount")) + activeChain.value.currencySymbol;
        } else if (props.bet?.get("betSide") == "0") {
          // Lost Back Bet
          return "-" + convertCurrency(props.bet?.get("amount")) + activeChain.value.currencySymbol;
        } else {
          // Lost Lay Bet
          return (
            "-" +
            new BigNumber(convertCurrency(props.bet?.get("amount"))).times(new BigNumber(decodeOdds(props.bet?.get("odds"))).minus(1)).toNumber() +
            activeChain.value.currencySymbol
          );
        }
      } else {
        return "N/A";
      }
    });
    return { activeChain, decodeOdds, convertCurrency, BigNumber, getBetSelection, getBetStatus, getProfitLoss, format, getDateTime };
  },
});
</script>
