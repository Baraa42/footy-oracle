<template>
  <div>
    <div class="flex flex-row w-full space-x-8">
      <!-- Bet Editor -->
      <div class="w-1/2 flex flex-col space-y-3">
        <div class="w-full">
          <label class="block text-sm font-medium text-gray-700">Event</label>
          <select
            v-model="eventModel"
            class="mt-1 focus:ring-gray-300 focus:border-gray-300 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            v-if="events"
          >
            <option v-for="event in events" :key="event.id" :value="event">{{ event.getName() }}</option>
          </select>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="w-full sm:w-1/2">
            <label class="block text-sm font-medium text-gray-700">Bet Type</label>
            <select v-model="type" class="mt-1 focus:ring-gray-300 focus:border-gray-300 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
              <option :value="types.BACK">Back</option>
              <option :value="types.LAY">Lay</option>
            </select>
          </div>
          <div class="w-full sm:w-1/2">
            <label class="block text-sm font-medium text-gray-700">Selection</label>
            <select v-model="selection" class="mt-1 focus:ring-gray-300 focus:border-gray-300 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
              <option :value="selections.HOME">Home</option>
              <option :value="selections.DRAW">Draw</option>
              <option :value="selections.AWAY">Away</option>
            </select>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="w-full sm:w-1/2">
            <label class="block text-sm font-medium text-gray-700">Odds</label>
            <input
              v-model="odds"
              type="text"
              class="mt-1 focus:ring-gray-300 focus:border-gray-300 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div class="w-full sm:w-1/2">
            <label class="block text-sm font-medium text-gray-700">Amount</label>
            <input
              v-model="amount"
              type="text"
              class="mt-1 focus:ring-gray-300 focus:border-gray-300 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      <!-- NFT Editor -->
      <div class="w-1/2 flex flex-col space-y-3">
        <div class="w-full">
          <label class="block text-sm font-medium text-gray-700">Team</label>
          <select
            v-model="teamModel"
            class="mt-1 focus:ring-gray-300 focus:border-gray-300 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            v-if="teams"
          >
            <option v-for="team in teams" :key="team.id" :value="team">{{ team.get("name") }}</option>
          </select>
        </div>

        <div class="col-span-6 sm:col-span-3">
          <label class="block text-sm font-medium text-gray-700">HEX Color</label>
          <div class="flex flex-row w-full space-x-2">
            <input
              v-model="color"
              type="text"
              class="mt-1 focus:ring-gray-300 focus:border-gray-300 inline-flex w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
            <input v-model="color" type="color" class="mt-1 w-10 h-10 inline-flex rounded-md appearance-none" />
          </div>
        </div>

        <div class="flex flex-col sm:flex-row w-full justify-center items-center gap-3">
          <div class="w-full sm:w-1/2">
            <label class="block text-sm font-medium text-gray-700">Border</label>
            <select v-model="border" class="mt-1 focus:ring-gray-300 focus:border-gray-300 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
              <option value="color">Color</option>
              <option value="gradient">Gradient</option>
            </select>
          </div>

          <div class="w-full sm:w-1/2">
            <label class="block text-sm font-medium text-gray-700">Border Thickness</label>
            <input type="range" min="0" max="8" step="1" v-model="borderThickness" class="mt-1 block w-full sm:text-sm rounded-md" />
          </div>
        </div>
      </div>
    </div>

    <!-- Background Layer Editor-->
    <div class="my-8">
      <div class="flex flex-col space-y-4">
        <button
          @click="addBackgroundLayer()"
          class="w-max group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mb-2"
        >
          Add background layer
        </button>

        <div class="flex flex-col space-y-2">
          <NftBackgroundLayerEditor
            v-for="(backgroundLayer, index) in backgroundLayers"
            :key="backgroundLayer.id"
            v-model="backgroundLayers[index]"
            @onMoveDown="moveLayerDown(backgroundLayer)"
            @onMoveUp="moveLayerUp(backgroundLayer)"
            @onRemove="removeBackgroundLayer(backgroundLayer)"
          />
        </div>
      </div>
    </div>

    <!-- NFT -->
    <Nft
      v-if="render && model"
      @converted="onConverted"
      :data="model"
      :backgroundLayers="backgroundLayers"
      :textureOpacity="textureOpacity"
      :color="color"
      :texture="texture"
      :angle1="angle1"
      :angle2="angle2"
      :border="border"
      :borderThickness="borderThickness"
    ></Nft>
    <div class="flex flex-row gap-x-2">
      <button
        @click="download()"
        class="w-max group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mb-2"
      >
        Download
      </button>
      <button
        @click="downloadText(JSON.stringify(backgroundLayers), 'config', 'json')"
        class="w-max group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mb-2"
      >
        Export Config
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Moralis from "moralis/dist/moralis.js";
import { defineComponent, Ref, ref, watch } from "vue";
import CardContainer from "../../common/CardContainer.vue";
import { EventModel } from "../../../interfaces/models/EventModel";
import { MatchedBetModel } from "../../../interfaces/models/MatchedBetModel";
import { TeamModel } from "../../../interfaces/models/TeamModel";
import { NFTBackgroundLayer } from "../../../interfaces/nft/NFTBackgroundLayer";
import { useDownload } from "../../../modules/download";
import { useBetslip } from "../../../modules/moralis/betslip";
import { useEvents } from "../../../modules/moralis/event";
import { useTeams } from "../../../modules/moralis/teams";
import { useOdds } from "../../../modules/settings/odds";
import Nft from "../Nft.vue";
import NftBackgroundLayerEditor from "./NftBackgroundLayerEditor.vue";
import { EventQueryParms } from "@/interfaces/queries/EventQueryParms";

