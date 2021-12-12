<template>
  <div v-if="nft && nft.event" class="w-full h-full">
    <div
      id="nonPrintable"
      ref="printMe"
      class="z-0 relative h-[400px] w-[256px] rounded p-2 overflow-hidden transition-transform mix-blend-soft-ligh"
      :style="{
        'background-color': color,
        'border-color': border == 'color' ? palette[800] : undefined,
        'border-image': border == 'gradient' ? getGradient(palette[700], palette[900], 'left top') + 1 : undefined,
        'border-width': borderThickness + 'px',
      }"
    >
      <!-- Background Layers -->

      <NFTBackgroundLayerVue v-for="backgroundLayer in backgroundLayers" :data="backgroundLayer" :key="backgroundLayer.id" />

      <!-- 
      <div
        class="transform top-0 left-[120px] h-[500px] w-[256px] absolute z-10 bg-blend-multiply"
        :style="{ background: getGradient(palette[400], palette[600], 'top'), transform: 'rotate(' + angle1 + 'deg)' }"
      ></div>
      <div
        class="transform top-32 left-[-100px] h-[400px] w-[256px] absolute z-20 bg-blend-multiply"
        :style="{ background: getGradient(palette[600], palette[500], 'top'), transform: 'rotate(-' + angle2 + 'deg)' }"
      ></div>
      <div :class="['texture-' + texture]" :style="{ opacity: textureOpacity }" class="absolute inset-0 z-30 bg-repeat mix-blend-soft-light"></div>
      -->

      <!-- Forward Layers -->
      <div class="relative flex flex-col z-50 w-full">
        <Logo class="flex h-10 w-max z-50" />
        <span class="absolute -right-6 top-6 transform rotate-90 text-xs text-white">2021-11-05</span>

        <div class="w-full">
          <div class="flex flex-row relative h-32 mt-6 mb-6">
            <div
              class="w-32 h-32 rounded-full bg-white border-2 absolute left-2 flex items-center justify-center shadow-inner"
              :style="{ 'background-color': palette[50], 'border-color': palette[500] }"
            >
              <Chl class="flex text-white h-16" />
            </div>
            <div
              class="w-32 h-32 rounded-full bg-white border-2 absolute right-2 flex items-center justify-center shadow-inner"
              :style="{ 'background-color': palette[50], 'border-color': palette[500] }"
            >
              <Liv class="flex text-white h-16" />
            </div>
          </div>

          <div class="flex text-white text-2xl font-bold">
            <span v-if="nft.attributes.selection == selections.HOME">{{ nft.event.attributes.home }}</span>
            <span v-if="nft.attributes.selection == selections.AWAY">{{ nft.event.attributes.away }}</span>
            <span v-if="nft.attributes.selection == selections.DRAW">Draw</span>
          </div>
          <span class="flex mt-1 text-white">{{ nft.event.get("home") }} vs. {{ nft.event.get("away") }}</span>
          <span class="flex text-[8px] mt-4" :style="{ color: palette[50] }">231/31232</span>
          <hr class="w-full border-2 mt-2 opacity-50" :style="{ 'background-color': palette[200], 'border-color': palette[200] }" />

          <div class="flex flex-row justify-between space-x-2 mt-4">
            <div :style="{ 'background-color': palette[700] }" class="shadow-inner w-5/12 h-10 rounded flex flex-col items-center justify-center">
              <span class="text-[8px] font-bold" :style="{ color: palette[50] }">SELECTION</span>
              <span v-if="nft.get('betType') == types.BACK" class="text-white font-medium text-[12px]">BACK</span>
              <span v-if="nft.get('betType') == types.LAY" class="text-white font-medium text-[12px]">LAY</span>
            </div>

            <div :style="{ 'background-color': palette[700] }" class="shadow-inner w-4/12 h-10 rounded flex flex-col items-center justify-center">
              <span class="text-[8px] font-bold" :style="{ color: palette[50] }">ODDS</span>
              <span class="text-white font-medium text-[12px] text-number">{{ new BigNumber(convertOdds(nft.get("odds"))) }}</span>
            </div>

            <div :style="{ 'background-color': palette[700] }" class="shadow-inner w-5/12 h-10 rounded flex flex-col items-center justify-center">
              <span class="text-[8px] font-bold" :style="{ color: palette[50] }">AMOUNT</span>
              <span class="text-white font-medium text-[12px] text-number flex flex-row space-x-1 items-center">
                <span>{{ new BigNumber(convertCurrency(nft.get("amount"))) }}</span>

                <div class="bg-white rounded-full w-[12px] h-[12px] flex justify-center items-center">
                  <Matic class="w-[7px] h-[8px]" :style="{ color: palette[700] }" />
                </div>
              </span>
            </div>
          </div>
        </div>

        <div></div>
      </div>
    </div>

    <!--
    <NFTBackgroundLayer :mode="'texture'" :opacity="textureOpacity" :color="color" :texture="texture" />
    -->

    <div class="flex flex-row w-full flex-wrap text-white my-8">
      <div class="w-20 h-20 flex justify-center items-center" :style="{ 'background-color': palette[50] }">50</div>
      <div class="w-20 h-20 flex justify-center items-center" :style="{ 'background-color': palette[100] }">100</div>
      <div class="w-20 h-20 flex justify-center items-center" :style="{ 'background-color': palette[200] }">200</div>
      <div class="w-20 h-20 flex justify-center items-center" :style="{ 'background-color': palette[300] }">300</div>
      <div class="w-20 h-20 flex justify-center items-center" :style="{ 'background-color': palette[400] }">400</div>
      <div class="w-20 h-20 flex justify-center items-center" :style="{ 'background-color': palette[500] }">500</div>
      <div class="w-20 h-20 flex justify-center items-center" :style="{ 'background-color': palette[600] }">600</div>
      <div class="w-20 h-20 flex justify-center items-center" :style="{ 'background-color': palette[700] }">700</div>
      <div class="w-20 h-20 flex justify-center items-center" :style="{ 'background-color': palette[800] }">800</div>
      <div class="w-20 h-20 flex justify-center items-center" :style="{ 'background-color': palette[900] }">900</div>
    </div>
  </div>
