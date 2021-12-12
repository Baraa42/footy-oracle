<template>
  <div>
    <div class="flex lg:flex-row flex-col items-center justify-between w-full relative" v-if="event">
      <div class="flex lg:flex-row flex-row-reverse justify-between lg:justify-start lg:items-center lg:space-x-4 w-full">
        <router-link :to="event.getDetailLink()">
          <EventStartDetail :event="event" />
        </router-link>
        <div class="flex flex-col justify-center items-start mt-[1px] w-full">
          <div class="flex flex-row space-x-2 items-center">
            <img class="w-4 h-4 rounded" :src="event.attributes.league.attributes.country.attributes.flag" />
            <router-link
              :to="{
                name: 'league',
                params: { sport: 'soccer', league: event.attributes.league?.id },
              }"
              class="text-xs font-medium text-gray-600 hover:text-black transition-colors"
              >{{ event.attributes.league?.attributes.name }}
            </router-link>
          </div>
          <div class="flex mt-[6px] w-full">
            <router-link :to="event.getDetailLink()" class="w-full font-semibold text-sm text-gray-800 hover:text-black transition-colors">{{
              event.getName()
            }}</router-link>
          </div>
        </div>
      </div>
      <div class="flex lg:flex-row flex-col lg:space-x-3 lg:space-y-0 space-y-2 mt-6 lg:mt-0 w-full lg:w-auto lg:absolute lg:right-0">
        <div class="flex flex-row justify-between items-center lg:bg-gray-50 lg:pl-1">
          <span class="lg:hidden font-semibold text-sm">{{ event.attributes.home }}</span>
          <div class="flex flex-row">
            <OddsButton
              :bet="firstUnmatchedBet(event, types.LAY, selections.HOME)"
              :type="types.BACK"
              @click="addToBetslip(event, types.BACK, selections.HOME, firstUnmatchedBet(event, types.LAY, selections.HOME))"
            />

            <OddsButton
              :bet="firstUnmatchedBet(event, types.BACK, selections.HOME)"
              :type="types.LAY"
              @click="addToBetslip(event, types.LAY, selections.HOME, firstUnmatchedBet(event, types.BACK, selections.HOME))"
            />
          </div>
        </div>
        <div class="flex flex-row justify-between items-center">
          <span class="lg:hidden font-semibold text-sm">Draw</span>
          <div class="flex flex-row">
            <OddsButton
              :bet="firstUnmatchedBet(event, types.LAY, selections.DRAW)"
              :type="types.BACK"
              @click="addToBetslip(event, types.BACK, selections.DRAW, firstUnmatchedBet(event, types.LAY, selections.DRAW))"
            />

            <OddsButton
              :bet="firstUnmatchedBet(event, types.BACK, selections.DRAW)"
              :type="types.LAY"
              @click="addToBetslip(event, types.LAY, selections.DRAW, firstUnmatchedBet(event, types.BACK, selections.DRAW))"
            />
          </div>
        </div>
        <div class="flex flex-row justify-between items-center">
          <span class="lg:hidden font-semibold text-sm">{{ event.attributes.away }}</span>
          <div class="flex flex-row">
            <OddsButton
              :bet="firstUnmatchedBet(event, types.LAY, selections.AWAY)"
              :type="types.BACK"
              @click="addToBetslip(event, types.BACK, selections.AWAY, firstUnmatchedBet(event, types.LAY, selections.AWAY))"
            />

            <OddsButton
              :bet="firstUnmatchedBet(event, types.BACK, selections.AWAY)"
              :type="types.LAY"
              @click="addToBetslip(event, types.LAY, selections.AWAY, firstUnmatchedBet(event, types.BACK, selections.AWAY))"
            />
          </div>
        </div>
      </div>
    </div>
    <hr class="lg:hidden mt-4" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EventStartDetail from "./EventStartDetail.vue";
import OddsButton from "../buttons/OddsButton.vue";
import { useBetslip } from "../../modules/moralis/betslip";
import FadeTransition from "../transitions/FadeTransition.vue";
import { EventModel } from "../../interfaces/models/EventModel";
import { useBet } from "../../modules/moralis/bets";
export default defineComponent({
  props: {
    event: {
      type: Object as () => EventModel,
      required: true,
    },
  },
  setup() {
    const { addToBetslip, selections, types } = useBetslip();
    const { firstUnmatchedBet } = useBet();
    return {
      firstUnmatchedBet,
      types,
      selections,
      addToBetslip,
    };
  },
  components: {
    EventStartDetail,
    OddsButton,
    FadeTransition,
  },
});
</script>
