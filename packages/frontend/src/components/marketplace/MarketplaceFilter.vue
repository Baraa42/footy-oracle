<template>
  <div>
    <TransitionRoot as="template" :show="mobileFiltersOpen">
      <Dialog as="div" class="fixed lg:mx-auto inset-0 lg:w-1/2 lg:my-20 lg:mt-40 mt-16 flex z-40 xl:hidden" @close="closeModal()">
        <TransitionChild
          as="template"
          enter="transition-opacity ease-linear duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <DialogOverlay class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <TransitionChild
          as="template"
          enter="transition ease-in-out duration-300 transform"
          enter-from="translate-x-full"
          enter-to="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leave-from="translate-x-0"
          leave-to="translate-x-full"
        >
          <div class="ml-auto relative w-full h-full bg-white shadow-xl py-4 pb-12 flex flex-col overflow-y-auto">
            <div class="px-4 flex items-center justify-between">
              <h2 class="text-lg font-medium text-gray-900">Filters</h2>
              <button type="button" class="-mr-2 w-10 h-10 bg-white p-2 rounded-md flex items-center justify-center text-gray-400" @click="closeModal()">
                <span class="sr-only">Close menu</span>
                <XIcon class="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <form class="mt-4 border-t border-gray-200">
              <h3 class="sr-only">Categories</h3>
              <ul role="list" class="font-medium text-gray-900 px-2 py-3">
                <li v-for="category in subCategories" :key="category.name">
                  <a :href="category.href" class="block px-2 py-3">
                    {{ category.name }}
                  </a>
                </li>
              </ul>
              <div class="flex flex-col divide-y border-t border-b divide-gray-200">
                <CheckboxFilter class="px-4" v-model="filters.betSides" label="Betside" :options="betSideOptions" />
                <CheckboxFilter class="px-4 border-none" v-model="filters.selections" label="Selection" :options="selectionsOptions" />
              </div>
            </form>
          </div>
        </TransitionChild>
      </Dialog>
    </TransitionRoot>

    <!-- Filters -->
    <form class="hidden xl:block">
      <h3 class="sr-only">Categories</h3>
      <ul role="list" class="text-sm font-medium text-gray-900 space-y-4 pb-6 border-b border-gray-200">
        <li v-for="category in subCategories" :key="category.name">
          <a>
            {{ category.name }}
          </a>
        </li>
      </ul>

      <CheckboxFilter v-model="filters.categories" label="Categories" :options="categoryOptions" :isOpen="true" />
      <CheckboxFilter v-model="filters.betSides" label="Betside" :options="betSideOptions" />
      <CheckboxFilter v-model="filters.selections" label="Selection" :options="selectionsOptions" />
    </form>
  </div>
</template>

<script lang="ts">
import { CheckboxOption } from "@/interfaces/layout/CheckboxOption";
import { ref, defineComponent } from "vue";
import CheckboxFilter from "./CheckboxFilter.vue";
import {
  Dialog,
  DialogOverlay,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { XIcon } from "@heroicons/vue/outline";

const subCategories = [
  { name: "Has Offer", href: "#" },
  { name: "Unlisted", href: "#" },
];

export default defineComponent({
  props: {
    modelValue: { type: Object },
    modelModifiers: {
      default: () => ({}),
    },
    mobileFiltersOpen: { type: Boolean },
  },
  emits: ["update:modelValue", "onMobileClose"],
  setup(props, { emit }) {
    const filters = ref<any>(props.modelValue || {});

    const categoryOptions: CheckboxOption[] = [
      {
        value: "bet",
        label: "BET NFT",
        checked: true,
      },
      {
        value: "lp",
        label: "LP NFT",
        checked: true,
      },
    ];

    const betSideOptions: CheckboxOption[] = [
      {
        value: "0",
        label: "Back",
        checked: false,
      },
      {
        value: "1",
        label: "Lay",
        checked: false,
      },
    ];

    const selectionsOptions: CheckboxOption[] = [
      {
        value: "1",
        label: "Home",
        checked: false,
      },
      {
        value: "2",
        label: "Away",
        checked: false,
      },
      {
        value: "3",
        label: "Draw",
        checked: false,
      },
    ];

    return {
      filters,
      subCategories,
      betSideOptions,
      selectionsOptions,
      categoryOptions,
      closeModal() {
        emit("onMobileClose");
      },
    };
  },
  components: {
    CheckboxFilter,
    XIcon,
    Dialog,
    DialogOverlay,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    TransitionChild,
    TransitionRoot,
  },
});
</script>
