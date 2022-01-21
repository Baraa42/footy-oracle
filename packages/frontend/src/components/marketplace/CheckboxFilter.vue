<template>
  <div class="border-b border-gray-200 py-6">
    <Disclosure as="div" v-slot="{ open }">
      <h3 class="-my-3 flow-root">
        <DisclosureButton class="py-3 w-full flex items-center justify-between text-sm text-gray-400 hover:text-gray-500">
          <span class="font-medium text-gray-900">
            {{ label }}
          </span>
          <span class="ml-6 flex items-center">
            <PlusSmIcon v-if="!open" class="h-5 w-5" aria-hidden="true" />
            <MinusSmIcon v-else class="h-5 w-5" aria-hidden="true" />
          </span>
        </DisclosureButton>
      </h3>
      <DisclosurePanel class="pt-6">
        <div class="space-y-4">
          <div v-for="(option, optionIdx) in options" :key="option.value" class="flex items-center">
            <input
              :id="`filter-${label}-${optionIdx}`"
              :name="`${label}[]`"
              :value="option.value"
              type="checkbox"
              :checked="option.checked"
              @change="check(option)"
              class="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label :for="`filter-${label}-${optionIdx}`" class="ml-3 text-sm text-gray-600">
              {{ option.label }}
            </label>
          </div>
        </div>
      </DisclosurePanel>
    </Disclosure>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, PropType, computed, Ref } from "vue";
import { Dialog, DialogOverlay, Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { MinusSmIcon, PlusSmIcon } from "@heroicons/vue/solid";
import { CheckboxOption } from "@/interfaces/layout/CheckboxOption";

export default defineComponent({
  props: {
    label: { type: String, required: true },
    options: { type: Array as PropType<CheckboxOption[]>, required: true },
    modelValue: { type: Array },
    modelModifiers: {
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const options: Ref<Array<CheckboxOption>> = ref<any>(props.options || []);

    const checkedValues = computed(() => options.value.filter((item) => item.checked).map((item) => item.value));

    const check = (option: CheckboxOption) => {
      options.value.filter((item) => item.label == option.label)[0].checked = !options.value.filter((item) => item.label == option.label)[0].checked;
      emit("update:modelValue", checkedValues.value);
    };

    return {
      check,
    };
  },
  components: {
    Dialog,
    DialogOverlay,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    MinusSmIcon,
    PlusSmIcon,
  },
});
</script>
