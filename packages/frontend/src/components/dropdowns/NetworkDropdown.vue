<template>
  <Menu as="div" class="relative inline-block text-left">
    <div>
      <MenuButton
        class="inline-flex justify-center items-center h-14 w-14 rounded-md bg-opacity-30 hover:bg-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 transition-colors"
      >
        <div class="flex flex-col">
          <component :is="activeChain.icon" :class="activeChain.iconClass" class="w-10 h-10" />
        </div>
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
        class="absolute h-full right-0 w-14 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <button v-for="chain in chainsWithoutActive" :key="chain.chainId" @click="setActiveChain(chain)" class="w-14 h-14 flex items-center justify-center">
          <component :is="chain.icon" :class="chain.iconClass" class="w-10 h-10 hover:opacity-100" />
        </button>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ChevronDownIcon } from "@heroicons/vue/solid";
import { ChevronUpIcon } from "@heroicons/vue/solid";
import { useToggle } from "@/modules/layout/toggle";
import { useChain } from "@/modules/moralis/chain";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";

export default defineComponent({
  setup() {
    const { isToggled, toggle, close } = useToggle();
    const { setActiveChain, chains, activeChain, chainsWithoutActive } = useChain();

    const onClickAway = (event: any) => {
      close();
    };

    console.log(chainsWithoutActive.value);

    return { isToggled, toggle, close, onClickAway, chains, activeChain, chainsWithoutActive, setActiveChain };
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
