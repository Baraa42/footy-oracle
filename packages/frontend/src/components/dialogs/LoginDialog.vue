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
            <div class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-md">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900"> Connect to a wallet </DialogTitle>
              <div class="mt-4">
                <button
                  v-if="isWeb3Enabled"
                  @click="login()"
                  type="button"
                  class="w-full justify-between inline-flex items-center px-4 py-2 font-medium text-gray-900 bg-gray-100 border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 hover:bg-gray-200 cursor-pointer"
                >
                  <span>Metamask</span>
                  <Metamask class="w-8 h-8" />
                </button>
                <a
                  v-else
                  href="https://metamask.io/"
                  target="_blank"
                  class="w-full justify-between inline-flex items-center px-4 py-2 font-medium text-gray-900 bg-gray-100 border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 hover:bg-gray-200 cursor-pointer"
                >
                  <span>Install Metamask</span>
                  <Metamask class="w-8 h-8" />
                </a>
              </div>
            </div>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent, Ref, watch, ref } from "vue";
import Metamask from "../../assets/svg/metamask.svg";
import { TransitionRoot, TransitionChild, Dialog, DialogOverlay, DialogTitle } from "@headlessui/vue";
import { useMoralis } from "../../modules/moralis/moralis";

export default defineComponent({
  props: ["isOpen"],
  emits: ["onClose"],
  setup(_, { emit }) {
    const { login, isAuthenticated, isWeb3Enabled } = useMoralis();

    watch(isAuthenticated, (value, oldValue) => {
      if (value && !oldValue) {
        emit("onClose");
      }
    });

    return {
      isWeb3Enabled,
      login,
      closeModal() {
        emit("onClose");
      },
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
