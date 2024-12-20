<script setup lang="ts">
// import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
// import { useTokens } from '@/providers/tokens.provider';
import { Pool } from '@/services/pool/types';
// import { PoolToken } from '@regenerative/sdk';
import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
type Props = {
  lockableTokenInfo: TokenInfo;
  lockablePool: Pool;
  totalLpTokens: string;
};

/**
 * PROPS
 */
defineProps<Props>();

/**
 * COMPOSABLES
 */
// const { getToken } = useTokens();
const { fNum } = useNumbers();

/**
 * COMPUTED
 */
// const poolWeightsLabel = computed(() =>
//   props.lockablePool.tokens
//     .map(token => {
//       const weightLabel = formatWeightLabel(token.weight);
//       const symbol = token.symbol ?? getToken(token.address).symbol;

//       return `${weightLabel} ${symbol}`;
//     })
//     .join(' / ')
// );

/**
 * METHODS
 */
// function formatWeightLabel(weight: PoolToken['weight']) {
//   return fNum(weight || '0', {
//     style: 'percent',
//     maximumFractionDigits: 0,
//   });
// }
</script>

<template>
  <div class="container">
    <div class="flex justify-between items-center p-3">
      <div>
        <div class="font-semibold">
          {{ fNum(totalLpTokens, FNumFormats.token) }} REFI tokens
        </div>
        <!-- <div class="text-gray-400 dark:text-gray-600">
          {{ poolWeightsLabel }}
        </div> -->
      </div>
      <BalAsset
        :key="lockableTokenInfo.address"
        :address="lockableTokenInfo.address"
        :size="30"
      />
    </div>
  </div>
</template>

<style scoped>
.container {
  @apply shadow-lg border dark:border-gray-700 divide-y dark:divide-gray-700 rounded-lg;
}
</style>
