<template>
  <div class="h-14 w-full bg-gray-700 text-white flex flex-row items-center justify-between px-4">
    <h3 class="text-lg font-semibold">Withdraw</h3>
    <CloseButton @click="closeOverlay()" />
  </div>
  <div class="p-4" v-if="isAuthenticated">
    <div class="grid grid-cols-2 gap-4">
      <div v-for="nft in nfts" class="flex flex-col items-center justify-center w-full cursor-pointer group">
        <NftImage :nft="nft" @callback="toogleWithdraw"></NftImage>
      </div>
    </div>
  </div>

  <InfoMessage v-else class="m-3" message="You need to connect to your wallet to withdraw your bets." />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import FadeTransition from "../../components/transitions/FadeTransition.vue";
import { useMoralis } from "../../modules/moralis/moralis";
import CloseButton from "../buttons/CloseButton.vue";
import InfoMessage from "../common/InfoMessage.vue";
import NftImage from "../common/NftImage.vue";
import SoccerBall from "../../assets/svg/soccer_ball.svg";
import { useToggle } from "../../modules/layout/toggle";
import { useWithdraw } from "../../modules/moralis/withdraw";

export default defineComponent({
  emits: ["closeOverlay"],
  setup(_, { emit }) {
    const { isAuthenticated, nfts } = useMoralis();
    const { toogleWithdraw } = useWithdraw();
    const closeOverlay = () => {
      emit("closeOverlay");
    };

    return {
      toogleWithdraw,
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
