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
const hiddenColumns = ['poolVolume', 'migrate', 'lockEndDate', 'volume'];

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
const { vaults, fetchBalances } = useVaults();
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

// async function handleVaultSuccess() {
//   handleVaultModalClose();
//   // Refetch vault balances
//   if (selectedVault.value?.contractAddress && account.value) {
//     await fetchBalances(selectedVault.value.contractAddress, account.value);
//   }
// }

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
    <!-- TODO: Integrate VaultDepositModal and VaultWithdrawModal -->
    <!-- Vault Deposit Modal -->
    <div
      v-if="showVaultDepositModal && selectedVault"
      class="fixed inset-0 z-50"
    >
      <!-- This will be replaced with the actual VaultDepositModal component -->
      <div
        class="absolute inset-0 bg-black/50"
        @click="handleVaultModalClose"
      ></div>
      <div
        class="absolute inset-1/2 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2"
      >
        <h2 class="mb-4 text-xl font-semibold">
          Deposit {{ selectedVault.title }}
        </h2>
        <p class="mb-4 text-gray-600 dark:text-gray-300">
          Available: {{ selectedVault.available }}
        </p>
        <div class="flex gap-3">
          <button
            class="flex-1 py-2 px-4 text-white bg-blue-500 hover:bg-blue-600 rounded"
            @click="handleVaultModalClose"
          >
            Deposit
          </button>
          <button
            class="py-2 px-4 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 rounded"
            @click="handleVaultModalClose"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
    <!-- Vault Withdraw Modal -->
    <div
      v-if="showVaultWithdrawModal && selectedVault"
      class="fixed inset-0 z-50"
    >
      <!-- This will be replaced with the actual VaultWithdrawModal component -->
      <div
        class="absolute inset-0 bg-black/50"
        @click="handleVaultModalClose"
      ></div>
      <div
        class="absolute inset-1/2 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2"
      >
        <h2 class="mb-4 text-xl font-semibold">
          Withdraw {{ selectedVault.title }}
        </h2>
        <p class="mb-4 text-gray-600 dark:text-gray-300">
          Deposit: {{ selectedVault.deposit }}
        </p>
        <div class="flex gap-3">
          <button
            class="flex-1 py-2 px-4 text-white bg-blue-500 hover:bg-blue-600 rounded"
            @click="handleVaultModalClose"
          >
            Withdraw
          </button>
          <button
            class="py-2 px-4 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 rounded"
            @click="handleVaultModalClose"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
