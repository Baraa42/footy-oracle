<template>
  <button
    disabled
    class="inline-flex w-full justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-gray-500 transition-colors items-center gap-x-2"
  >
    <span>{{ text }}</span>
    <SoccerBall class="animate-spin-slow w-4 h-4 text-gray-300" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SoccerBall from "../../assets/svg/soccer_ball.svg";

export default defineComponent({
  props: {
    text: { type: String, required: true },
    class: { type: String },
  },
  components: { SoccerBall },
});
</script>
