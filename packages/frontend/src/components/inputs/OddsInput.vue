<template>
  <div class="relative shadow-sm">
    <div
      :class="{
        'bg-blue-300': type === betTypes.BACK,
        'hover:bg-blue-500': type === betTypes.BACK && !disabled,
        'bg-red-300 ': type === betTypes.LAY,
        'hover:bg-red-500': type === betTypes.LAY && !disabled,
      }"
      class="opacity-75 absolute inset-y-0 left-0 w-6 flex items-center rounded-tl-sm rounded-bl-sm"
    >
      <button :disabled="disabled" @click="decrement()" class="w-full h-full focus:outline-none flex text-white">
        <MinusIcon class="w-4 h-4 m-auto" />
      </button>
    </div>
    <input
      :disabled="disabled"
      :value="modelValue"
      @input="debouncedEmit($event)"
      :class="{
        'bg-blue-100 focus:ring-blue-400': type === betTypes.BACK,
        'bg-red-100 focus:ring-red-400': type === betTypes.LAY,
      }"
      type="text"
      class="text-number pt-7 text-right font-semibold block w-full h-12 pl-8 pr-8 text-sm border-none rounded-sm text-gray-900 placeholder-gray-700"
      placeholder="0.00"
    />
    <div
      :class="{
        ' text-blue-500': type === betTypes.BACK,
        ' text-red-500': type === betTypes.LAY,
      }"
      class="absolute top-1 inset-y right-8 text-[10px] font-semibold"
    >
      <template v-if="type === betTypes.BACK">BACK</template>
      <template v-if="type === betTypes.LAY">LAY</template>
    </div>
    <div
      :class="{
        'bg-blue-300': type === betTypes.BACK,
        'hover:bg-blue-500': type === betTypes.BACK && !disabled,
        'bg-red-300 ': type === betTypes.LAY,
        'hover:bg-red-500': type === betTypes.LAY && !disabled,
      }"
      class="absolute opacity-75 inset-y-0 right-0 w-6 flex items-center rounded-tr-sm rounded-br-sm"
    >
      <button :disabled="disabled" @click="increment()" class="w-full h-full focus:outline-none flex text-white">
        <PlusIcon class="w-4 h-4 m-auto" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import { BetTypeEnum } from "../../interfaces/enums/BetTypeEnum";
import { PlusIcon } from "@heroicons/vue/solid";
import { MinusIcon } from "@heroicons/vue/solid";
import { useMath } from "../../modules/math";
import { useOdds } from "../../modules/settings/odds";
import { useDebounce } from "@/modules/layout/debounce";

export default defineComponent({
  props: {
    type: { type: Number as PropType<BetTypeEnum>, required: true },
    modelValue: [Number],
    modelModifiers: {
      default: () => ({}),
    },
    min: {
      type: Number,
      default: 0,
    },
    step: {
      type: Number,
      default: 0.01,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const betTypes = BetTypeEnum;

    const { round, countDecimals } = useMath();
    const { minOdds, oddsDecimals } = useOdds();

    const modelValue = ref<number>(props.modelValue || minOdds);
    const step: number = Number(props.step);

    const emitValue = () => {
      emit("update:modelValue", modelValue.value);
    };

    const emitEvent = (event: Event) => {
      const element: HTMLInputElement | null = event.target as HTMLInputElement;

      if (element.value) {
        let value = Number(element.value.replaceAll(",", "."));

        if (isNaN(value)) {
          value = minOdds;
        } else if (value <= minOdds) {
          value = minOdds;
        } else if (countDecimals(value) > oddsDecimals) {
          value = round(value, oddsDecimals);
        }

        modelValue.value = 0;
        modelValue.value = value;
        emitValue();
      }
    };

    const { debounceFunction } = useDebounce();
    const debouncedEmit = debounceFunction(emitEvent, 500);

    const increment = () => {
      modelValue.value = round(modelValue.value + step, oddsDecimals);
      emitValue();
    };
    const decrement = () => {
      modelValue.value = round(modelValue.value - step, oddsDecimals);
      emitValue();
    };

    return { modelValue, betTypes, emitValue, emitEvent, increment, decrement, debouncedEmit };
  },
  components: { PlusIcon, MinusIcon },
});
</script>
