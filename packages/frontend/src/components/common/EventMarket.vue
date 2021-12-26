<template>
  <div class="flex lg:flex-row flex-col items-center justify-between w-full">
    <div class="flex lg:flex-row justify-between lg:justify-start lg:items-center lg:space-x-4 w-full">
      <span class="font-semibold text-lg ml-auto md:ml-0 text-gray-800 mr-1 md:mr-1">
        <template v-if="selection == selections.HOME">{{ event.attributes.home.attributes.name }}</template>
        <template v-if="selection == selections.AWAY">{{ event.attributes.away.attributes.name }}</template>
        <template v-if="selection == selections.DRAW">Draw</template>
      </span>
    </div>
    <div class="flex lg:flex-row flex-col lg:space-x-3 lg:space-y-0 space-y-1 mt-3 lg:mt-0 w-full lg:w-auto">
      <div class="flex flex-row justify-between items-center">
        <span class="lg:hidden font-semibold text-sm">Back</span>
        <div class="flex flex-row space-x-1">
          <OddsButton
            class="rounded"
            :bet="getUnmatchedBetByIndex(event, types.LAY, selection, 2)"
            :type="types.BACK"
            @click="addToBetslip(event, types.BACK, selection, getUnmatchedBetByIndex(event, types.LAY, selection, 2))"
          />
          <OddsButton
            class="rounded"
            :bet="getUnmatchedBetByIndex(event, types.LAY, selection, 1)"
            :type="types.BACK"
            @click="addToBetslip(event, types.BACK, selection, getUnmatchedBetByIndex(event, types.LAY, selection, 1))"
          />
          <OddsButton
            class="rounded"
            :bet="getUnmatchedBetByIndex(event, types.LAY, selection, 0)"
            :type="types.BACK"
            @click="addToBetslip(event, types.BACK, selection, getUnmatchedBetByIndex(event, types.LAY, selection, 0))"
          />
        </div>
      </div>
      <div class="flex flex-row justify-between items-center">
        <span class="lg:hidden font-semibold text-sm">Lay</span>
        <div class="flex flex-row space-x-1">
          <OddsButton
            class="rounded"
            :bet="getUnmatchedBetByIndex(event, types.BACK, selection, 0)"
            :type="types.LAY"
            @click="addToBetslip(event, types.LAY, selection, getUnmatchedBetByIndex(event, types.BACK, selection, 0))"
          />
          <OddsButton
            class="rounded"
            :bet="getUnmatchedBetByIndex(event, types.BACK, selection, 1)"
            :type="types.LAY"
            @click="addToBetslip(event, types.LAY, selection, getUnmatchedBetByIndex(event, types.BACK, selection, 1))"
          />
          <OddsButton
            class="rounded"
            :bet="getUnmatchedBetByIndex(event, types.BACK, selection, 2)"
            :type="types.LAY"
            @click="addToBetslip(event, types.LAY, selection, getUnmatchedBetByIndex(event, types.BACK, selection, 2))"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import OddsButton from "../buttons/OddsButton.vue";
import { useBetslip } from "../../modules/moralis/betslip";
import { SelectionEnum } from "../../interfaces/enums/SelectionEnum";
import { EventModel } from "../../interfaces/models/EventModel";
import { useBet } from "../../modules/moralis/bets";
export default defineComponent({
  props: {
    selection: {
      type: Number as PropType<SelectionEnum>,
      required: true,
    },
    event: {
      type: Object as () => EventModel,
      required: true,
    },
  },
  setup() {
    const { addToBetslip, selections, types } = useBetslip();
    const { getUnmatchedBetByIndex } = useBet();
    return { types, addToBetslip, selections, getUnmatchedBetByIndex };
  },
  components: {
    OddsButton,
  },
});
</script>
