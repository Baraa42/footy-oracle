<template>
  <div class="bg-gray-100 border border-gray-200 px-3 py-3 rounded-sm flex justify-between items-center">
    <div class="flex space-x-2">
      <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>

      <span class="font-medium text-gray-700">
        {{ message }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: ["message"],
  setup() {},
});
</script>
