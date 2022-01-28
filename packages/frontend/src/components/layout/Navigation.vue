<template>
  <nav class="min-h-[4rem] lg:min-h-[5rem] bg-gray-900 w-full fixed shadow lg:shadow-none pt-save pr-save pl-save z-50">
    <div class="min-h-[4rem] lg:min-h-[5rem] flex flex-row items-center h-full w-full text-white px-3 lg:px-5 lg:pr-2">
      <div class="flex items-center space-x-4 lg:space-x-0 md:w-52 w-max">
        <button class="lg:hidden focus:outline-none flex items-center justify-center" @click="setNavigationToActionBar()">
          <MenuIcon class="w-6 h-6" v-if="!isMobileMenuOpen" />
          <XIcon class="w-6 h-6" v-if="isMobileMenuOpen" />
        </button>
        <router-link to="/" class="font-bold text-xl md:text-2xl tracking-wide">Footy Oracle</router-link>
      </div>

      <div class="hidden lg:flex">
        <SearchInput />
      </div>

      <div class="flex ml-auto md:space-x-8 space-x-4 items-center p-0 m-0">
        <FundsDropdown class="hidden lg:block" />
        <ChainDropdown />

        <button
          @click="toggleLoginDialog()"
          v-if="!isAuthenticated"
          class="w-auto px-4 h-10 shadow-sm font-medium rounded-md bg-gradient-to-b from-indigo-600 to-indigo-700 text-gray-50 focus:outline-none transition-all hover:bg-gradient-to-t border-2 border-indigo-600 focus:ring-2 focus:ring-indigo-700 ring-offset-4 ring-offset-gray-800"
        >
          <span class="hidden lg:block">Connect to a wallet</span>
          <span class="block lg:hidden">Connect</span>
        </button>

        <div v-if="isAuthenticated" class="flex flex-row items-center lg:space-x-2 cursor-pointer group transition-colors" @click="setProfileToActionBar()">
          <span class="font-semibold hidden md:block">{{ moralisUser?.get("ethAddress").substring(0, 6) }}...</span>
          <button class="focus:outline-none h-14 w-14 rounded-full group-hover:bg-gray-800 flex items-center justify-center">
            <UserIcon class="w-6 h-6 lg:w-8 lg:h-8" />
          </button>
        </div>
      </div>
    </div>
  </nav>

  <teleport to="#app" v-if="isLoginDialogOpen">
    <LoginDialog :isOpen="isLoginDialogOpen" @onClose="toggleLoginDialog()" />
  </teleport>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { MenuIcon } from "@heroicons/vue/outline";
import { XIcon } from "@heroicons/vue/outline";
import { UserIcon } from "@heroicons/vue/solid";
import { ChevronDownIcon, LoginIcon } from "@heroicons/vue/solid";
import { useToggle } from "../../modules/layout/toggle";
import SlideTransition from "../transitions/SlideTransition.vue";
import OverlayWrapper from "../overlays/OverlayWrapper.vue";
import FadeTransition from "../transitions/FadeTransition.vue";
import NavigationBar from "./NavigationBar.vue";
import { useMoralis } from "../../modules/moralis/moralis";
import FundsDropdown from "../dropdowns/FundsDropdown.vue";
import LoginDialog from "../dialogs/LoginDialog.vue";
import SearchInput from "../inputs/SearchInput.vue";
import { useActionBar } from "../../modules/layout/actionBar";
import UserOverlay from "../overlays/UserOverlay.vue";
import ChainDropdown from "../dropdowns/ChainDropdown.vue";

export default defineComponent({
  setup() {
    const { isAuthenticated, moralisUser } = useMoralis();
    const { isToggled: isMobileMenuOpen } = useToggle();
    const { isToggled: isLoginDialogOpen, toggle: toggleLoginDialog } = useToggle();
    const { setActionBarItem } = useActionBar();

    const setProfileToActionBar = () => {
      setActionBarItem({
        name: "User",
        component: UserOverlay,
      });
    };

    const setNavigationToActionBar = () => {
      setActionBarItem({
        name: "Navigation",
        component: NavigationBar,
      });
    };

    return {
      moralisUser,
      isAuthenticated,
      isMobileMenuOpen,
      isLoginDialogOpen,
      toggleLoginDialog,
      setProfileToActionBar,
      setNavigationToActionBar,
    };
  },
  components: {
    XIcon,
    MenuIcon,
    LoginIcon,
    UserIcon,
    SlideTransition,
    OverlayWrapper,
    FadeTransition,
    NavigationBar,
    ChevronDownIcon,
    FundsDropdown,
    SearchInput,
    LoginDialog,
    ChainDropdown,
  },
});
</script>
