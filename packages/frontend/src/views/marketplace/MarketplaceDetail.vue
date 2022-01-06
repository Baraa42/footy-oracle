<template>
  <div class="lg:max-w-screen-xl w-full m-auto grid grid-cols-1 md:grid-cols-6 gap-x-8 gap-y-4" v-if="nft">
    <NftImage :nft="nft" class="md:col-span-2 aspect-auto" />
    <div class="md:col-span-4 flex flex-col space-y-4">
      <div class="flex justify-between items-center">
        <span class="text-2xl font-semibold">Bet #{{ nft.attributes.token_id }}</span>
        <button class="px-8 py-2 shadow-sm rounded bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors hidden md:block">Buy</button>
      </div>

      <div class="bg-gray-50 rounded shadow-sm w-full h-full p-3 flex flex-col justify-around">
        <span class="text-gray-500">Current Price</span>

        <div class="flex flex-row items-center space-x-1">
          <Matic class="w-6 h-6 text-polygon" />
          <span class="text-2xl font-bold tracking-wider text-number">1.00</span>
        </div>
        <button class="px-8 py-2 mt-4 shadow-sm rounded bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors block md:hidden">Buy</button>
      </div>

      <div class="flex flex-col space-y-4 h-full justify-end order-4">
        <div class="bg-gray-50 rounded shadow-sm w-full">
          <div class="p-3">
            <span class="font-semibold text-gray-700">Match Details</span>
          </div>
          <div class="p-3 flex flex-col space-y-2">
            <div class="flex flex-row justify-between">
              <span>Match</span>
              <router-link
                v-if="nft.attributes.bet?.attributes.event"
                class="text-indigo-500 font-semibold hover:text-indigo-900"
                :to="nft.attributes.bet.attributes.event.getDetailLink()"
                >{{ nft.attributes.bet.attributes.event.getName() }}</router-link
              >
            </div>
            <div class="flex flex-row justify-between">
              <span>Start</span>
              <span v-if="nft.attributes.bet?.attributes.event">{{ getDateTime(nft.attributes.bet.attributes.event?.attributes.start || 0) }}</span>
            </div>
            <div class="flex flex-row justify-between">
              <span>League</span>
              <span v-if="nft.attributes.bet?.attributes.event?.attributes.league"
                >{{ nft.attributes.bet.attributes.event.attributes.league.attributes.name }}
              </span>
            </div>
            <div class="flex flex-row justify-between">
              <span>Season</span>
              <span v-if="nft.attributes.bet?.attributes.event?.attributes.league">
                {{ nft.attributes.bet.attributes.event.attributes.league.attributes.season }}</span
              >
            </div>
          </div>
        </div>

        <div class="col-span-2 bg-gray-50 rounded shadow-sm w-full">
          <div class="p-3">
            <span class="font-semibold text-gray-700">Bet Details</span>
          </div>
          <div class="p-3 flex flex-col space-y-2">
            <div class="flex flex-row justify-between">
              <span>Market</span>
              <span>Match Winner</span>
            </div>
            <div class="flex flex-row justify-between">
              <span>Side</span>
              <span>{{ nft.attributes.bet?.attributes.betSide == 1 ? "Back" : "Lay" }} </span>
            </div>
            <div class="flex flex-row justify-between">
              <span>Selection</span>
              <span v-if="nft.attributes.bet?.attributes.selection == 1">{{ nft.attributes.bet?.attributes.event?.attributes.home.attributes.name }}</span>
              <span v-if="nft.attributes.bet?.attributes.selection == 2">{{ nft.attributes.bet?.attributes.event?.attributes.away.attributes.name }}</span>
              <span v-if="nft.attributes.bet?.attributes.selection == 3">Draw</span>
            </div>
            <div class="flex flex-row justify-between">
              <span>Odds</span>
              <span> {{ decodeOdds(nft.attributes.bet?.attributes.odds || "") }}</span>
            </div>
            <div class="flex flex-row justify-between">
              <span>Amount</span>
              <span> {{ convertCurrency(nft.attributes.bet?.attributes.amount || "") }} Matic</span>
            </div>
            <div class="flex flex-row justify-between">
              <span>Potential Profit</span>
              <span v-if="nft.attributes.bet"> {{ calculatePotentialProfit(nft.attributes.bet) }} Matic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { NftOwnerModel } from "@/interfaces/models/NftOwnerModel";
import { useNFTs } from "@/modules/moralis/nfts";
import { Moralis as MoralisTypes } from "moralis/types";
import { useSubscription } from "@/modules/moralis/subscription";
import { defineComponent, onUnmounted, ref, watchEffect } from "vue";
import { useRoute } from "vue-router";
import NftImage from "@/components/common/NftImage.vue";
import { useTimezone } from "@/modules/settings/timezone";
import { useOdds } from "@/modules/settings/odds";
import { useCurrency } from "@/modules/settings/currency";
import { useBet } from "@/modules/moralis/bets";
import Matic from "@/assets/svg/matic.svg";

export default defineComponent({
  setup() {
    const route = useRoute();

    const { calculatePotentialProfit } = useBet();
    const { getDateTime } = useTimezone();
    const { decodeOdds } = useOdds();
    const { convertCurrency } = useCurrency();

    const { getNFTQuery } = useNFTs();
    const { subscribe, unsubscribe } = useSubscription();
    const nft = ref<NftOwnerModel>();

    watchEffect(() => {
      const tokenId = route.params.tokenId;

      const query = getNFTQuery({
        filter: {
          tokenId: Array.isArray(tokenId) ? tokenId[0] : tokenId,
        },
        inlcude: ["bet", "bet.event.home", "bet.event.away", "bet.event.league", "offer"],
      });

      query.first().then((data: any) => {
        nft.value = data as NftOwnerModel;
      });

      subscribe(query).then((subscription: MoralisTypes.LiveQuerySubscription) => {
        subscription.on("update", (object: MoralisTypes.Object<MoralisTypes.Attributes>) => (nft.value = object as NftOwnerModel));
      });
    });

    onUnmounted(() => {
      unsubscribe();
    });

    return { nft, getDateTime, decodeOdds, convertCurrency, calculatePotentialProfit };
  },
  components: { NftImage, Matic },
});
</script>
