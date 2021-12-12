<template>
  <div class="h-14 w-full bg-gray-700 text-white flex flex-row items-center justify-between px-4">
    <h3 class="text-lg font-semibold">Settings</h3>
    <CloseButton @click="closeOverlay()" />
  </div>
  <div class="p-4 flex flex-col gap-y-6">
    <div>
      <label class="block text-sm font-medium text-gray-700 pl-1">Language</label>
      <Select v-model="selectedLanguage" :options="languages" :label="selectedLanguage.label" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 pl-1">Display Currency</label>
      <Select v-model="selectedCurrency" :options="currencies" :label="selectedCurrency.label" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 pl-1">Odds Format</label>
      <Select v-model="selectedOddsFormat" :options="oddsFormats" :label="selectedOddsFormat.label" />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 pl-1">Timezone</label>
      <Select v-model="selectedTimezone" :options="timezones" :label="selectedTimezone.label" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CloseButton from "../buttons/CloseButton.vue";
import TimezoneSelect from "../inputs/TimezoneSelect.vue";
import Select from "../inputs/Select.vue";
import { useTimezone } from "../../modules/settings/timezone";
import { useCurrency } from "../../modules/settings/currency";
import { useOdds } from "../../modules/settings/odds";
import { useLanguage } from "../../modules/settings/language";

export default defineComponent({
  emits: ["closeOverlay"],
  setup(_, { emit }) {
    const closeOverlay = () => {
      emit("closeOverlay");
    };

    const { currencies, selectedCurrency } = useCurrency();
    const { oddsFormats, selectedOddsFormat } = useOdds();
    const { languages, selectedLanguage } = useLanguage();
    const { timezoneList: timezones, selectedTimezone } = useTimezone();

    return {
      languages,
      selectedLanguage,
      currencies,
      selectedCurrency,
      timezones,
      selectedTimezone,
      oddsFormats,
      selectedOddsFormat,
      closeOverlay,
    };
  },
  components: { CloseButton, TimezoneSelect, Select },
});
</script>
