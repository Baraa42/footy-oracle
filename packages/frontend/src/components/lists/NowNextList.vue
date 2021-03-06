<template>
  <div>
    <div :class="{ 'opacity-0': !events, 'opacity-100 ease-in duration-300': events && groupedBy }" ref="infiniteScroll">
      <div v-if="events && groupedBy">
        <div v-for="(value, name, index) in groupedBy" :key="index">
          <CardSubHeader :title="name" class="capitalize">
            <div class="flex flex-row space-x-3 ml-auto text-xs font-semibold text-gray-300 mr-[-5px]">
              <span class="hidden lg:block w-40 text-center">HOME</span>
              <span class="hidden lg:block w-40 text-center">DRAW</span>
              <span class="hidden lg:block w-40 text-center">AWAY</span>
            </div>
          </CardSubHeader>
          <div class="p-4 flex flex-col lg:space-y-3 space-y-4 hide-last-hr">
            <EventListItem v-for="event in value" :key="event.id" :event="event" />
          </div>
        </div>
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
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, Ref, ref } from "vue";
import EventListItem from "../common/EventListItem.vue";
import CardSubHeader from "../common/CardSubHeader.vue";
import { useEvents } from "../../modules/moralis/event";
import { EventModel } from "../../interfaces/models/EventModel";
import PulseEventListItem from "../transitions/pulse/PulseEventListItem.vue";
import { EventQueryParms } from "../../interfaces/queries/EventQueryParms";
import { useTimezone } from "../../modules/settings/timezone";
import { useInfiniteScroll } from "../../modules/layout/infiniteScroll";
import { useSubscription } from "@/modules/moralis/subscription";

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
    const { onUpdateFunction } = useSubscription();
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
    const groupedBy = computed(
      (): {
        [key: string]: EventModel[];
      } => {
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
      }
    );

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
      const event = onUpdateFunction(object, events.value, "id");
      if (event) {
        event.loadUnmatchedBets();
      }
    };

    /**
     * Create query for events, fetch it and subscribe to it
     */
    const queryParms: EventQueryParms = Object.assign(
      {
        sort: {
          key: "start",
          direction: "ASC",
        },
        filter: {
          onlyFutureEvents: true,
        },
        limit: pageSize.value,
        inlcude: ["home", "away", "league.country"],
      },
      props.queryParms
    );
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
      page.value++;
      query.find().then((data: any) => {
        if (data && data?.length != 0) {
          events.value?.push(...(data as EventModel[]));
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
