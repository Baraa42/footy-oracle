<template>
  <div class="h-14 w-full bg-gray-700 text-white flex flex-row items-center justify-between px-4">
    <h3 class="text-lg font-semibold">Favorites</h3>
    <CloseButton @click="closeOverlay()" />
  </div>

  <div class="flex flex-col space-y-1" v-if="isAuthenticated">
    <table v-if="favorites && favorites.length != 0">
      <tr class="bg-gray-200">
        <th class="w-2/3 text-left px-4 py-1">
          <button @click="toggleSort('event')" class="flex flex-row items-center text-gray-600 font-semibold text-sm focus:outline-none group">
            Event
            <ChevronDownIcon
              v-if="activeSort.asc"
              :class="{
                block: activeSort.prop === 'event',
                'hidden group-hover:block': activeSort.prop !== 'event',
              }"
              class="ml-1 w-4 h-4 transition-all"
            />
            <ChevronUpIcon
              v-if="!activeSort.asc"
              :class="{
                block: activeSort.prop === 'event',
                'hidden group-hover:block': activeSort.prop !== 'event',
              }"
              class="ml-1 w-4 h-4 transition-all"
            />
          </button>
        </th>
        <th class="text-left">
          <button @click="toggleSort('start')" class="flex flex-row items-center text-gray-600 font-semibold text-sm focus:outline-none group">
            Start
            <ChevronDownIcon
              v-if="activeSort.asc"
              :class="{
                block: activeSort.prop === 'start',
                'hidden group-hover:block': activeSort.prop !== 'start',
              }"
              class="ml-1 w-4 h-4 transition-all"
            />
            <ChevronUpIcon
              v-if="!activeSort.asc"
              :class="{
                block: activeSort.prop === 'start',
                'hidden group-hover:block': activeSort.prop !== 'start',
              }"
              class="ml-1 w-4 h-4 transition-all"
            />
          </button>
        </th>
      </tr>

      <tr v-for="favorite in favorites" :key="favorite.id" class="hover:bg-gray-100 border-b transition-colors">
        <td class="text-left px-4 flex flex-col my-2">
          <router-link
            @click="hideMobileOverlay()"
            class="leading-5 hover:text-gray-900 text-gray-700 font-medium max-w-[240px] w-max transition-colors"
            :title="`Go to ${favorite.get('event').get('home')} vs. ${favorite.get('event').get('away')}`"
            :to="{
              name: 'event',
              params: {
                sport: 'soccer',
                league: favorite.get('event').get('league').id,
                event: favorite.get('event').id,
              },
            }"
          >
            {{ favorite.get("event").get("home") }} vs {{ favorite.get("event").get("away") }}</router-link
          >
          <router-link
            @click="hideMobileOverlay()"
            :title="`Go to ${favorite.get('event').get('league').get('name')}`"
            :to="{
              name: 'league',
              params: {
                sport: 'soccer',
                league: favorite.get('event').get('league').id,
              },
            }"
            class="hover:text-gray-900 text-xs text-gray-600 mt-1 w-max transition-colors"
            >{{ favorite.get("event").get("league").get("name") }}</router-link
          >
        </td>
        <td class="text-left font-medium align-text-top text-gray-700 text-sm">
          {{ getDateTime(favorite.get("event").get("start")) }}
        </td>
      </tr>
    </table>
    <InfoMessage v-else class="m-3" message="Click in a event on the star icon to bookmark events for easy access." />
  </div>
  <InfoMessage v-else class="m-3" message="You need to connect to your wallet to see your favorite events." />
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { useTimezone } from "../../modules/settings/timezone";
import { ChevronUpIcon } from "@heroicons/vue/solid";
import { ChevronDownIcon } from "@heroicons/vue/solid";
import CloseButton from "../buttons/CloseButton.vue";
import InfoMessage from "../common/InfoMessage.vue";
import { useMoralis } from "../../modules/moralis/moralis";
import { useBreakpoint } from "../../modules/layout/tailwindBreakpoints";
import { useActionBar } from "../../modules/layout/actionBar";
import { FavoriteModel } from "../../interfaces/models/FavoriteModel";

export default defineComponent({
  emits: ["closeOverlay"],
  setup(_, { emit }) {
    const { breakpoints } = useBreakpoint();
    const { closeActionBar } = useActionBar();
    const { isAuthenticated, favorites } = useMoralis();
    const { getDateTime } = useTimezone();

    const activeSort = reactive({
      prop: "start",
      asc: true,
    });

    const sortName = (asc = true) => {
      if (favorites.value?.length != 0) {
        favorites.value?.sort((a: FavoriteModel, b: FavoriteModel) => {
          const aName: string = `${a.get("event").get("home").get("name")} vs. ${a.get("event").get("away").get("name")}`;
          const bName: string = `${b.get("event").get("home").get("name")} vs. ${b.get("event").get("away").get("name")}`;

          if (asc) {
            return aName.localeCompare(bName);
          } else {
            return bName.localeCompare(aName);
          }
        });
      }
    };

    const sortTimestamp = (asc = true) => {
      if (favorites.value?.length != 0) {
        favorites.value?.sort((a: FavoriteModel, b: FavoriteModel) => {
          if (asc) {
            return a.get("event").get("start") - b.get("event").get("start");
          } else {
            return b.get("event").get("start") - a.get("event").get("start");
          }
        });
      }
    };

    const toggleSort = (prop: string) => {
      if (activeSort.prop !== prop) {
        activeSort.prop = prop;
        activeSort.asc = true;
      } else {
        activeSort.asc = !activeSort.asc;
      }

      if (prop === "event") {
        sortName(activeSort.asc);
      }
      if (prop === "start") {
        sortTimestamp(activeSort.asc);
      }
    };

    const hideMobileOverlay = () => {
      if (breakpoints.is === "xs" || breakpoints.is === "sm" || breakpoints.is === "md") {
        closeActionBar();
      }
    };

    const closeOverlay = () => {
      emit("closeOverlay");
    };

    sortTimestamp();

    return {
      isAuthenticated,
      activeSort,
      favorites,
      toggleSort,
      sortName,
      getDateTime,
      closeOverlay,
      hideMobileOverlay,
    };
  },
  components: { CloseButton, ChevronUpIcon, ChevronDownIcon, InfoMessage },
});
</script>
