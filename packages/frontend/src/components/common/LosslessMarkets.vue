<template>
  <div class="flex flex-col space-y-4">
    <div class="flex flex-row items-center space-x-2">
      <h2 class="text-2xl font-bold text-gray-800">Lossless Markets</h2>
      <QuestionMarkCircleIcon class="w-6 h-6" />
    </div>
    <div v-if="events" class="flex flex-row flex-nowrap space-x-4 overflow-x-scroll scroll-smooth pb-2 horizontal-scroll no-scrollbar snap-x">
      <LosslessBet v-for="event in events" class="snap-start" :event="event" />
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
