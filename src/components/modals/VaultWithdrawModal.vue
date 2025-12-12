<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import BalModal from '@/components/_global/BalModal/BalModal.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import BalActionSteps from '@/components/_global/BalActionSteps/BalActionSteps.vue';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import { useTxState } from '@/composables/useTxState';
import useTransactions from '@/composables/useTransactions';
import { ethers } from 'ethers';

interface WithdrawToken {
  symbol: string;
  address: string;
  icon: string;
  balance: string;
}

const props = withDefaults(
  defineProps<{
    show: boolean;
    vault?: any;
    available?: string;
    availableRaw?: string;
    title?: string;
    contractAddress: string;
    vaultComposable?: any;
    acceptedTokens?: WithdrawToken[];
  }>(),
  { available: '0', acceptedTokens: () => [] }
);

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'close'): void;
}>();

const withdrawAmount = ref('');
const showFireworks = ref(false);

const { txState } = useTxState();
const { addTransaction } = useTransactions();

const stCeloComposable = computed(() => props.vaultComposable);

const rawWithdrawAmount = computed(() => {
  const amount = Number(withdrawAmount.value) || 0;
  return amount <= 0
    ? ethers.constants.Zero
    : ethers.utils.parseUnits(amount.toString(), 18);
});

const canWithdraw = computed(
  () =>
    rawWithdrawAmount.value.gt(0) &&
    rawWithdrawAmount.value.lte(
      ethers.BigNumber.from(props.availableRaw || '0')
    )
);

const actions = computed(() => [
  {
    label: 'Withdraw',
    loadingLabel: 'Withdrawing',
    confirmingLabel: 'Confirming',
    action: submitWithdraw,
    stepTooltip: 'Withdraw stCELO from vault',
  },
]);

async function submitWithdraw() {
  const tx = await stCeloComposable.value.withdrawTx(
    rawWithdrawAmount.value.toString()
  );
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'withdraw',
    summary: `Withdraw ${withdrawAmount.value} stCELO`,
  });
  return tx;
}

function handleClose() {
  withdrawAmount.value = '';
  showFireworks.value = false;
  txState.confirmed = false;
  txState.receipt = undefined;
  emit('close');
}

function onStepsSuccess() {
  // Set transaction state
  txState.confirmed = true;
  txState.confirming = false;

  showFireworks.value = true;
  emit('success');

  // Refetch balances immediately after successful withdrawal
  stCeloComposable.value?.refetch?.().catch((e: any) => {
    console.error('Failed to refetch balances:', e);
  });
}

onMounted(async () => {
  if (props.contractAddress) {
    try {
      await stCeloComposable.value?.refetch?.();
    } catch (e) {
      console.error('Failed to fetch balances', e);
    }
  }
});
</script>

<template>
  <BalModal :show="show" :fireworks="showFireworks" @close="handleClose">
    <template #header>
      <div class="flex gap-3 items-center">
        <img :src="vault?.icon" alt="token" class="w-8 h-8 rounded-full" />
        <h3 class="text-2xl font-semibold">{{ vault?.title }}</h3>
      </div>
    </template>

    <div v-if="!txState.confirmed || !txState.receipt">
      <!-- My Position -->
      <label class="block mb-4 text-sm">My position (stCELO)</label>
      <div
        class="p-4 mb-6 bg-blue-50 dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-gray-700"
      >
        <div class="flex gap-2 items-center">
          <img :src="vault?.icon" alt="stcelo" class="w-8 h-8 rounded-full" />
          <span class="text-2xl font-bold">
            {{
              Number(available).toLocaleString('en-US', {
                maximumFractionDigits: 5,
              })
            }}
          </span>
        </div>
      </div>

      <!-- Withdraw Input -->
      <div
        class="p-4 mb-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div class="flex gap-2 items-center mb-3">
          <input
            v-model="withdrawAmount"
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            class="flex-1 text-2xl font-semibold placeholder-gray-300 bg-transparent outline-none"
          />
        </div>
        <div class="flex justify-between items-center text-sm text-gray-500">
          <span
            >Balance:
            <span class="font-medium">{{
              Number(available).toLocaleString('en-US', {
                maximumFractionDigits: 5,
              })
            }}</span></span
          >
          <button
            class="font-medium text-blue-600 hover:text-blue-700"
            @click="withdrawAmount = String(available)"
          >
            Max
          </button>
        </div>
      </div>

      <hr class="my-4 border-gray-200 dark:border-gray-700" />

      <BalActionSteps
        :actions="actions"
        primaryActionType="withdraw"
        :disabled="!canWithdraw || txState.confirming"
        class="mt-4"
        @success="onStepsSuccess"
      />
    </div>

    <div v-else>
      <!-- Success Header with Icon -->
      <div class="flex gap-3 items-center mb-6">
        <div
          class="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-green-100 rounded-full dark:bg-green-900/30"
        >
          <svg
            class="w-6 h-6 text-green-600 dark:text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Withdrawal Successful
        </h3>
      </div>

      <!-- Withdrawal Summary -->
      <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
        You withdrew
        <span class="font-semibold text-gray-900 dark:text-gray-100"
          >{{ withdrawAmount }} stCELO</span
        >
        from the vault.
      </p>

      <!-- Transaction Details -->
      <div class="pb-6 mb-6 border-b border-gray-200 dark:border-gray-700">
        <ConfirmationIndicator :txReceipt="txState.receipt" />
      </div>

      <!-- Close Button -->
      <BalBtn
        class="w-full h-12"
        label="Continue"
        color="gradient"
        @click="handleClose"
      />
    </div>
  </BalModal>
</template>
