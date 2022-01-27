<template>
  <div class="flex-grow flex flex-col h-full">
    <Navigation />
    <NavigationBar class="hidden lg:flex" />
    <main
      :class="{
        '3xl:-translate-x-52 3xl:max-w-full': isActionBarActive && isActionBarMovement,
      }"
      class="relative h-full mt-16 lg:mt-20 lg:mr-18 lg:ml-52 p-3 md:p-6 xl:p-8 mb-14 lg:mb-0 ease-in-out duration-500 transform"
    >
      <router-view v-slot="{ Component }" class="pl-save mt-save mb-save">
        <template v-if="Component">
          <FadeTransition mode="out-in">
            <suspense>
              <component :is="Component" :key="forceUpdateKey" />
            </suspense>
          </FadeTransition>
        </template>
      </router-view>
    </main>

    <ActionBar />
  </div>
  <teleport to="body"> <Alert /></teleport>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import ActionBar from "@/components/layout/ActionBar.vue";
import Alert from "./components/layout/Alert.vue";
import Navigation from "./components/layout/Navigation.vue";
import NavigationBar from "./components/layout/NavigationBar.vue";
import FadeTransition from "./components/transitions/FadeTransition.vue";
import { useActionBar } from "./modules/layout/actionBar";
import { useMoralis } from "./modules/moralis/moralis";
import { useChain } from "./modules/moralis/chain";

export default defineComponent({
  setup() {
    const { isActionBarActive, isActionBarMovement } = useActionBar();
    const { initUserFromCache, loadUserRelatedData, isAuthenticated, enableWeb3 } = useMoralis();

    enableWeb3().then((isEnabled: boolean) => {
      if (isEnabled) {
        initUserFromCache();
      }
    });

    const { activeChain } = useChain();
    const forceUpdateKey = ref(0);

    watch(activeChain, () => {
      if (isAuthenticated.value) {
        loadUserRelatedData(); // reload user related data
      }
      forceUpdateKey.value++; // force route to update
    });

    return {
      forceUpdateKey,
      isActionBarActive,
      isActionBarMovement,
    };
  },
  components: {
    ActionBar,
    Alert,
    Navigation,
    NavigationBar,
    FadeTransition,
  },
});
</script>
