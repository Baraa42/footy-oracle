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
              <div class="flex flex-col">
                <div
                  :class="{
                    'bg-green-100': color === 'green',
                    'bg-blue-100': color === 'blue',
                    'bg-red-100': color === 'red',
                    'bg-indigo-100': color === 'indigo',
                    'bg-gray-100': color === 'gray',
                  }"
                  class="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                >
                  <component
                    v-if="icon"
                    :is="icon"
                    :class="{
                      'text-green-600': color === 'green',
                      'text-blue-600': color === 'blue',
                      'text-red-600': color === 'red',
                      'text-indigo-600': color === 'indigo',
                      'text-gray-600': color === 'gray',
                    }"
                    class="h-8 w-8"
                    aria-hidden="true"
                  />
                </div>

                <h2 class="mt-6 font-semibold text-xl text-center text-gray-800">{{ title }}</h2>
                <p class="mt-2 text-center text-gray-600">
                  {{ description }}
                </p>
                <slot></slot>
                <button
                  v-if="buttonText"
                  @click="confirmModal()"
                  class="mt-8 w-full px-8 py-3 shadow-sm rounded bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors"
                >
                  {{ buttonText }}
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
import { defineComponent } from "vue";
import { TransitionRoot, TransitionChild, Dialog, DialogOverlay, DialogTitle } from "@headlessui/vue";
import { ExclamationIcon, CheckIcon, InformationCircleIcon } from "@heroicons/vue/outline";

export default defineComponent({
  props: ["isOpen", "color", "icon", "title", "description", "buttonText"],
  emits: ["onClose", "onConfirm"],
  setup(_, { emit }) {
    return {
      closeModal() {
        emit("onClose");
      },
      confirmModal() {
        emit("onConfirm");
      },
    };
  },
  components: {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogOverlay,
    DialogTitle,
    ExclamationIcon,
    InformationCircleIcon,
    CheckIcon,
  },
});
</script>
