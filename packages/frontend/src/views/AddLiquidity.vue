<template>
  <div class="p-4" v-if="isAuthenticated">
    <div class="grid grid-cols-2 gap-4">
      <div class="w-full rounded shadow-sm lg:max-w-screen-xl m-auto bg-gray-800 p-6" v-if="depositNfts">
        <h1 class="text-4xl font-semibold text-gray-50 mb-2 ml-6">My LP Token NFTs</h1>
        <div v-for="(nft, id) in depositNfts" :key="nft.attributes.tokenId" class="flex flex-col items-center justify-center w-full cursor-pointer group">
          <!-- Disabled for build  <NftImage :nft="nft"></NftImage> -->
          <div class="flex space-x-4 mb-6 text-sm font-medium">
            <div class="flex-auto flex space-x-4">
              <!-- Disabled for build
              <button
                @click="listOnMarketplace(nft, prices[id])"
                type="button"
                class="text-center justify-between inline-flex items-center px-4 py-2 font-medium text-gray-900 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
              >
                <span>List on Marketplace</span>
              </button> -->
              <input v-model="prices[id]" placeholder="Price" />
              <button
                @click="withdrawLP(nft)"
                type="button"
                class="text-center justify-between inline-flex items-center px-4 py-2 font-medium text-gray-900 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
              >
                <span>{{ getWithdrawLPText(nft) }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full rounded shadow-sm lg:max-w-screen-xl m-auto bg-gray-800 p-6">
        <h1 class="text-4xl font-semibold text-gray-50 mb-2 ml-6">Liquidity Pool</h1>
        <button
          @click="depositLiquidity(amount)"
          type="button"
          class="w-full text-center justify-between inline-flex items-center px-4 py-2 font-medium text-gray-900 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
        >
          <span>Add Liquidity</span>
        </button>
        <input v-model="amount" placeholder="Deposit Amount" />
        <span class="text-2xl font-medium text-gray-900 bg-gray-100">{{ getTotalLPDeposit() }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
// @ts-ignore
import { defineComponent, reactive, ref, watch } from "vue";
import { RefreshIcon } from "@heroicons/vue/solid";
import { useMoralis } from "../modules/moralis/moralis";
import { useRoute } from "vue-router";
import ListedNftImage from "../components/common/ListedNftImage.vue";
import NftImage from "../components/common/NftImage.vue";
import { useContract, useMarketMaker } from "../modules/moralis/contract";
import { useMarketplace } from "@/modules/moralis/marketplace";
import { useNFTs } from "../modules/moralis/nfts";
import { useCurrency } from "../modules/settings/currency";

export default defineComponent({
  async setup() {
    const ethereum = window.ethereum;

    const { listOnMarketplace } = useMarketplace();

    const route = useRoute();
    const { Moralis, moralisUser, web3 } = useMoralis();
    const activeMode = ref("");
    const nft_market_place_address = "0xDC81312829E51220e1882EE26f5976d432CC7a43";

    const marketMakerContractAddress = "0xE517DbcD2d9748562DbAB19e8979d35cE730bB29";
    const marketMakerAbi = useMarketMaker();
    const marketMakerContract = new web3.value.eth.Contract(marketMakerAbi.marketMakerAbi, marketMakerContractAddress);

    const cloudTest = await Moralis.Cloud.run("HelloWorld");
    console.log(cloudTest);

    var totalBalance = await marketMakerContract.methods.getTotalDeposit().call();
    console.log(totalBalance);

    const prices = ref([]);
    const amount = ref([]);

    const { isAuthenticated, nfts, depositNfts } = useMoralis();

    const depositLiquidity = async (price: any) => {
      console.log("Deposit Liquidity");
      console.log("entered amount = " + price);

      const { generateLPTokenURI } = useNFTs();

      var amount = web3.value.utils.toWei(price, "ether");
      var uri = await generateLPTokenURI(marketMakerContractAddress, amount);
      console.log("deposit with uri ", uri);

      marketMakerContract.methods
        .deposit(uri)
        .send({ from: moralisUser?.value?.get("ethAddress"), value: amount })
        .on("transactionHash", (hash: any) => {
          console.log("Deposit Completed. Hash = ", hash);
        })
        .catch((err: any) => {
          console.log("Deposit Failed: " + err.message);
        });
    };

    const withdrawLP = async (nft: any) => {
      console.log("Attempting to withdraw NFT : ", nft);
      marketMakerContract.methods
        .withdraw(nft.attributes.tokenId)
        .send({ from: moralisUser?.value?.get("ethAddress") })
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

    const getTotalLPDeposit = () => {
      return "Total LP Balance " + totalBalance + " MATIC";
    };

    return {
      activeMode,
      isAuthenticated,
      nfts,
      depositLiquidity,
      depositNfts,
      getTotalLPDeposit,
      listOnMarketplace,
      prices,
      amount,
      withdrawLP,
      getWithdrawLPText,
    };
  },
  components: { RefreshIcon, NftImage, ListedNftImage },
});
</script>
