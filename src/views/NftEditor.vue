<template>
  <CardContainer class="min-h-[800px]">
    <div class="bg-gray-800 h-22 rounded-t">
      <div class="flex flex-col items-star justify-between w-full h-full text-white">
        <h2 class="font-semibold text-2xl px-5 py-5">NFT Editor</h2>
      </div>
    </div>
    <div class="p-2 lg:p-6">
      <Suspense>
        <NftEditor />
      </Suspense>
    </div>
  </CardContainer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CardContainer from "../components/common/CardContainer.vue";
import NftImage from "../components/common/NftImage.vue";
import NftEditor from "../components/nfts/editor/NftEditor.vue";

export default defineComponent({
  setup() {
    return {};
  },

  components: {
    CardContainer,
    NftImage,
    NftEditor,
  },
});
</script>
