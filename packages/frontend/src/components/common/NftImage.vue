<template>
  <img @click="click()" :src="image" class="rounded transition w-full" />
</template>

<script lang="ts">
import { NftOwnerModel } from "../../interfaces/models/NftOwnerModel";
import { computed } from "vue";
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

    const image = computed((): string | undefined => {
      if (props.nft.attributes.metadata[0]) {
        console.log(props.nft.attributes.metadata[0].image);
        return props.nft.attributes.metadata[0].image;
      } else {
        return props.nft.attributes.metadata.image;
      }
    });

    return { click, image };
  },
};
</script>
