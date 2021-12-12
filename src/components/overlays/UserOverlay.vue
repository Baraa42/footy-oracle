<template>
  <div class="h-14 w-full bg-gray-700 text-white flex flex-row items-center justify-between px-4">
    <h3 class="text-lg font-semibold">User</h3>
    <CloseButton @click="closeOverlay()" />
  </div>
  <div class="p-4 flex flex-col space-y-4">
    <span class="font-semibold">My Wallet</span>
    <div class="flex flex-col space-y-2">
      <div class="flex justify-between">
        <span class="text-sm font-medium text-gray-700">Balance</span>
        <span class="text-sm font-medium leading-relaxed tracking-wide">{{ balance.available }} MATIC</span>
      </div>
      <div class="flex justify-between">
        <span class="text-sm font-medium text-gray-700">Liability</span>
        <span class="text-sm font-medium leading-relaxed tracking-wide">{{ balance.liability }} MATIC</span>
      </div>
      <div class="flex justify-between">
        <span class="text-sm font-medium text-gray-700">Available</span>
        <span class="text-sm font-medium leading-relaxed tracking-wide">{{ balance.available - balance.liability }} MATIC</span>
      </div>
    </div>
  </div>

  <div class="flex flex-col space-y-4 mt-2">
    <span class="font-semibold pl-4">Navigation</span>
    <div class="flex flex-col space-y-1">
      <router-link
        :to="{
          name: 'history',
        }"
        class="
          font-semibold
          bg-gray-100
          hover:bg-gray-200
          text-gray-700
          hover:text-black
          transition-colors
          py-3
          px-[12px]
          border-l-4 border-gray-700
          flex flex-row
          items-center
          space-x-2
        "
      >
        <CashIcon class="w-6 h-6" />
        <span>Bet Overview</span>
      </router-link>
      <router-link
        :to="{
          name: 'history',
        }"
        class="
          font-semibold
          bg-gray-100
          hover:bg-gray-200
          text-gray-700
          hover:text-black
          transition-colors
          py-3
          px-[12px]
          border-l-4 border-gray-700
          flex flex-row
          items-center
          space-x-2
        "
      >
        <LogoutIcon class="w-6 h-6" />
        <span>Logout</span>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useMoralis } from "../../modules/moralis/moralis";
import { CashIcon, LogoutIcon } from "@heroicons/vue/solid";
import CloseButton from "../buttons/CloseButton.vue";

export default defineComponent({
  emits: ["closeOverlay"],
  setup(_, { emit }) {
    const closeOverlay = () => {
      emit("closeOverlay");
    };

    const { isAuthenticated, balance } = useMoralis();

    return {
      isAuthenticated,
      balance,
      closeOverlay,
    };
  },
  components: { CloseButton, CashIcon, LogoutIcon },
});
</script>
