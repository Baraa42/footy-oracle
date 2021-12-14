<template>
  <button class="focus:outline-none h-full px-1">
    <XIcon class="w-6 h-6 text-gray-300" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { XIcon } from "@heroicons/vue/outline";

export default defineComponent({
  components: { XIcon },
});
</script>
