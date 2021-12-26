<template>
  <CardContainer v-if="league" class="pb-2">
    <div class="bg-gray-800 h-24 rounded-t">
      <div class="flex flex-col w-full h-full text-white">
        <div class="text-gray-300 flex flex-row space-x-2 items-center pt-5 px-4 lg:px-5 w-max">
          <span
            class="text-xs font-light hover:text-white transition-colors w-max"
            :to="{
              name: 'sport',
              params: { sport: 'soccer' },
            }"
            >Soccer
          </span>
        </div>
        <h2 class="font-semibold text-2xl px-4 lg:px-5 pt-2 capitalize">
          {{ league.get("name") }}
        </h2>
      </div>
    </div>
    <NowNextList v-if="queryParms" :queryParms="queryParms" />
  </CardContainer>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import CardContainer from "../components/common/CardContainer.vue";
import NowNextList from "../components/lists/NowNextList.vue";
import { useLeagues } from "../modules/moralis/leagues";
import { useAlert } from "../modules/layout/alert";
import { LeagueModel } from "../interfaces/models/LeagueModel";
import { EventQueryParms } from "../interfaces/EventQueryParms";

export default defineComponent({
  setup() {
    const route = useRoute();
    const sport = ref(route.params.sport);
    const league: Ref<LeagueModel | undefined> = ref();
    const queryParms: Ref<EventQueryParms> = ref({});
    const { getLeagueById } = useLeagues();

    /**
     * Load league by its id
     */
    const loadLeague = async (id: string) => {
      league.value = await getLeagueById(id);

      if (league.value) {
        queryParms.value = { filter: { league: league.value } };
      } else {
        const { showError } = useAlert();
        const router = useRouter();
        showError("League could not be loaded.");
        router.push({ name: "NotFound" });
      }
    };

    /**
     * Trigger load league from mount and router change
     */
    watch(
      () => route.params.league,
      (newId) => (newId ? loadLeague(newId.toString()) : "")
    );
    if (!league.value) {
      loadLeague(route.params.league.toString());
    }

    return { sport, league, queryParms };
  },
  components: {
    CardContainer,
    NowNextList,
  },
});
</script>
