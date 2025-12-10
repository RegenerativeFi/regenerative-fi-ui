<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { useUserPools } from '@/providers/local/user-pools.provider';
import { useVaults } from '@/composables/vaults/index';
import StakePreviewModal from '@/components/contextual/pages/pool/staking/StakePreviewModal.vue';
import VaultDepositModal from '@/components/modals/VaultDepositModal.vue';
import VaultWithdrawModal from '@/components/modals/VaultWithdrawModal.vue';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
import { PoolAction } from '../../pools/types';

/**
 * STATE
 */
const showStakeModal = ref(false);
const stakePool = ref<Pool | undefined>();
const showVaultDepositModal = ref(false);
const showVaultWithdrawModal = ref(false);
const selectedVault = ref<any>(undefined);
const networkName = configService.network.shortName;
const hiddenColumns = [
  'poolVolume',
  'migrate',
  'lockEndDate',
  'totalLiquidity',
  'volume',
];

/**
 * PROVIDERS
 */
providePoolStaking();

/**
 * COMPOSABLES
 */
const { isWalletReady, isWalletConnecting, account } = useWeb3();
const { t } = useI18n();
const {
  unstakedPools,
  userPoolShares,
  refetchAllUserPools,
  isLoading: isLoadingPools,
} = useUserPools();
const { vaults, fetchBalances, getComposable } = useVaults();
const defaultPoolActions = [PoolAction.Add, PoolAction.Remove];

/**
 * COMPUTED
 */

const vaultsData = computed(() => {
  return vaults.reduce((acc, vault) => {
    acc[vault.contractAddress] = {
      id: vault.contractAddress,
      address: vault.contractAddress,
      title: vault.title,
      icon: vault.icon,
      deposit: vault.deposit,
      depositRaw: vault.depositRaw,
      available: vault.available,
      apy: vault.apy,
      contractAddress: vault.contractAddress,
      price: vault.price,
      tokens: [
        {
          balance: vault.deposit,
          decimals: 18,
          symbol: vault.title,
          price: vault.price || 0,
          address: vault.tokenAddress || '',
        },
      ],
    };
    return acc;
  }, {} as Record<string, any>);
});

const noPoolsLabel = computed(() => {
  return isWalletReady.value || isWalletConnecting.value
    ? t('noInvestments', [networkName])
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

function handleVaultDeposit(pool: Pool) {
  selectedVault.value = pool;
  showVaultDepositModal.value = true;
}

function handleVaultWithdraw(pool: Pool) {
  selectedVault.value = pool;
  showVaultWithdrawModal.value = true;
}

function handleVaultModalClose() {
  selectedVault.value = undefined;
  showVaultDepositModal.value = false;
  showVaultWithdrawModal.value = false;
}

function handleModalClose() {
  refetchAllUserPools();
  showStakeModal.value = false;
}

async function handleStakeSuccess() {
  await refetchAllUserPools();
}

async function handleVaultSuccess() {
  handleVaultModalClose();
  // Refetch vault balances
  if (selectedVault.value?.contractAddress && account.value) {
    await fetchBalances(selectedVault.value.contractAddress, account.value);
  }
}

onMounted(() => {
  refetchAllUserPools();
  // Fetch vault balances for connected account
  if (vaults.length > 0 && account.value) {
    vaults.forEach(vault => {
      if (vault.contractAddress) {
        fetchBalances(vault.contractAddress, account.value);
      }
    });
  }
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
        :vaults="vaultsData"
        showPoolShares
        showActions
        @trigger-stake="handleStake"
        @trigger-vault-deposit="handleVaultDeposit"
        @trigger-vault-withdraw="handleVaultWithdraw"
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
    <VaultDepositModal
      v-if="selectedVault"
      :show="showVaultDepositModal"
      :vault="selectedVault"
      :available="selectedVault.available"
      :contractAddress="selectedVault.contractAddress"
      :vaultComposable="getComposable(selectedVault.contractAddress)"
      @close="handleVaultModalClose"
      @success="handleVaultSuccess"
    />
    <VaultWithdrawModal
      v-if="selectedVault"
      :show="showVaultWithdrawModal"
      :vault="selectedVault"
      :available="selectedVault.depositRaw"
      :availableRaw="selectedVault.depositRaw"
      :contractAddress="selectedVault.contractAddress"
      :vaultComposable="getComposable(selectedVault.contractAddress)"
      @close="handleVaultModalClose"
      @success="handleVaultSuccess"
    />
  </div>
</template>
