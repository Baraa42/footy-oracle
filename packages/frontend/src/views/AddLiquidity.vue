<template>
  <div class="flex flex-col space-y-8">
    <CardContainer>
      <div class="bg-gray-800 rounded pb-4 transition-all">
        <div class="flex flex-col items-star justify-between w-full h-full text-white">
          <div class="flex flex-row justify-between items-center px-5 py-5">
            <h2 class="font-semibold text-2xl capitalize">Liquidity Pool ({{ activeChain.currencyName }})</h2>
            <button><QuestionMarkCircleIcon class="w-8 h-8 text-gray-500 hover:text-white transition-all" /></button>
          </div>

          <div class="p-5 flex flex-col md:flex-row justify-between md:space-x-5 md:space-y-0">
            <div class="flex md:flex-col w-full md:w-8/12">
              <div class="flex flex-col h-full space-y-8 md:space-y-0 justify-between w-full">
                <div class="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mb-4">
                  <div class="bg-gray-700 rounded-xl p-4 flex flex-col w-full md:w-1/3">
                    <span class="text-gray-200 mb-3 text-lg font-semibold">Total Deposits:</span>
                    <span class="text-sm font-semibold text-number" v-if="totalDeposits"
                      >{{ round(Number(convertCurrency(totalDeposits)), 8) }} {{ activeChain.currencySymbol }}</span
                    >
                  </div>
                  <div class="bg-gray-700 rounded-xl p-4 flex flex-col w-full md:w-1/3">
                    <span class="text-gray-200 mb-3 text-lg font-semibold">Your Position:</span>
                    <span class="text-sm font-semibold text-number" v-if="isAuthenticated && lpDeposits"
                      >{{ round(Number(convertCurrency(lpDeposits)), 8) }} {{ activeChain.currencySymbol }}</span
                    >
                  </div>
                  <div class="bg-gray-700 rounded-xl p-4 flex flex-col w-full md:w-1/3">
                    <span class="text-gray-200 mb-3 text-lg font-semibold">Earned:</span>
                    <span class="text-sm font-semibold text-number" v-if="totalDeposits">0 {{ activeChain.currencySymbol }}</span>
                  </div>
                </div>

                <div class="flex flex-col space-y-4">
                  <SwapItemVue mode="input" label="Provide" :disableSelect="true" v-model="liquidityModel" />

                  <button
                    @click="onDeposit()"
                    class="w-full shadow-md shadow-indigo-800/30 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-xl text-xl font-bold py-4 text-gray-100 focus:outline-none transition-all hover:bg-gradient-to-t border-2 border-indigo-500 focus:ring-2 focus:ring-indigo-500 ring-offset-4 ring-offset-gray-800"
                  >
                    Provide Liquidity
                  </button>
                </div>
              </div>
            </div>

            <div class="w-full md:w-4/12 xl:w-3/12 bg-gray-700 rounded-xl aspect-[2.5/3.6] mt-8 md:mt-8">
              <div class="p-4 space-y-4 h-full">
                <span class="text-sm text-gray-200 font-semibold">Receive</span>
                <img v-if="nftBase64" :src="nftBase64" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContainer>

    <MarketMakerHistory v-if="marketMakerContractAddress" />

    <div class="opacity-0 absolute top-0 -z-10">
      <LpNFT v-if="liquidityModel.value && !isNaN(Number(liquidityModel.value))" :amount="liquidityModel.value" @converted="onConverted" color="#111827" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, Ref, ref, watchEffect } from "vue";
import { QuestionMarkCircleIcon } from "@heroicons/vue/solid";
import { RefreshIcon } from "@heroicons/vue/solid";
import { useMoralis } from "../modules/moralis/moralis";
import ListedNftImage from "../components/common/ListedNftImage.vue";
import NftImage from "../components/common/NftImage.vue";
import CardContainer from "@/components/common/CardContainer.vue";
import { useChain } from "@/modules/moralis/chain";
import SwapItemVue from "@/components/dex/SwapItem.vue";
import { SwapItem } from "../interfaces/SwapItem";
import { TokenPrice } from "@/interfaces/web3/TokenPrice";
import LpNFT from "@/components/nfts/LpNFT.vue";
import { useDownload } from "@/modules/download";
import { useCurrency } from "@/modules/settings/currency";
import { useMath } from "@/modules/math";
import { useMarketMaker } from "@/modules/moralis/marketMaker";
import { useAlert } from "@/modules/layout/alert";
import MarketMakerHistory from "@/components/lists/MarketMakerHistory.vue";
import { useContract } from "@/modules/moralis/contract";
export default defineComponent({
  setup() {
    const { showError } = useAlert();
    const { getTotalDeposits, depositLiquidity } = useMarketMaker();
    const { marketMakerContractAddress } = useContract();

    const liquidityModel: SwapItem = reactive({
      token: undefined,
      value: undefined,
      price: undefined,
    });

    /**
     * Get total deposits, reactive if web3 changes
     */
    const { isAuthenticated, isWeb3Enabled, lpDeposits } = useMoralis();
    const totalDeposits = <Ref<string>>ref();
    watchEffect(() => {
      if (isWeb3Enabled.value) {
        getTotalDeposits().then((value) => {
          if (value) {
            totalDeposits.value = value;
          }
        });
      }
    });

    /**
     * Provide liquidity
     */
    const onDeposit = async () => {
      if (isAuthenticated.value) {
        if (liquidityModel.value && nftBase64.value) {
          await depositLiquidity(liquidityModel.value, nftBase64.value);
        }
      } else {
        showError("You need to connect your wallet");
      }
    };

    /**
     * Converts component to image
     */
    const nftBase64 = <Ref<string>>ref();
    const { blobToB64 } = useDownload();
    const onConverted = async (blob: Blob) => {
      nftBase64.value = (await blobToB64(blob)) as string;
    };

    /**
     * Loads native token and price
     */
    const { activeChain, getDex } = useChain();
    const { getSupportedTokens, tokens, getTokenPrice } = getDex();
    getSupportedTokens().then(() => {
      if (!liquidityModel.token) {
        liquidityModel.token = tokens.value?.find((item) => item.symbol === activeChain.value.currencySymbol);
      }
      if (!liquidityModel.price && liquidityModel.token) {
        getTokenPrice(liquidityModel.token.address).then((price: TokenPrice | undefined) => (liquidityModel.price = price));
      }
    });

    /**
     * Helpers
     */
    const { convertCurrency } = useCurrency();
    const { round } = useMath();

    return {
      liquidityModel,
      totalDeposits,
      isAuthenticated,
      lpDeposits,
      onDeposit,
      nftBase64,
      activeChain,
      round,
      onConverted,
      convertCurrency,
      marketMakerContractAddress,
    };
  },
  components: { RefreshIcon, NftImage, ListedNftImage, CardContainer, SwapItemVue, LpNFT, QuestionMarkCircleIcon, MarketMakerHistory },
});
</script>
