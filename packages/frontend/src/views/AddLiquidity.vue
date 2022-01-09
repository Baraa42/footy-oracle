<template>
  <div class="p-4" v-if="isAuthenticated">
    <div class="grid grid-cols-2 gap-4">
      <div class="w-full rounded shadow-sm lg:max-w-screen-xl m-auto bg-gray-800 p-6" v-if="depositNfts">
        <h1 class="text-4xl font-semibold text-gray-50 mb-2 ml-6">My LP Token NFTs</h1>
        <div v-for="(nft, id) in depositNfts" :key="nft.attributes.tokenId" class="flex flex-col items-center justify-center w-full cursor-pointer group">
          <!-- <NftImage :nft="nft"></NftImage> NftOwnerModel not compatible with MumbaiDepositLPModel -->

          <!--  @click="listOnMarketplace(nft, prices[id])" MumbaiDepositLPModel not compatible with NftOwnerModel-->
          <button
            type="button"
            class="w-full text-center justify-between inline-flex items-center px-4 py-2 font-medium text-gray-900 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
          >
            <span>List on Marketplace</span>
          </button>
          <input v-model="prices[id]" placeholder="Price" />
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
import { defineComponent, reactive, ref, watch } from "vue";
import { RefreshIcon } from "@heroicons/vue/solid";
import { useMoralis } from "../modules/moralis/moralis";
import { useRoute } from "vue-router";
import ListedNftImage from "../components/common/ListedNftImage.vue";
import NftImage from "../components/common/NftImage.vue";
import { useContract, useMarketMaker } from "../modules/moralis/contract";
import { useMarketplace } from "@/modules/moralis/marketplace";

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
    var totalBalance = await marketMakerContract.methods.getTotalDeposit().call();
    console.log(totalBalance);

    const cloudTest = await Moralis.Cloud.run("HelloWorld");
    console.log(cloudTest);

    const prices = ref([]);
    const amount = ref([]);

    const { isAuthenticated, nfts, depositNfts } = useMoralis();

    const depositLiquidity = async (price: any) => {
      console.log("Deposit Liquidity");
      console.log("entered amount = " + price);

      /*
      console.log('marketMakerAbi')
      console.log(marketMakerAbi.marketMakerAbi);
      */

      var amount = web3.value.utils.toWei(price, "ether");

      marketMakerContract.methods
        .deposit("uri3")
        .send({ from: moralisUser?.value?.get("ethAddress"), value: amount })
        .on("transactionHash", (hash: any) => {
          console.log("Deposit Completed. Hash = ", hash);
        })
        .catch((err: any) => {
          console.log("Failed: " + err.message);
        });
    };

    const getTotalLPDeposit = () => {
      return "Total LP Balance " + totalBalance + " MATIC";
    };

    const approveMarketPlace = async (hostContract: any, tokenId: any) => {
      console.log("approveMarketPlace");

      const encodedFunction = web3.value.eth.abi.encodeFunctionCall(
        {
          name: "approve",
          type: "function",
          inputs: [
            { type: "address", name: "to" },
            { type: "uint256", name: "tokenURI" },
          ],
        },
        [nft_market_place_address, tokenId]
      );

      const transactionParameters = {
        to: hostContract,
        from: moralisUser?.value?.get("ethAddress"),
        data: encodedFunction,
      };
      console.log(transactionParameters);
      console.log(encodedFunction);
      const txt = await ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
      return txt;
    };

    const placeOffering = async (_hostContract: any, _tokenId: any, _price: any) => {
      const params = { hostContract: _hostContract, offerer: moralisUser?.value?.get("ethAddress"), tokenId: _tokenId, price: _price };
      console.log(params);
      console.log("Calling cloud function placeOffering");
      const result = await Moralis.Cloud.run("placeOffering", params);
      return result;
    };

    return {
      activeMode,
      isAuthenticated,
      nfts,
      depositLiquidity,
      approveMarketPlace,
      placeOffering,
      depositNfts,
      getTotalLPDeposit,
      listOnMarketplace,
      prices,
      amount,
    };
  },
  components: { RefreshIcon, NftImage, ListedNftImage },
});
</script>
