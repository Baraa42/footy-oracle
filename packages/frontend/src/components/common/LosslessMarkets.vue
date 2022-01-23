<template>
  <div class="flex flex-col bg-gray-800 rounded">
    <div class="flex flex-row items-center justify-between px-5 py-5">
      <h2 class="font-semibold text-2xl text-white">Lossless Markets</h2>
      <QuestionMarkCircleIcon class="w-8 h-8 text-gray-500 hover:text-white transition-all cursor-pointer" />
    </div>
    <div class="px-5 py-5">
      <div
        v-if="events"
        class="bg-gray-800 flex flex-row flex-nowrap space-x-4 w-full overflow-x-scroll scroll-smooth horizontal-scroll snap-mandatory no-scrollbar snap-x pb-4"
      >
        <LosslessBet v-for="event in events" class="snap-start border-2 border-gray-200 shadow-md" :event="event" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { EventModel } from "@/interfaces/models/EventModel";
import { EventQueryParms } from "@/interfaces/queries/EventQueryParms";
import { useChain } from "@/modules/moralis/chain";
import { useEvents } from "@/modules/moralis/event";
import { defineComponent, Ref, ref } from "vue";
import LosslessBet from "./LosslessBet.vue";
import { StarIcon, QuestionMarkCircleIcon } from "@heroicons/vue/solid";
export default defineComponent({
  setup() {
    const { getEventQuery } = useEvents();
    const events: Ref<EventModel[] | undefined> = ref();
    const { getAttributeName } = useChain();

    const queryParms: EventQueryParms = {
      limit: 20,
      sort: {
        key: getAttributeName("volume") as string,
        direction: "DESC",
      },
      filter: {
        onlyFutureEvents: true,
      },
      inlcude: ["home", "away", "league.country"],
    };
    const query = getEventQuery(queryParms);
    query.find().then((data: any) => {
      events.value = data as EventModel[];
    });

    return { events };
  },
  components: { LosslessBet, QuestionMarkCircleIcon },
});
</script>
