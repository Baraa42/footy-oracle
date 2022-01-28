<template>
  <CardContainer>
    <div class="bg-gray-800 h-[7.5rem] rounded-t">
      <div class="flex flex-col items-star justify-between w-full h-full text-white">
        <h2 class="font-semibold text-2xl px-5 py-5 capitalize">Market Maker</h2>

        <div class="flex flex-row">
          <button
            v-for="tab in tabs"
            :key="tab.name"
            @click="setTab(tab)"
            :class="{
              'border-b-2': tab.isActive,
              'hover:bg-gray-700 hover:border-b-2 hover:shadow-inner': !tab.isActive,
            }"
            class="lg:px-5 w-1/3 h-12 lg:w-auto focus:outline-none text-sm font-semibold transition-colors"
          >
            {{ tab.name }}
          </button>
        </div>
      </div>
    </div>
    <div class="bg-gray-700 flex flex-row items-center h-6 text-xs font-semibold text-gray-300 px-5">
      <div class="w-full grid grid-cols-table">
        <span class="hidden lg:block text-left">MATCH</span>
        <span class="hidden lg:block text-left">DETAILS</span>
        <span class="hidden lg:block text-left">ODDS</span>
        <span class="hidden lg:block text-left">STAKE</span>
        <span class="hidden lg:block text-left">P / L</span>
        <span class="hidden lg:block text-left">STATUS</span>
      </div>
    </div>

    <div class="flex flex-col space-y-0 divide-y divide-gray-100">
      <HistoryItem v-for="bet in marketMakerBets" :bet="bet" :key="bet.id" />
    </div>
  </CardContainer>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, watch } from "vue";
import HistoryItem from "@/components/common/HistoryItem.vue";
import CardContainer from "@/components/common/CardContainer.vue";
import { useTabs } from "@/modules/layout/tabs";
import { useBet } from "@/modules/moralis/bets";
import { MatchedBetModel } from "@/interfaces/models/MatchedBetModel";

export default defineComponent({
  setup() {
    const { tabs, setTab, activeTab } = useTabs([
      {
        name: "All Bets",
        isActive: true,
        component: undefined,
      },
    ]);

    let marketMakerBets = <Ref<MatchedBetModel[] | undefined>>ref();
    const { getMarketMakerMatchedBets } = useBet();

    getMarketMakerMatchedBets().then((bets: Ref<MatchedBetModel[] | undefined>) => {
      if (bets.value) {
        marketMakerBets.value = bets.value;
      }
    });

    return { tabs, setTab, activeTab, marketMakerBets };
  },
  components: {
    CardContainer,
    HistoryItem,
  },
});
</script>
