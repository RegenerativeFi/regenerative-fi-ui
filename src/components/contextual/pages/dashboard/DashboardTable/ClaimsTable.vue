<script setup lang="ts" >
import { useI18n } from 'vue-i18n';
import useBreakpoints from '@/composables/useBreakpoints';
import { ColumnDefinition } from '@/components/_global/BalTable/types';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useWeb3 from '@/services/web3/useWeb3';
import { configService } from '@/services/config/config.service';

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

const isLoading = ref(false);
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
  console.log('GM');
};

const { isWalletReady, isWalletConnecting } = useWeb3();

const { upToLargeBreakpoint } = useBreakpoints();
const networkName = configService.network.shortName;

const noPoolsLabel = computed(() => {
  return isWalletReady.value || isWalletConnecting.value
    ? t('noRewardsToClaim', [networkName])
    : t('connectYourWallet');
});

// const hasCurrentAllocation = computed(() => {
//   return false;
// });
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
      :noResultsLabel="noPoolsLabel"
      :data="[]"
      :isLoading="isLoading"
      skeletonClass="h-24"
      :square="upToLargeBreakpoint"
    >
      <template #iconsColumnCell>
        <div class="flex gap-4 justify-start items-center px-6 w-full">
          <!-- <img :src="RFP" class="w-6 h-6" /> -->
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
          :disabled="!selectedRows.length"
          class="w-fit"
          size="sm"
          @click="handleButtonClick"
          >Claim</BalBtn
        >
      </template>
    </BalTable>
  </BalCard>
</template>
