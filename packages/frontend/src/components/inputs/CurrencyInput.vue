<template>
  <div class="relative shadow-sm">
    <input
      :disabled="disabled"
      :value="modelValue"
      @input="emitValue($event)"
      :class="{
        'bg-blue-100 focus:ring-blue-400': type === betTypes.BACK,
        'bg-red-100 focus:ring-red-400': type === betTypes.LAY,
      }"
      type="text"
      class="text-number pt-7 text-right font-semibold block w-full h-12 pl-2 pr-10 text-sm border-none rounded-sm text-gray-900 placeholder-gray-700"
      placeholder="0.00"
    />
    <div
      :class="{
        ' text-blue-500': type === betTypes.BACK,
        ' text-red-500': type === betTypes.LAY,
      }"
      class="absolute top-1 inset-y right-10 text-[10px] font-semibold"
    >
      {{ label }}
    </div>
    <div class="absolute inset-y-0 right-0 flex items-center">
      <button
        :disabled="disabled"
        :class="{
          'bg-blue-300  border-l-2 border-blue-300 border-opacity-30': type === betTypes.BACK,
          'hover:bg-blue-500': type === betTypes.BACK && !disabled,
          'hover:bg-red-500': type === betTypes.LAY && !disabled,
          ' bg-red-300 ': type === betTypes.LAY,
        }"
        class="opacity-100 h-full py-0 pl-1 pr-1 text-xs font-semibold text-white rounded-tr-sm rounded-br focus:outline-none"
      >
        <Matic class="w-4 h-4 text-white" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";
import { BetTypeEnum } from "../../interfaces/enums/BetTypeEnum";
import { PlusIcon } from "@heroicons/vue/solid";
import { MinusIcon } from "@heroicons/vue/solid";
import { useMath } from "../../modules/math";
import Matic from "../../assets/svg/matic.svg";

export default defineComponent({
  props: {
    type: { type: Number as PropType<BetTypeEnum>, required: true },
    label: String,
    modelValue: [Number],
    modelModifiers: {
      default: () => ({}),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const betTypes = BetTypeEnum;

    const { round } = useMath();
    const modelValue = ref<any>(props.modelValue || 0);

    const emitValue = (event: Event) => {
      const element: HTMLInputElement | null = event.target as HTMLInputElement;
      modelValue.value = Number(element?.value.replaceAll(",", "."));
      emit("update:modelValue", modelValue.value);
    };

    return { betTypes, emitValue };
  },
  components: { PlusIcon, MinusIcon, Matic },
});
</script>
