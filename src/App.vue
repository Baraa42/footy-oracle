<template>
  <Navigation />
  <NavigationBar class="hidden lg:flex" />
  <main
    :class="{
      '3xl:-translate-x-52 3xl:max-w-full': isActionBarActive,
    }"
    class="relative mt-16 lg:mt-20 lg:mr-18 lg:ml-44 p-3 xl:p-8 mb-14 lg:mb-0 ease-in-out duration-500 transform"
  >
    <router-view v-slot="{ Component }" class="pl-save mt-save mb-save">
      <template v-if="Component">
        <FadeTransition mode="out-in">
          <suspense>
            <component :is="Component" />
          </suspense>
        </FadeTransition>
      </template>
    </router-view>
  </main>
  <WithdrawDialog v-if="selectedNft" :nft="selectedNft" :isOpen="isWithdrawDialogOpen" @onClose="toggleWithdrawDialog()" />
  <Alert />
  <ActionBar />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ActionBar from "./components/layout/ActionBar.vue";
import Alert from "./components/layout/Alert.vue";
import Navigation from "./components/layout/Navigation.vue";
import NavigationBar from "./components/layout/NavigationBar.vue";
import FadeTransition from "./components/transitions/FadeTransition.vue";
import { useActionBar } from "./modules/layout/actionBar";
import SoccerBall from "./assets/svg/soccer_ball.svg";
import WithdrawDialog from "./components/dialogs/WithdrawDialog.vue";
import { useWithdraw } from "./modules/moralis/withdraw";
import { useMoralis } from "./modules/moralis/moralis";

export default defineComponent({
  setup() {
    const { isActionBarActive } = useActionBar();
    const { toogleWithdraw, isWithdrawDialogOpen, selectedNft, toggleWithdrawDialog } = useWithdraw();
    const { initUserFromCache } = useMoralis();
    initUserFromCache();

    return {
      isActionBarActive,
      toogleWithdraw,
      toggleWithdrawDialog,
      isWithdrawDialogOpen,
      selectedNft,
    };
  },
  components: {
    WithdrawDialog,
    SoccerBall,
    ActionBar,
    Alert,
    Navigation,
    NavigationBar,
    FadeTransition,
  },
});
</script>
