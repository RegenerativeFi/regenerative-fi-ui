0x56Fa6A4cBED97E2ed4c4d1d272b8375F46970F92<script setup lang="ts">
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { useTokens } from '@/providers/tokens.provider';
import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
type Props = {
  lockablePoolTokenInfo: TokenInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { balanceFor } = useTokens();
const { fNum, toFiat } = useNumbers();

/**
 * COMPUTED
 */
const tokenBalance = computed(() =>
  balanceFor(props.lockablePoolTokenInfo.address)
);

const fiatTotal = computed((): string =>
  toFiat(tokenBalance.value, props.lockablePoolTokenInfo.address)
);
</script>

<template>
  <BalCard noPad shadow="xl">
    <div class="p-4 w-full border-b dark:border-gray-900">
      <h6>
        {{ $t('getVeBAL.lockableTokens.title') }}
      </h6>
    </div>
    <div class="p-4 -mt-2">
      <div class="flex justify-between">
        <div>{{ lockablePoolTokenInfo.symbol }}</div>
        <div>{{ fNum(tokenBalance, FNumFormats.token) }}</div>
      </div>
      <div class="flex justify-between text-secondary">
        <div>{{ lockablePoolTokenInfo.name }}</div>
        <div>{{ fNum(fiatTotal, FNumFormats.fiat) }}</div>
      </div>
    </div>
  </BalCard>
</template>
