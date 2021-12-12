<template>
  <FadeTransition mode="out-in">
    <div class="absolute flex h-3 w-3 -top-1 -right-4" v-if="data">
      <span v-if="pulse" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-50 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-3 w-3 bg-gray-100 items-center justify-center">
        <span class="font-bold text-[7px] text-gray-800">{{ data }}</span>
      </span>
    </div>
  </FadeTransition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import FadeTransition from "../transitions/FadeTransition.vue";

export default defineComponent({
  props: {
    data: { required: true },
    pulse: { required: true },
  },
  components: {
    FadeTransition,
  },
});
</script>
