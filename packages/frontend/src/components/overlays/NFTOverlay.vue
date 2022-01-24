<template>
  <div class="h-14 w-full bg-gray-700 text-white flex flex-row items-center justify-between px-4">
    <h3 class="text-lg font-semibold">NFTs</h3>
    <CloseButton @click="closeOverlay()" />
  </div>
  <div class="p-4" v-if="isAuthenticated">
    <div class="grid grid-cols-2 gap-4" v-if="nfts">
      <div v-for="nft in nfts" :key="nft.id" class="flex flex-col items-center justify-center w-full cursor-pointer group">
        <router-link
          :to="{
            name: 'marketplace-detail',
            params: { objectId: nft.id || -1 },
          }"
        >
          <NftImage :nft="nft" />
        </router-link>
      </div>
    </div>
  </div>

  <InfoMessage v-else class="m-3" message="You need to connect to your wallet to withdraw your bets." />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import FadeTransition from "../transitions/FadeTransition.vue";
import { useMoralis } from "../../modules/moralis/moralis";
import CloseButton from "../buttons/CloseButton.vue";
import InfoMessage from "../common/InfoMessage.vue";
import NftImage from "../common/NftImage.vue";
import SoccerBall from "../../assets/svg/soccer_ball.svg";

export default defineComponent({
  emits: ["closeOverlay"],
  setup(_, { emit }) {
    const { isAuthenticated, nfts } = useMoralis();
    const closeOverlay = () => {
      emit("closeOverlay");
    };

    return {
      isAuthenticated,
      nfts,
      closeOverlay,
    };
  },
  components: {
    InfoMessage,
    CloseButton,
    NftImage,
    FadeTransition,
    SoccerBall,
  },
});
</script>
