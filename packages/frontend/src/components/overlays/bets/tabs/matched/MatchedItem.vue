<template>
  <div class="m-2 px-3 py-3 bg-gray-100 border border-gray-200 flex flex-col space-y-3 rounded-sm">
    <div class="flex flex-col space-y-1 text-gray-800" v-if="data.event">
      <span class="text-sm font-bold">{{ data.event.getName() }}</span>
      <span class="text-xs font-semibold text-gray-800" v-if="data.get('selection') == selections.HOME">{{ data.event.get("home").get("name") }}</span>
      <span class="text-xs font-semibold text-gray-800" v-if="data.get('selection') == selections.AWAY">{{ data.event.get("away").get("name") }}</span>
      <span class="text-xs font-semibold text-gray-800" v-if="data.get('selection') == selections.DRAW">Draw</span>
    </div>
    <div class="flex flex-row pt-1 w-full space-x-3 justify-between">
      <OddsInput disabled :modelValue="new BigNumber(decodeOdds(data.get('odds'))).toNumber()" :type="data.get('betSide') == 0 ? types.BACK : types.LAY" />
      <CurrencyInput
        disabled
        label="STAKE"
        :modelValue="new BigNumber(convertCurrency(data.get('amount'))).toNumber()"
        :type="data.get('betSide') == 0 ? types.BACK : types.LAY"
      />
      <CurrencyInput
        disabled
        v-if="types.BACK === (data.get('betSide') == 0 ? types.BACK : types.LAY)"
        :modelValue="new BigNumber(convertCurrency(data.get('amount'))).times(new BigNumber(decodeOdds(data.get('odds'))).minus(1)).toNumber()"
        label="PROFIT"
        :type="data.get('betSide') == 0 ? types.BACK : types.LAY"
      />
      <CurrencyInput
        disabled
        v-if="types.LAY === (data.get('betSide') == 0 ? types.BACK : types.LAY)"
        label="LIABILITY"
        :modelValue="new BigNumber(convertCurrency(data.get('amount'))).times(new BigNumber(decodeOdds(data.get('odds'))).minus(1)).toNumber()"
        :type="data.get('betSide') == 0 ? types.BACK : types.LAY"
      />
    </div>

    <div class="flex flex-row w-full space-x-3" v-if="data.get('confirmed')">
      <button
        v-if="data.get('mintStatus') == NftMintStatus.COMPLETED"
        @click="showNft(data)"
        class="inline-flex w-full justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-sm text-white bg-gray-500 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
      >
        Show NFT
      </button>
      <WaitingButton v-else-if="data.get('mintStatus') == NftMintStatus.PENDING || data.get('isMinted')" text="Waiting for confirmation" />
      <WaitingButton v-else-if="customMessage.show" :text="customMessage.message" />
      <button
        v-else
        @click="initMinting(data)"
        class="inline-flex w-full justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-sm text-white bg-gray-500 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
      >
        Mint
      </button>
    </div>

    <div class="relative">
      <Nft
        class="absolute bottom-[1000px]"
        :data="data"
        v-if="isMinting"
        @converted="mintIt"
        :color="data?.event?.get('home').get('primaryColor') || '#111827'"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import OddsInput from "../../../../inputs/OddsInput.vue";
import CurrencyInput from "../../../../inputs/CurrencyInput.vue";
import { useBetslip } from "../../../../../modules/moralis/betslip";
import { useCurrency } from "../../../../../modules/settings/currency";
import { BigNumber } from "bignumber.js";
import { useNFTs } from "../../../../../modules/moralis/nfts";
import { useWithdraw } from "../../../../../modules/moralis/withdraw";
import { useAlert } from "../../../../../modules/layout/alert";
import { useOdds } from "../../../../../modules/settings/odds";
import { MatchedBetModel } from "../../../../../interfaces/models/MatchedBetModel";
import WaitingButton from "../../../../buttons/WaitingButton.vue";
import Nft from "@/components/nfts/Nft.vue";

export default defineComponent({
  props: {
    data: { type: Object as () => MatchedBetModel, required: true },
  },
  setup(props) {
    const { selections, types } = useBetslip();
    const { toogleWithdraw } = useWithdraw();
    const { convertCurrency } = useCurrency();
    const { decodeOdds } = useOdds();
    const { NftMintStatus, mint } = useNFTs();
    const { showError, showSuccess } = useAlert();

    const customMessage = reactive({
      show: false,
      message: "",
    });
    const isMinting = ref(false);

    const initMinting = async (data: any) => {
      isMinting.value = true;
      customMessage.message = "Generating NFT";
      customMessage.show = true;
    };

    const mintIt = async (blob: Blob) => {
      await mint(props.data, blob, customMessage);
    };

    const showNft = async (matchedBet: MatchedBetModel) => {
      if (matchedBet.attributes.nft) {
        toogleWithdraw(matchedBet.attributes.nft);
      } else {
        showError("Hash not found, please try again later.");
      }
    };

    return {
      NftMintStatus,
      customMessage,
      showNft,
      mint,
      decodeOdds,
      convertCurrency,
      selections,
      types,
      BigNumber,
      initMinting,
      mintIt,
      isMinting,
    };
  },
  components: { OddsInput, CurrencyInput, WaitingButton, Nft },
});
</script>
