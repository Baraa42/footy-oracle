<template>
  <div class="lg:max-w-screen-xl w-full m-auto grid grid-cols-1 md:grid-cols-6 gap-x-8 gap-y-4" v-if="nft">
    <NftImage :nft="nft" class="md:col-span-2 aspect-auto" />
    <div class="md:col-span-4 flex flex-col space-y-4">
      <div class="flex justify-between items-center">
        <span class="text-2xl font-semibold">Bet #{{ nft.attributes.token_id }}</span>
        <div>
          <div v-if="userAddress == nft.attributes.owner_of && !nft.attributes.offer" class="flex flex-row space-x-4">
            <button
              @click="onSell()"
              class="px-8 py-2 shadow-sm rounded bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors hidden md:block"
            >
              Sell
            </button>
            <button
              @click="onWithdraw()"
              class="px-8 py-2 shadow-sm rounded bg-gray-700 text-white font-bold hover:bg-gray-800 transition-colors hidden md:block"
            >
              Withdraw
            </button>
          </div>
          <button
            @click="onBuy()"
            v-if="nft.attributes.offer && userAddress != nft.attributes.owner_of"
            class="px-8 py-2 shadow-sm rounded bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors hidden md:block"
          >
            Buy
          </button>
          <button
            @click="onClose()"
            v-if="nft.attributes.offer && nft.attributes.offer.attributes.confirmed && userAddress == nft.attributes.owner_of"
            class="px-8 py-2 shadow-sm rounded bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors hidden md:block"
          >
            Close
          </button>

          <WaitingButton
            class="shadow-sm rounded"
            v-if="
              (nft.attributes.offer && !nft.attributes.offer.attributes.confirmed && userAddress == nft.attributes.owner_of) ||
              (nft.attributes.closedOffer && !nft.attributes.closedOffer.attributes.confirmed)
            "
            text="Waiting for confirmation"
          />
        </div>
      </div>
      <div class="bg-gray-50 rounded shadow-sm w-full h-full p-3 flex flex-col justify-around" v-if="nft?.attributes.offer?.attributes.price">
        <span class="text-gray-500">Current Price</span>

        <div class="flex flex-row items-center space-x-2 mt-2">
          <Matic class="w-6 h-6 text-polygon" />
          <span class="text-2xl font-bold tracking-wider text-number">{{ convertCurrency(nft.attributes.offer.attributes.price) }}</span>
        </div>

        <button
          @click="onSell()"
          v-if="userAddress == nft.attributes.owner_of"
          class="px-8 py-2 mt-4 shadow-sm rounded bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors block md:hidden"
        >
          Sell
        </button>
        <button
          @click="onBuy()"
          v-else
          class="px-8 py-2 mt-4 shadow-sm rounded bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors block md:hidden"
        >
          Buy
        </button>
      </div>

      <div class="flex flex-col space-y-4 h-full">
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

    <teleport to="#app">
      <ConfirmationDialog
        :type="confirmDialog.type"
        :color="confirmDialog.color"
        :icon="confirmDialog.icon"
        :title="confirmDialog.title"
        :description="confirmDialog.description"
        :buttonText="confirmDialog.buttonText"
        :isOpen="confirmDialog.isToggled"
        @onConfirm="confirmDialog.onConfirm"
        @onClose="confirmDialog.toggle()"
      >
        <div v-if="confirmDialog.action == 'sell'" class="mt-4">
          <label for="price" class="block text-sm font-medium text-gray-700">Price</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <input
              v-model="sellPrice"
              type="number"
              name="price"
              id="price"
              class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
            />
            <div class="absolute inset-y-0 right-3 flex items-center">
              <Matic class="w-4 h-4 text-polygon" />
            </div>
          </div>
        </div>
      </ConfirmationDialog>
    </teleport>
  </div>
</template>

<script lang="ts">
import { NftOwnerModel } from "@/interfaces/models/NftOwnerModel";
import { useNFTs } from "@/modules/moralis/nfts";
import { Moralis as MoralisTypes } from "moralis/types";
import { useSubscription } from "@/modules/moralis/subscription";
import { defineComponent, onUnmounted, reactive, ref, watchEffect } from "vue";
import { useRoute } from "vue-router";
import NftImage from "@/components/common/NftImage.vue";
import { useTimezone } from "@/modules/settings/timezone";
import { useOdds } from "@/modules/settings/odds";
import { useCurrency } from "@/modules/settings/currency";
import { useBet } from "@/modules/moralis/bets";
import { useMarketplace } from "@/modules/moralis/marketplace";
import Matic from "@/assets/svg/matic.svg";
import { useMoralis } from "@/modules/moralis/moralis";
import { useConfirmDialog } from "@/modules/layout/confirmDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog.vue";
import { CashIcon, XIcon, CheckIcon } from "@heroicons/vue/outline";
import WaitingButton from "@/components/buttons/WaitingButton.vue";
import { useWithdraw } from "@/modules/moralis/withdraw";
import { useAlert } from "@/modules/layout/alert";

