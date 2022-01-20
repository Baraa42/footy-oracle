<template>
  <div v-if="nft && nft.attributes.event" class="w-full h-full">
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
      <div v-if="backgroundLayers">
        <NFTBackgroundLayerVue v-for="backgroundLayer in backgroundLayers" :data="backgroundLayer" :key="backgroundLayer.id" />
      </div>

      <!-- Forward Layers -->
      <div class="relative flex flex-col z-50 w-full">
        <Logo class="flex h-10 w-max z-50" />
        <span class="absolute -right-6 top-6 transform rotate-90 text-xs text-white">{{ format(nft.attributes.event.attributes.start, "YYYY-MM-DD") }}</span>

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
            <span v-if="nft.attributes.selection == selections.HOME">{{ nft.attributes.event.attributes.home.attributes.name }}</span>
            <span v-if="nft.attributes.selection == selections.AWAY">{{ nft.attributes.event.attributes.away.attributes.name }}</span>
            <span v-if="nft.attributes.selection == selections.DRAW">Draw</span>
          </div>
          <span class="flex mt-1 text-white">{{ nft.attributes.event.getName() }}</span>
          <span class="flex text-[8px] mt-4" :style="{ color: palette[50] }">231/31232</span>
          <hr class="w-full border-2 mt-2 opacity-50" :style="{ 'background-color': palette[200], 'border-color': palette[200] }" />

          <div class="flex flex-row justify-between space-x-2 mt-4">
            <div :style="{ 'background-color': palette[700] }" class="shadow-inner w-5/12 h-10 rounded flex flex-col items-center justify-center">
              <span class="text-[8px] font-bold" :style="{ color: palette[50] }">SELECTION</span>
              <span v-if="nft.get('betSide') == types.BACK" class="text-white font-medium text-[12px]">BACK</span>
              <span v-if="nft.get('betSide') == types.LAY" class="text-white font-medium text-[12px]">LAY</span>
            </div>

            <div :style="{ 'background-color': palette[700] }" class="shadow-inner w-4/12 h-10 rounded flex flex-col items-center justify-center">
              <span class="text-[8px] font-bold" :style="{ color: palette[50] }">ODDS</span>
              <span class="text-white font-medium text-[12px] text-number">{{ decodeOdds(nft.get("odds")) }}</span>
            </div>

            <div :style="{ 'background-color': palette[700] }" class="shadow-inner w-5/12 h-10 rounded flex flex-col items-center justify-center">
              <span class="text-[8px] font-bold" :style="{ color: palette[50] }">AMOUNT</span>
              <span class="text-white font-medium text-[12px] text-number flex flex-row space-x-1 items-center">
                <span>{{ new BigNumber(convertCurrency(nft.get("amount"))) }}</span>

                <component :is="activeChain.iconRounded" class="w-[12px] h-[12px]" :style="{ color: palette[700] }" />
              </span>
            </div>
          </div>
        </div>

        <div></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { BigNumber } from "bignumber.js";
import { ref, onMounted, Ref, watch, defineComponent } from "vue";
import { useBetslip } from "../../modules/moralis/betslip";
import { useCurrency } from "../../modules/settings/currency";
import domtoimage from "dom-to-image-more";
import { useOdds } from "../../modules/settings/odds";
import { MatchedBetModel } from "../../interfaces/models/MatchedBetModel";
import { useColors } from "../../modules/colors";
import { ColorPalette } from "../../interfaces/ColorPalette";
import Logo from "../../assets/svg/logo.svg";
import Liv from "../../assets/svg/liv.svg";
import Chl from "../../assets/svg/chl.svg";
import { NFTBackgroundLayer } from "../../interfaces/nft/NFTBackgroundLayer";
import NFTBackgroundLayerVue from "./NFTBackgroundLayer.vue";
import { useTimezone } from "@/modules/settings/timezone";
import { useChain } from "@/modules/moralis/chain";

export default defineComponent({
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
      required: false,
    },
    textureOpacity: {
      type: Number,
      required: false,
    },
    angle1: {
      type: Number,
      required: false,
    },
    angle2: {
      type: Number,
      required: false,
    },
    border: {
      type: String,
      required: false,
    },
    borderThickness: {
      type: String,
      required: false,
    },
    backgroundLayers: {
      type: Array as () => NFTBackgroundLayer[],
      required: false,
    },
  },
  setup(props: any, { emit }: any) {
    const { selections, types } = useBetslip();
    const { convertCurrency } = useCurrency();
    const { decodeOdds } = useOdds();
    const { format } = useTimezone();
    const { generatePalette, getGradient } = useColors();
    const palette: Ref<ColorPalette> = ref(generatePalette(props.color));
    const nft: Ref<MatchedBetModel> = ref(props.data);
    const { activeChain } = useChain();

    watch(
      () => props.color,
      () => {
        palette.value = generatePalette(props.color);
      }
    );

    const printMe: Ref<HTMLElement | null> = ref(null);

    onMounted(() => {
      if (printMe.value) {
        domtoimage
          .toBlob(printMe.value)
          .then(function (dataUrl) {
            console.log("nft captured");
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
      decodeOdds,
      getGradient,
      convertCurrency,
      BigNumber,
      activeChain,
      selections,
      types,
      palette,
      format,
    };
  },
  components: { Logo, Liv, Chl, NFTBackgroundLayerVue },
});
</script>
