<template>
  <MarketplaceFilter>
    <div v-if="nfts" class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4 xl:gap-8 w-full col-span-5" ref="infiniteScroll">
      <div v-for="nft in nfts" :key="nft.id" class="p-4 bg-white rounded shadow-sm relative group cursor-pointer hover:shadow-md transition-all">
        <NftImage :nft="nft" class="flex group-hover:-translate-y-1" />
        <div class="flex justify-between items-center flex-row h-8 mt-3">
          <div class="flex font-semibold text-sm">Bet #{{ nft.attributes.token_id }}</div>
          <div class="flex flex-row items-center space-x-1">
            <span class="font-bold text-sm">1</span>
            <div class="bg-indigo-500 rounded-full w-5 h-5 flex items-center justify-center"><Matic class="w-3 h-3 text-white" /></div>
          </div>
        </div>
      </div>
    </div>
  </MarketplaceFilter>
</template>

<script lang="ts">
import NftImage from "@/components/common/NftImage.vue";
import { NftOwnerModel } from "@/interfaces/models/NftOwnerModel";
import { QueryParms } from "@/interfaces/QueryParms";
import { useInfiniteScroll } from "@/modules/layout/infiniteScroll";
import { useNFTs } from "@/modules/moralis/nfts";
import Matic from "@/assets/svg/matic.svg";
import { useSubscription } from "@/modules/moralis/subscription";
import { defineComponent, onUnmounted, Ref, ref } from "vue";
import MarketplaceFilter from "@/components/marketplace/MarketplaceFilter.vue";

export default defineComponent({
  setup() {
    const { getNFTQuery } = useNFTs();
    const { onUpdateFunction } = useSubscription();
    const nfts: Ref<NftOwnerModel[] | undefined> = ref();
    const subsriptions: Ref<Array<any>> = ref([]);
    const page = ref(1);
    const pageSize = ref(40);
    const bottomHit = ref(false);
    const infiniteScroll = ref(null);
    const triggerPulse = ref(false);

    /**
     * On subsription update
     */
    const onUpdate = async (object: any) => {
      onUpdateFunction(object, nfts.value, "id");
    };

    const queryParms: QueryParms = {
      limit: pageSize.value,
      sort: {
        key: "block_number",
        direction: "DESC",
      },
    };
    const query = getNFTQuery(queryParms);
    query.find().then((data: any) => {
      nfts.value = data as NftOwnerModel[];
    });
    query.subscribe().then((subsription) => {
      subsription.on("update", onUpdate);
      subsriptions.value.push(subsription);
    });

    /**
     * Load more events callback function
     */
    const loadMoreEvents = () => {
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

    /**
     * Mount infinte scroll to container
     */
    useInfiniteScroll(infiniteScroll, loadMoreEvents);

    /**
     * Unsubscribe to subsriptions when unmounted
     */
    onUnmounted(() => {
      subsriptions.value.forEach((subsription) => subsription.unsubscribe());
    });

    return { nfts, infiniteScroll, triggerPulse, pageSize };
  },
  components: { NftImage, Matic, MarketplaceFilter },
});
</script>