</template>

<script lang="ts">
import { BigNumber } from "bignumber.js";
import { ref, onMounted, Ref, watch } from "vue";
import { useBetslip } from "../../modules/moralis/betslip";
import { useCurrency } from "../../modules/settings/currency";
import domtoimage from "dom-to-image-more";
import { useOdds } from "../../modules/settings/odds";
import { MatchedBetModel } from "../../interfaces/models/MatchedBetModel";
import { useColors } from "../../modules/colors";
import { ColorPalette } from "../../interfaces/ColorPalette";
import Logo from "../../assets/svg/logo.svg";
import Matic from "../../assets/svg/matic.svg";
import Liv from "../../assets/svg/liv.svg";
import Chl from "../../assets/svg/chl.svg";
import { NFTBackgroundLayer } from "../../interfaces/nft/NFTBackgroundLayer";
import NFTBackgroundLayerVue from "./NFTBackgroundLayer.vue";

export default {
  props: {
    data: {
      type: Object as () => MatchedBetModel,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    texture: {
      type: String,
      required: true,
    },
    textureOpacity: {
      type: Number,
      required: true,
    },
    angle1: {
      type: Number,
      required: true,
    },
    angle2: {
      type: Number,
      required: true,
    },
    border: {
      type: String,
      required: true,
    },
    borderThickness: {
      type: String,
      required: true,
    },
    backgroundLayers: {
      type: Array as () => NFTBackgroundLayer[],
      required: true,
    },
  },
  setup(props: any, { emit }: any) {
    const { selections, types } = useBetslip();
    const { convertCurrency } = useCurrency();
    const { convertOdds } = useOdds();
    const { generatePalette, getGradient } = useColors();
    const palette: Ref<ColorPalette> = ref(generatePalette(props.color));
    const nft: Ref<MatchedBetModel> = ref(props.data);

    watch(
      () => props.data,
      () => {
        console.log(props.data);
      }
    );

    watch(
      () => props.color,
      () => {
        palette.value = generatePalette(props.color);
      }
    );

    const printMe: Ref<HTMLElement | null> = ref(null);

    onMounted(() => {
      console.log("onUpdated");
      if (printMe.value) {
        domtoimage
          .toBlob(printMe.value)
          .then(function (dataUrl) {
            console.log(dataUrl);
            console.log("image captured");
            emit("converted", dataUrl);
          })
          .catch(function (error) {
            console.info(error);
          });
      }
    });

    return {
      nft,
      printMe,
      convertOdds,
      getGradient,
      convertCurrency,
      BigNumber,
      selections,
      types,
      palette,
    };
  },
  components: { Logo, Matic, Liv, Chl, NFTBackgroundLayerVue },
};
</script>

<style></style>
