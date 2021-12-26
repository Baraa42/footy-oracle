<template>
  <div>
    <div v-if="isAuthenticated && matchedBets">
      <MatchedItem
        v-for="bet in matchedBets"
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
