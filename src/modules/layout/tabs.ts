import { computed, reactive, ref } from "vue";
import { Tab } from "../../interfaces/layout/Tab";

export const useTabs = (items: Array<Tab>) => {
  const tabs = reactive(items);

  const activeTab = computed(() => tabs.find((item: Tab) => item.isActive));

  const setTab = (tab: Tab) => {
    if (activeTab.value) {
      activeTab.value.isActive = false;
    }
    tab.isActive = true;
  };

  return { tabs, activeTab, setTab };
};
