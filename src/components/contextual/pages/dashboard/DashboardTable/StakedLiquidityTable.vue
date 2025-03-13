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
const showUnstakeModal = ref(false);
const poolToUnstake = ref<Pool | undefined>();
const showRestakeModal = ref(false);
const poolToRestake = ref<Pool | undefined>();

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
  stakedPools,
  userPoolShares,
  refetchAllUserPools,
  isLoading: isLoadingPools,
} = useUserPools();
const defaultPoolActions = [
  PoolAction.Unstake,
  PoolAction.Add,
  PoolAction.Vote,
];

/**
 * COMPUTED
 */
const noPoolsLabel = computed(() => {
  return isWalletReady.value || isWalletConnecting.value
    ? t('noInvestments', [networkName])
    : t('connectYourWallet');
});

const poolsToRenderKey = computed(() => JSON.stringify(stakedPools.value));

/**
 * METHODS
 */
function handleUnstake(pool: Pool) {
  showUnstakeModal.value = true;
  poolToUnstake.value = pool;
}

function handleModalClose() {
  refetchAllUserPools();
  showUnstakeModal.value = false;
}

async function handleUnstakeSuccess() {
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
        :data="stakedPools"
        :shares="userPoolShares"
        :noPoolsLabel="noPoolsLabel"
        sortColumn="myBalance"
        :hiddenColumns="hiddenColumns"
        :defaultPoolActions="defaultPoolActions"
        showPoolShares
        showActions
        showStakeActions
        poolsType="staked"
        @trigger-unstake="handleUnstake"
      />
    </BalStack>
    <StakePreviewModal
      v-if="poolToUnstake"
      :pool="poolToUnstake"
      :isVisible="showUnstakeModal"
      action="unstake"
      @close="handleModalClose"
      @success="handleUnstakeSuccess"
    />
    <!-- Restake modal -->
    <StakePreviewModal
      v-if="poolToRestake"
      :pool="poolToRestake"
      :isVisible="showRestakeModal"
      action="restake"
      @close="handleModalClose"
      @success="handleUnstakeSuccess"
    />
  </div>
</template>
