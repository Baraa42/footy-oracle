import { computed, reactive, ref } from "vue";
import { ActionBarItem } from "../../interfaces/layout/ActionBarItem";

const activeActionBarItem = ref<string | null>(null);
const activeActionBarComponent = ref<any>(null);
const isActionBarMovement = ref<boolean>(true);
const isActionBarActive = computed(() => !!activeActionBarItem.value);

const closeActionBar = (): void => {
  activeActionBarItem.value = null;
  activeActionBarComponent.value = null;
};

const setActionBarItem = (item: ActionBarItem): void => {
  if (activeActionBarItem.value === item.name) {
    closeActionBar();
  } else {
    activeActionBarItem.value = item.name;
    activeActionBarComponent.value = item.component;
  }
};

const toggleMovement = (): void => {
  isActionBarMovement.value = !isActionBarMovement.value;
};

export const useActionBar = () => {
  return {
    activeActionBarItem,
    activeActionBarComponent,
    closeActionBar,
    setActionBarItem,
    isActionBarActive,
    isActionBarMovement,
    toggleMovement,
  };
};
