<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ColumnDefinition } from '@/components/_global/BalTable/types';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { GaugePool } from '@/composables/useClaimsData';
import { Gauge } from '@/services/balancer/gauges/types';
// import { isStableLike, isComposableStable } from '@/composables/usePoolHelpers';
import { useTokens } from '@/providers/tokens.provider';
import useWeb3 from '@/services/web3/useWeb3';
import { bnum } from '@/lib/utils';
import { formatUnits } from '@ethersproject/units';
import ClaimRewardsBtn from '@/components/btns/ClaimRewardsBtn/ClaimRewardsBtn.vue';
// import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';
// import PoolWarningTooltip from '@/components/pool/PoolWarningTooltip.vue';
// import { isSameAddress } from '@/lib/utils';
// import { PoolType } from '@regenerative/sdk';
// import axios from 'axios';
import { useRewardsQuery } from '@/composables/queries/useRewardsQuery';

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
  rawReward: any;
};

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { upToLargeBreakpoint } = useBreakpoints();
const { fNum, toFiat } = useNumbers();
const { isWalletReady } = useWeb3();
const { getToken } = useTokens();
const { data, isLoading } = useRewardsQuery();

/**
 * STATE
 */
const columns = ref<ColumnDefinition<RewardRow>[]>([
  {
    name: 'Token',
    id: 'rewards',
    accessor: 'rewardTokens',
    Cell: 'rewardsColumnCell',
    align: 'left',
    width: 300,
  },
  {
    name: 'Amount',
    id: 'rewards',
    accessor: 'rewardTokens',
    Cell: 'amountColumnCell',
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

// -----------------------------------------------------------------------------
// Computed: proteger accesos y normalizar decimals
// -----------------------------------------------------------------------------
const rewardsData = computed((): RewardRow[] => {
  if (isLoading.value || !data.value) return []; // Asegurarse de que no se procesan datos mientras se cargan
  console.debug('Rewards data:', data.value);

  return data.value
    .flatMap(rewardGroup => {
      return rewardGroup.rewards.map(reward => {
        // Si no hay token en el payload, ignorar esa entrada
        if (!reward || !reward.token) {
          console.warn('Skipping reward without token:', reward);
          return null;
        }

        // Guardar que breakdowns exista y tenga elementos antes de acceder
        if (!reward.breakdowns || reward.breakdowns.length === 0) return null;

        // Calcular la cantidad pendiente (amount - claimed) usando bnum para evitar BigInt
        const remainingRawBN = bnum(String(reward.amount)).minus(
          bnum(String(reward.claimed))
        );
        if (remainingRawBN.lte(0)) return null;

        // Preferir información de token del provider, si existe; si no, usar la del payload
        const tokenInfo = getToken(reward.token.address) || reward.token;

        // Normalizar amount usando decimals del token (asegurar number)
        const decimals = Number(reward.token?.decimals ?? 18);
        const remainingRaw = remainingRawBN.toString();
        const amount = formatUnits(remainingRaw || '0', decimals); // string

        // Calcular valor en fiat usando helper del repo (usar dirección conocida)
        const tokenAddress = tokenInfo?.address || reward.token.address || '';
        const valueStr = toFiat(amount, tokenAddress);

        return {
          gauge: {} as Gauge,
          pool: {} as GaugePool,
          rewardTokens: [
            {
              token: tokenInfo,
              amount: amount, // dejar sin formatear aquí; la tabla usa fNum para mostrar
              value: valueStr,
            },
          ],
          // Guardar totalValue como string numérica sin formatear; el accessor lo formatea
          totalValue: valueStr,
          rawReward: reward,
        };
      });
    })
    .filter((r): r is RewardRow => r !== null);
});

const totalValue = computed((): string =>
  rewardsData.value
    .reduce((acc, row) => acc.plus(bnum(row.totalValue)), bnum(0))
    .toString()
);

const noRewardsLabel = computed(() => {
  if (isWalletReady.value) {
    return 'No Incentives ready to claim. <p>Explore opportunities in the <a class="underline" href="/pools">Pools</a> page or via <a class="underline" href="https://app.merkl.xyz" target="_blank" rel="noopener noreferrer">Merkl</a>.</p>';
  }
  return t('connectYourWallet');
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
      :noResultsIsHtml="true"
      :isLoading="isLoading"
      skeletonClass="h-24"
      :square="upToLargeBreakpoint"
    >
      <!-- <template #poolColumnCell="{ pool }">
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
      </template> -->

      <template #rewardsColumnCell="{ rewardTokens }">
        <div class="py-4 px-6">
          <div
            v-for="reward in rewardTokens"
            :key="reward.token.address"
            class="flex items-center mb-2 last:mb-0"
          >
            <BalAsset :address="reward.token.address" :size="24" class="mr-2" />
            <span class="text-sm">
              {{ reward.token.symbol }}
            </span>
          </div>
        </div>
      </template>

      <template #amountColumnCell="{ rewardTokens }">
        <div class="py-4 px-6">
          <div
            v-for="reward in rewardTokens"
            :key="reward.token.address"
            class="flex items-center mb-2 last:mb-0"
          >
            <span class="text-sm">
              {{ fNum(reward.amount, FNumFormats.token) }}
            </span>
          </div>
        </div>
      </template>

      <template #totalValueCell>
        <div class="flex justify-end">
          {{ fNum(totalValue, FNumFormats.fiat) }}
        </div>
      </template>

      <template
        #claimColumnCell="{ gauge, totalValue: rowTotalValue, rawReward }"
      >
        <div class="py-4 px-6">
          <ClaimRewardsBtn
            :gauge="gauge"
            :fiatValue="rowTotalValue"
            rewardType="Merkl"
            :rewards="[rawReward]"
          />
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>
