<template>
  <div class="p-4" v-if="isAuthenticated">
    <div class="grid grid-cols-2 gap-4">
      <div class="w-full rounded shadow-sm lg:max-w-screen-xl m-auto bg-gray-800 p-6" v-if="nfts">
        <h1 class="text-4xl font-semibold text-gray-50 mb-2 ml-6">My NFTs</h1>
        <div v-for="(nft, id) in nfts" :key="nft.attributes.token_id" class="flex flex-col items-center justify-center w-full cursor-pointer group">
          <NftImage :nft="nft" @callback="toogleWithdraw"></NftImage>
          <button
            @click="listOnMarketplace(nft, prices[id])"
            type="button"
            class="w-full text-center justify-between inline-flex items-center px-4 py-2 font-medium text-gray-900 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
          >
            <span>List on Marketplace</span>
          </button>
          <input v-model="prices[id]" placeholder="Price" />
        </div>
      </div>
      <div class="w-full rounded shadow-sm lg:max-w-screen-xl m-auto bg-gray-800 p-6" v-if="listedNfts">
        <h1 class="text-4xl font-semibold text-gray-50 mb-2 ml-6">NFTs Listed on Marketplace</h1>
        <div v-for="nft in listedNfts" :key="nft.attributes.tokenId" class="flex flex-col items-center justify-center w-full cursor-pointer group">
          <ListedNftImage :nft="nft" @callback="toogleWithdraw"></ListedNftImage>
          <button
            @click="buyNFT(nft)"
            type="button"
            class="w-full text-center justify-between inline-flex items-center px-4 py-2 font-medium text-gray-900 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
          >
            <span> {{ getBuyText(nft) }} </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch } from "vue";
import { RefreshIcon } from "@heroicons/vue/solid";
import { useCurrency } from "../modules/settings/currency";
import { useMoralis } from "../modules/moralis/moralis";
import { useRoute } from "vue-router";
import ListedNftImage from "../components/common/ListedNftImage.vue";
import NftImage from "../components/common/NftImage.vue";
import { useWithdraw } from "../modules/moralis/withdraw";

export default defineComponent({
  async setup() {
    const ethereum = window.ethereum;

    const route = useRoute();
    const { Moralis, moralisUser } = useMoralis();
    const { convertCurrency } = useCurrency();
    const activeMode = ref("");
    const nft_market_place_address = "0xDC81312829E51220e1882EE26f5976d432CC7a43";
    const web3 = await Moralis.Web3.enable();

    const prices = ref([]);

    const { isAuthenticated, nfts, listedNfts } = await useMoralis();
    const { toogleWithdraw } = useWithdraw();
    console.log("In Marketplace. NFT count = " + nfts?.value?.length);

    const listOnMarketplace = async (nft: any, price: any) => {
      console.log("ListOnMarketplace");
      console.log(nft);
      console.log("token addr = " + nft.attributes.token_address);
      console.log("entered price = " + price);

      // Need a text field to set price
      //const price = "0.001";
      const contract = nft.attributes.token_address;
      const tokenId = nft.attributes.token_id;

      const approval = await approveMarketPlace(contract, tokenId);
      console.log("approval tx = " + approval);

      const offering = await placeOffering(contract, tokenId, price);
      console.log(offering);
    };

    const getBuyText = (nft: any) => {
      const ethPrice = web3.utils.fromWei(nft.attributes.price);
      console.log("getBuyText");
      console.log(nft);
      console.log(ethPrice);
      return "Buy this NFT at " + ethPrice + " MATIC";
    };

    const approveMarketPlace = async (hostContract: any, tokenId: any) => {
      console.log("approveMarketPlace");

      const encodedFunction = web3.eth.abi.encodeFunctionCall(
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

    const buyNFT = async (nft: any) => {
      console.log("buyNFT");
      console.log(nft);
      if (nft.attributes.offerer != moralisUser?.value?.get("ethAddress")) {
        const priceHexString = BigInt(nft.attributes.price).toString(16);
        console.log("priceHexString = " + priceHexString);
        const closedOffering = await closeOffering(nft.attributes.offeringId, priceHexString);
        console.log("buy tx = " + closedOffering);
      }
      //return some of kind of an error, you can't buy your own nft
    };

    const closeOffering = async (offeringId: any, priceEncoded: any) => {
      const encodedFunction = web3.eth.abi.encodeFunctionCall(
        {
          name: "closeOffering",
          type: "function",
          inputs: [{ type: "bytes32", name: "_offeringId" }],
        },
        [offeringId]
      );

      const transactionParameters = {
        to: nft_market_place_address,
        from: moralisUser?.value?.get("ethAddress"),
        value: priceEncoded,
        data: encodedFunction,
      };
      const txt = await ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
      return txt;
    };

    return {
      activeMode,
      toogleWithdraw,
      isAuthenticated,
      nfts,
      listOnMarketplace,
      approveMarketPlace,
      placeOffering,
      listedNfts,
      buyNFT,
      closeOffering,
      getBuyText,
      prices,
    };
  },
  components: { RefreshIcon, NftImage, ListedNftImage },
});
</script>
