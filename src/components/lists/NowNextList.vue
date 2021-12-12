<template>
  <div :class="{ 'opacity-0': !events, 'opacity-100 ease-in duration-300': events && groupedBy }" ref="infiniteScroll">
    <div v-if="events && groupedBy">
      <template v-for="(value, name, index) in groupedBy" :key="index">
        <CardSubHeader :title="name" class="capitalize">
          <div class="flex flex-row space-x-2 ml-auto text-xs font-semibold text-gray-300 -mr-4">
            <span class="hidden lg:block w-40 text-center pr-6">HOME</span>
            <span class="hidden lg:block w-40 text-center pr-6">DRAW</span>
            <span class="hidden lg:block w-40 text-center pr-6">AWAY</span>
          </div>
        </CardSubHeader>
        <div class="p-4 flex flex-col lg:space-y-3 space-y-4 hide-last-hr">
          <EventListItem v-for="event in value" :key="event.id" :event="event" />
        </div>
      </template>
    </div>
  </div>
  <div :class="{ 'opacity-0 ease-out duration-300': (events && groupedBy) || !triggerPulse, 'opacity-100': !events || triggerPulse }">
    <div v-show="!events || triggerPulse">
      <CardSubHeader class="h-12" title="" />
      <div class="p-4 flex flex-col lg:space-y-3 space-y-4">
        <PulseEventListItem v-for="n in pageSize" :key="n" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, Ref, ref } from "vue";
import EventListItem from "../common/EventListItem.vue";
import CardSubHeader from "../common/CardSubHeader.vue";
import { useEvents } from "../../modules/moralis/event";
import { EventModel } from "../../interfaces/models/EventModel";
import PulseEventListItem from "../transitions/pulse/PulseEventListItem.vue";
import { EventQueryParms } from "../../interfaces/EventQueryParms";
import { useTimezone } from "../../modules/settings/timezone";
import { useInfiniteScroll } from "../../modules/layout/infiniteScroll";
export default defineComponent({
  props: {
    queryParms: {
      type: Object as () => EventQueryParms,
      default: {},
      required: false,
    },
  },
  setup(props) {
    const { format, humanizeDate } = useTimezone();
    const { getEventQuery } = useEvents();
    const events: Ref<EventModel[] | undefined> = ref();
    const eventSubsriptions: Ref<Array<any>> = ref([]);
    const page = ref(1);
    const pageSize = ref(20);
    const bottomHit = ref(false);
    const infiniteScroll = ref(null);
    const triggerPulse = ref(false);

    /**
     * Group events by start category and sort by it
     */
    const groupedBy = computed((): any => {
      const group = events.value?.reduce((groups: any, event: EventModel) => {
        // Group initialization
        const date = humanizeDate(format(event.attributes.start, "YYYY-MM-DD"));
        if (!groups[date]) {
          groups[date] = [];
        }
        // Grouping
        groups[date].push(event);
        return groups;
      }, {});
      return group;
    });

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
    const queryParms: EventQueryParms = Object.assign(props.queryParms, {
      sort: {
        key: "start",
        direction: "ASC",
      },
      filter: {
        onlyFutureEvents: true,
      },
      limit: pageSize.value,
      inlcude: ["home", "away", "league.country"],
    });
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

    return { events, groupedBy, infiniteScroll, triggerPulse, pageSize };
  },

  components: {
    PulseEventListItem,
    EventListItem,
    CardSubHeader,
  },
});
</script>

<style scoped>
.hide-last-hr > div:last-child > :nth-child(2) {
  display: none;
}
</style>
