<template>
  <div>
    <LosslessMarkets class="lg:max-w-screen-xl mx-auto mb-4" />
    <CardContainer>
      <div class="bg-gray-800 h-[8rem] rounded-t">
        <div class="flex flex-col items-star justify-between w-full h-full text-white">
          <h2 class="font-semibold text-2xl px-5 py-5 capitalize">Soccer</h2>

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

      <template v-if="activeTab?.component">
        <component :is="activeTab?.component" :key="activeTab.name" />
      </template>
    </CardContainer>
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, markRaw, ref, watch } from "vue";
import FadeTransition from "../components/transitions/FadeTransition.vue";
import { useRoute } from "vue-router";
import CardContainer from "../components/common/CardContainer.vue";
import { useTabs } from "../modules/layout/tabs";
import LoadingBar from "../components/common/LoadingBar.vue";
import PopularList from "../components/lists/PopularList.vue";
import NowNextList from "../components/lists/NowNextList.vue";
import LosslessBet from "@/components/common/LosslessBet.vue";
import LosslessMarkets from "@/components/common/LosslessMarkets.vue";

export default defineComponent({
  async setup() {
    const route = useRoute();
    const sport = ref<any>(route.params.sport);

    watch(
      () => route.params.sport,
      (newId) => (sport.value = newId)
    );

    const { tabs, setTab, activeTab } = useTabs([
      {
        name: "Popular",
        isActive: true,
        component: markRaw(PopularList),
      },
      {
        name: "Now & Next",
        component: markRaw(NowNextList),
      },
      {
        name: "All",
        component: markRaw(defineAsyncComponent(() => import("../components/lists/CountryList.vue"))),
      },
    ]);

    return { sport, tabs, setTab, activeTab };
  },
  components: {
    CardContainer,
    FadeTransition,
    LoadingBar,
    PopularList,
    LosslessBet,
    LosslessMarkets,
  },
});
</script>
