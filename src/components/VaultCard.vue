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
          <div
            class="flex gap-1 items-center py-2 px-4 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg"
          >
            <span class="font-medium">APY:</span>
            <span class="font-semibold">{{ formattedApy }}%</span>
            <div class="flex justify-center items-center w-6 h-6 rounded-full">
              <img :src="icon" alt="token" class="w-4 h-4 rounded-full" />
            </div>
          </div>
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
          <div class="flex gap-3 justify-center items-center mt-3">
            <img :src="icon" alt="token" class="w-7 h-7" />
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

          <!-- Deposit Button - Disabled due to CGP218 -->
          <BalTooltip placement="top" noPad class="flex-1">
            <template #activator>
              <BalBtn
                label="Deposit"
                color="gray"
                class="w-full h-12 opacity-50 cursor-not-allowed"
                disabled
              />
            </template>
            <div
              class="overflow-hidden w-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <div
                class="py-3 px-4 border-b border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/20"
              >
                <div class="flex gap-2 items-center">
                  <svg
                    class="w-4 h-4 text-amber-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span
                    class="text-sm font-semibold text-amber-700 dark:text-amber-400"
                  >
                    Deposits Disabled
                  </span>
                </div>
              </div>
              <div class="py-3 px-4">
                <p class="text-sm leading-5 text-gray-600 dark:text-gray-300">
                  Following
                  <span class="font-medium text-gray-900 dark:text-white"
                    >CGP218</span
                  >, the stCELO Validator strategy no longer yields returns.
                </p>
                <p
                  class="mt-2 text-xs leading-4 text-gray-500 dark:text-gray-400"
                >
                  You can still withdraw your stCELO from the vault.
                </p>
              </div>
            </div>
          </BalTooltip>
        </div>
      </div>
    </div>
  </BalCard>

  <!-- Withdraw Modal -->
  <VaultWithdrawModal
    :show="showWithdraw"
    :vault="{ title, apy, deposit, icon }"
    :available="deposit"
    :availableRaw="depositRaw"
    :contractAddress="contractAddress"
    :vaultComposable="vaultComposable"
    @close="closeWithdraw"
    @success="handleSucess"
  />

  <VaultDepositModal
    :show="showDeposit"
    :vault="{ title, apy, deposit, icon }"
    :available="available"
    :contractAddress="contractAddress"
    :vaultComposable="vaultComposable"
    @close="closeDeposit"
    @success="handleSucess"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import VaultDepositModal from '@/components/modals/VaultDepositModal.vue';
import VaultWithdrawModal from '@/components/modals/VaultWithdrawModal.vue';

const props = defineProps<{
  title?: string;
  apy?: number | string;
  deposit: string;
  depositRaw: string;
  available?: number | string;
  icon?: string;
  placeholder?: boolean;
  contractAddress: string;
  vaultComposable?: any;
}>();
const emit = defineEmits<{
  (e: 'success', contractAddress?: string): void;
}>();

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
  return Number(props.apy) || 0;
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

// const openDepositModal = () => {
//   showDeposit.value = true;
// };

const closeDeposit = () => {
  showDeposit.value = false;
  depositAmount.value = '';
};
</script>
