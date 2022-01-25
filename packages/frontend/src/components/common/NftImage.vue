<template>
  <img @click="click()" v-if="image" :src="image" class="rounded transition w-full" />
  <div v-else></div>
</template>

<script lang="ts">
import { NftOwnerModel } from "../../interfaces/models/NftOwnerModel";
import { computed, defineComponent } from "vue";
export default defineComponent({
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
      if (Array.isArray(props.nft.attributes.metadata)) {
        console.log(props.nft.attributes.metadata[0].image);
        return props.nft.attributes.metadata[0].image;
      } else if (props.nft.attributes?.metadata?.image) {
        return props.nft.attributes.metadata.image;
      } else if (props.nft.parsed_metadata?.image) {
        return props.nft.parsed_metadata?.image;
      } else {
        return "";
      }
    });

    return { click, image };
  },
});
</script>
