<template>
  <Menu as="div" class="relative inline-block text-left" v-if="isAuthenticated">
    <div>
      <MenuButton
        class="inline-flex justify-end items-center w-full pr-4 pl-10 h-14 text-sm font-medium bg-black rounded-md bg-opacity-30 hover:bg-opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 space-x-3"
      >
        <div class="flex flex-col text-right">
          <span class="text-xs font-medium text-gray-300 leading-relaxed">Available Funds</span>
          <span class="text-xs leading-relaxed tracking-wide">{{ balance.available }} {{ activeChain.currencySymbol }}</span>
        </div>
        <ChevronDownIcon class="w-4 h-4 ml-2 -mr-1 text-gray-200 hover:text-gray-100" aria-hidden="true" />
      </MenuButton>
    </div>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems
        class="absolute right-0 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <div class="divide-y-2 divide-gray-400 divide-opacity-20" v-if="tokens.length != 0">
          <div v-for="token in tokens" :key="token.symbol" class="flex flex-row space-x-2 py-2 justify-end px-2 items-center text-black text-sm">
            <div class="flex flex-row space-x-2 leading-relaxed tracking-wide font-medium">
              <span>{{ convertCurrency(token.balance) }}</span
              ><span>{{ token.symbol }}</span>
            </div>

            <router-link
              :to="{
                name: 'swap',
                query: { from: token.symbol },
              }"
              class="text-[9px] px-2 rounded text-white bg-indigo-500 hover:bg-indigo-700 transition-colors"
              >Swap</router-link
            >
          </div>
        </div>
        <div v-else class="p-3">
          <p class="text-gray-800 text-sm tracking-tighter leading-tighter">No other Tokens found in your wallet.</p>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";
import { ChevronDownIcon } from "@heroicons/vue/solid";
import { ChevronUpIcon } from "@heroicons/vue/solid";
import { useToggle } from "../../modules/layout/toggle";
import { useMoralis } from "../../modules/moralis/moralis";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { useCurrency } from "../../modules/settings/currency";
import { useChain } from "@/modules/moralis/chain";

export default defineComponent({
  setup() {
    const { isAuthenticated, balance, tokens } = useMoralis();
    const { isToggled, toggle, close } = useToggle();
    const { activeChain } = useChain();
    const { convertCurrency } = useCurrency();

    const onClickAway = (event: any) => {
      close();
    };

    return { isAuthenticated, isToggled, toggle, close, onClickAway, balance, tokens, activeChain, convertCurrency };
  },
  components: {
    Menu,
    MenuButton,
    MenuItems,
    MenuItem,
    ChevronUpIcon,
    ChevronDownIcon,
  },
});
</script>