export default defineComponent({
  async setup() {
    const web3 = new Moralis.Web3();
    const { selections, types } = useBetslip();
    const { decodeOdds } = useOdds();
    const { getEventQuery } = useEvents();
    const { getTeams } = useTeams();
    const { downloadText, downloadSVG, downloadPNG } = useDownload();

    /**
     * Get events for selection
     */
    const events: Ref<EventModel[]> = ref([]);

    const queryParms: EventQueryParms = {
      sort: {
        key: "start",
        direction: "ASC",
      },
      filter: {
        onlyFutureEvents: true,
      },
      inlcude: ["home", "away", "league.country"],
    };
    const query = getEventQuery(queryParms);

    query.find().then((data) => {
      events.value = data as EventModel[];
    });

    const eventModel: Ref<EventModel | undefined> = ref();
    if (!eventModel.value && events.value && events.value.length != 0) {
      eventModel.value = events.value[0];
    }

    /**
     * Get teams for selection
     */
    const teams: Array<TeamModel> | undefined = await getTeams();
    const teamModel: Ref<TeamModel | undefined> = ref();
    if (!teamModel.value && teams && teams.length != 0) {
      teamModel.value = teams[0];
    }

    /**
     * Reactive variables for customization
     */
    const odds = ref("2.0");
    const amount = ref("0.1");
    const selection = ref(selections.HOME);
    const type = ref(types.BACK);
    const border = ref("color");
    const borderThickness = ref("4");
    const color = ref(teamModel.value?.attributes.primaryColor ? teamModel.value.attributes.primaryColor : "#7A263A");
    const texture = ref("wiggle");
    const textureOpacity = ref(0.1);
    const angle1 = ref(30);
    const angle2 = ref(39);
    const backgroundLayers: Ref<Array<NFTBackgroundLayer>> = ref([]);
    const nftImage = ref("");
    const render = ref(true);

    const download = async () => {
      console.log("download");
      render.value = false;
      await new Promise((r) => setTimeout(r, 500));
      render.value = true;
      await new Promise((r) => setTimeout(r, 500));
      downloadPNG(nftImage.value, "nft");
    };

    const onConverted = (data: string) => {
      nftImage.value = data;
    };

    const addBackgroundLayer = () => {
      backgroundLayers.value.push({
        id: backgroundLayers.value.length + 1,
        mode: "color",
        color: color.value,
        scale: "1",
        opacity: "0.5",
        rotate: "0",
        translateY: "0",
        translateX: "0",
        blur: "0",
        blendMode: "normal",
        texture: "wiggle",
      });
    };

    const moveLayerDown = (layer: NFTBackgroundLayer) => {
      const index: number = backgroundLayers.value.findIndex((obj: NFTBackgroundLayer) => obj === layer);
      if (index > -1 && backgroundLayers.value[index + 1]) {
        const temp = backgroundLayers.value[index];
        backgroundLayers.value[index] = backgroundLayers.value[index + 1];
        backgroundLayers.value[index + 1] = temp;
      }
    };

    const moveLayerUp = (layer: NFTBackgroundLayer) => {
      const index: number = backgroundLayers.value.findIndex((obj: NFTBackgroundLayer) => obj === layer);
      if (index > -1 && backgroundLayers.value[index - 1]) {
        const temp = backgroundLayers.value[index];
        backgroundLayers.value[index] = backgroundLayers.value[index - 1];
        backgroundLayers.value[index - 1] = temp;
      }
    };

    const removeBackgroundLayer = (backgroundLayer: NFTBackgroundLayer) => {
      const index: number = backgroundLayers.value.findIndex((obj: NFTBackgroundLayer) => obj === backgroundLayer);
      if (index > -1) {
        backgroundLayers.value.splice(index, 1);
      }
    };

    /**
     * Recreating matched bet as its real
     */
    const MatchedBet = Moralis.Object.extend("MatchedBet");
    const model: Ref<MatchedBetModel> = ref(new MatchedBet());
    model.value.set("id", "1");
    model.value.set("eventId", "1");
    model.value.set("odds", web3.utils.toWei(odds.value));
    model.value.set("amount", web3.utils.toWei(amount.value));
    model.value.set("selection", selection.value);
    model.value.set("betSide", type.value);
    model.value.set("addr", "");
    model.value.set("address", "");
    model.value.set("block_hash", "");
    model.value.set("block_timestamp", new Date());
    model.value.set("transaction_hash", "");
    model.value.set("transaction_index", 1);
    model.value.set("confirmed", true);
    model.value.set("log_index", 1);
    model.value.set("event", eventModel.value);

    /**
     * Reloading model if some value changes
     */
    watch(
      () => color.value,
      () => {
        backgroundLayers.value.forEach((item: NFTBackgroundLayer) => {
          item.color = color.value;
        });
      }
    );

    watch(
      () => odds.value,
      () => {
        model.value.set("odds", web3.utils.toWei(odds.value));
        model.value.set("event", undefined);
        model.value.set("event", eventModel.value);
      }
    );

    watch(
      () => amount.value,
      () => {
        model.value.set("amount", web3.utils.toWei(amount.value));
        model.value.set("event", undefined);
        model.value.set("event", eventModel.value);
      }
    );

    watch(
      () => selection.value,
      () => {
        model.value.set("selection", selection.value);
        model.value.set("event", undefined);
        model.value.set("event", eventModel.value);
      }
    );

    watch(
      () => type.value,
      () => {
        model.value.set("betType", type.value);
        model.value.set("event", undefined);
        model.value.set("event", eventModel.value);
      }
    );

    watch(
      () => eventModel.value,
      () => {
        model.value.set("event", eventModel.value);
      }
    );

    watch(
      () => teamModel.value,
      () => {
        color.value = teamModel.value?.attributes.primaryColor ? teamModel.value?.attributes.primaryColor : color.value;
      }
    );

    return {
      render,
      download,
      model,
      events,
      selections,
      type,
      odds,
      types,
      eventModel,
      amount,
      selection,
      color,
      decodeOdds,
      texture,
      textureOpacity,
      borderThickness,
      border,
      angle1,
      teams,
      teamModel,
      angle2,
      backgroundLayers,
      addBackgroundLayer,
      removeBackgroundLayer,
      onConverted,
      nftImage,
      downloadText,
      downloadSVG,
      downloadPNG,
      moveLayerUp,
      moveLayerDown,
    };
  },

  components: {
    CardContainer,
    Nft,
    NftBackgroundLayerEditor,
  },
});
</script>
