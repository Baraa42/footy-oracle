<template>
  <div class="block w-full lg:h-full lg:fixed lg:left-0 lg:top-20 lg:bg-gradient-to-t lg:from-gray-900 lg:to-gray-800 lg:w-52 lg:flex lg:flex-col z-50">
    <p class="font-semibold text-sm lg:text-gray-500 text-gray-700 mt-5 mb-3 ml-3 lg:mt-4 lg:mb-2 lg:ml-4">Populare</p>

    <div class="flex flex-col space-y-1">
      <router-link
        v-for="item in populareItems"
        :key="item.name"
        @click="hideMobileOverlay()"
        :to="item.to"
        class="bg-gray-100 lg:bg-transparent rounded-sm text-gray-700 font-semibold flex-row-reverse lg:flex-row justify-between lg:justify-start lg:text-gray-300 hover:text-white transition-colors flex items-center lg:space-x-3 py-3 lg:px-4 mx-2 lg:mx-0 px-3 hover:bg-gray-700"
      >
        <component :is="item.icon" class="lg:w-5 lg:h-5 w-6 h-6" />
        <span class="text-sm">{{ item.name }}</span>
      </router-link>
    </div>
    <hr class="hidden lg:block border-gray-700 my-4" />
    <p class="font-semibold text-sm lg:text-gray-500 text-gray-700 mt-6 mb-3 ml-3 lg:mt-4 lg:mb-2 lg:ml-4">All Sports</p>
    <div class="flex flex-col space-y-1">
      <router-link
        v-for="item in sports"
        :key="item.name"
        @click="hideMobileOverlay()"
        :to="item.to"
        :class="{
          'text-gray-300 lg:text-gray-600 pointer-events-none': item.disable,
          'text-gray-700 lg:text-gray-300': !item.disable,
        }"
        class="bg-gray-100 lg:bg-transparent rounded-sm font-semibold flex-row-reverse lg:flex-row justify-between lg:justify-start hover:text-white transition-colors flex items-center lg:space-x-3 py-3 lg:px-4 mx-2 lg:mx-0 px-3 hover:bg-gray-700"
      >
        <component :is="item.icon" class="w-5 h-5" />
        <span class="text-sm">{{ item.name }}</span>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
/// <reference types="vite-svg-loader" />
import { defineComponent, markRaw } from "vue";
import ActionBarButton from "../buttons/ActionBarButton.vue";
import SoccerBall from "@/assets/svg/soccer_ball.svg";
import Trophy from "@/assets/svg/trophy.svg";
import Basketball from "@/assets/svg/basketball.svg";
import Baseball from "@/assets/svg/baseball.svg";
import Football from "@/assets/svg/football.svg";
import Gamepad from "@/assets/svg/gamepad.svg";
import { RefreshIcon, LibraryIcon } from "@heroicons/vue/outline";
import TennisBall from "@/assets/svg/tennis_ball.svg";
import Boxing from "@/assets/svg/boxing.svg";
import RacingHelmet from "@/assets/svg/racing_helmet.svg";
import { useBreakpoint } from "../../modules/layout/tailwindBreakpoints";
import { useActionBar } from "../../modules/layout/actionBar";
export default defineComponent({
  setup() {
    const { breakpoints } = useBreakpoint();
    const { closeActionBar } = useActionBar();
    const hideMobileOverlay = () => {
      if (breakpoints.is === "xs" || breakpoints.is === "sm" || breakpoints.is === "md") {
        closeActionBar();
      }
    };

    const populareItems = [
      {
        name: "Soccer",
        icon: markRaw(SoccerBall),
        to: {
          name: "sport",
          params: { sport: "soccer" },
        },
      },
      {
        name: "NFT Marketplace",
        icon: markRaw(LibraryIcon),
        to: {
          name: "nftMarketplace",
        },
      },
      {
        name: "Swap Tokens",
        icon: markRaw(RefreshIcon),
        to: {
          name: "swap",
        },
      },
    ];

    const sports = [
      {
        name: "Baseball",
        icon: markRaw(Baseball),
        to: {
          name: "sport",
          params: { sport: "baseball" },
        },
        disable: true,
      },
      {
        name: "Basketball",
        icon: markRaw(Basketball),
        to: {
          name: "sport",
          params: { sport: "basketball" },
        },
        disable: true,
      },
      {
        name: "Boxing",
        icon: markRaw(Boxing),
        to: {
          name: "sport",
          params: { sport: "boxing" },
        },
        disable: true,
      },
      {
        name: "E-Sport",
        icon: markRaw(Gamepad),
        to: {
          name: "sport",
          params: { sport: "e-sport" },
        },
        disable: true,
      },
      {
        name: "Football",
        icon: markRaw(Football),
        to: {
          name: "sport",
          params: { sport: "football" },
        },
        disable: true,
      },
      {
        name: "Racing",
        icon: markRaw(RacingHelmet),
        to: {
          name: "sport",
          params: { sport: "racing" },
        },
        disable: true,
      },
      {
        name: "Soccer",
        icon: markRaw(SoccerBall),
        to: {
          name: "sport",
          params: { sport: "soccer" },
        },
      },
      {
        name: "Specials",
        icon: markRaw(Trophy),
        to: {
          name: "sport",
          params: { sport: "specials" },
        },
        disable: true,
      },
      {
        name: "Tennis",
        icon: markRaw(TennisBall),
        to: {
          name: "sport",
          params: { sport: "tennis" },
        },
        disable: true,
      },
    ];

    return { hideMobileOverlay, populareItems, sports };
  },
  components: { ActionBarButton, SoccerBall },
});
</script>
