<template>
  <div>
    <BetSlipItem v-for="betitem in betslip" :data="betitem" :key="`${betitem.event.id}-${betitem.selection}-${betitem.type}`" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useMoralis } from "../../../../../modules/moralis/moralis";
import BetSlipItem from "./BetSlipItem.vue";

export default defineComponent({
  setup() {
    const { betslip } = useMoralis();

    return {
      betslip,
    };
  },
  components: {
    BetSlipItem,
  },
});
</script>
