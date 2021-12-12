<template>
  <Listbox v-model="selectedTimezone">
    <div class="relative mt-1">
      <ListboxButton
        class="
          relative
          w-full
          py-3
          pl-3
          pr-10
          text-left
          bg-white
          rounded-md
          shadow-sm
          cursor-default
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-opacity-75
          focus-visible:ring-white
          focus-visible:ring-offset-orange-300
          focus-visible:ring-offset-2
          focus-visible:border-indigo-500
          sm:text-sm
        "
      >
        <span class="block truncate">{{ selectedTimezone.label }}</span>
        <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <SelectorIcon class="w-5 h-5 text-gray-400" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-out"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <ListboxOptions
          class="
            z-50
            absolute
            w-full
            py-1
            mt-1
            overflow-auto
            text-base
            bg-white
            rounded-md
            shadow-sm
            max-h-60
            ring-1 ring-black ring-opacity-5
            focus:outline-none
            sm:text-sm
          "
        >
          <ListboxOption v-slot="{ active, selected }" v-for="timezone in timezones" :key="timezone.name" :value="timezone" as="template">
            <li :class="[active ? 'text-gray-900 bg-gray-100' : 'text-gray-900', 'cursor-default select-none relative py-3 pl-3 pr-10']">
              <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{ timezone.label }}</span>
              <span v-if="selected" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600">
                <CheckIcon class="w-5 h-5" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import { Listbox, ListboxLabel, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import { CheckIcon, SelectorIcon } from "@heroicons/vue/solid";
import { useTimezone } from "../../modules/settings/timezone";
export default defineComponent({
  components: {
    Listbox,
    ListboxLabel,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
    CheckIcon,
    SelectorIcon,
  },

  setup() {
    const { timezoneList: timezones, selectedTimezone } = useTimezone();

    return {
      timezones,
      selectedTimezone,
    };
  },
});
</script>
