<template>
  <img v-if="nft.parsed_metadata" @click="click()" :src="nft.parsed_metadata.image" class="rounded opacity-75 group-hover:opacity-100 transition w-full" />
</template>

<script lang="ts">
import { ListedNftModel } from "../../interfaces/models/NftOwnerModel";
export default {
  props: {
    nft: {
      type: Object as () => ListedNftModel,
      required: true,
    },
  },
  setup(props: any, { emit }: any) {
    const click = () => {
      emit("callback", props.nft);
    };

    return { click };
  },
};
</script>
