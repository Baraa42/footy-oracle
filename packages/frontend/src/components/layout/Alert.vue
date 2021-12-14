<template>
  <transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0 translate-y-1"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-1"
  >
    <div
      v-if="show"
      :class="{
        ' bg-red-500': type == alertTypes.ERROR,
        ' bg-green-500': type == alertTypes.SUCCESS,
      }"
      class="
        z-[100]
        text-gray-100
        px-3
        py-3
        sm:px-6 sm:py-4
        border-0
        rounded-sm
        bottom-18
        sm:bottom-5
        absolute
        ml-auto
        mr-auto
        left-0
        right-0
        w-11/12
        sm:w-5/12
        shadow
        flex
        justify-between
        items-center
      "
    >
      <div class="flex space-x-2">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>

        <span>
          <b class="capitalize" v-if="title">{{ title }} </b>
          {{ message }}
        </span>
      </div>
      <button @click="close()" class="flex items-center justify-center text-2xl font-semibold focus:outline-none">
        <span>×</span>
      </button>
    </div>
  </transition>
</template>

<script lang="ts">
import { toRefs } from "vue";
import { useAlert } from "../../modules/layout/alert";
export default {
  setup() {
    const { alert, close, alertTypes } = useAlert();
    return { ...toRefs(alert), close, alertTypes };
  },
};
</script>
