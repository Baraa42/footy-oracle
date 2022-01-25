<template>
  <div class="grid grid-cols-table p-5" v-if="bet.attributes.event">
    <div class="flex flex-col">
      <span class="text-lg font-medium">{{ bet.attributes.event.getName() }}</span>
      <!-- <div class="flex flex-row space-x-2">
       <span class="font-semibold" v-if="bet.get('selection') == '1'"> {{ bet.attributes.event.get("home").attributes.name }}</span>
        <span class="font-semibold" v-if="bet.get('selection') == '2'">Draw</span>
        <span class="font-semibold" v-if="bet.get('selection') == '3'">{{ bet.attributes.event.get("away").attributes.name }}</span>  
      </div> 
      -->
    </div>
    <div class="flex items-center text-red-600 font-semibold" v-if="bet.get('betSide') == '1'">Lay</div>
    <div class="flex items-center text-blue-600 font-semibold" v-if="bet.get('betSide') == '0'">Back - {{ getBetSelection() }}</div>
    <div class="flex items-center">{{ decodeOdds(bet.get("odds")) }}</div>
    <div class="flex items-center">{{ convertCurrency(bet.get("amount")) }} {{ activeChain.currencySymbol }}</div>
    <div class="flex items-center" v-if="bet.get('betSide') == '0'">{{ convertCurrency(bet.get("amount")) }} {{ activeChain.currencySymbol }}</div>
    <div class="flex items-center" v-if="bet.get('betSide') == '1'">
      {{ new BigNumber(convertCurrency(bet.get("amount"))).times(new BigNumber(decodeOdds(bet.get("odds"))).minus(1)).toNumber() }}
      {{ activeChain.currencySymbol }}
    </div>
    <div class="flex items-center" v-if="bet.get('won') == true">{{ convertCurrency(bet.get("amount"
)) }} {{ activeChain.currencySymbol }}</div>
    <div class="flex items-center" v-if="bet.get('won') == false && bet.get('betSide') == '0'">- {{
convertCurrency(bet.get("amount")) }} {{ activeChain.currencySymbol }}</div>
    <div class="flex items-center" v-if="bet.get('won') == false && bet.get('betSide') == '1'">
      -{{ new BigNumber(convertCurrency(bet.get("amount"))).times(new BigNumber(decodeOdds(bet.get("odds"))).minus(1)).toNumber() }}
      {{ activeChain.currencySymbol }}
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
import { MatchedBetModel } from "../../interfaces/models/MatchedBetModel";
import { useChain } from "@/modules/moralis/chain";

export default defineComponent({
  props: {
   bet: { type: Object as () => MatchedBetModel, required: true },
  },
  setup(props) {
    const { convertCurrency } = useCurrency();
    const { decodeOdds } = useOdds();
    const { activeChain } = useChain();
    console.log(props.bet);
    console.log(props.bet.get('selection'));
    console.log(props.bet.get('betSide'));
    //console.log(props.bet.get('won'));
    console.log(props.bet?.attributes.event?.getName());
    console.log(props.bet?.attributes.event?.get("home").attributes.name);
    
    

    const getBetSelection = () => {
      if (props.bet?.get('selection') == '1') {
        return props.bet?.attributes.event?.get("home").attributes.name;
      }
      else if (props.bet?.get('selection') == '2') {
        return 'Draw';
      } 
      else if (props.bet?.get('selection') == '1') {
        return props.bet?.attributes.event?.get("away").attributes.name;
      } 
      else {
        return '';
      }
    };
    return { activeChain, decodeOdds, convertCurrency, BigNumber, getBetSelection };
  },
});
</script>
