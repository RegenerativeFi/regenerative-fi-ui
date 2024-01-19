<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import useBreakpoints from '@/composables/useBreakpoints';
import { ColumnDefinition } from '@/components/_global/BalTable/types';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import RFP from '@/assets/images/icons/coins/RFP.svg';
import { useAllocations } from '@/composables/campaigns/useAllocations';

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
const { currentAllocation, isLoading, claimReward } = useAllocations();
watch(currentAllocation, () => {
  console.debug(currentAllocation.value);
});
/**
 * STATE
 */
//  ref<ColumnDefinition<RewardRow>[]>
const columns = ref<ColumnDefinition<ClaimRow>[]>([
  {
    name: t('token'),
    id: 'icon',
    accessor: 'uri',
    Cell: 'iconsColumnCell',
    width: 100,
    noGrow: true,
  },
  {
    name: t('amount'),
    id: 'amount',
    align: 'right',
    width: 150,
    totalsCell: 'totalAmountCell',
    accessor: ({ amount }) => `${fNum(amount, FNumFormats.token)}`,
  },
  {
    name: t('value'),
    id: 'value',
    align: 'right',
    width: 150,
    totalsCell: 'totalValueCell',
    accessor: ({ value }) => value,
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

const selectedRows = ref([]);

const handleButtonClick = () => {
  claimReward();
};

const rewardsData = [
  {
    icon: RFP,
    amount: currentAllocation,
    value: 'NFT XP',
  },
];

const { upToLargeBreakpoint } = useBreakpoints();

const hasCurrentAllocation = computed(() => {
  return parseInt(currentAllocation.value as string) > 0;
});
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
      sticky="both"
      :data="hasCurrentAllocation ? rewardsData : []"
      :isLoading="isLoading"
      skeletonClass="h-24"
      :square="upToLargeBreakpoint"
    >
      <template #iconsColumnCell>
        <div class="flex gap-4 justify-start items-center px-6 w-full">
          <img :src="RFP" class="w-6 h-6" />
          <p class="text-base font-normal">RFPs</p>
        </div>
      </template>
      <template #claimColumnCell="{ row }">
        <div class="py-4 px-6">
          <input
            v-model="selectedRows"
            :value="row"
            type="checkbox"
            class="w-5 h-5 bg-transparent border-2 border-disabled cursor-pointer"
          />
        </div>
      </template>
      <template #claimTotalCell>
        <BalBtn
          :color="selectedRows.length ? 'blue' : 'gray'"
          class="w-fit"
          size="sm"
          @click="handleButtonClick"
          >Claim</BalBtn
        >
      </template>
    </BalTable>
  </BalCard>
</template>
