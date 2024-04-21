<script setup lang="ts">
import { toRef } from 'vue';

import { usePoolHelpers } from '@/composables/usePoolHelpers';
import { Pool } from '@/services/pool/types';

import InvestmentTransactions from './InvestmentTransactions/InvestmentTransactions.vue';
/**
 * TYPES
 */
type Props = {
  pool: Pool;
  loading: boolean;
};

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

/**
 * COMPOSABLES
 */
const { isDeepPool, isStablePhantomPool } = usePoolHelpers(
  toRef(props, 'pool')
);
</script>

<template>
  <InvestmentTransactions
    :isDeepPool="isDeepPool"
    :isStablePhantomPool="isStablePhantomPool"
    :pool="pool"
    :loading="loading"
  />
</template>
