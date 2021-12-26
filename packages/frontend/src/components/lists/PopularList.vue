<template>
  <div>
    <div class="bg-gray-700 flex flex-row items-center h-2 lg:h-5 text-xs font-semibold text-gray-300 px-5 justify-end">
      <div class="flex flex-row mr-[-6px] space-x-3">
        <span class="hidden lg:block w-40 text-center">HOME</span>
        <span class="hidden lg:block w-40 text-center">DRAW</span>
        <span class="hidden lg:block w-40 text-center">AWAY</span>
      </div>
    </div>

    <div ref="infiniteScroll">
      <div class="p-4">
        <div :class="{ 'opacity-0': !events, 'opacity-100 ease-in duration-300': events }">
          <div class="flex flex-col lg:space-y-3 space-y-4" v-show="events">
            <EventListItem v-for="event in events" :key="event.id" :event="event" />
          </div>
        </div>

        <!-- Pulse event animation -->
        <div :class="{ 'lg:mt-3 mt-4': triggerPulse }">
          <div :class="{ 'opacity-0 ease-out duration-300': events || !triggerPulse, 'opacity-100': !events || triggerPulse }">
            <div class="flex flex-col lg:space-y-3 space-y-4" v-show="!events || triggerPulse">
              <PulseEventListItem v-for="n in pageSize" :key="n" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, ref, Ref } from "vue";
import EventListItem from "../common/EventListItem.vue";
import CardSubHeader from "../common/CardSubHeader.vue";
import { useEvents } from "../../modules/moralis/event";
import { useInfiniteScroll } from "../../modules/layout/infiniteScroll";
import { EventModel } from "../../interfaces/models/EventModel";
import PulseEventListItem from "../transitions/pulse/PulseEventListItem.vue";
import FadeTransition from "../transitions/FadeTransition.vue";
import { EventQueryParms } from "../../interfaces/EventQueryParms";

export default defineComponent({
  setup() {
    const { getEventQuery } = useEvents();
    const events: Ref<EventModel[] | undefined> = ref();
    const eventSubsriptions: Ref<Array<any>> = ref([]);
    const page = ref(1);
    const pageSize = ref(20);
    const bottomHit = ref(false);
    const infiniteScroll = ref(null);
    const triggerPulse = ref(false);

    /**
     * Load unmatched bets for current events without
     */
    const loadUnmatchedBets = () => {
      events.value?.filter((event) => !event.unmatchedBets).forEach((event) => event.loadUnmatchedBets());
    };

    /**
     * On subsription update
     */
    const onUpdate = async (object: any) => {
      const event = object as EventModel;
      if (events.value) {
        const index = events.value?.findIndex((item: EventModel) => item.id == event.id);
        if (index != undefined) {
          events.value[index] = event;
          event.loadUnmatchedBets();
        }
      }
    };

    /**
     * Create query for events, fetch it and subscribe to it
     */
    const queryParms: EventQueryParms = {
      limit: pageSize.value,
      sort: {
        key: "polygonVolume",
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
      loadUnmatchedBets();
    });
    query.subscribe().then((subsription) => {
      subsription.on("update", onUpdate);
      eventSubsriptions.value.push(subsription);
    });

    /**
     * Load more events callback function
     */
    const loadMoreEvents = () => {
      if (bottomHit.value) {
        return;
      }
      triggerPulse.value = true;

      const query = getEventQuery(Object.assign(queryParms, { skip: pageSize.value * page.value }));
      query.find().then((data: any) => {
        if (data && data?.length != 0) {
          events.value?.push(...(data as EventModel[]));
          page.value++;
          loadUnmatchedBets();
        } else {
          bottomHit.value = true;
        }
        triggerPulse.value = false;
      });
      query.subscribe().then((subsription) => {
        subsription.on("update", onUpdate);
        eventSubsriptions.value.push(subsription);
      });
    };

    /**
     * Mount infinte scroll to container
     */
    useInfiniteScroll(infiniteScroll, loadMoreEvents);

    /**
     * Unsubscribe to subsriptions when unmounted
     */
    onUnmounted(() => {
      eventSubsriptions.value.forEach((subsription) => subsription.unsubscribe());
    });

    return { events, infiniteScroll, triggerPulse, pageSize };
  },
  components: { EventListItem, CardSubHeader, PulseEventListItem, FadeTransition },
});
</script>
