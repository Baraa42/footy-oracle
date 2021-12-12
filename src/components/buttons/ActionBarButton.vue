<template>
  <button
    :class="{
      'bg-gray-800 text-white': active,
      'text-gray-200 hover:bg-gray-800 hover:text-white': !active,
    }"
    class="h-14 w-14 lg:h-18 lg:w-18 focus:outline-none transition-colors"
    style="margin: 0px"
  >
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    active: Boolean,
  },
});
</script>
