<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePoolHelpers } from '@/composables/usePoolHelpers';
import { Pool } from '@/services/pool/types';

import BoostedActivities from '../BoostedPoolActivities/Activities.vue';
import Activities from '../PoolActivities/Activities.vue';
import { PoolTransactionsTab } from '../types';
import useWeb3 from '@/services/web3/useWeb3';
import { PoolContractDetails } from '../..';
import SwapTransactions from '../SwapTransactions/SwapTransactions.vue';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  loading: boolean;
  isStablePhantomPool: boolean;
  isDeepPool: boolean;
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
const { isWalletReady } = useWeb3();

/**
 * COMPUTED
 */
const tabs = computed(() => [
  {
    value: PoolTransactionsTab.ALL_ACTIVITY,
    label: t('poolTransactions.tabs.myTransactions'),
  },
  ...(isWalletReady.value
    ? [
        {
          value: PoolTransactionsTab.USER_ACTIVITY,
          label: t('poolTransactions.tabs.myInvestments'),
        },
      ]
    : []),
  ...(isWalletReady.value
    ? [
        {
          value: PoolTransactionsTab.SWAPS,
          label: t('poolTransactions.tabs.swaps'),
        },
      ]
    : []),
  {
    value: PoolTransactionsTab.POOL_DETAILS,
    label: t('poolTransactions.tabs.details'),
  },
]);

/**
 * COMPOSABLES
 */
const { isDeepPool, isStablePhantomPool } = usePoolHelpers(
  toRef(props, 'pool')
);
const { t } = useI18n();

/**
 * STATE
 */
const activeTab = ref(tabs.value[0].value);

/**
 * COMPUTED
 */
</script>

<template>
  <div class="mb-5">
    <div>
      <div
        class="flex justify-between items-end mx-4 lg:mx-0 mb-6 border-b dark:border-gray-900"
      >
        <BalTabs v-model="activeTab" :tabs="tabs" noPad class="-mb-px" />
      </div>
    </div>

    <template v-if="isStablePhantomPool || isDeepPool">
      <BoostedActivities
        v-if="activeTab === PoolTransactionsTab.ALL_ACTIVITY"
        :poolActivityType="PoolTransactionsTab.ALL_ACTIVITY"
        :pool="pool"
        :loading="loading"
      />
      <BoostedActivities
        v-else-if="activeTab === PoolTransactionsTab.USER_ACTIVITY"
        :poolActivityType="PoolTransactionsTab.USER_ACTIVITY"
        :pool="pool"
        :loading="loading"
      />
    </template>
    <template v-else>
      <div class="mb-20">
        <Activities
          v-if="activeTab === PoolTransactionsTab.ALL_ACTIVITY"
          :poolActivityType="PoolTransactionsTab.ALL_ACTIVITY"
          :pool="pool"
          :loading="loading"
        />
        <Activities
          v-else-if="activeTab === PoolTransactionsTab.USER_ACTIVITY"
          :poolActivityType="PoolTransactionsTab.USER_ACTIVITY"
          :pool="pool"
          :loading="loading"
        />
        <SwapTransactions
          v-else-if="
            activeTab === PoolTransactionsTab.SWAPS &&
            !isStablePhantomPool &&
            !isDeepPool
          "
          :pool="pool"
          :loading="loading"
        />
        <PoolContractDetails
          v-else-if="activeTab === PoolTransactionsTab.POOL_DETAILS"
          :pool="pool"
        />
      </div>
    </template>
  </div>
</template>
