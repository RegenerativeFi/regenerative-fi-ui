<template>
  <div
    class="xl:container flex flex-col gap-4 sm:gap-8 px-3 sm:px-4 pt-5 xl:mx-auto sm:pt-[30px]"
  >
    <!-- Summary Stats -->
    <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <BalCard class="flex-1 p-3 sm:p-4 card-gap">
        <template #header>
          <h4 class="text-sm sm:text-base font-normal text-[#7B7B7B]">
            Your Vaults Deposits
          </h4>
        </template>
        <p class="text-lg sm:text-xl font-medium">
          ${{ totalDepositsUsd.toFixed(2) }}
        </p>
      </BalCard>

      <BalCard class="flex-1 p-3 sm:p-4 card-gap">
        <template #header>
          <h4 class="text-sm sm:text-base font-normal text-[#7B7B7B]">
            Average APY
          </h4>
        </template>
        <p class="text-lg sm:text-xl font-medium">{{ averageApy }}%</p>
      </BalCard>
      <BalCard class="flex-1 p-3 sm:p-4 card-gap">
        <template #header>
          <h4 class="text-sm sm:text-base font-normal text-[#7B7B7B]">
            Total Deposits in Vaults
          </h4>
        </template>
        <p class="text-lg sm:text-xl font-medium">
          {{ globalDepositsUsd.toFixed(2) }} $
        </p>
      </BalCard>
    </div>

    <!-- Vaults Title -->
    <h2 class="text-lg sm:text-xl font-medium leading-5">
      Regenerative Vaults
    </h2>

    <!-- Vaults Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <div v-for="vault in vaults" :key="vault.id">
        <VaultCard
          :title="vault.title"
          :apy="vault.apy"
          :deposit="vault.deposit"
          :depositRaw="vault.depositRaw"
          :available="vault.available"
          :availableStCelo="vault.availableStCelo"
          :icon="vault.icon"
          :depositTokenIcon="vault.depositTokenIcon"
          :protocolIcon="vault.protocolIcon"
          :protocolInfo="vault.protocolInfo"
          :vaultCapacityLimit="vault.vaultCapacityLimit"
          :vaultCapacityUsed="vault.vaultCapacityUsed"
          :userDepositLimit="vault.userDepositLimit"
          :userRemainingDeposit="vault.userRemainingDeposit"
          :limitTokenSymbol="vault.limitTokenSymbol"
          :contractAddress="vault.contractAddress"
          :vaultComposable="getComposable(vault.contractAddress)"
          :tokenPrice="vault.price"
          @success="handleSuccess"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VaultCard from '@/components/VaultCard.vue';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import { useVaults } from '@/composables/vaults/index';

const {
  vaults,
  refetchVault,
  getComposable,
  totalDepositsUsd,
  globalDepositsUsd,
  averageApy,
} = useVaults();

const handleSuccess = async (contractAddress?: string) => {
  const addr = contractAddress || vaults[0]?.contractAddress;
  try {
    await refetchVault(addr);
  } catch (e) {
    console.error('Failed to refetch vault:', e);
  }
};
</script>
