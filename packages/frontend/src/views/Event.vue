<template>
  <CardContainer v-if="event">
    <div class="bg-gray-800 pb-6 lg:pb-6 relative rounded-t">
      <button @click="event ? setFavorite(event) : ''" class="absolute lg:right-4 lg:top-4 top-3 right-3 focus:outline-none">
        <StarIcon
          :class="{
            'text-yellow-300 hover:text-gray-600': isFavoriteEvent,
            'text-gray-600 hover:text-yellow-300': !isFavoriteEvent,
          }"
          class="w-8 h-8 transition-colors shadow-inner hover:shadow-none"
        />
      </button>
      <div class="text-gray-300 flex flex-row space-x-2 items-center lg:pt-5 lg:px-5 pt-5 px-4 w-max ml-1">
        <router-link
          class="text-xs font-light hover:text-white transition-colors w-max"
          :to="{
            name: 'sport',
            params: { sport: sport },
          }"
          >Soccer
        </router-link>
        <ChevronRightIcon class="w-3 h-3" />
        <router-link
          class="text-xs font-light hover:text-white transition-colors w-max"
          :to="{
            name: 'league',
            params: { sport: 'soccer', league: event.attributes.league?.id },
          }"
          >{{ event.attributes.league?.attributes.name }}
        </router-link>
      </div>
      <div class="flex flex-row lg:items-center items-start w-full text-white lg:px-5 lg:mt-4 mt-8 px-3 space-x-4">
        <EventStartDetail :event="event" :inDetail="true" />
        <div class="lg:mb-1 -mt-1 lg:mt-0 flex flex-col gap-y-1">
          <h2 class="font-semibold text-xl capitalize">{{ event.attributes.home }} vs. {{ event.attributes.away }}</h2>
          <span class="text-sm"
            >Matched Volume:
            <span v-if="event.attributes.polygonVolume">{{ event.attributes.polygonVolume }}</span>
            <span v-else>0</span>
            MATIC</span
          >
        </div>
      </div>
    </div>

    <div class="bg-gray-700 flex flex-row items-center h-5 text-xs font-semibold text-gray-300 px-5 justify-end">
      <div class="flex flex-row mr-[10.5rem] space-x-2">
        <span class="hidden lg:block w-20 text-center">Back</span>
        <span class="hidden lg:block w-20 text-center">Lay</span>
      </div>
    </div>

    <div class="lg:p-5 p-4 flex flex-col lg:space-y-3 space-y-4">
      <EventMarket :event="event" :selection="selections.HOME" />
      <hr class="lg:hidden" />
      <EventMarket :event="event" :selection="selections.DRAW" />
      <hr class="lg:hidden" />
      <EventMarket :event="event" :selection="selections.AWAY" />
    </div>
  </CardContainer>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, Ref, ref, watch } from "vue";
import { useRoute } from "vue-router";
import EventMarket from "../components/common/EventMarket.vue";
import CardContainer from "../components/common/CardContainer.vue";
import EventStartDetail from "../components/common/EventStartDetail.vue";
import { ChevronRightIcon } from "@heroicons/vue/solid";
import { StarIcon } from "@heroicons/vue/solid";
import { useEvents } from "../modules/moralis/event";
import { useFavorites } from "../modules/moralis/favorites";
import { useBetslip } from "../modules/moralis/betslip";
import { useAlert } from "../modules/layout/alert";
import { useCurrency } from "../modules/settings/currency";
import { useMoralis } from "../modules/moralis/moralis";
import { EventModel } from "../interfaces/models/EventModel";

export default defineComponent({
  setup() {
    const route = useRoute();
    const sport = ref(route.params.sport);
    const league = ref(route.params.league);

    const { selections } = useBetslip();
    const { convertCurrency } = useCurrency();
    const { showError } = useAlert();

    /**
     * Get favorites from user and check if this event is selected
     */
    const { favorites } = useMoralis();
    const { setFavorite, isFavorite } = useFavorites();
    const isFavoriteEvent = ref(false);
    watch(
      () => favorites.value?.length,
      () => {
        if (event.value) {
          isFavoriteEvent.value = isFavorite(event.value);
        }
      }
    );

    /**
     * Get event and subscribe to events
     */
    const { getEventQuery } = useEvents();
    const event: Ref<EventModel | undefined> = ref();
    const eventSubsription = ref();

    const onUpdate = (object: any) => {
      event.value = object as EventModel;
      event.value.loadUnmatchedBets();
    };

    const loadEvent = async (id: string) => {
      const query = getEventQuery({ filter: { id: id }, inlcude: ["home", "away", "league.country"] });
      event.value = (await query.first()) as EventModel;
      event.value.loadUnmatchedBets();

      query.subscribe().then((subsription) => {
        subsription.on("update", onUpdate);
        eventSubsription.value = subsription;
      });

      if (event.value) {
        isFavoriteEvent.value = isFavorite(event.value);
      } else {
        showError("Event could not be loaded.");
      }
    };

    /**
     * Trigger load event from mount and router change
     */
    watch(
      () => route.params.event,
      (newId) => (newId ? loadEvent(newId.toString()) : "")
    );
    if (!event.value) {
      loadEvent(route.params.event.toString());
    }

    /**
     * Unsubscribe to subsriptions when unmounted
     */
    onUnmounted(() => {
      eventSubsription.value.unsubscribe();
    });

    return {
      sport,
      league,
      event,
      setFavorite,
      isFavorite,
      isFavoriteEvent,
      selections,
      convertCurrency,
    };
  },
  components: {
    EventMarket,
    ChevronRightIcon,
    EventStartDetail,
    CardContainer,
    StarIcon,
  },
});
</script>
