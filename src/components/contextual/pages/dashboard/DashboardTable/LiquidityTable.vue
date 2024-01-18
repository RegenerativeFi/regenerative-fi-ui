
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { useUserPools } from '@/providers/local/user-pools.provider';
import StakePreviewModal from '@/components/contextual/pages/pool/staking/StakePreviewModal.vue';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
import { PoolAction } from '../../pools/types';

/**
 * STATE
 */
const showStakeModal = ref(false);
const stakePool = ref<Pool | undefined>();
const networkName = configService.network.shortName;
const hiddenColumns = ['poolVolume', 'migrate', 'lockEndDate', 'volume'];

/**
 * PROVIDERS
 */
providePoolStaking();

/**
 * COMPOSABLES
 */
const { isWalletReady, isWalletConnecting } = useWeb3();
const { t } = useI18n();
const {
  unstakedPools,
  userPoolShares,
  refetchAllUserPools,
  isLoading: isLoadingPools,
} = useUserPools();
const defaultPoolActions = [
  PoolAction.Stake,
  PoolAction.Add,
  PoolAction.Remove,
];

/**
 * COMPUTED
 */
const noPoolsLabel = computed(() => {
  return isWalletReady.value || isWalletConnecting.value
    ? t('noUnstakedInvestments', [networkName])
    : t('connectYourWallet');
});

const poolsToRenderKey = computed(() => JSON.stringify(unstakedPools.value));

/**
 * METHODS
 */
function handleStake(pool: Pool) {
  showStakeModal.value = true;
  stakePool.value = pool;
}

function handleModalClose() {
  refetchAllUserPools();
  showStakeModal.value = false;
}

async function handleStakeSuccess() {
  await refetchAllUserPools();
}

onMounted(() => {
  refetchAllUserPools();
});
</script>

<template>
  <div>
    <BalStack vertical spacing="sm">
      <PoolsTable
        :key="poolsToRenderKey"
        :isLoading="isWalletReady && isLoadingPools"
        :data="unstakedPools"
        :shares="userPoolShares"
        :noPoolsLabel="noPoolsLabel"
        sortColumn="myBalance"
        :hiddenColumns="hiddenColumns"
        :defaultPoolActions="defaultPoolActions"
        showPoolShares
        showActions
        @trigger-stake="handleStake"
      />
    </BalStack>
    <StakePreviewModal
      v-if="stakePool"
      :pool="stakePool"
      :isVisible="showStakeModal"
      action="stake"
      @close="handleModalClose"
      @success="handleStakeSuccess"
    />
  </div>
</template>

<!-- 
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
      :data="data?.pools || []"
      noResultsLabel="No pools"
      :isLoading="isLoading"
      skeletonClass="pools-table-loading-height"
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
      <template #iconColumnCell="pool">
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
            />
          </div>
          <PoolsTableExtraInfo :pool="pool" />
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
      </template>
      <template #actionsCell="pool">
        <PoolsTableActionSelector
          v-if="defaultPoolActions"
          :defaultPoolActions="defaultPoolActions"
          :pool="pool"
          :showPokeAction="false"
          :showMigrateGaugeAction="false"
          @click:add="addLiquidity(pool.id)"
          @click:remove="removeLiquidity(pool.id)"
          @click:unstake="pool => emit('triggerUnstake', pool)"
          @click:stake="pool => emit('triggerStake', pool)"
          @click:vote="emit('triggerVote')"
          @click:migrate-gauge="goToPoolPage(pool.id)"
          @click:poke="pool => emit('triggerCheckpoint', pool)"
        />
        <PoolsTableActionsCell
          v-else
          :pool="pool"
          :poolsType="poolsType"
          @click:stake="pool => emit('triggerStake', pool)"
          @click:unstake="pool => emit('triggerUnstake', pool)"
          @click:migrate="pool => navigateToPoolMigration(pool)"
        />
      </template>
    </BalTable>
  </BalCard>
</template> -->
