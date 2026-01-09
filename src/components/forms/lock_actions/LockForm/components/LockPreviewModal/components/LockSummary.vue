<script setup lang="ts">
import { format } from 'date-fns';
import { computed } from 'vue';

import { PRETTY_DATE_FORMAT } from '@/components/forms/lock_actions/constants';
import { LockType } from '@/components/forms/lock_actions/LockForm/types';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useVeBal from '@/composables/useVeBAL';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';
import { TokenInfo } from '@/types/TokenList';

import VeBalTooltipExplainer from './VeBalTooltipExplainer.vue';

/**
 * TYPES
 */
type Props = {
  lockablePoolTokenInfo: TokenInfo;
  totalLpTokens: string;
  lockEndDate: string;
  lockAmount: string;
  expectedVeBalAmount: string;
  lockType: LockType[];
  veBalLockInfo?: VeBalLockInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum, toFiat } = useNumbers();
const { veBalTokenInfo } = useVeBal();

/**
 * COMPUTED
 */
const fiatTotalLockedAmount = computed(() => {
  if (!props.veBalLockInfo) return '0';
  return toFiat(
    props.veBalLockInfo.lockedAmount,
    props.lockablePoolTokenInfo.address
  );
});

const fiatTotalLockAmount = computed(() =>
  toFiat(props.lockAmount, props.lockablePoolTokenInfo.address)
);

const fiatTotalLpTokens = computed(() =>
  toFiat(props.totalLpTokens, props.lockablePoolTokenInfo.address)
);

const isExtendLockOnly = computed(
  () =>
    props.lockType.length === 1 && props.lockType.includes(LockType.EXTEND_LOCK)
);

const isIncreaseLockOnly = computed(
  () =>
    props.lockType.length === 1 &&
    props.lockType.includes(LockType.INCREASE_LOCK)
);

// const fiatWeeklyYield = computed(() => '0');
</script>

<template>
  <div class="summary-table">
    <h6 class="p-2">
      {{ $t('getVeBAL.previewModal.summary.title') }}
    </h6>
    <div class="p-2">
      <div class="summary-item-row">
        <div>
          {{
            isExtendLockOnly || isIncreaseLockOnly
              ? $t('getVeBAL.previewModal.summary.totalAlreadyLocked')
              : $t('getVeBAL.previewModal.summary.totalToLock')
          }}
        </div>
        <div>
          {{
            fNum(
              isIncreaseLockOnly ? fiatTotalLockedAmount : fiatTotalLpTokens,
              FNumFormats.fiat
            )
          }}
        </div>
      </div>
      <div v-if="isIncreaseLockOnly" class="summary-item-row">
        <div>
          {{ $t('getVeBAL.previewModal.summary.increasedLockAmount') }}
        </div>
        <div>{{ fNum(fiatTotalLockAmount, FNumFormats.fiat) }}</div>
      </div>
      <div class="summary-item-row">
        <div>
          {{
            isExtendLockOnly
              ? $t('getVeBAL.previewModal.summary.newLockEndDate')
              : $t('getVeBAL.previewModal.summary.lockEndDate')
          }}
        </div>
        <div>{{ format(new Date(lockEndDate), PRETTY_DATE_FORMAT) }}</div>
      </div>
      <div class="summary-item-row">
        <div>{{ $t('getVeBAL.previewModal.summary.totalVotingEscrow') }}</div>
        <div class="flex items-center">
          {{ fNum(expectedVeBalAmount, FNumFormats.token) }}
          {{ veBalTokenInfo?.symbol }}
          <VeBalTooltipExplainer
            :expectedVeBalAmount="expectedVeBalAmount"
            :lockEndDate="lockEndDate"
            :totalLpTokens="totalLpTokens"
          />
        </div>
      </div>
      <!-- <div class="summary-item-row">
        <div>
          {{ $t('getVeBAL.previewModal.summary.potentialWeeklyYield') }}
        </div>
        <div>{{ fNum(fiatWeeklyYield, FNumFormats.fiat) }}</div>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
.summary-table {
  @apply border dark:border-gray-700 divide-y dark:divide-gray-700 rounded-lg mt-4;
}

.summary-item-row {
  @apply flex justify-between pb-2;
}
</style>
