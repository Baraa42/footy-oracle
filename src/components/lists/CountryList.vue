<template>
  <div>
    <CardSubHeader title="By Country" />
    <div class="flex flex-col space-y-2 p-2">
      <div v-if="countries" v-for="country in countries" :key="country.id" @click="openCountry(country)">
        <div class="flex flex-row items-center justify-between bg-gray-100 py-4 px-3 rounded-sm hover:bg-gray-200 transition-all cursor-pointer">
          <div class="flex items-center space-x-3">
            <img v-if="country.get('code')" class="w-4 h-4" :src="country.get('flag')" />

            <span class="text-lg">{{ country.get("name") }}</span>
          </div>
          <ChevronDownIcon v-if="!isActiveCountry(country)" class="w-6 h-6 text-gray-400" />
          <ChevronUpIcon v-else class="w-6 h-6 text-gray-400" />
        </div>
        <div v-if="isActiveCountry(country) && country.leagues" class="border-2 border-gray-100">
          <ul class="list-disc list-inside my-4 px-5 flex flex-col space-y-2">
            <li v-for="league in country.leagues" :key="league.id">
              <router-link
                class="hover:underline"
                :to="{
                  name: 'league',
                  params: { sport: 'soccer', league: league.id },
                }"
              >
                {{ league.get("name") }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "vue";
import { ChevronDownIcon } from "@heroicons/vue/solid";
import { ChevronUpIcon } from "@heroicons/vue/solid";
import { useCountry } from "../../modules/moralis/country";
import { useLeagues } from "../../modules/moralis/leagues";
import CardSubHeader from "../common/CardSubHeader.vue";
import FadeTransition from "../transitions/FadeTransition.vue";
import { CountryModel } from "../../interfaces/models/CountryModel";

export default defineComponent({
  async setup() {
    const { getCountries } = useCountry();
    const { getLeagues } = useLeagues();

    const activeCountries = <Ref<Array<CountryModel>>>ref([]);
    const countries = await getCountries();

    const getActiveIndex = (country: CountryModel): number => {
      return activeCountries.value.findIndex((item: CountryModel) => item.id === country.id);
    };

    const isActiveCountry = (country: CountryModel): boolean => {
      if (getActiveIndex(country) === -1) {
        return false;
      } else {
        return true;
      }
    };

    const openCountry = async (country: CountryModel) => {
      if (!isActiveCountry(country)) {
        const leagues = await getLeagues(true, country);
        country.leagues = leagues;
        activeCountries.value.push(country);
      } else {
        activeCountries.value.splice(getActiveIndex(country), 1);
      }
    };

    return { openCountry, isActiveCountry, countries };
  },
  components: {
    ChevronDownIcon,
    ChevronUpIcon,
    CardSubHeader,
    FadeTransition,
  },
});
</script>
