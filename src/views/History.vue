<template>
  <CardContainer>
    <div class="bg-gray-800 h-[7.5rem] rounded-t">
      <div class="flex flex-col items-star justify-between w-full h-full text-white">
        <h2 class="font-semibold text-2xl px-5 py-5 capitalize">Bet Overview</h2>

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
        <span class="hidden lg:block text-left">SETTLED</span>
        <span class="hidden lg:block text-left">DESCRIPTION</span>
        <span class="hidden lg:block text-left">TYPE</span>
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
    <div class="px-5 py-4 flex items-center justify-between border-t border-gray-100 sm:px-6">
      <div class="flex-1 flex justify-between sm:hidden">
        <a
          href="#"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:text-gray-500"
        >
          Previous
        </a>
        <a
          href="#"
          class="
            ml-3
            relative
            inline-flex
            items-center
            px-4
            py-2
            border border-gray-300
            text-sm
            font-medium
            rounded-md
            text-gray-700
            bg-white
            hover:text-gray-500
          "
        >
          Next
        </a>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing
            <span class="font-medium">1</span>
            to
            <span class="font-medium">10</span>
            of
            <span class="font-medium">{{ bets?.length }}</span>
            results
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <a
              href="#"
              class="
                relative
                inline-flex
                items-center
                px-2
                py-2
                rounded-l-md
                border border-gray-300
                bg-white
                text-sm
                font-medium
                text-gray-500
                hover:bg-gray-50
              "
            >
              <span class="sr-only">Previous</span>
              <!-- Heroicon name: solid/chevron-left -->
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fill-rule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </a>
            <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              1
            </a>
            <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              2
            </a>
            <a
              href="#"
              class="hidden md:inline-flex relative items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              3
            </a>
            <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"> ... </span>
            <a
              href="#"
              class="hidden md:inline-flex relative items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              8
            </a>
            <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              9
            </a>
            <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              10
            </a>
            <a
              href="#"
              class="
                relative
                inline-flex
                items-center
                px-2
                py-2
                rounded-r-md
                border border-gray-300
                bg-white
                text-sm
                font-medium
                text-gray-500
                hover:bg-gray-50
              "
            >
              <span class="sr-only">Next</span>
              <!-- Heroicon name: solid/chevron-right -->
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </a>
          </nav>
        </div>
      </div>
    </div>
  </CardContainer>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import HistoryItem from "../components/common/HistoryItem.vue";
import CardContainer from "../components/common/CardContainer.vue";
import { useAlert } from "../modules/layout/alert";
import { useBet } from "../modules/moralis/bets";
import { useMoralis } from "../modules/moralis/moralis";
import { useTabs } from "../modules/layout/tabs";

export default defineComponent({
  async setup() {
    const { showError, showSuccess } = useAlert();
    const { tabs, setTab, activeTab } = useTabs([
      {
        name: "Current",
        isActive: true,
        component: undefined,
      },
      {
        name: "Past",
        component: undefined,
      },
    ]);

    const { isAuthenticated } = useMoralis();
    const { getHistoryBets } = useBet();
    let bets: any;

    if (isAuthenticated.value) {
      bets = await getHistoryBets();
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
