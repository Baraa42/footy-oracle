<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal">
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="min-h-screen px-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <DialogOverlay class="fixed inset-0 bg-black opacity-30" />
          </TransitionChild>

          <span class="inline-block h-screen align-middle" aria-hidden="true"> &#8203; </span>

          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <div
              class="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-md"
              v-if="nft"
            >
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                <span v-if="nft.attributes?.token_id">Bet NFT #{{ nft.attributes.token_id }}</span>
              </DialogTitle>
              <div class="mt-4">
                <FadeTransition mode="out-in">
                  <Suspense>
                    <template #default>
                      <NftImage :nft="nft" ckass="w-full"></NftImage>
                    </template>
                    <template #fallback>
                      <div class="flex w-full h-48 justify-center items-center">
                        <SoccerBall class="animate-spin-slow w-14 h-14 text-gray-300" />
                      </div>
                    </template>
                  </Suspense>
                </FadeTransition>
              </div>
              <div class="mt-4 flex flex-row space-x-2">
                <a
                  :href="getOpenseaLink(nft)"
                  target="_blank"
                  class="w-full text-center justify-between inline-flex items-center px-4 py-2 font-medium text-gray-900 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
                >
                  <span>Open in Opensea</span>
                  <Opensea class="w-6 h-6" />
                </a>
                <button
                  @click="withdraw(nft)"
                  type="button"
                  class="w-full text-center justify-between inline-flex items-center px-4 py-2 font-medium text-gray-900 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
                >
                  <span>Withdraw</span>
                  <div class="w-6 h-6 bg-[#2081E2] rounded-full flex items-center justify-center">
                    <CashIcon class="w-4 h-4 text-white" />
                  </div>
                </button>
              </div>
            </div>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import { TransitionRoot, TransitionChild, Dialog, DialogOverlay, DialogTitle } from "@headlessui/vue";
import { useMoralis } from "@/modules/moralis/moralis";
import FadeTransition from "@/components/transitions/FadeTransition.vue";
import NftImage from "../common/NftImage.vue";
import Opensea from "@/assets/svg/opensea.svg";
import { CashIcon } from "@heroicons/vue/solid";
import SoccerBall from "@/assets/svg/soccer_ball.svg";
import { useNFTs } from "@/modules/moralis/nfts";
import { useWithdraw } from "@/modules/moralis/withdraw";
import { NftOwnerModel } from "@/interfaces/models/NftOwnerModel";

export default defineComponent({
  props: {
    isOpen: {
      type: Boolean,
    },
    nft: {
      type: Object as () => NftOwnerModel,
      required: true,
    },
  },
  emits: ["onClose"],
  setup(_, { emit }) {
    const { isAuthenticated } = useMoralis();
    const { getOpenseaLink } = useNFTs();
    const { withdraw } = useWithdraw();

    watch(
      () => isAuthenticated.value,
      (value) => {
        if (value) {
          emit("onClose");
        }
      }
    );

    return {
      withdraw,
      getOpenseaLink,
      closeModal() {
        emit("onClose");
      },
    };
  },
  components: {
    NftImage,
    CashIcon,
    Opensea,
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogOverlay,
    DialogTitle,
    FadeTransition,
    SoccerBall,
  },
});
</script>
