<template>
  <CardContainer>
    <div class="bg-gray-800 h-[7.5rem] rounded-t">
      <div class="flex flex-col items-star justify-between w-full h-full text-white">
        <h2 class="font-semibold text-2xl px-5 py-5 capitalize">User Bets</h2>

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
      <div class="grid grid-cols-table">
        <span class="hidden lg:block text-left">MATCH</span>
        <span class="hidden lg:block text-left">Details</span>
        <span class="hidden lg:block text-left">ODDS</span>
        <span class="hidden lg:block text-left">STAKE</span>
        <span class="hidden lg:block text-left">LIABILITY</span>
        <span class="hidden lg:block text-left">P / L</span>
        <span class="hidden lg:block text-left">STATUS</span>
      </div>
    </div>

    <div class="flex flex-col space-y-0">
      <HistoryItem v-for="bet in bets" :bet="bet" :key="bet.id" />
    </div>
  </CardContainer>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import HistoryItem from "../components/common/HistoryItemCopy.vue";
import CardContainer from "../components/common/CardContainer.vue";
import { useAlert } from "../modules/layout/alert";
import { useMoralis } from "../modules/moralis/moralis";
import { useTabs } from "../modules/layout/tabs";

export default defineComponent({
  async setup() {
    const { showError } = useAlert();
    const { tabs, setTab, activeTab } = useTabs([
      {
        name: "All Bets",
        isActive: true,
        component: undefined,
      },
    ]);

    const { isAuthenticated, matchedBets, unmatchedBets } = useMoralis();
    //console.log("User Matched Bets");
    //console.log(matchedBets);

    //console.log("User UnMatched Bets");
    //console.log(unmatchedBets);

    // const { getHistoryBets } = useBet();
    let bets: any;

    if (isAuthenticated.value) {
      // bets = await getHistoryBets();
      bets = matchedBets.value;
      bets = bets.concat(unmatchedBets.value);
      //console.log("matchedBets.length = ", matchedBets?.value?.length) ;
      //console.log("bets.length = ", bets?.length);
      //console.log(bets);
    } else {
      showError("You need to connect your wallet");
    }

    return { tabs, setTab, activeTab, bets };
  },
  components: {
    CardContainer,
    HistoryItem,
  },
});
</script>
