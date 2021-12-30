<template>
  <img v-if="nft.attributes.metadata" @click="click()" :src="nft.attributes.metadata.image" class="rounded transition w-full" />
</template>

<script lang="ts">
import { NftOwnerModel } from "../../interfaces/models/NftOwnerModel";
export default {
  props: {
    nft: {
      type: Object as () => NftOwnerModel,
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
