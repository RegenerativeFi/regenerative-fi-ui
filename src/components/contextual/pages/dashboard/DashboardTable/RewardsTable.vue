<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ColumnDefinition } from '@/components/_global/BalTable/types';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { GaugePool, useClaimsData } from '@/composables/useClaimsData';
import { Gauge } from '@/services/balancer/gauges/types';
import { isStableLike, isComposableStable } from '@/composables/usePoolHelpers';
import { useTokens } from '@/providers/tokens.provider';
import useWeb3 from '@/services/web3/useWeb3';
import { bnum } from '@/lib/utils';
import { formatUnits } from '@ethersproject/units';
import ClaimRewardsBtn from '@/components/btns/ClaimRewardsBtn/ClaimRewardsBtn.vue';
import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';
import PoolWarningTooltip from '@/components/pool/PoolWarningTooltip.vue';
import { isSameAddress } from '@/lib/utils';

/**
 * TYPES
 */
export type RewardRow = {
  gauge: Gauge;
  pool: GaugePool;
  rewardTokens: Array<{
    token: any;
    amount: string;
    value: string;
  }>;
  totalValue: string;
};

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { upToLargeBreakpoint } = useBreakpoints();
const { fNum } = useNumbers();
const { isWalletReady } = useWeb3();
const { getToken, priceFor } = useTokens();

const { gauges, gaugePools, isLoading: isClaimsLoading } = useClaimsData();

/**
 * STATE
 */
const columns = ref<ColumnDefinition<RewardRow>[]>([
  {
    name: t('pool'),
    id: 'pool',
    accessor: 'pool',
    Cell: 'poolColumnCell',
    align: 'left',
    width: 200,
  },
  {
    name: t('rewards'),
    id: 'rewards',
    accessor: 'rewards',
    Cell: 'rewardsColumnCell',
    align: 'left',
    width: 300,
  },
  {
    name: t('value'),
    id: 'value',
    align: 'right',
    width: 150,
    totalsCell: 'totalValueCell',
    accessor: ({ totalValue }) => fNum(totalValue, FNumFormats.fiat),
  },
  {
    name: '',
    id: 'claim',
    accessor: 'claim',
    Cell: 'claimColumnCell',
    width: 150,
  },
]);

/**
 * COMPUTED
 */
const rewardsData = computed((): RewardRow[] => {
  if (!isWalletReady.value) return [];

  // Get gauges with rewards
  const gaugesWithRewards = gauges.value.filter(
    gauge => gauge.rewardTokens.length > 0
  );

  return gaugesWithRewards.reduce<RewardRow[]>((arr, gauge) => {
    const pool = gaugePools.value.find(pool => pool.id === gauge.poolId);

    if (!pool) return arr;

    // Calculate total reward value
    const totalRewardValue = Object.values(gauge.claimableRewards).reduce(
      (acc, reward) => acc.plus(reward),
      bnum(0)
    );

    if (totalRewardValue.lte(0)) return arr;

    // Format reward tokens
    const rewardTokens = Object.entries(gauge.claimableRewards).map(
      ([tokenAddress, amount]) => {
        const token = getToken(tokenAddress);
        // Convert from wei to human readable format
        const formattedAmount = formatUnits(amount, token?.decimals || 18);
        // Calculate value using the formatted amount
        const value = bnum(formattedAmount)
          .times(priceFor(tokenAddress))
          .toString();

        return {
          token,
          amount: formattedAmount,
          value,
        };
      }
    );

    arr.push({
      gauge,
      pool,
      rewardTokens,
      totalValue: rewardTokens
        .reduce((sum, token) => bnum(sum).plus(token.value), bnum(0))
        .toString(),
    });

    return arr;
  }, []);
});

const totalValue = computed((): string =>
  rewardsData.value
    .reduce((acc, row) => acc.plus(row.totalValue), bnum(0))
    .toString()
);

const noRewardsLabel = computed(() => {
  return isWalletReady.value ? t('noRewardsToClaim') : t('connectYourWallet');
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
      :data="rewardsData"
      :noResultsLabel="noRewardsLabel"
      :isLoading="isClaimsLoading"
      skeletonClass="h-24"
      :square="upToLargeBreakpoint"
    >
      <template #poolColumnCell="{ pool }">
        <div class="flex items-center py-4 px-6">
          <div class="text-left">
            <TokenPills
              :tokens="
                isComposableStable(pool.poolType)
                  ? pool.tokens.filter(
                      token => !isSameAddress(token.address, pool.address)
                    )
                  : pool.tokens
              "
              :isStablePool="isStableLike(pool.poolType)"
            />
            <PoolWarningTooltip :pool="pool" />
          </div>
        </div>
      </template>

      <template #rewardsColumnCell="{ rewardTokens }">
        <div class="py-4 px-6">
          <div
            v-for="reward in rewardTokens"
            :key="reward.token.address"
            class="flex items-center mb-2 last:mb-0"
          >
            <BalAsset :address="reward.token.address" :size="24" class="mr-2" />
            <span class="text-sm">
              {{ fNum(reward.amount, FNumFormats.token) }}
              {{ reward.token.symbol }}
            </span>
          </div>
        </div>
      </template>

      <template #totalValueCell>
        <div class="flex justify-end">
          {{ fNum(totalValue, FNumFormats.fiat) }}
        </div>
      </template>

      <template #claimColumnCell="{ gauge, totalValue: rowTotalValue }">
        <div class="py-4 px-6">
          <ClaimRewardsBtn :gauge="gauge" :fiatValue="rowTotalValue" />
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>
