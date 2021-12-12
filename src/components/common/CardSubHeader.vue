<template>
  <div class="bg-gray-700 flex flex-row items-center px-4 lg:px-5 py-3">
    <div class="flex flex-col space-y-1 text-white">
      <h2 class="font-semibold text-lg">{{ title }}</h2>
      <router-link v-if="linkTo && linkName" class="text-xs font-light text-gray-300 hover:text-white transition-colors w-max uppercase" :to="linkTo"
        >{{ linkName }}
      </router-link>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    title: String,
    linkTo: Object,
    linkName: String,
  },
});
</script>
