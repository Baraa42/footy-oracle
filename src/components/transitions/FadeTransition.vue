<template>
  <transition
    v-if="!group"
    enter-active-class="transition ease-out duration-50"
    enter-from-class="opacity-50"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-50"
    leave-from-class="opacity-100"
    leave-to-class="opacity-50"
  >
    <slot></slot>
  </transition>
  <transition-group
    v-else
    :tag="tag"
    mode="out-in"
    enter-active-class="transition ease-out duration-50"
    enter-from-class="opacity-50"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-50"
    leave-from-class="opacity-100"
    leave-to-class="opacity-50"
  >
    <slot></slot>
  </transition-group>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    group: {
      type: Boolean,
      required: false,
    },
    tag: {
      type: String,
      required: false,
      default: "div",
    },
  },
});
</script>
