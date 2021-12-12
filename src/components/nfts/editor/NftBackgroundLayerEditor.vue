<template>
  <div class="bg-gray-100 p-4 rounded space-y-4">
    <div class="h-12 flex flex-row w-full items-center justify-between">
      <div @click="toggle()" class="hover:cursor-pointer">
        <span class="font-semibold">Layer {{ modelValue.id }}</span>
      </div>
      <div class="flex flex-row space-x-2">
        <button
          @click="moveLayerUp()"
          class="
            h-10
            w-10
            group
            relative
            flex
            justify-center
            items-center
            rounded-md
            text-white
            bg-gray-600
            hover:bg-gray-700
            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500
          "
        >
          <ChevronUpIcon class="w-6 h-6" />
        </button>
        <button
          @click="moveLayerDown()"
          class="
            h-10
            w-10
            group
            relative
            flex
            justify-center
            items-center
            rounded-md
            text-white
            bg-gray-600
            hover:bg-gray-700
            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500
          "
        >
          <ChevronDownIcon class="w-6 h-6" />
        </button>

        <button
          @click="removeLayer()"
          class="
            h-10
            w-10
            group
            relative
            flex
            justify-center
            items-center
            rounded-md
            text-white
            bg-red-700
            hover:bg-red-900
            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-800
          "
        >
          <TrashIcon class="w-6 h-6" />
        </button>
        <div class="flex flex-row">
          <button
            @click="downloadText(JSON.stringify(modelValue), 'config-layer-' + modelValue.id, 'json')"
            class="
              ml-2
              h-10
              w-10
              group
              relative
              flex
              justify-center
              items-center
              rounded-md
              text-white
              bg-gray-600
              hover:bg-gray-700
              focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500
            "
          >
            <DownloadIcon class="w-6 h-6" />
          </button>
          <button
            @click="toggle()"
            class="
              ml-2
              h-10
              w-10
              group
              relative
              flex
              justify-center
              items-center
              rounded-md
              text-white
              bg-gray-600
              hover:bg-gray-700
              focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500
            "
          >
            <EyeIcon v-if="isToggled" class="w-6 h-6" />
            <EyeOffIcon v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="isToggled" class="flex flex-col space-y-4">
      <div class="w-full flex space-x-4 items-end">
        <div class="w-full sm:w-2/6">
          <label class="block text-sm font-medium text-gray-700">Mode</label>
          <select v-model="modelValue.mode" class="mt-1 focus:ring-gray-300 focus:border-gray-300 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
            <option value="texture">Texture</option>
            <option value="color">Color</option>
            <option value="gradient">Gradient</option>
          </select>
        </div>
        <div class="w-full sm:w-2/6">
          <label class="block text-sm font-medium text-gray-700">Blend Mode</label>
          <select
            v-model="modelValue.blendMode"
            class="mt-1 focus:ring-gray-300 focus:border-gray-300 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          >
            <option value="normal">Normal</option>
            <option value="multiply">Multiply</option>
            <option value="screen">Screen</option>
            <option value="overlay">Overlay</option>
            <option value="darken">Darken</option>
            <option value="lighten">Lighten</option>
            <option value="color-doge">Color doge</option>
            <option value="color-burn">Color burn</option>
            <option value="hard-light">Hard light</option>
            <option value="soft-light">Soft light</option>
            <option value="difference">Difference</option>
            <option value="exclusion">Exclusion</option>
            <option value="hue">Hue</option>
            <option value="saturation">Saturation</option>
            <option value="color">Color</option>
            <option value="luminosity">Luminosity</option>
          </select>
        </div>
        <div class="w-full sm:w-2/6" v-if="modelValue.mode == 'texture'">
          <label class="block text-sm font-medium text-gray-700">Texture</label>
          <select
            v-model="modelValue.texture"
            class="mt-1 focus:ring-gray-300 focus:border-gray-300 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          >
            <option value="hexagons">Hexagons</option>
            <option value="charlie-brown">Charlie brown</option>
            <option value="temple">Temple</option>
            <option value="four-point-stars">4 point stars</option>
            <option value="bamboo">Bamboo</option>
            <option value="wiggle">Wiggle</option>
            <option value="glamorous">Glamorous</option>
            <option value="circuit-board">Circuit board</option>
            <option value="bank-note">Bank note</option>
          </select>
        </div>
        <div class="w-full sm:w-2/6" v-if="modelValue.mode == 'color'">
          <label class="block text-sm font-medium text-gray-700">Color Mode</label>
          <select
            v-model="modelValue.colorMode"
            class="mt-1 focus:ring-gray-300 focus:border-gray-300 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          >
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="300">300</option>
            <option value="400">400</option>
            <option value="500">500</option>
            <option value="600">600</option>
            <option value="700">700</option>
            <option value="800">800</option>
            <option value="900">900</option>
          </select>
        </div>
        <div class="w-full sm:w-2/6" v-if="modelValue.mode == 'gradient'">
          <label class="block text-sm font-medium text-gray-700">Start Color Mode</label>
          <select
            v-model="modelValue.gradientStart"
            class="mt-1 focus:ring-gray-300 focus:border-gray-300 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          >
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="300">300</option>
            <option value="400">400</option>
            <option value="500">500</option>
            <option value="600">600</option>
            <option value="700">700</option>
            <option value="800">800</option>
            <option value="900">900</option>
          </select>
        </div>
        <div class="w-full sm:w-2/6" v-if="modelValue.mode == 'gradient'">
          <label class="block text-sm font-medium text-gray-700">End Color Mode</label>
          <select
            v-model="modelValue.gradientStop"
            class="mt-1 focus:ring-gray-300 focus:border-gray-300 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          >
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="300">300</option>
            <option value="400">400</option>
            <option value="500">500</option>
            <option value="600">600</option>
            <option value="700">700</option>
            <option value="800">800</option>
            <option value="900">900</option>
          </select>
        </div>
        <div class="w-full sm:w-2/6" v-if="modelValue.mode == 'gradient'">
          <label class="block text-sm font-medium text-gray-700">Direction</label>

          <select
            v-model="modelValue.gradientDirection"
            class="mt-1 focus:ring-gray-300 focus:border-gray-300 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          >
            <option value="top">Top</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="bottom">Bottom</option>
            <option value="top left">Top Right</option>
            <option value="top right">Top Left</option>
            <option value="bottom right">Bottom Right</option>
            <option value="bottom left">Bottom Left</option>
          </select>
        </div>
      </div>
      <div class="flex flex-row space-x-4">
        <div class="w-full sm:w-1/6">
          <label class="block text-sm font-medium text-gray-700">Opacity</label>
          <input type="range" min="0" max="1" step="0.01" v-model="modelValue.opacity" class="mt-1 block w-full sm:text-sm rounded-md" />
        </div>
        <div class="w-full sm:w-1/6">
          <label class="block text-sm font-medium text-gray-700">Scale</label>
          <input v-model="modelValue.scale" type="range" min="0" max="5" step="0.01" class="mt-1 block w-full sm:text-sm rounded-md" />
        </div>
        <div class="w-full sm:w-1/6">
          <label class="block text-sm font-medium text-gray-700">Rotate</label>
          <input v-model="modelValue.rotate" type="range" min="-360" max="360" step="1" class="mt-1 block w-full sm:text-sm rounded-md" />
        </div>
        <div class="w-full sm:w-1/6">
          <label class="block text-sm font-medium text-gray-700">Translate X</label>
          <input v-model="modelValue.translateX" type="range" min="-500" max="500" step="1" class="mt-1 block w-full sm:text-sm rounded-md" />
        </div>
        <div class="w-full sm:w-1/6">
          <label class="block text-sm font-medium text-gray-700">Translate Y</label>
          <input v-model="modelValue.translateY" type="range" min="-500" max="500" step="1" class="mt-1 block w-full sm:text-sm rounded-md" />
        </div>
        <div class="w-full sm:w-1/6">
          <label class="block text-sm font-medium text-gray-700">Blur</label>
          <input v-model="modelValue.blur" type="range" min="0" max="5" step="0.01" class="mt-1 block w-full sm:text-sm rounded-md" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useToggle } from "../../../modules/layout/toggle";
import CardContainer from "../../common/CardContainer.vue";
import Nft from "../Nft.vue";
import { ChevronUpIcon } from "@heroicons/vue/solid";
import { ChevronDownIcon } from "@heroicons/vue/solid";
import { TrashIcon } from "@heroicons/vue/solid";
import { EyeIcon } from "@heroicons/vue/solid";
import { EyeOffIcon } from "@heroicons/vue/solid";
import { DownloadIcon } from "@heroicons/vue/solid";
import { useDownload } from "../../../modules/download";

export default defineComponent({
  props: ["modelValue"],
  setup(props, { emit }) {
    const { isToggled, toggle } = useToggle();
    const { downloadText } = useDownload();

    const moveLayerDown = () => {
      emit("onMoveDown");
    };
    const moveLayerUp = () => {
      emit("onMoveUp");
    };
    const removeLayer = () => {
      emit("onRemove");
    };

    return {
      isToggled,
      toggle,
      downloadText,
      removeLayer,
      moveLayerUp,
      moveLayerDown,
    };
  },

  components: {
    CardContainer,
    Nft,
    ChevronUpIcon,
    ChevronDownIcon,
    TrashIcon,
    EyeIcon,
    EyeOffIcon,
    DownloadIcon,
  },
});
</script>
