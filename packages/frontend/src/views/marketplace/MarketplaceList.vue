<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8">
    <div class="relative z-10 flex items-baseline justify-between pt-8 pb-6 border-b border-gray-200">
      <h1 class="text-4xl font-extrabold tracking-tight text-gray-900">NFT Marketplace</h1>

      <div class="flex items-center">
        <Menu as="div" class="relative inline-block text-left">
          <div>
            <MenuButton class="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
              Sort
              <ChevronDownIcon class="flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
            </MenuButton>
          </div>

          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <MenuItems class="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div class="py-1">
                <MenuItem v-for="option in sortOptions" :key="option.name" v-slot="{ active }">
                  <a :class="[option.current ? 'font-medium text-gray-900' : 'text-gray-500', active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm']">
                    {{ option.name }}
                  </a>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>

        <button type="button" class="p-2 -m-2 ml-5 sm:ml-7 text-gray-400 hover:text-gray-500">
          <span class="sr-only">View grid</span>
          <ViewGridIcon class="w-5 h-5" aria-hidden="true" />
        </button>
        <button type="button" class="p-2 -m-2 ml-4 sm:ml-6 text-gray-400 hover:text-gray-500 xl:hidden" @click="toggleMobileFilter()">
          <span class="sr-only">Filters</span>
          <FilterIcon class="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div class="pt-6 pb-24">
      <div class="grid grid-cols-1 xl:grid-cols-6 xl:gap-x-8 xl:gap-y-10">
        <MarketplaceFilter v-model="filters" :mobileFiltersOpen="isMobileFilterOpen" @onMobileClose="toggleMobileFilter()" />

        <!-- NFT List -->
        <div
          v-if="nfts"
          ref="infiniteScroll"
          class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-7 gap-4 xl:gap-8 w-full col-span-5"
        >
          <transition-group
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-out"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
            class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-7 gap-4 xl:gap-8 w-full col-span-5"
            tag="div"
          >
            <router-link
              :to="{
                name: 'marketplace-detail',
                params: { objectId: nft.id },
              }"
              v-for="nft in nfts"
              :key="nft.id"
              class="flex flex-col p-4 bg-white rounded shadow-sm relative group cursor-pointer hover:shadow-md transition-all"
            >
              <div class="h-full flex items-center">
                <NftImage :nft="nft" class="h-max group-hover:-translate-y-1" />
              </div>

              <div class="flex justify-between items-center flex-row h-8 mt-2">
                <div class="flex font-semibold text-sm">{{ nft.attributes.symbol }} #{{ nft.attributes.token_id }}</div>
                <div class="flex flex-row items-center space-x-1" v-if="nft.attributes.offer">
                  <span class="font-bold text-sm">{{ convertCurrency(nft.attributes.offer.attributes.price) }}</span>
                  <div class="bg-indigo-500 rounded-full w-5 h-5 flex items-center justify-center">
                    <component :is="activeChain.icon" class="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            </router-link>
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import NftImage from "@/components/common/NftImage.vue";
import { NftOwnerModel } from "@/interfaces/models/NftOwnerModel";
import { InnerQuery, QueryParms } from "@/interfaces/queries/QueryParms";
import { useInfiniteScroll } from "@/modules/layout/infiniteScroll";
import { useNFTs } from "@/modules/moralis/nfts";
import { useSubscription } from "@/modules/moralis/subscription";
import { defineComponent, onUnmounted, reactive, Ref, ref, watch, watchEffect } from "vue";
import MarketplaceFilter from "@/components/marketplace/MarketplaceFilter.vue";
import { useBet } from "@/modules/moralis/bets";
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
import { ChevronDownIcon, FilterIcon, MinusSmIcon, PlusSmIcon, ViewGridIcon } from "@heroicons/vue/solid";
import { useCurrency } from "@/modules/settings/currency";
import { useActionBar } from "@/modules/layout/actionBar";
import { useChain } from "@/modules/moralis/chain";
import { NFTTQueryParms } from "@/interfaces/queries/NFTQueryParms";
import { useToggle } from "@/modules/layout/toggle";

