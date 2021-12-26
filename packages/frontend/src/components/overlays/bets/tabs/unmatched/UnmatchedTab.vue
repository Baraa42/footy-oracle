<template>
  <div>
    <div v-if="isAuthenticated && unmatchedBets">
      <UnmatchedItem
        v-for="bet in unmatchedBets"
        :data="bet"
        :key="`${bet.attributes.apiId}-${bet.attributes.betType}-${bet.attributes.selection}-${bet.attributes.betSide}`"
      />
    </div>
    <div v-else>
      <InfoMessage class="m-3" message="You need to connect to your wallet to see your unmatched events." />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useMoralis } from "../../../../../modules/moralis/moralis";
import UnmatchedItem from "./UnmatchedItem.vue";
import InfoMessage from "../../../../common/InfoMessage.vue";

export default defineComponent({
  setup() {
    const { isAuthenticated, unmatchedBets } = useMoralis();

    return {
      isAuthenticated,
      unmatchedBets,
    };
  },
  components: {
    UnmatchedItem,
    InfoMessage,
  },
});
</script>
