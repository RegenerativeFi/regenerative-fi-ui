<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import useBreakpoints from '@/composables/useBreakpoints';
import { ColumnDefinition } from '@/components/_global/BalTable/types';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
/**
 * TYPES
 */
export type ClaimRow = {
  token: string;
  amount: string;
  value: string;
};

/**
 * PROPS & EMITS
 */

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { fNum } = useNumbers();

/**
 * STATE
 */
//  ref<ColumnDefinition<RewardRow>[]>
const columns = ref<ColumnDefinition<ClaimRow>[]>([
  {
    name: t('token'),
    id: 'icons',
    accessor: 'icons',
    Cell: 'iconsColumnCell',
    width: 50,
    noGrow: true,
  },
  {
    name: t('amount'),
    id: 'amount',
    align: 'right',
    width: 150,
    totalsCell: 'totalAmountCell',
    accessor: ({ amount }) => `${fNum(amount, FNumFormats.token)} BAL`,
  },
  {
    name: t('value'),
    id: 'value',
    align: 'right',
    width: 150,
    totalsCell: 'totalValueCell',
    accessor: ({ value }) => fNum(value, FNumFormats.fiat),
  },
  {
    name: '',
    id: 'claim',
    accessor: 'claim',
    Cell: 'claimColumnCell',
    totalsCell: 'claimTotalCell',
    width: 150,
  },
]);

const rewardsData = [];

const { upToLargeBreakpoint } = useBreakpoints();
</script>

<template>
  <BalCard
    shadow="lg"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :columns="columns"
      :data="rewardsData"
      :isLoading="true"
      skeletonClass="h-24"
      :square="upToLargeBreakpoint"
    >
      <template #claimColumnCell="{ amount }">
        <div class="py-4 px-6">
          <ClaimBalBtn :label="$t('claim')" :amount="amount" />
        </div>
      </template>
      <!-- <template #totalAmountCell>
        <div class="flex justify-end">
          {{ fNum(totalClaimAmount, FNumFormats.token) }} BAL
        </div>
      </template>
      <template #totalValueCell>
        <div class="flex justify-end">
          {{ fNum(totalClaimValue, FNumFormats.fiat) }}
        </div>
      </template>
      <template #claimTotalCell>
        <ClaimBalBtn
          :label="$t('claimAll')"
          :gauges="allGauges"
          :amount="totalClaimAmount"
        />
      </template> -->
    </BalTable>
  </BalCard>
</template>
