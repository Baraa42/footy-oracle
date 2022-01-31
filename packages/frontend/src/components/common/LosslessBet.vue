<template>
  <div class="bg-gradient-to-br from-gray-100 to-white rounded p-4 text-gray-800 h-max">
    <div class="flex flex-col w-72 md:w-80">
      <div class="flex flex-row items-start justify-between">
        <div class="flex flex-row">
          <div
            class="border-2 border-gray-200/20 w-16 h-16 rounded-full text-white flex items-center justify-center font-bold text-lg z-10"
            :style="{ background: event.attributes.home.attributes.primaryColor }"
            :class="{ ' bg-gray-800': !event.attributes.away.attributes.primaryColor }"
          >
            {{ event.attributes.home.attributes.name.charAt(0) }}
          </div>
          <div
            class="border-2 border-gray-200/20 transform -translate-x-4 w-16 h-16 rounded-full text-white flex items-center justify-center font-bold text-lg"
            :style="{ background: event.attributes.away.attributes.primaryColor }"
            :class="{ 'bg-gray-800': !event.attributes.away.attributes.primaryColor }"
          >
            {{ event.attributes.away.attributes.name.charAt(0) }}
          </div>
        </div>

        <div class="flex flex-col space-y-1">
          <div class="flex space-x-1 ml-auto" v-if="defiProvider">
            <div class="bg-gray-600 px-2 py-1 rounded text-xs font-semibold text-gray-50">{{ defiProvider.depositApy + defiProvider.rewardApy }} %</div>
            <div class="bg-gray-600 px-2 py-1 rounded"><component :is="defiProvider.logo" class="w-12" /></div>
          </div>
          <div class="bg-indigo-700 w-full text-center px-2 py-1 rounded text-xs font-semibold text-gray-50">
            <!-- Total Deposit 2 {{ activeChain.currencySymbol }} -->
            Total Deposit {{ getTotalQiBalance }} {{ activeChain.currencySymbol }}
          </div>
          <div class="flex space-x-1 ml-auto">
            <div class="bg-gray-600 w-full text-center px-2 py-1 rounded text-xs font-semibold text-gray-50">
              Ends {{ humanizeDate(getDate(event.attributes.start)) }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col space-y-2 mt-6">
        <div class="flex flex-row space-x-2 items-center">
          <img class="w-4 h-4 rounded" :src="event.attributes.league.attributes.country.attributes.flag" />
          <router-link
            :to="{
              name: 'league',
              params: { sport: 'soccer', league: event.attributes.league?.id },
            }"
            class="text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >{{ event.attributes.league?.attributes.name }}
          </router-link>
        </div>
        <span class="text-lg font-semibold leading-5">{{ event.getName() }}</span>
      </div>

      <div class="mt-4 flex flex-row h-5 outline outline-gray-200 divide-x divide-gray-50/10 rounded text-gray-50 text-xs font-semibold">
        <div
          class="h-full opacity-90 flex items-center rounded-l justify-center"
          style="width: 33.33%"
          :style="{ background: event.attributes.home.attributes.primaryColor }"
        >
          {{ percentageTotalSelectionValue(selections.HOME) }} %
        </div>
        <div class="h-full opacity-90 flex items-center justify-center bg-gray-600" style="width: 33.33%">
          {{ percentageTotalSelectionValue(selections.DRAW) }} %
        </div>
        <div
          class="h-full flex opacity-90 items-center rounded-r justify-center"
          style="width: 33.33%"
          :style="{ background: event.attributes.away.attributes.primaryColor }"
        >
          {{ percentageTotalSelectionValue(selections.AWAY) }}%
        </div>
      </div>

      <div class="flex flex-row w-full mt-4 rounded shadow-md shadow-gray-200">
        <button class="btn border-l-2 border-t-2 border-b-2 rounded-l" @click="onSelect(selections.HOME)">
          <span class="font-semibold">Home</span>
          <span class="text-xs">{{ countTotalSelectionValue(selections.HOME) }} {{ activeChain.currencySymbol }}</span>
        </button>
        <button class="btn border-2" @click="onSelect(selections.DRAW)">
          <span class="font-semibold">Draw</span> <span class="text-xs">{{ countTotalSelectionValue(selections.DRAW) }} {{ activeChain.currencySymbol }}</span>
        </button>
        <button class="btn border-t-2 border-b-2 border-r-2 rounded-r" @click="onSelect(selections.AWAY)">
          <span class="font-semibold">Away</span> <span class="text-xs">{{ countTotalSelectionValue(selections.AWAY) }} {{ activeChain.currencySymbol }}</span>
        </button>
      </div>
    </div>

    <teleport to="#app">
      <ConfirmationDialog
        :type="confirmDialog.type"
        :color="confirmDialog.color"
        :icon="confirmDialog.icon"
        :title="confirmDialog.title"
        :description="confirmDialog.description"
        :buttonText="confirmDialog.buttonText"
        :isOpen="confirmDialog.isToggled"
        @onConfirm="confirmDialog.onConfirm"
        @onClose="confirmDialog.toggle()"
      >
        <h2 class="text-center font-semibold text-3xl text-gray-800 -mt-2">Lossless Betting</h2>

        <div class="mt-8 mb-6 space-y-2 bg-gray-50 p-4 rounded">
          <div class="flex justify-between">
            <span>Match</span>
            <router-link :to="event.getDetailLink()" class="text-indigo-600 font-medium">{{ event.getName() }}</router-link>
          </div>
          <div class="flex justify-between">
            <span>League</span>
            <router-link
              :to="{
                name: 'league',
                params: { sport: 'soccer', league: event.attributes.league?.id },
              }"
              class="text-indigo-600 font-medium"
              >{{ event.attributes.league.attributes.name }}</router-link
            >
          </div>
          <div class="flex justify-between">
            <span>Selection</span>
            <span class="font-semibold">{{ getNameFromSelection }}</span>
          </div>
          <div class="flex justify-between">
            <span>Ends at</span>
            <span class="font-semibold">{{ getDateTime(event.attributes.start) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Reward</span>
            <span class="font-semibold">0 %</span>
          </div>
          <div class="flex justify-between">
            <span>Potential price</span>
            <span class="font-semibold">2 {{ activeChain.currencySymbol }}</span>
          </div>
        </div>

        <label for="price" class="block text-sm font-medium text-gray-700">Amount</label>
        <div class="mt-1 relative rounded-md shadow-sm">
          <input
            v-model="betAmount"
            type="text"
            name="price"
            id="price"
            class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="0.00"
          />
        </div>
      </ConfirmationDialog>
    </teleport>
  </div>
</template>

<script lang="ts">
import { EventModel } from "@/interfaces/models/EventModel";
import { useTimezone } from "@/modules/settings/timezone";
import { computed, defineComponent, Ref, ref } from "vue";
import { useChain } from "@/modules/moralis/chain";
import { DefiProvider } from "@/interfaces/Chain";
import { useConfirmDialog } from "@/modules/layout/confirmDialog";
import { useMoralis } from "@/modules/moralis/moralis";
import { useLosslessBet } from "@/modules/moralis/lossless";
import { useAlert } from "@/modules/layout/alert";
import { CashIcon } from "@heroicons/vue/outline";
import { SelectionEnum } from "@/interfaces/enums/SelectionEnum";
import ConfirmationDialog from "../dialogs/ConfirmationDialog.vue";
import { QuestionMarkCircleIcon } from "@heroicons/vue/solid";
import { MatchedBetModel } from "../../interfaces/models/MatchedBetModel";
import BigNumber from "bignumber.js";
import { useCurrency } from "../../modules/settings/currency";
import { useMath } from "@/modules/math";

export default defineComponent({
  props: {
    event: {
      type: Object as () => EventModel,
      required: true,
    },
  },
  setup(props) {
    const selections = SelectionEnum;
    const { humanizeDate, getDate, getDateTime } = useTimezone();
    const { showError } = useAlert();
    const { convertCurrency } = useCurrency();
    const { activeChain } = useChain();
    const { round } = useMath();
    const defiProvider = computed((): DefiProvider | undefined => (activeChain.value.defiProviders ? activeChain.value.defiProviders[0] : undefined));

    const { isAuthenticated, losslessBets } = useMoralis();
    const confirmDialog = useConfirmDialog();

    const selection: Ref<SelectionEnum | undefined> = ref();
    const betAmount = <Ref<string>>ref();
    const betAmountNumber = computed((): number => Number(betAmount?.value.replaceAll(",", ".")));

    const { createLosslessBet } = useLosslessBet();

    const getNameFromSelection = computed((): string => {
      if (selection.value === selections.HOME) {
        return props.event.attributes.home.attributes.name;
      } else if (selection.value === selections.AWAY) {
        return props.event.attributes.away.attributes.name;
      } else {
        return "Draw";
      }
    });

    const percentageTotalSelectionValue = (select: SelectionEnum): string => {
      var totalAmount = new BigNumber(0);
      var selectionAmount = new BigNumber(0);
      var zero = new BigNumber(0);

      losslessBets?.value?.forEach((losslessBet: MatchedBetModel) => {
        if (losslessBet.attributes.apiId == String(props.event.attributes.apiId)) {
          var amount = new BigNumber(convertCurrency(losslessBet?.get("amount")));
          totalAmount = totalAmount.plus(amount);

          if (losslessBet.attributes.selection == select) {
            selectionAmount = selectionAmount.plus(amount);
          }
        }
      });
      if (totalAmount.gt(zero)) {
        console.log(selectionAmount.div(totalAmount).times(100).toString());
        return String(round(selectionAmount.div(totalAmount).times(100).toNumber(), 2));
      }
      return String(round(zero.toNumber(), 2));
    };

    const countTotalSelectionValue = (select: SelectionEnum): string => {
      var totalAmount = new BigNumber(0);
      losslessBets?.value?.forEach((losslessBet: MatchedBetModel) => {
        if (losslessBet.attributes.apiId == String(props.event.attributes.apiId) && losslessBet.attributes.selection == select) {
          console.log(losslessBet);
          var amount = new BigNumber(convertCurrency(losslessBet?.get("amount")));
          totalAmount = totalAmount.plus(amount);
        }
      });
      return String(round(totalAmount.toNumber(), 2));
    };

    const getTotalQiBalance = computed((): string => {
      var totalAmount = new BigNumber(0);
      losslessBets?.value?.forEach((losslessBet: MatchedBetModel) => {
        if (losslessBet.attributes.apiId == String(props.event.attributes.apiId)) {
          console.log(losslessBet);
          console.log(losslessBet.attributes.amount);
          console.log(losslessBet.attributes.apiId);
          var amount = new BigNumber(convertCurrency(losslessBet?.get("amount")));
          totalAmount = totalAmount.plus(amount);
        }
      });
      return totalAmount.toString();
    });

    const onSelect = (select: SelectionEnum) => {
      console.log("onSelect");
      selection.value = select;
      confirmDialog.icon = CashIcon;
      confirmDialog.color = "indigo";
      confirmDialog.buttonText = "Confirm";
      confirmDialog.onConfirm = async () => {
        console.log("onConfirm ", props.event.attributes);
        console.log(betAmountNumber.value);
        createLosslessBet(props.event, select, betAmountNumber.value);
        betAmount.value = "";
        confirmDialog.toggle();
      };

      if (isAuthenticated.value) {
        confirmDialog.toggle();
      } else {
        showError("You need to connect your wallet");
      }
    };

    return {
      activeChain,
      defiProvider,
      humanizeDate,
      getDate,
      getDateTime,
      selections,
      confirmDialog,
      onSelect,
      selection,
      getNameFromSelection,
      betAmount,
      getTotalQiBalance,
      countTotalSelectionValue,
      percentageTotalSelectionValue,
    };
  },
  components: { ConfirmationDialog, QuestionMarkCircleIcon },
});
</script>

<style scoped>
.btn {
  @apply flex flex-col bg-gradient-to-b text-gray-600 hover:text-gray-800 from-gray-50 to-gray-100  items-center h-14 w-1/3 justify-center hover:to-gray-50 hover:from-gray-100  transition-all  border-gray-200;
}
</style>
