<script setup lang="ts">
import { computed, onBeforeMount } from 'vue';

import Col3Layout from '@/components/layouts/Col3Layout.vue';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';
import useBreakpoints from '@/composables/useBreakpoints';
import useConfig from '@/composables/useConfig';
import { useTokens } from '@/providers/tokens.provider';
import HowToLock from './components/HowToLock.vue';
import LockableTokens from './components/LockableTokens.vue';
import MyVeBAL from './components/MyVeBAL.vue';
import VeBalForm from './components/VeBalForm/VeBalForm.vue';
import useREFI from '@/composables/useREFI';

/**
 * COMPOSABLES
 */
const { isDesktop, isMobile } = useBreakpoints();
const { networkConfig } = useConfig();
const { injectTokens } = useTokens();
const { ReFiTokenInfo } = useREFI();
// veBalLockInfoQuery is optional - only needed for displaying existing lock info
// It shouldn't block the UI from loading
const veBalLockInfoQuery = useVeBalLockInfoQuery();

/**
 * LIFECYCLE
 */
// Inject REFI token if it's not already in the token registry
onBeforeMount(async () => {
  if (networkConfig.addresses.ReFi) {
    await injectTokens([networkConfig.addresses.ReFi]);
  }
});

/**
 * COMPUTED
 */
const lockablePoolTokenInfo = ReFiTokenInfo;

const veBalLockInfo = computed(() => veBalLockInfoQuery.data.value);

// For direct REFI locking, we only need token info - no pool required
// Check if token address exists in config, not just if token info is available
// (token info might not be available until after injection)
const isReady = computed(() => {
  // If we have token info, we're ready
  if (ReFiTokenInfo.value) return true;
  // If we have the address in config, we can still proceed (token will be injected)
  return !!networkConfig.addresses.ReFi;
});
</script>

<template>
  <Col3Layout offsetGutters>
    <template #gutterLeft>
      <BalLoadingBlock v-if="!isReady" class="h-36" />
      <LockableTokens
        v-else-if="isReady && lockablePoolTokenInfo"
        :lockablePoolTokenInfo="lockablePoolTokenInfo"
      />
      <template v-if="isDesktop">
        <BalLoadingBlock v-if="!isReady" class="mt-4 h-12" />
        <HowToLock
          v-else-if="isReady && lockablePoolTokenInfo"
          :lockablePoolTokenInfo="lockablePoolTokenInfo"
        />
      </template>
    </template>

    <BalLoadingBlock v-if="!isReady" class="h-96" />
    <VeBalForm
      v-else-if="isReady && lockablePoolTokenInfo"
      :lockablePoolTokenInfo="lockablePoolTokenInfo"
      :veBalLockInfo="veBalLockInfo"
    />

    <template #gutterRight>
      <MyVeBAL :veBalLockInfo="veBalLockInfo" />
      <template v-if="isMobile">
        <BalLoadingBlock v-if="!isReady" class="mt-4 h-12" />
        <HowToLock
          v-else-if="isReady && lockablePoolTokenInfo"
          :lockablePoolTokenInfo="lockablePoolTokenInfo"
        />
      </template>
    </template>
  </Col3Layout>
</template>
