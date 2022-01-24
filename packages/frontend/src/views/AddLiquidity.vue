<template>
  <div>
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
                    <span class="text-sm font-semibold text-number" v-if="totalDeposits">0 {{ activeChain.currencySymbol }}</span>
                  </div>
                  <div class="bg-gray-700 rounded-xl p-4 flex flex-col w-full md:w-1/3">
                    <span class="text-gray-200 mb-3 text-lg font-semibold">Earnd:</span>
                    <span class="text-sm font-semibold text-number" v-if="totalDeposits">0 {{ activeChain.currencySymbol }}</span>
                  </div>
                </div>

                <div class="flex w-max bg-gray-700 rounded-xl hidden">
                  <button
                    @click="setDeposit()"
                    :class="{ 'bg-indigo-700 font-semibold': isDeposit, 'hover:bg-indigo-00': !isDeposit }"
                    class="w-32 py-2 rounded-l-xl transition-colors"
                  >
                    Deposit
                  </button>
                  <button
                    @click="setWithdraw()"
                    :class="{ 'bg-indigo-700 font-semibold': !isDeposit, 'hover:bg-indigo-800': isDeposit }"
                    class="w-32 py-2 rounded-r-xl transition-colors"
                  >
                    Withdraw
                  </button>
                </div>

                <div class="flex flex-col space-y-4">
                  <SwapItemVue mode="input" label="Provide" :disableSelect="true" v-model="liqidityModel" />

                  <button
                    @click="depositLiquidity()"
                    class="w-full shadow-md shadow-indigo-800/30 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-xl text-xl font-bold py-4 text-gray-100 focus:outline-none transition-all hover:bg-gradient-to-t border-2 border-indigo-500 focus:ring-2 focus:ring-indigo-500 ring-offset-4 ring-offset-gray-800"
                  >
                    Provide Liquidity
                  </button>
                </div>
              </div>
            </div>

            <div class="w-full md:w-4/12 xl:w-3/12 bg-gray-700 rounded-xl aspect-[2.5/3.6] mt-8 md:mt-8">
              <div class="p-4 space-y-4 h-full">
                <span class="text-sm text-gray-200 font-semibold">Recive</span>
                <img v-if="nftBase64" :src="nftBase64" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContainer>

    <div class="opacity-0 absolute top-0 -z-10">
      <LpNFT v-if="liqidityModel.value" :amount="liqidityModel.value" @converted="onConverted" color="#111827" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, Ref, ref } from "vue";
import { QuestionMarkCircleIcon } from "@heroicons/vue/solid";
import { RefreshIcon } from "@heroicons/vue/solid";
import { useMoralis } from "../modules/moralis/moralis";
import ListedNftImage from "../components/common/ListedNftImage.vue";
import NftImage from "../components/common/NftImage.vue";
import { useMarketMaker } from "../modules/moralis/contract";
import { useNFTs } from "../modules/moralis/nfts";
import { Contract } from "web3-eth-contract";
import CardContainer from "@/components/common/CardContainer.vue";
import { useChain } from "@/modules/moralis/chain";
import SwapItemVue from "@/components/dex/SwapItem.vue";
import { SwapItem } from "../interfaces/SwapItem";
import { TokenPrice } from "@/interfaces/web3/TokenPrice";
import LpNFT from "@/components/nfts/LpNFT.vue";
import { useDownload } from "@/modules/download";
import { useCurrency } from "@/modules/settings/currency";
import { useMath } from "@/modules/math";
import { useIPFS } from "@/modules/moralis/ipfs";
import { useAlert } from "@/modules/layout/alert";
import { useToggle } from "@/modules/layout/toggle";
export default defineComponent({
  setup() {
    const { userAddress, web3, enableWeb3, isAuthenticated, nfts, depositNfts } = useMoralis();
    const { activeChain, getDex } = useChain();
    const { convertCurrency } = useCurrency();
    const { round } = useMath();
    const { showError, showSuccess } = useAlert();

    const { isToggled: isDeposit, open: setDeposit, close: setWithdraw } = useToggle(true);

    const { marketMakerAbi, getMarketMakerContractAddress } = useMarketMaker();

    const marketMakerContract = <Ref<Contract>>ref();
    const marketMakerContractAddress = <Ref<string>>ref();
    const totalDeposits = <Ref<string>>ref();

    const { getSupportedTokens, tokens, getTokenPrice } = getDex();
    const liqidityModel: SwapItem = reactive({
      token: undefined,
      value: undefined,
      price: undefined,
    });

    getSupportedTokens().then(() => {
      if (!liqidityModel.token) {
        liqidityModel.token = tokens.value?.find((item) => item.symbol === activeChain.value.currencySymbol);
      }
      if (!liqidityModel.price && liqidityModel.token) {
        getTokenPrice(liqidityModel.token.address).then((price: TokenPrice | undefined) => (liqidityModel.price = price));
      }
    });

    const nftBase64 = <Ref<string>>ref();
    const onConverted = async (blob: Blob) => {
      const { blobToB64 } = useDownload();
      nftBase64.value = (await blobToB64(blob)) as string;
    };

    const getTotalDeposits = async () => {
      const isEnabled = await enableWeb3();
      if (isEnabled) {
        try {
          marketMakerContractAddress.value = await getMarketMakerContractAddress();
          marketMakerContract.value = new web3.value.eth.Contract(marketMakerAbi, marketMakerContractAddress.value);

          totalDeposits.value = await marketMakerContract.value.methods.getTotalDeposit().call();
        } catch (err: any) {
          console.log(err);
        }
      }
    };
    getTotalDeposits();

    const depositLiquidity = async () => {
      if (liqidityModel.value && userAddress.value) {
        const { generateLPTokenURI } = useNFTs();
        const { saveBase64ImageToIPFS } = useIPFS();

        const image = await saveBase64ImageToIPFS(userAddress.value, nftBase64.value);
        const amount = web3.value.utils.toWei(liqidityModel.value, "ether");
        const uri = await generateLPTokenURI(marketMakerContractAddress.value, amount.toString(), image.ipfs());

        marketMakerContract.value.methods
          .deposit(uri)
          .send({ from: userAddress.value, value: amount })
          .on("transactionHash", (hash: any) => {
            showSuccess("Deposit completed, your NFT will be sended");
          })
          .catch((err: any) => {
            showError();
            console.log(err);
          });
      }
    };

    const withdrawLP = async (nft: any) => {
      console.log("Attempting to withdraw NFT : ", nft);
      marketMakerContract.value.methods
        .withdraw(nft.attributes.tokenId)
        .send({ from: userAddress.value })
        .on("transactionHash", (hash: any) => {
          console.log("Withdraw Completed. Hash = ", hash);
        })
        .catch((err: any) => {
          console.log("Withdraw Failed: " + err.message);
        });
    };

    const getWithdrawLPText = (nft: any) => {
      const depositAmount = web3.value.utils.fromWei(nft.attributes.depositAmount);
      console.log("getBuyText");
      console.log(nft);
      console.log(depositAmount);
      return "Withdraw LP Deposit of " + depositAmount + " MATIC";
    };

    return {
      liqidityModel,
      totalDeposits,
      isAuthenticated,
      nftBase64,
      activeChain,
      round,
      depositLiquidity,
      depositNfts,
      onConverted,
      convertCurrency,
      isDeposit,
      setDeposit,
      setWithdraw,
    };
  },
  components: { RefreshIcon, NftImage, ListedNftImage, CardContainer, SwapItemVue, LpNFT, QuestionMarkCircleIcon },
});
</script>
