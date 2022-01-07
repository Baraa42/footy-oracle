<template>
  <SlideTransition :from="activeActionBarItem === 'User' || activeActionBarItem === 'Navigation' ? 'top' : 'bottom'" lg-from="right">
    <OverlayWrapper class="lg:w-110 lg:h-full w-full h-calc-without-nav-footer top-16 lg:top-20 lg:right-18" v-if="activeActionBarItem !== null">
      <component :is="activeActionBarComponent" @closeOverlay="closeActionBar()"></component>
    </OverlayWrapper>
  </SlideTransition>

  <div
    class="pb-save shadow fixed bottom-0 lg:right-0 lg:top-20 lg:shadow-none w-full bg-gray-900 flex flex-row lg:flex-col items-center justify-around lg:justify-start min-h-[3.5rem] lg:w-18 lg:h-full space-y-[1px] z-50"
  >
    <ActionBarButton
      v-for="item in actionBarItems"
      :key="item.name"
      :class="item.class"
      :active="activeActionBarItem === item.name"
      @click="setActionBarItem(item)"
    >
      <component :is="item.icon" class="w-6 h-6 m-auto" />
      <span class="lg:block hidden text-xs font-semibold mt-2">{{ item.name }}</span>
    </ActionBarButton>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, markRaw } from "vue";
import ActionBarButton from "../buttons/ActionBarButton.vue";
import OverlayWrapper from "../overlays/OverlayWrapper.vue";
import SlideTransition from "../transitions/SlideTransition.vue";
import { SearchIcon } from "@heroicons/vue/outline";
import { StarIcon } from "@heroicons/vue/outline";
import { CogIcon } from "@heroicons/vue/outline";
import { CashIcon } from "@heroicons/vue/outline";
import { RefreshIcon } from "@heroicons/vue/outline";
import { BookmarkIcon } from "@heroicons/vue/outline";
import WithdrawOverlay from "../overlays/NFTOverlay.vue";
import SettingsOverlay from "../overlays/SettingsOverlay.vue";
import FavoritesOverlay from "../overlays/FavoritesOverlay.vue";
import SearchOverlay from "../overlays/SearchOverlay.vue";
import MyBetsOverlay from "../overlays/bets/MyBetsOverlay.vue";
import { useActionBar } from "../../modules/layout/actionBar";
import { ActionBarItem } from "../../interfaces/layout/ActionBarItem";

export default defineComponent({
  setup() {
    const actionBarItems: Array<ActionBarItem> = [
      {
        name: "Search",
        icon: SearchIcon,
        component: markRaw(SearchOverlay),
        class: "lg:hidden",
      },
      {
        name: "My Bets",
        icon: BookmarkIcon,
        component: markRaw(MyBetsOverlay),
      },
      {
        name: "NFTs",
        icon: CashIcon,
        component: markRaw(WithdrawOverlay),
      },
      {
        name: "Favorites",
        icon: StarIcon,
        component: markRaw(FavoritesOverlay),
      },
      {
        name: "Settings",
        icon: CogIcon,
        component: markRaw(SettingsOverlay),
      },
    ];

    const { activeActionBarItem, activeActionBarComponent, closeActionBar, setActionBarItem } = useActionBar();

    return {
      actionBarItems,
      activeActionBarItem,
      activeActionBarComponent,
      closeActionBar,
      setActionBarItem,
    };
  },
  components: {
    ActionBarButton,
    OverlayWrapper,
    SlideTransition,
  },
});
</script>
