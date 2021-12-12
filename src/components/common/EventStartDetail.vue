<template>
  <div
    :class="{ 'bg-gray-700': inDetail, 'bg-gray-200': !inDetail }"
    class="flex flex-col w-20 items-center h-12 justify-center rounded"
    v-if="event.get('status') === 'NS'"
  >
    <span class="text-xs font-bold leading-5">
      <template v-if="isToday(event.get('start'))">Today</template>
      <template v-else-if="isTomorrow(event.get('start'))">Tomorrow</template>
      <template v-else>{{ getDate(event.get("start")) }}</template>
    </span>
    <span class="text-xs">{{ getTime(event.get("start")) }}</span>
  </div>
  <div
    :class="{
      'bg-gray-700': inDetail,
      'bg-gray-600 text-gray-50': !inDetail,
    }"
    class="flex flex-col w-20 items-center h-12 justify-center"
    v-else
  >
    <template v-if="event.get('status') === 'FT'">
      <span class="text-xs font-bold leading-5 text-center">Match<br />Finished</span>
    </template>
    <template v-else-if="event.get('status') === 'HT'">
      <span class="text-xs font-bold leading-5">Halftime</span>
    </template>
    <template v-else>
      <span class="text-xs font-bold leading-5">LIVE</span>
      <span class="text-xs">{{ event.get("elapsed") }} min</span>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useTimezone } from "../../modules/settings/timezone";
export default defineComponent({
  props: ["event", "inDetail"],
  setup() {
    const { isToday, isTomorrow, getTime, getDate, difference, isRunning } = useTimezone();
    return { isToday, isTomorrow, getTime, getDate, difference, isRunning };
  },
});
</script>
