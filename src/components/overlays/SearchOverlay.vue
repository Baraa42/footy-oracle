<template>
  <div
    class="
      h-14
      w-full
      bg-gray-700
      text-white
      flex flex-row
      items-center
      justify-between
      px-4
    "
  >
    <h3 class="text-lg font-semibold">Search</h3>
    <CloseButton @click="closeOverlay()" />
  </div>
  <div class="p-4">
    <SearchInput></SearchInput>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CloseButton from "../buttons/CloseButton.vue";
import SearchInput from "../inputs/SearchInput.vue";

export default defineComponent({
  emits: ["closeOverlay"],
  setup(_, { emit }) {
    const closeOverlay = () => {
      emit("closeOverlay");
    };

    return {
      closeOverlay,
    };
  },
  components: { CloseButton, SearchInput },
});
</script>