export default defineComponent({
  setup() {
    const { toggleMovement } = useActionBar();

    const { activeChain } = useChain();
    const { getNFTQuery } = useNFTs();
    const { getMatchedBetQuery } = useBet();
    const { onUpdateFunction } = useSubscription();
    const { convertCurrency } = useCurrency();
    const nfts: Ref<NftOwnerModel[] | undefined> = ref();
    const subsriptions: Ref<Array<any>> = ref([]);
    const page = ref(1);
    const pageSize = ref(40);
    const bottomHit = ref(false);
    const infiniteScroll = ref(null);
    const triggerPulse = ref(false);

    const { isToggled: isMobileFilterOpen, toggle: toggleMobileFilter } = useToggle();

    const filters = reactive({
      categories: ["bet", "lp"],
      betSides: [],
      selections: [],
    });

    const sortOptions = [
      { name: "Recently Listed", href: "#", current: true },
      { name: "Recently Created", href: "#", current: false },
      { name: "Recently Sold", href: "#", current: false },
      { name: "Recently Received", href: "#", current: false },
      { name: "Price: Low to High", href: "#", current: false },
      { name: "Price: High to Low", href: "#", current: false },
      { name: "Highest Last Sale", href: "#", current: false },
    ];

    const queryParms: NFTTQueryParms = {
      limit: pageSize.value,
      sort: {
        key: "block_number",
        direction: "DESC",
      },

      inlcude: ["bet", "offer"],
    };

    const loadNfts = (mergingParms?: NFTTQueryParms, resetSubsriptions = false) => {
      const mergedParms = Object.assign(queryParms, mergingParms);
      const query = getNFTQuery(mergedParms);
      query.find().then((data: any) => {
        nfts.value = data as NftOwnerModel[];
      });

      if (resetSubsriptions) {
        subsriptions.value.forEach((subsription) => subsription.unsubscribe());
      }

      query.subscribe().then((subsription) => {
        subsription.on("update", onUpdate);
        subsriptions.value.push(subsription);
      });
    };

    // TODO implement handling filters
    const paginateNfts = () => {
      if (bottomHit.value) {
        return;
      }
      triggerPulse.value = true;

      const query = getNFTQuery(Object.assign(queryParms, { skip: pageSize.value * page.value }));
      page.value++;

      query.find().then((data: any) => {
        if (data && data?.length != 0) {
          nfts.value?.push(...(data as NftOwnerModel[]));
        } else {
          bottomHit.value = true;
        }
        triggerPulse.value = false;
      });
      query.subscribe().then((subsription) => {
        subsription.on("update", onUpdate);
        subsriptions.value.push(subsription);
      });
    };

    const onUpdate = async (object: any) => {
      onUpdateFunction(object, nfts.value, "id");
    };

    /**
     * Load NFT at mount and reload if filter changes
     */
    watchEffect(() => {
      let filter = false;
      let appendFilter = {} as any;

      if (filters.categories && filters.categories.length != 0) {
        appendFilter = {
          hasBet: false,
          hasLP: false,
          hasBetOrLP: false,
        };

        filters.categories.forEach((item: string) => {
          if (item === "lp") {
            appendFilter.hasLP = true;
          }
          if (item === "bet") {
            appendFilter.hasBet = true;
          }
        });

        if (appendFilter.hasLP && appendFilter.hasBet) {
          appendFilter.hasBetOrLP = true;
          appendFilter.hasLP = false;
          appendFilter.hasBet = false;
        }
      }

      const betQuery = getMatchedBetQuery({});
      if (filters.betSides && filters.betSides.length != 0) {
        betQuery.containedIn("betSide", filters.betSides);
        filter = true;
      }
      if (filters.selections && filters.selections.length != 0) {
        const selections = filters.selections.map((item) => Number(item));
        console.log(selections);

        betQuery.containedIn("selection", selections);
        filter = true;
      }

      console.log(filters);

      if (filter && !appendFilter.hasLP) {
        loadNfts({ filter: appendFilter, innerQuery: [{ relation: "bet", query: betQuery }] });
      } else {
        loadNfts({ filter: appendFilter, innerQuery: [] });
      }
    });

    /**
     * Mount infinte scroll to container
     */
    useInfiniteScroll(infiniteScroll, paginateNfts);

    /**
     * Unsubscribe to subsriptions when unmounted
     */
    onUnmounted(() => {
      subsriptions.value.forEach((subsription) => subsription.unsubscribe());
      toggleMovement();
    });
    toggleMovement();

    return { nfts, infiniteScroll, sortOptions, filters, isMobileFilterOpen, toggleMobileFilter, convertCurrency, activeChain };
  },
  components: {
    NftImage,
    MarketplaceFilter,
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
    ChevronDownIcon,
    FilterIcon,
    MinusSmIcon,
    PlusSmIcon,
    ViewGridIcon,
    XIcon,
  },
});
</script>
