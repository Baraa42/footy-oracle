<template>
  <CardContainer>
    <div class="bg-gray-800 flex flex-row items-center px-4 py-6 rounded-t">
      <div class="flex flex-col space-y-1 text-white">
        <h2 class="font-semibold text-lg uppercase">Populare Soccer Matches</h2>
        <router-link
          class="text-xs font-light text-gray-300 hover:text-white transition-colors w-max uppercase"
          :to="{
            name: 'sport',
            params: { sport: 'soccer' },
          }"
          >See all
        </router-link>
      </div>
    </div>

    <suspense>
      <template #default>
        <PopularList />
      </template>
      <template #fallback>
        <div>Loading...</div>
      </template>
    </suspense>
  </CardContainer>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";
import EventListItem from "../components/common/EventListItem.vue";
import CardContainer from "../components/common/CardContainer.vue";

export default defineComponent({
  components: {
    EventListItem,
    CardContainer,
    PopularList: defineAsyncComponent(() => import("../components/lists/PopularList.vue")),
  },
});
</script>
