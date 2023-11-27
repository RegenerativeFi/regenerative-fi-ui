<script lang="ts" setup>
import useBreakpoints from '@/composables/useBreakpoints';
import { useSidebar } from '@/composables/useSidebar';
import useWeb3 from '@/services/web3/useWeb3';

import { Goals, trackGoal } from '@/composables/useFathom';
import AppNavAccountBtn from './AppNavAccountBtn.vue';

/**
 * COMPOSABLES
 */
const { isMobile } = useBreakpoints();
const { account, startConnectWithInjectedProvider } = useWeb3();
const { setSidebarOpen } = useSidebar();

/**
 * COMPUTED
 */

/**
 * METHODS
 */
function connectWalletHandler() {
  trackGoal(Goals.ClickNavConnectWallet);
  startConnectWithInjectedProvider();
}
</script>

<template>
  <div class="grid grid-rows-1 grid-flow-col gap-2">
    <AppNavActivityBtn v-if="account" />
    <AppNavAccountBtn v-if="account" />
    <BalBtn
      v-else
      color="white"
      :size="isMobile ? 'md' : 'sm'"
      @click="connectWalletHandler"
    >
      <WalletIcon class="mr-2" />
      <span class="hidden lg:inline-block" v-text="$t('connectWallet')" />
      <span class="lg:hidden" v-text="$t('connect')" />
    </BalBtn>
    <BalBtn
      v-if="isMobile"
      color="white"
      flat
      circle
      @click="setSidebarOpen(true)"
    >
      <BalIcon name="menu" size="lg" />
    </BalBtn>
  </div>
</template>