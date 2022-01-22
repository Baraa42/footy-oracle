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
            <div class="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-md">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 pl-4 mt-4"> Select token </DialogTitle>
              <div>
                <div class="px-4 pt-4 pb-2 placeholder-blue-200">
                  <input
                    type="text"
                    placeholder="Search token name or address"
                    v-model="search"
                    class="focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 block text-gray-500 w-full sm:text-sm border-gray-300 placeholder-gray-400 border-2 rounded-md transition-all duration-100 mb-2"
                  />

                  <div v-if="isAuthenticated && mode == 'from' && userTokens">
                    <span class="text-xs font-semibold">Avalible Tokens</span>
                    <div v-for="token in userTokens" :key="token.symbol" class="mt-1">
                      <div
                        v-if="findToken(token.symbol)"
                        class="relative horizontal-scroll grid grid-cols-horizontal-scroll col-span-full gap-1 grid-flow-col auto-cols-max overflow-x-scroll no-scrollbar pb-1"
                      >
                        <button
                          @click="click(findToken(token.symbol))"
                          class="inline-flex items-center bg-indigo-500 hover:bg-indigo-700 px-2 py-1 space-x-2 rounded"
                        >
                          <img :src="findToken(token.symbol)?.logoURI" class="w-6 h-6 rounded-full opacity-100" />
                          <span class="text-white text-xs font-medium">{{ token.symbol }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="w-full flex flex-col max-h-[416px] overflow-y-scroll border-t">
                  <template v-if="filterdTokens">
                    <div
                      v-for="token in filterdTokens"
                      @click="click(token)"
                      :key="token.symbol"
                      :id="token.symbol"
                      class="flex py-2 pl-4 flex-row space-x-4 items-center group hover:cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <img :src="token.logoURI" class="w-8 h-8 rounded-full opacity-100" />
                      <div class="flex flex-col">
                        <span class="text-sm font-semibold leading-5">{{ token.symbol }}</span>
                        <span class="text-xs text-gray-500">{{ token.name }}</span>
                      </div>
                    </div>
                    <div v-if="filterdTokens.length == 0" class="py-4 pl-4">
                      <span>No search results found.</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, computed } from "vue";
import Metamask from "../../assets/svg/metamask.svg";
import { TransitionRoot, TransitionChild, Dialog, DialogOverlay, DialogTitle } from "@headlessui/vue";
import useDex from "../../modules/moralis/dex/dex";
import { Token } from "../../interfaces/Token";
import { useMoralis } from "../../modules/moralis/moralis";

export default defineComponent({
  props: ["isOpen", "mode", "hideToken"],
  emits: ["onClose", "onClick"],
  setup(props, { emit }) {
    const { isAuthenticated } = useMoralis();
    const { tokens, findToken } = useDex();
    const { tokens: userTokens } = useMoralis();

    const search: Ref<string> = ref("");

    const filterdTokens = computed((): Token[] => {
      if (!tokens.value) {
        return [];
      }

      return tokens.value
        .filter((item: Token) => item != props.hideToken)
        .filter((item: Token) => {
          if (search.value.startsWith("0x")) {
            return item.address == search.value;
          } else {
            return item.name.toLowerCase().includes(search.value.toLowerCase());
          }
        });
    });

    const closeModal = () => {
      search.value = "";
      emit("onClose");
    };

    const click = (token: Token | undefined) => {
      emit("onClick", token);
      closeModal();
    };

    return {
      filterdTokens,
      search,
      tokens,
      userTokens,
      isAuthenticated,
      findToken,
      click,
      closeModal,
    };
  },
  components: {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogOverlay,
    DialogTitle,
    Metamask,
  },
});
</script>
