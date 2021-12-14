<template>
  <div ref="overlay" class="fixed bg-gray-50 mt-save pl-save pb-2-save lg:pb-18 shadow overflow-y-auto overflow-x-hidden hide-scrollbar z-40">
    <suspense>
      <slot></slot>
      <template #fallback>
        <div>Loading...</div>
      </template>
    </suspense>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref } from "vue";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { useBreakpoint } from "../../modules/layout/tailwindBreakpoints";
export default defineComponent({
  setup() {
    const overlay = ref("");
    const { breakpoints } = useBreakpoint();

    onMounted(() => {
      if (breakpoints.is === "xs" || breakpoints.is === "sm" || breakpoints.is === "md") {
        disableBodyScroll(overlay.value);
      }
    });

    onBeforeUnmount(() => {
      // todo change to watch for activeActionBarItem, this will not work with component keep alive probaly
      if (breakpoints.is === "xs" || breakpoints.is === "sm" || breakpoints.is === "md") {
        enableBodyScroll(overlay.value);
      }
    });

    return { overlay };
  },
});
</script>
