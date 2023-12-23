<script setup lang="ts">
import { ColumnDefinition } from '@/components/_global/BalTable/types';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers from '@/composables/useNumbers';
import { absMaxApr, fiatValueOf } from '@/composables/usePoolHelpers';
import { useI18n } from 'vue-i18n';
import { Pool } from '@/services/pool/types';
import { APR_THRESHOLD } from '@/constants/pools';
import useDarkMode from '@/composables/useDarkMode';
import TokensWhite from '@/assets/images/icons/tokens_white.svg';
import TokensBlack from '@/assets/images/icons/tokens_black.svg';

const { upToLargeBreakpoint, upToSmallBreakpoint } = useBreakpoints();

const { t } = useI18n();
const { fNum } = useNumbers();
const { darkMode } = useDarkMode();

type Props = {
  data?: Pool[];
  poolsType?: 'unstaked' | 'staked';
  isLoading?: boolean;
  isLoadingMore?: boolean;
  showPoolShares?: boolean;
  noPoolsLabel?: string;
  isPaginated?: boolean;
  sortColumn?: string;
  selectedTokens?: string[];
  hiddenColumns?: string[];
  showBoost?: boolean;
  showActions?: boolean;
  columnStates?: Record<string, string>;
  skeletonClass?: string;
  shares?: Record<string, string>;
  boosts?: Record<string, string>;
  shouldPokePoolsMap?: Record<string, string>;
  hasNonPrefGaugesPoolsAddresses?: string[];
};

const props = withDefaults(defineProps<Props>(), {
  poolsType: 'unstaked',
  isLoadingMore: false,
  showPoolShares: false,
  noPoolsLabel: 'No pools',
  isPaginated: false,
  sortColumn: 'totalLiquidity',
  hiddenColumns: () => [],
  showBoost: false,
  showActions: false,
  columnStates: () => ({}),
  data: () => [],
  selectedTokens: () => [],
  skeletonClass: 'h-64',
});

const wideCompositionWidth = computed(() => {
  if (upToSmallBreakpoint.value) return 250;
  return 350;
});

function balanceValue(pool: Pool): string {
  const bpt = props?.shares?.[pool.id] || '0';
  return fiatValueOf(pool, bpt);
}

const columns = computed<ColumnDefinition<Pool>[]>(() => [
  {
    name: 'Icons',
    id: 'icons',
    accessor: 'uri',
    Header: 'iconColumnHeader',
    Cell: 'iconColumnCell',
    width: 125,
    noGrow: true,
  },
  {
    name: t('composition'),
    id: 'poolName',
    accessor: 'id',
    Cell: 'poolNameCell',
    width: props.hiddenColumns.length >= 2 ? wideCompositionWidth.value : 350,
  },
  {
    name: t('myBalance'),
    accessor: pool =>
      fNum(balanceValue(pool), {
        style: 'currency',
        maximumFractionDigits: 0,
        fixedFormat: true,
      }),
    align: 'right',
    id: 'myBalance',
    hidden: !props.showPoolShares,
    sortKey: pool => Number(balanceValue(pool)),
    width: 160,
    cellClassName: 'font-numeric',
  },
  {
    name: t('poolValue'),
    accessor: pool =>
      fNum(pool.totalLiquidity || 0, {
        style: 'currency',
        maximumFractionDigits: 0,
      }),
    align: 'right',
    id: 'totalLiquidity',
    sortKey: pool => {
      const apr = Number(pool.totalLiquidity);
      if (apr === Infinity || isNaN(apr)) return 0;
      return apr;
    },
    width: 150,
    cellClassName: 'font-numeric',
  },
  {
    name: props.showPoolShares ? t('myApr') : t('apr'),
    Cell: 'aprCell',
    accessor: pool => pool?.apr?.min.toString() || '0',
    align: 'right',
    id: 'apr',
    sortKey: pool => {
      let apr = 0;

      if (pool?.apr) {
        apr = Number(absMaxApr(pool.apr, pool.boost));
      }

      return isFinite(apr) && (pool.apr?.swapFees || 0) < APR_THRESHOLD
        ? apr
        : 0;
    },
    width: 150,
  },
  {
    name: t('actions'),
    Cell: 'actionsCell',
    accessor: 'actions',
    align: 'right',
    id: 'actions',
    hidden: !props.showActions,
    width: 150,
  },
]);
</script>




