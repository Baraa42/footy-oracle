import { onMounted, onUnmounted, Ref } from "vue";

/**
 * Infinte scroll module helper
 *
 * @param el
 * @param callback
 * @returns
 */
export const useInfiniteScroll = (element: Ref, callback: Function) => {
  const handleScroll = () => {
    if (element.value && element.value.getBoundingClientRect().bottom - 50 < window.innerHeight) {
      callback();
    }
  };

  onMounted(() => {
    window.addEventListener("scroll", handleScroll);
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
  });
};
