<template>
  <BalCard class="flex-1">
    <template #header>
      <div class="flex justify-between items-center w-full">
        <div v-if="!placeholder" class="flex gap-3 items-center">
          <div class="flex justify-center items-center w-10 h-10 rounded-full">
            <img :src="icon" alt="icon" class="w-8 h-8 rounded-full" />
          </div>
          <h4 class="text-lg font-medium">{{ title }}</h4>
        </div>
        <div v-else class="h-10" />

        <div v-if="!placeholder" class="flex items-center">
          <BalTooltip placement="top" noPad>
            <template #activator>
              <div
                class="flex gap-1 items-center py-2 px-4 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                <span class="font-medium">APY:</span>
                <span class="font-semibold">{{ formattedApy }}%</span>
              </div>
            </template>
            <div
              class="w-56 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <!-- Total APY Header -->
              <div
                class="py-3 px-4 pb-3 bg-blue-50 rounded-t-lg border-b border-gray-200 dark:border-gray-700 dark:bg-blue-900/20"
              >
                <div class="flex justify-between items-center">
                  <span
                    class="text-xs font-medium text-gray-600 dark:text-gray-400"
                  >
                    Total APY
                  </span>
                  <span class="text-lg font-bold text-gray-900 dark:text-white">
                    {{ formattedApy }}%
                  </span>
                </div>
              </div>

              <!-- APY Components -->
              <div v-if="apy && apy.length > 0" class="py-3 px-4 space-y-2">
                <div
                  v-for="component in apy"
                  :key="component.token"
                  class="flex justify-between items-center py-2 text-sm"
                >
                  <div class="flex gap-2 items-center">
                    <img
                      v-if="component.icon"
                      :src="component.icon"
                      :alt="component.token"
                      class="w-5 h-5 rounded-full"
                    />
                    <span
                      v-else
                      class="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"
                    />
                    <span class="font-medium text-gray-700 dark:text-gray-300">
                      {{ component.token }}
                    </span>
                  </div>
                  <span class="font-semibold text-gray-900 dark:text-white">
                    {{ component.value }}%
                  </span>
                </div>
              </div>
            </div>
          </BalTooltip>
        </div>
      </div>
    </template>
    <!-- Header divider (extend to card edges compensating internal padding) -->
    <div class="-mx-6">
      <hr class="border-t border-gray-200 dark:border-gray-700" />
    </div>

    <div>
      <div
        v-if="placeholder"
        class="flex justify-center items-center p-6 h-full bg-transparent rounded-xl border-2 border-dashed border-teal-200"
      >
        <div class="text-sm text-gray-300">&nbsp;</div>
      </div>

      <div v-else class="mt-4">
        <div
          class="p-6 text-center rounded-xl border-2 border-dashed border-teal-200 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-800"
        >
          <div class="text-sm text-gray-500">My Deposit</div>
          <div class="flex gap-1 justify-center items-center mt-3">
            <!-- Vault Token Icon (stCELO) -->
            <div class="flex relative items-center">
              <img
                :src="depositTokenIcon"
                alt="vault-token"
                class="w-7 h-7 rounded-full"
              />
            </div>
            <!-- Deposit Amount -->
            <div class="text-2xl font-semibold">{{ formattedDeposit }}</div>
          </div>
        </div>

        <!-- Footer divider (extend to card edges compensating internal padding) -->
        <hr class="my-6 -mx-6 border-t border-gray-200 dark:border-gray-700" />

        <div class="flex flex-row gap-4 items-center">
          <!-- Abrir modal en lugar de emitir directamente -->

          <BalBtn
            v-if="Number(deposit) > 0"
            label="Withdraw"
            outline
            color="blue"
            class="flex-1 w-full h-12"
            @click="openWithdrawModal"
          />

          <BalBtn
            label="Deposit"
            color="gradient"
            class="flex-1 w-full h-12"
            @click="openDepositModal"
          />
        </div>
      </div>
    </div>
  </BalCard>

  <!-- Withdraw Modal -->
  <VaultWithdrawModal
    :show="showWithdraw"
    :vault="{ title, apy, deposit, icon, depositTokenIcon }"
    :available="deposit"
    :availableRaw="depositRaw"
    :contractAddress="contractAddress"
    :vaultComposable="vaultComposable"
    :acceptedTokens="acceptedWithdrawTokens"
    @close="closeWithdraw"
    @success="handleSucess"
  />

  <VaultDepositModal
    :show="showDeposit"
    :vault="{ title, apy, deposit, icon, depositTokenIcon }"
    :available="available"
    :availableStCelo="availableStCelo"
    :contractAddress="contractAddress"
    :vaultComposable="vaultComposable"
    :acceptedTokens="acceptedDepositTokens"
    @close="closeDeposit"
    @success="handleSucess"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import VaultDepositModal from '@/components/modals/VaultDepositModal.vue';
import VaultWithdrawModal from '@/components/modals/VaultWithdrawModal.vue';
import type { ApyComponent, VaultComposable } from '@/composables/vaults/types';
import { VAULT_TOKENS } from '@/composables/vaults/config';
import BalTooltip from './_global/BalTooltip/BalTooltip.vue';

const props = defineProps<{
  title?: string;
  apy?: ApyComponent[];
  deposit: string;
  depositRaw: string;
  available?: number | string;
  availableStCelo?: number | string;
  icon?: string;
  depositTokenIcon?: string;
  placeholder?: boolean;
  contractAddress: string;
  vaultComposable?: VaultComposable;
}>();

const emit = defineEmits<{
  (e: 'success', contractAddress?: string): void;
}>();

// Build accepted tokens from centralized config
const acceptedDepositTokens = computed(() => [
  {
    ...VAULT_TOKENS.CELO,
    balance: props.available?.toString() || '0',
  },
  {
    ...VAULT_TOKENS.STCELO,
    balance: props.availableStCelo?.toString() || '0',
  },
]);

const acceptedWithdrawTokens = computed(() => [
  {
    ...VAULT_TOKENS.STCELO,
    balance: props.deposit?.toString() || '0',
  },
  {
    ...VAULT_TOKENS.CELO,
    balance: props.available?.toString() || '0',
  },
]);

const showWithdraw = ref(false);
const showDeposit = ref(false);
const depositAmount = ref('');

const formattedDeposit = computed(() => {
  const num = Number(props.deposit) || 0;
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 5,
  }).format(num);
});

const formattedApy = computed(() => {
  if (!props.apy || props.apy.length === 0) return 0;
  return props.apy.reduce((sum, component) => sum + component.value, 0);
});

const handleSucess = () => {
  // emit contract address so parent can refetch only this vault
  emit('success', props.contractAddress);
};

const openWithdrawModal = () => {
  showWithdraw.value = true;
};

const closeWithdraw = () => {
  showWithdraw.value = false;
};

const openDepositModal = () => {
  showDeposit.value = true;
};

const closeDeposit = () => {
  showDeposit.value = false;
  depositAmount.value = '';
};
</script>
