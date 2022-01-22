<template>
  <div class="bg-gray-800 rounded shadow p-4 flex flex-col justify-between">
    <div class="flex flex-row items-start justify-between space-x-2">
      <div class="flex flex-row w-1/2">
        <div
          class="border-2 border-gray-200/20 w-14 h-14 rounded-full text-white flex items-center justify-center font-bold text-lg z-10"
          :style="{ background: event.attributes.home.attributes.primaryColor }"
          :class="{ ' bg-gray-800': !event.attributes.away.attributes.primaryColor }"
        >
          {{ event.attributes.home.attributes.name.charAt(0) }}
        </div>
        <div
          class="border-2 border-gray-200/20 transform -translate-x-3 w-14 h-14 rounded-full text-white flex items-center justify-center font-bold text-lg"
          :style="{ background: event.attributes.away.attributes.primaryColor }"
          :class="{ 'bg-gray-800': !event.attributes.away.attributes.primaryColor }"
        >
          {{ event.attributes.away.attributes.name.charAt(0) }}
        </div>
      </div>

      <div class="flex flex-col w-1/2 space-y-1">
        <span class="text-xs text-gray-50 font-semibold ml-auto">{{ getDateTime(event.attributes.start) }}</span>
        <div class="flex flex-row ml-auto">
          <span class="text-xs text-gray-50 font-semibold">100 Avax</span>
        </div>
      </div>
    </div>

    <div class="mt-6 mb-4 text-white text-lg font-semibold leading-5">
      <span>{{ event.getName() }}</span>
    </div>

    <div class="flex flex-row w-full space-x-4 text-white">
      <div class="flex flex-col w-1/3 items-center space-y-2 group cursor-pointe">
        <span class="text-xs text-gray-400 group-hover:text-white transition-colors">40%</span>
        <button class="px-3 py-2 w-full rounded font-semibold outline outline-gray-200 shadow-md shadow-gray-700/5 opacity-75 hover:opacity-100 transition-all">
          Home
        </button>
      </div>
      <div class="flex flex-col w-1/3 items-center space-y-2 group cursor-pointe">
        <span class="text-xs text-gray-400 group-hover:text-white transition-colors">27%</span>
        <button class="px-3 py-2 w-full rounded font-semibold outline outline-gray-200 shadow-md shadow-gray-700/5 opacity-75 hover:opacity-100 transition-all">
          Draw
        </button>
      </div>
      <div class="flex flex-col w-1/3 items-center space-y-2 group cursor-pointe">
        <span class="text-xs text-gray-400 group-hover:text-white transition-colors">33%</span>
        <button class="px-3 py-2 w-full rounded font-semibold outline outline-gray-200 shadow-md shadow-gray-700/5 opacity-75 hover:opacity-100 transition-all">
          Away
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { EventModel } from "@/interfaces/models/EventModel";
import { useTimezone } from "@/modules/settings/timezone";
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    event: {
      type: Object as () => EventModel,
      required: true,
    },
  },
  setup() {
    const { getDateTime } = useTimezone();

    return { getDateTime };
  },
});
</script>