export default defineComponent({
  setup() {
    const { userAddress } = useMoralis();
    const route = useRoute();
    const { calculatePotentialProfit } = useBet();
    const { getDateTime } = useTimezone();
    const { decodeOdds } = useOdds();
    const { convertCurrency } = useCurrency();

    const { getNFTQuery } = useNFTs();
    const { subscribe, unsubscribe } = useSubscription();
    const nft = ref<NftOwnerModel>();

    const sellPrice = ref();

    const confirmDialog = useConfirmDialog();

    const onSell = () => {
      confirmDialog.action = "sell";
      confirmDialog.title = "List this NFT for sale";
      confirmDialog.description = "You will not be able to withdraw any profits from this NFT as long as its for sale.";
      confirmDialog.icon = CashIcon;
      confirmDialog.color = "indigo";
      confirmDialog.buttonText = "Confirm";
      confirmDialog.onConfirm = async () => {
        if (nft.value) {
          const { listOnMarketplace } = useMarketplace();
          const isListed = await listOnMarketplace(nft.value, String(sellPrice.value));
          confirmDialog.toggle();
        }
      };
      confirmDialog.toggle();
    };

    const onClose = () => {
      confirmDialog.action = "close";
      confirmDialog.title = "Are you sure you want to close your NFT listing?";
      confirmDialog.description = "";
      confirmDialog.icon = XIcon;
      confirmDialog.color = "red";
      confirmDialog.buttonText = "Confirm";
      confirmDialog.onConfirm = async () => {
        confirmDialog.toggle();
      };
      confirmDialog.toggle();
    };

    const onBuy = () => {
      confirmDialog.action = "buy";
      confirmDialog.title = `Are you sure you want to buy this NFT for ${convertCurrency(nft.value?.attributes.offer?.attributes.price || "")} Matic?`;
      confirmDialog.description = "";
      confirmDialog.icon = CheckIcon;
      confirmDialog.color = "green";
      confirmDialog.buttonText = "Confirm";
      confirmDialog.onConfirm = async () => {
        if (nft.value) {
          const { buyNFT } = useMarketplace();
          const isBought = await buyNFT(nft.value);
          confirmDialog.toggle();
        }
      };
      confirmDialog.toggle();
    };

    const onWithdraw = () => {
      confirmDialog.action = "withdraw";
      // game is over
      if (nft.value?.attributes.bet?.attributes.event?.attributes.isCompleted) {
        confirmDialog.icon = CashIcon;
        confirmDialog.color = "indigo";
        confirmDialog.buttonText = "Confirm";
        confirmDialog.description = "";
        confirmDialog.title = `Are you sure you want to withdraw the profits of this NFT?`;

        confirmDialog.onConfirm = async () => {
          if (nft.value) {
            const { withdraw } = useWithdraw();
            const withdrawing = await withdraw(nft.value);
            confirmDialog.toggle();
          }
        };
      } else {
        confirmDialog.icon = XIcon;
        confirmDialog.color = "red";
        confirmDialog.buttonText = "Close";
        confirmDialog.description = "";
        confirmDialog.title = `You need to wait until the game is over.`;
        confirmDialog.onConfirm = async () => {
          confirmDialog.toggle();
        };
      }

      confirmDialog.toggle();
    };

    watchEffect(() => {
      const tokenId = route.params.tokenId;

      const query = getNFTQuery({
        filter: {
          tokenId: Array.isArray(tokenId) ? tokenId[0] : tokenId,
        },
        inlcude: ["bet", "bet.event.home", "bet.event.away", "bet.event.league", "offer", "closedOffer"],
      });

      query.first().then((data: any) => {
        nft.value = data as NftOwnerModel;
      });

      subscribe(query).then((subscription: MoralisTypes.LiveQuerySubscription) => {
        subscription.on("update", (object: MoralisTypes.Object<MoralisTypes.Attributes>) => {
          console.log("update nft");
          console.log(object);
          nft.value = object as NftOwnerModel;
        });
      });
    });

    onUnmounted(() => {
      unsubscribe();
    });

    return {
      nft,
      getDateTime,
      decodeOdds,
      convertCurrency,
      calculatePotentialProfit,
      userAddress,
      confirmDialog,
      onSell,
      onClose,
      onWithdraw,
      onBuy,
      sellPrice,
    };
  },
  components: { NftImage, Matic, ConfirmationDialog, WaitingButton },
});
</script>
