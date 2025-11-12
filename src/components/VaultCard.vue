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

const openDepositModal = () => {
  showDeposit.value = true;
};

const closeDeposit = () => {
  showDeposit.value = false;
  depositAmount.value = '';
};
</script>
