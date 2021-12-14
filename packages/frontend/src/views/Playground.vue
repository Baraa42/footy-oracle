<template>
  <CardContainer class="min-h-[800px] mt-8">
    <div class="p-4">
      <div v-if="isAuthenticated">
        <span>You are logged in {{ moralisUser?.get("ethAddress") }}</span>

        <div class="flex flex-col mt-4">
          <span>Balance: {{ balance.available }} Matic</span>
          <span>Nfts: {{ nfts?.length }}</span>
          <span>Favorite Events: {{ favorites?.length }}</span>
          <span>Matched Bets: {{ matchedBets?.length }}</span>
          <span>Unmatched Bets: {{ unmatchedBets?.length }}</span>
        </div>

        <div class="mt-4">
          <button @click="toggle()" class="bg-gray-200 px-4 py-2 text rounded mb-2">Toggle NFTs</button>
          <div class="flex flex-row w-full flex-wrap gap-2" v-if="isToggled">
            <NftImage v-for="nft in nfts" :nft="nft" class="flex w-20" />
          </div>
        </div>
      </div>
      <div v-else>You are logged off</div>
    </div>
  </CardContainer>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import CardContainer from "../components/common/CardContainer.vue";
import { useMoralis } from "../modules/moralis/moralis";
import NftImage from "../components/common/NftImage.vue";
import { useToggle } from "../modules/layout/toggle";

export default defineComponent({
  setup() {
    const { isAuthenticated, moralisUser, balance, nfts, favorites, matchedBets, unmatchedBets } = useMoralis();
    const { isToggled, toggle } = useToggle();

    return {
      isAuthenticated,
      moralisUser,
      balance,
      nfts,
      favorites,
      matchedBets,
      unmatchedBets,
      isToggled,
      toggle,
    };
  },

  components: {
    CardContainer,
    NftImage,
  },
});
</script>