<template>
  <BalCard
    shadow="lg"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
    exposeOverflow
  >
    <BalTable
      :columns="columns"
      :data="data"
      :noResultsLabel="noPoolsLabel"
      :isLoading="isLoading"
      :isLoadingMore="isLoadingMore"
      :skeletonClass="skeletonClass"
      sticky="both"
      :square="upToLargeBreakpoint"
      isOnlyDescSort
    >
      <template #iconColumnHeader>
        <div class="flex items-center">
          <img
            v-if="darkMode"
            :src="TokensWhite"
            alt="token"
            loading="lazy"
            width="24"
            height="15"
          />
          <img
            v-else
            :src="TokensBlack"
            alt="token"
            loading="lazy"
            width="24"
            height="15"
          />
        </div>
      </template>
      <!-- <template #iconColumnCell="pool">
        <div v-if="!isLoading" class="py-4 px-6" :data-testid="pool?.id">
          <BalAssetSet
            :addresses="iconAddresses(pool)"
            :width="100"
            :size="isMobile ? 28 : 32"
          />
        </div>
      </template>
      <template #poolNameCell="pool">
        <div v-if="!isLoading" class="flex items-center py-4 px-6">
          <div v-if="poolMetadata(pool.id)?.name" class="pr-2 text-left">
            {{ poolMetadata(pool.id)?.name }}
          </div>
          <div v-else>
            <TokenPills
              :tokens="orderedPoolTokens(pool, pool.tokens)"
              :isStablePool="isStableLike(pool.poolType)"
              :selectedTokens="selectedTokens"
              :pickedTokens="selectedTokens"
            />
          </div>
          <PoolsTableExtraInfo :pool="pool" />
        </div>
      </template>
      <template #volumeCell="pool">
        <div
          :key="columnStates.volume"
          class="flex justify-end py-4 px-6 -mt-1 font-numeric"
        >
          <BalLoadingBlock v-if="!pool?.volumeSnapshot" class="w-12 h-4" />
          <span v-else class="text-right">
            {{
              fNum(
                pool?.volumeSnapshot < VOLUME_THRESHOLD
                  ? pool?.volumeSnapshot
                  : '-',
                {
                  style: 'currency',
                  maximumFractionDigits: 0,
                }
              )
            }}
          </span>
        </div>
      </template>
      <template #aprCell="pool">
        <div
          :key="columnStates.aprs"
          :class="[
            'flex justify-end py-4 px-6 -mt-1 font-numeric text-right',
            {
              'text-gray-300 dark:text-gray-600 line-through': isLBP(
                pool.poolType
              ),
            },
          ]"
        >
          <span v-if="!pool?.apr || shouldHideAprs(pool.id)">-</span>
          <template v-else>
            {{ aprLabelFor(pool) }}
            <BalTooltip
              v-if="isLBP(pool.poolType)"
              width="36"
              :text="$t('lbpAprTooltip')"
              iconSize="sm"
              iconClass="ml-1"
            />
            <APRTooltip v-else-if="pool?.apr" :pool="pool" />
          </template>
        </div>
      </template> -->
    </BalTable>
  </BalCard>
</template>


<!-- <template>
  <div>
    <BalStack vertical spacing="sm">
      <h5 class="px-4 xl:px-0">
        {{ $t('staking.unstakedPools') }}
      </h5>
      <PoolsTable
        :isLoading="isWalletReady"
        :data="unstakedPools"
        :shares="userPoolShares"
        :noPoolsLabel="noPoolsLabel"
        sortColumn="myBalance"
        :hiddenColumns="hiddenColumns"
        showPoolShares
        showActions
      />
    </BalStack>
  </div>
</template> -->
