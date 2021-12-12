<template>
  <div>
    <div class="h-14 w-full bg-gray-700 flex flex-row items-center justify-around space-x-[1px]">
      <div
        v-for="tab in tabs"
        :key="'header-' + tab.name"
        @click="setTab(tab)"
        :class="{
          'bg-gray-600 text-white': tab.isActive,
          'hover:bg-gray-600 hover:text-white text-gray-200': !tab.isActive,
        }"
        class="h-full w-full flex items-center justify-center"
      >
        <button class="focus:outline-none text-sm font-semibold w-full h-full transition-colors">
          <span class="relative"
            >{{ tab.name }}
            <PulseCircle v-if="betslip?.length !== 0 && tab.name === 'Betslip'" :data="betslip?.length" :pulse="animatePulsBetslip" />
            <PulseCircle v-if="unmatchedBets?.length !== 0 && tab.name === 'Unmatched'" :data="unmatchedBets?.length" :pulse="animatePulsMatched" />
            <PulseCircle v-if="matchedBets?.length !== 0 && tab.name === 'Matched'" :data="matchedBets?.length" :pulse="animatePulsUnmatched" />
          </span>
        </button>
      </div>
    </div>
    <div v-for="tab in tabs" :key="'content-' + tab.name">
      <template v-if="activeTab == tab">
        <transition-group
          enter-active-class="transition ease-out duration-100"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <component :is="tab.component" :key="tab.name" />
        </transition-group>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, markRaw } from "vue";
import FadeTransition from "../../transitions/FadeTransition.vue";
import { BetTypeEnum } from "../../../interfaces/enums/BetTypeEnum";
import { useTabs } from "../../../modules/layout/tabs";
import { useBetslip } from "../../../modules/moralis/betslip";
import { useMoralis } from "../../../modules/moralis/moralis";
import BetslipTab from "./tabs/betslip/BetslipTab.vue";
import PulseCircle from "../../common/PulseCircle.vue";
import UnmatchedTab from "./tabs/unmatched/UnmatchedTab.vue";
import MatchedTab from "./tabs/matched/MatchedTab.vue";

export default defineComponent({
  emits: ["closeOverlay"],
  async setup() {
    const type = BetTypeEnum;

    const { tabs, setTab, activeTab } = useTabs([
      {
        name: "Betslip",
        isActive: true,
        component: markRaw(BetslipTab),
      },
      {
        name: "Unmatched",
        component: markRaw(UnmatchedTab),
      },
      {
        name: "Matched",
        component: markRaw(MatchedTab),
      },
    ]);

    const { unmatchedBets, matchedBets, isAuthenticated } = useMoralis();
    const { betslip } = useBetslip();
    const animatePulsBetslip = ref(false);
    const animatePulsUnmatched = ref(false);
    const animatePulsMatched = ref(false);

    watch(
      () => betslip.value?.length,
      () => {
        animatePulsBetslip.value = true;
        setTimeout(() => {
          animatePulsBetslip.value = false;
        }, 500);
      }
    );

    watch(
      () => unmatchedBets.value?.length,
      () => {
        animatePulsBetslip.value = true;
        setTimeout(() => {
          animatePulsBetslip.value = false;
        }, 500);
      }
    );

    watch(
      () => matchedBets.value?.length,
      () => {
        animatePulsMatched.value = true;
        setTimeout(() => {
          animatePulsMatched.value = false;
        }, 500);
      }
    );

    return {
      isAuthenticated,
      tabs,
      setTab,
      activeTab,
      type,
      betslip,
      animatePulsBetslip,
      animatePulsUnmatched,
      animatePulsMatched,
      matchedBets,
      unmatchedBets,
    };
  },
  components: {
    PulseCircle,
    FadeTransition,
  },
});
</script>
