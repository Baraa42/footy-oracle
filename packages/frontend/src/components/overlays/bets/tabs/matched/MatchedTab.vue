<template>
  <div>
    <MatchedItem
      v-if="isAuthenticated"
      v-for="bet in matchedBets"
      :data="bet"
      :key="`${bet.attributes.eventId}-${bet.attributes.selection}-${bet.attributes.betType}`"
    />
    <InfoMessage v-else class="m-3" message="You need to connect to your wallet to see your matched events." />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useMoralis } from "../../../../../modules/moralis/moralis";
import InfoMessage from "../../../../common/InfoMessage.vue";
import MatchedItem from "./MatchedItem.vue";

export default defineComponent({
  setup() {
    const { matchedBets, isAuthenticated } = useMoralis();

    return {
      isAuthenticated,
      matchedBets,
    };
  },
  components: {
    InfoMessage,
    MatchedItem,
  },
});
</script>
