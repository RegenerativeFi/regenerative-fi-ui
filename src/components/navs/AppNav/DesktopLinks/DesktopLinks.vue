<script lang="ts" setup>
import { Goals, trackGoal } from '@/composables/useFathom';
import useNetwork, { isTestnet } from '@/composables/useNetwork';
import { useRoute } from 'vue-router';
import DesktopLinkItem from './DesktopLinkItem.vue';
import BalTooltip from '@/components/_global/BalTooltip/BalTooltip.vue';

/**
 * COMPOSABLES
 */
const route = useRoute();
const { networkSlug } = useNetwork();

/**
 * METHODS
 */
function isActive(page: string): boolean {
  if (route.name === page) return true;
  return false;
}
</script>

<template>
  <div class="desktop-links">
    <DesktopLinkItem
      :to="{ name: 'swap', params: { networkSlug } }"
      :active="isActive('swap')"
      prefetch
      @click="trackGoal(Goals.ClickNavSwap)"
    >
      {{ $t('swap') }}
    </DesktopLinkItem>
    <DesktopLinkItem
      :to="{ name: 'pools', params: { networkSlug } }"
      :active="isActive('pools')"
      prefetch
      @click="trackGoal(Goals.ClickNavPools)"
    >
      {{ $t('pools') }}
    </DesktopLinkItem>
    <!-- <DesktopLinkItem
      :to="{ name: 'home', params: { networkSlug } }"
      :active="isActive('home')"
      prefetch
      @click="trackGoal(Goals.ClickNavPools)"
    >
      {{ $t('vote') }}
    </DesktopLinkItem> -->
    <!-- <DesktopLinkItem
      :to="{ name: 'claim', params: { networkSlug } }"
      :active="isActive('claim')"
      prefetch
      @click="trackGoal(Goals.ClickNavClaim)"
    >
      <div class="flex items-center">
        {{ $t('claim') }}
      </div>
    </DesktopLinkItem> -->
    <DesktopLinkItem
      v-if="isTestnet"
      :to="{ name: 'faucet', params: { networkSlug } }"
      :active="isActive('faucet')"
    >
      Faucet
    </DesktopLinkItem>
    <!-- <DesktopLinkItem
      :to="{ name: 'portfolio', params: { networkSlug } }"
      :active="isActive('portfolio')"
      prefetch
      @click="trackGoal(Goals.ClickNavPortfolio)"
    >
      {{ $t('portfolio') }}
    </DesktopLinkItem> -->
    <BalTooltip
      text="Vote page coming soon."
      width="64"
      class="opacity-50 cursor-not-allowed"
      placement="bottom"
      textAlign="center"
    >
      <template #activator>
        <span class="text-base font-medium">Vote</span>
      </template>
    </BalTooltip>
    <DesktopLinkItem
      :to="{ name: 'dashboard', params: { networkSlug } }"
      :active="isActive('dashboard')"
      prefetch
      @click="trackGoal(Goals.ClickNavPools)"
    >
      {{ $t('dashboard') }}
    </DesktopLinkItem>
  </div>
</template>

<style scoped>
.desktop-links {
  @apply grid gap-6 grid-flow-col grid-rows-1 h-full content-center;
}
</style>
