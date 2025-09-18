<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import BalModal from '@/components/_global/BalModal/BalModal.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import BalActionSteps from '@/components/_global/BalActionSteps/BalActionSteps.vue';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import useWeb3 from '@/services/web3/useWeb3';
import useStCelo from '@/composables/vaults/stCelo';
import { useTxState } from '@/composables/useTxState';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { TransactionActionInfo } from '@/types/transactions';
import useTokenApprovalActions from '@/composables/approvals/useTokenApprovalActions';
import { ApprovalAction } from '@/composables/approvals/types';
import useTransactions from '@/composables/useTransactions';

const props = withDefaults(
  defineProps<{
    show: boolean;
    vault?: any;
    available?: string | number;
    title?: string;
    contractAddress: string;
  }>(),
  { available: '0' }
);

const emit = defineEmits<{
  (e: 'success', receipt: TransactionReceipt): void;
  (e: 'close'): void;
}>();

const depositAmount = ref('');
const loading = ref(false);
const showFireworks = ref(false);

const { getProvider, account } = useWeb3();
const { getTokenApprovalActions } = useTokenApprovalActions();
const { txState } = useTxState();
const { addTransaction } = useTransactions();

const approvalActions = ref<TransactionActionInfo[]>([]);
const stCeloComposable = useStCelo(props.contractAddress);

const displayedAvailable = computed(() => {
  if (Number(props.available) > 0) return String(props.available);

  return String(stCeloComposable.vault.available);
});

const actions = computed(() => [
  ...approvalActions.value,
  {
    label: 'Deposit',
    loadingLabel: 'Depositing',
    confirmingLabel: 'Confirming',
    action: submit,
    stepTooltip: 'Deposit stCELO into vault',
  },
]);

const formattedFiat = computed(() => {
  const amt = Number(depositAmount.value) || 0;
  return (amt * 1).toFixed(2);
});

const canDeposit = computed(() => {
  const v = Number(depositAmount.value);
  return v > 0 && v <= Number(displayedAvailable.value);
});

async function submit() {
  txState.init = true;
  try {
    await setApprovalActions();
    txState.confirming = true;

    const tx = await stCeloComposable.depositTx(Number(depositAmount.value));
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'invest',
      summary: `Deposit ${depositAmount.value} stCELO`,
    });
    return tx;
  } catch (error) {
    console.error('Deposit error', error);
    txState.confirming = false;
    throw new Error('Failed to submit transaction.', {
      cause: error,
    });
  } finally {
    txState.init = false;
  }
}

function onDepositInput(e: Event) {
  depositAmount.value = (e.target as HTMLInputElement).value;
}

function setMaxDeposit() {
  depositAmount.value = displayedAvailable.value;
}

function handleClose() {
  showFireworks.value = false;
  emit('close');
}

function onStepsSuccess(receipt: TransactionReceipt, confirmedAt?: string) {
  showFireworks.value = true;
  txState.receipt = receipt;
  txState.confirmedAt = confirmedAt || new Date().toISOString();
  txState.confirmed = true;
  txState.confirming = false;
  loading.value = false;
  emit('success', receipt);
}

function onStepsFailed() {
  txState.confirming = false;
  loading.value = false;
}

async function setApprovalActions() {
  if (!account.value) return;
  const tokenAddr =
    props.contractAddress || (props.vault && props.vault.contractAddress);
  if (!tokenAddr) return;
  const amt = Number(depositAmount.value);
  if (amt <= 0) return;

  const tokenApprovalActions = await getTokenApprovalActions({
    amountsToApprove: [
      {
        address: tokenAddr,
        amount: amt.toString(),
      },
    ],
    spender:
      props.vault?.contractAddress ||
      '0x794163F6f73dA948D1392cedE445e851e9681cEc',
    actionType: ApprovalAction.Locking,
    forceMax: false,
  });

  approvalActions.value = tokenApprovalActions;
}

onMounted(async () => {
  const tokenAddr =
    props.contractAddress || (props.vault && props.vault.contractAddress);
  if (!tokenAddr) return;

  if (account.value) {
    await setApprovalActions();
    try {
      await stCeloComposable.fetchOnchainBalance(
        tokenAddr,
        account.value,
        getProvider ? getProvider() : undefined
      );
    } catch (e) {
      console.error('Failed to fetch balances', e);
    }
  }
});

watch(depositAmount, async () => {
  if (account.value) {
    await setApprovalActions();
  }
});
</script>

<template>
  <BalModal :show="show" :fireworks="showFireworks" @close="handleClose">
    <template #header>
      <div class="flex gap-3 items-center">
        <div class="flex justify-center items-center w-10 h-10 rounded-full">
          <img :src="vault?.icon" alt="token" class="w-8 h-8 rounded-full" />
        </div>
        <div>
          <h3 class="text-2xl font-semibold">{{ vault?.title || title }}</h3>
        </div>
      </div>
    </template>

    <div>
      <label class="block mb-3 text-sm">Deposit</label>

      <div class="p-4 bg-white rounded-lg border border-gray-200">
        <div class="flex justify-between items-start">
          <input
            v-model="depositAmount"
            type="number"
            min="0"
            step="any"
            :disabled="loading"
            placeholder="0.00"
            class="w-full text-4xl font-semibold leading-tight placeholder-gray-300 bg-transparent outline-none"
            @input="onDepositInput"
          />

          <div class="flex flex-col items-end ml-4">
            <div
              class="flex gap-3 items-center py-2 px-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div
                class="flex justify-center items-center w-8 h-8 bg-white rounded-full"
              >
                <img :src="vault?.icon" alt="token" class="w-6 h-6" />
              </div>
              <div class="font-medium">CELO</div>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center text-sm text-gray-500">
          <div>${{ formattedFiat }}</div>
          <div class="flex gap-2 items-center">
            <div>
              Available:
              <span class="font-medium">{{ displayedAvailable }}</span>
            </div>
            <button
              class="text-sm font-medium underline"
              :disabled="loading"
              @click.prevent="setMaxDeposit"
            >
              MAX
            </button>
          </div>
        </div>
      </div>
      <div class="mt-4"><hr class="border-t border-gray-200" /></div>
    </div>

    <transition>
      <BalActionSteps
        v-if="!txState.confirmed || !txState.receipt"
        :actions="actions"
        primaryActionType="invest"
        :disabled="!canDeposit || loading"
        class="mt-4"
        @success="onStepsSuccess"
        @failed="onStepsFailed"
      />
      <div v-else class="mt-4">
        <ConfirmationIndicator :txReceipt="txState.receipt" />
        <BalBtn
          class="flex-1 mt-4 w-full"
          label="Close"
          color="gradient"
          :disabled="loading"
          @click="$emit('close')"
        />
      </div>
    </transition>
  </BalModal>
</template>
