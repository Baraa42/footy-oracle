<template>
  <div class="w-full h-full">
    <div
      id="nonPrintable"
      ref="printMe"
      class="z-0 relative h-[1024px] w-[768px] rounded-md p-4 overflow-hidden transition-transform mix-blend-soft-ligh"
      :style="{
        'background-color': palette[500],
      }"
    >
      <!-- Background Layers -->
      <div v-if="backgroundLayers">
        <NFTBackgroundLayerVue v-for="backgroundLayer in backgroundLayers" :data="backgroundLayer" :key="backgroundLayer.id" />
      </div>

      <!-- Forward Layers -->
      <div class="relative flex flex-col z-50 w-full p-4 text-white">
        <Logo class="flex h-32 w-max z-50" />
        <h1 class="text-9xl font-bold uppercase mt-16 tracking-tight leading-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-50 to-gray-200">
          Liqidity<br />Provider
        </h1>
        <h1
          class="text-9xl font-bold uppercase tracking-tight leading-tighter text-transparent -mt-8 bg-clip-text bg-gradient-to-t from-white/[.05] to-white/[.0]"
          style="transform: scale(1, -1)"
        >
          Liqidity<br />Provider
        </h1>

        <div class="shadow-md w-full p-4 h-52 mt-12 bg-gray-800/10 rounded backdrop-blur-sm">
          <div class="w-full flex flex-col space-y-6 items-center justify-center h-full -mt-2">
            <span class="text-3xl text-white/[.05] text-center font-semibold">Amount:</span>
            <div class="w-full flex flex-row space-x-4 justify-center font-semibold">
              <span class="text-number text-6xl">{{ amount }}</span>
              <span class="text-number text-6xl">{{ activeChain.currencyName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { BigNumber } from "bignumber.js";
import { ref, onMounted, Ref, watch } from "vue";
import domtoimage from "dom-to-image-more";
import { MatchedBetModel } from "../../interfaces/models/MatchedBetModel";
import { useColors } from "../../modules/colors";
import { ColorPalette } from "../../interfaces/ColorPalette";
import { NFTBackgroundLayer } from "../../interfaces/nft/NFTBackgroundLayer";
import NFTBackgroundLayerVue from "./NFTBackgroundLayer.vue";
import { useChain } from "@/modules/moralis/chain";
import Logo from "@/assets/svg/logo.svg";

export default {
  props: {
    color: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
  },
  setup(props: any, { emit }: any) {
    const { generatePalette, getGradient } = useColors();
    const palette: Ref<ColorPalette> = ref(generatePalette(props.color));
    const nft: Ref<MatchedBetModel> = ref(props.data);
    const { activeChain } = useChain();

    const backgroundLayers = <Ref<NFTBackgroundLayer[]>>ref([]);

    backgroundLayers.value.push({
      id: 0,
      mode: "texture",
      color: palette.value[50],
      opacity: "0.2",
      blendMode: "soft-light",
      texture: "circuit-board",
    });

    backgroundLayers.value.push({
      id: 1,
      mode: "gradient",
      color: palette.value[100],
      gradientStart: palette.value[900],
      gradientStop: palette.value[100],
      gradientDirection: "top right",
      opacity: "0.5",
      blendMode: "soft-light",
    });

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
      backgroundLayers,
      nft,
      printMe,
      getGradient,
      BigNumber,
      activeChain,
      palette,
    };
  },
  components: { NFTBackgroundLayerVue, Logo },
};
</script>

<style></style>
