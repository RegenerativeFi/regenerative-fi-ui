<template>
  <div class="xl:container flex flex-col gap-8 px-4 xl:mx-auto pt-[30px]">
    <div class="flex flex-row gap-4">
      <BalCard class="flex-1 p-8 card-gap">
        <template #header>
          <div class="flex flex-row flex-1 justify-between items-center">
            <h4 class="text-lg font-medium">Your Vaults Deposits</h4>
          </div>
        </template>
        <div>
          <div class="flex flex-row gap-2 items-center">
            <p class="text-xl font-medium">$134.48</p>
          </div>
        </div>
      </BalCard>

      <BalCard class="flex-1 p-8 card-gap">
        <template #header>
          <div class="flex flex-row flex-1 justify-between items-center">
            <h4 class="text-lg font-medium">Your Vaults Deposits</h4>
          </div>
        </template>
        <div>
          <div class="flex flex-row gap-2 items-center">
            <p class="text-xl font-medium">$134.48</p>
          </div>
        </div>
      </BalCard>
    </div>
    <div>
      <h2 class="text-xl font-medium leading-5 !mb-4">Claimable Incentives</h2>
    </div>
    <div class="grid grid-cols-3 gap-4">
      <!-- Primera columna: la única VaultCard real -->
      <div>
        <template v-if="!isLoading">
          <VaultCard
            v-if="vaults.length > 0"
            :title="vaults[0].title"
            :apy="vaults[0].apy"
            :deposit="vaults[0].deposit"
            :depositRaw="vaults[0].depositRaw"
            :available="vaults[0].available"
            :icon="vaults[0].icon"
            :contractAddress="vaults[0].contractAddress"
          />
          <!-- Si no hay vaults, dejar el espacio en blanco -->
          <div
            v-else
            class="flex justify-center items-center h-full text-gray-300"
          >
            &nbsp;
          </div>
        </template>

        <template v-else>
          <!-- skeleton simple mientras carga -->
          <div class="p-6 h-40 bg-gray-100 rounded animate-pulse"></div>
        </template>
      </div>

      <!-- Columnas 2 y 3: espacios vacíos para mantener el layout -->
      <div class="flex justify-center items-center h-full text-gray-300">
        &nbsp;
      </div>
      <div class="flex justify-center items-center h-full text-gray-300">
        &nbsp;
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VaultCard from '@/components/VaultCard.vue';
import { useVaults } from '@/composables/vaults/index';
import { onMounted } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';

const { vaults, isLoading, fetchBalances } = useVaults();
const { account, getProvider } = useWeb3();

console.debug('vaults', vaults);

onMounted(async () => {
  // si existe una vault con contractAddress, fetch balance for connected account
  if (vaults.length > 0 && vaults[0].contractAddress && account.value) {
    await fetchBalances(
      vaults[0].contractAddress,
      account.value,
      getProvider ? getProvider() : undefined
    );
  }
});
</script>
