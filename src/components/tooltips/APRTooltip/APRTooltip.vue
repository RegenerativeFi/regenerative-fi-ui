<!-- <script setup lang="ts">
import { computed } from 'vue';

// import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { isVeBalPool, totalAprLabel } from '@/composables/usePoolHelpers';
import { APR_THRESHOLD } from '@/constants/pools';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';

import StakingBreakdown from './components/StakingBreakdown.vue';
import VeBalBreakdown from './components/VeBalBreakdown.vue';
import YieldBreakdown from './components/YieldBreakdown.vue';
import { AprBreakdown } from '@regenerative/sdk';
import { hasStakingRewards } from '@/composables/useAPR';
import useWeb3 from '@/services/web3/useWeb3';
import OpportunitiesBreakdown from './components/OpportunitiesBreakdown.vue';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  poolApr?: AprBreakdown;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
// const { fNum } = useNumbers();
const { isWalletReady } = useWeb3();

/**
 * COMPUTED
 */
const apr = computed<AprBreakdown | undefined>(
  () => props.pool?.apr || props.poolApr
);
const validAPR = computed(
  () => Number(apr.value?.swapFees || 0) <= APR_THRESHOLD
);

const hasYieldAPR = computed(() => {
  return bnum(apr.value?.tokenAprs.total || '0').gt(0);
});

const hasVebalAPR = computed((): boolean => isVeBalPool(props.pool.id));

const totalLabel = computed((): string =>
  apr.value
    ? totalAprLabel(apr.value, props.pool.boost, isWalletReady.value)
    : '0'
);
</script> -->
<script setup lang="ts"></script>

<template v-slot:aprCell="pool">
  <div></div>
</template>
