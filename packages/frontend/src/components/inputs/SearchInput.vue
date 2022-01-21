<template>
  <div class="relative">
    <Menu as="div" v-slot="{ open }">
      <MenuButton ref="button"></MenuButton>
      <input
        ref="input"
        v-model="searchInput"
        class="focus:outline-none h-10 rounded-md w-full lg:w-96 px-3 bg-gray-200 lg:bg-gray-700 placeholder-gray-400"
        placeholder="Search ..."
      />
      <div class="absolute inset-y-0 right-8 flex items-center h-10">
        <SearchIcon class="w-5 h-5 absolute text-gray-400" v-if="!searchInput || loaded" />
        <SoccerBall class="animate-spin-slow w-5 h-5 absolute text-gray-400" v-else />
      </div>

      <div>
        <transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <MenuItems
            static
            v-if="query && loaded"
            class="lg:absolute lg:left-0 lg:w-96 w-full mt-2 origin-top-right lg:bg-white lg:hover:bg-white divide-y divide-gray-100 lg:rounded-md lg:shadow-lg lg:ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <div class="px-1 lg:py-1">
              <div class="flex flex-col space-y-2 lg:my-1 mx-1">
                <template v-if="searchResults && searchResults.length == 0 && loaded">
                  <span class="lg:px-2 mt-1 text-gray-900">No matching events found ...</span>
                </template>
                <MenuItem v-slot="{ active }" v-for="result in searchResults" :key="result.id">
                  <router-link
                    @click="closeResults()"
                    :to="{
                      name: 'event',
                      params: {
                        sport: 'soccer',
                        league: result.get('league').id,
                        event: result.id,
                      },
                    }"
                    :class="[active ? 'bg-gray-200 text-white' : 'lg:bg-white text-black']"
                    class="hover:bg-gray-200 transition-colors flex flex-col py-1 rounded-md lg:px-2"
                  >
                    <span class="text-gray-900">{{ result.get("home").get("name") }} vs. {{ result.get("away").get("name") }}</span>
                    <span class="text-xs text-gray-600">{{ result.get("league").get("name") }}</span>
                  </router-link>
                </MenuItem>
              </div>
            </div>
          </MenuItems>
        </transition>
      </div>
    </Menu>
  </div>
</template>

<script lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { defineComponent, Ref, ref, watch } from "vue";
import { SearchIcon } from "@heroicons/vue/outline";
import { useEvents } from "../../modules/moralis/event";
import SoccerBall from "../../assets/svg/soccer_ball.svg";
import { useDebounce } from "../../modules/layout/debounce";
import { useBreakpoint } from "../../modules/layout/tailwindBreakpoints";
import { useActionBar } from "../../modules/layout/actionBar";

export default defineComponent({
  setup() {
    const button = <Ref<any | null>>ref(null);
    const input = <Ref<any | null>>ref(null);
    const searchInput = ref("");

    const { debouncedRef } = useDebounce();

    const query = debouncedRef("", 400, false);
    const loaded = ref(false);
    const searchResults = ref();
    const { search: searchEvents } = useEvents();

    const { breakpoints } = useBreakpoint();
    const { closeActionBar } = useActionBar();
    const hideMobileOverlay = () => {
      if (breakpoints.is === "xs" || breakpoints.is === "sm" || breakpoints.is === "md") {
        closeActionBar();
      }
    };

    const closeResults = () => {
      hideMobileOverlay();
      query.value = "";
      loaded.value = false;
    };

    const onClickAway = (event: any) => {
      if (breakpoints.is !== "xs" && breakpoints.is !== "sm" && breakpoints.is !== "md") {
        closeResults();
      }
    };

    watch(searchInput, (searchTerm) => {
      loaded.value = false;
      query.value = searchTerm;
    });

    watch(query, async (searchTerm) => {
      searchResults.value = await searchEvents(searchTerm);
      loaded.value = true;

      if (button.value && input.value) {
        input.value.addEventListener("keydown", button.value.handleKeyDown);
        input.value.addEventListener("keyup", button.value.handleKeyUp);
        //input.value.addEventListener("click", button.value.handleClick);
        //button.value.focus();
      }
    });

    return {
      button,
      input,
      searchInput,
      query,
      searchResults,
      onClickAway,
      closeResults,
      loaded,
    };
  },
  components: { SearchIcon, SoccerBall, Menu, MenuButton, MenuItems, MenuItem },
});
</script>
