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
import useTransactions from '@/composables/useTransactions';
import useSwapping from '@/composables/swap/useSwapping';
import useTokenApprovalActions from '@/composables/approvals/useTokenApprovalActions';
import { TransactionActionInfo } from '@/types/transactions';
import useNetwork from '@/composables/useNetwork';
import { ApprovalAction } from '@/composables/approvals/types';
import { useSwapState } from '@/composables/swap/useSwapState';
import { ethers } from 'ethers';

const props = withDefaults(
  defineProps<{
    show: boolean;
    vault?: any;
    available?: string;
    availableRaw?: string;
    itle?: string;
    contractAddress: string;
    vaultComposable?: any;
  }>(),
  { available: '0' }
);

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'close'): void;
}>();

const loading = ref(false);
const withdrawPercent = ref('');
const selectedPercent = ref<number | null>(null);
const showFireworks = ref(false);

const { account } = useWeb3();
const { txState } = useTxState();
const { addTransaction } = useTransactions();
const { networkConfig } = useNetwork();
const stCeloComposable = computed(() => props.vaultComposable || useStCelo());
const { getTokenApprovalActions } = useTokenApprovalActions();
const tokenApprovalActions = ref<TransactionActionInfo[]>([]);
const {
  tokenInAddress,
  tokenOutAddress,
  tokenInAmount,
  tokenOutAmount,
  setTokenInAddress,
  setTokenOutAddress,
  setTokenInAmount,
  setTokenOutAmount,
  setInitialized,
} = useSwapState();

const swapping = useSwapping(
  ref(true), // exactIn
  tokenInAddress,
  tokenInAmount,
  tokenOutAddress,
  tokenOutAmount
);

const actions = computed((): TransactionActionInfo[] => {
  const arr: any[] = [
    {
      label: 'Withdraw',
      loadingLabel: 'Withdrawing',
      confirmingLabel: 'Confirming',
      action: submitWithdraw,
      stepTooltip: 'Withdraw stCELO from vault',
    },
    ...tokenApprovalActions.value,
    {
      label: 'Swap stCELO to CELO',
      loadingLabel: 'Swapping',
      confirmingLabel: 'Confirming swap',
      action: submitSwap,
      stepTooltip: 'Swap withdrawn stCELO to CELO',
    },
  ];
  return arr as TransactionActionInfo[];
});

const rawWithdrawAmount = computed(() => {
  const availableBN = ethers.BigNumber.from(props.availableRaw || '0');
  const percent = Number(selectedPercent.value ?? withdrawPercent.value) || 0;

  if (percent <= 0 || percent > 100) return ethers.constants.Zero;

  const amount = availableBN.mul(percent).div(100);

  return amount;
});

watch(rawWithdrawAmount, async newVal => {
  await setTokenApprovalActions();
  setTokenInAmount(ethers.utils.formatUnits(newVal.toString(), 18));
  await swapping.handleAmountChange();
});

// Updates token approval actions for the current withdraw amount
async function setTokenApprovalActions() {
  if (!account.value) return;
  const amt = ethers.utils.formatUnits(rawWithdrawAmount.value, 18);
  if (!amt || Number(amt) <= 0) {
    tokenApprovalActions.value = [];
    return;
  }

  try {
    const actions = await getTokenApprovalActions({
      amountsToApprove: [
        {
          address: props.contractAddress || '',
          amount: amt,
        },
      ],
      spender: networkConfig.addresses.vault,
      actionType: ApprovalAction.Swapping,
      forceMax: false,
    });
    tokenApprovalActions.value = actions;
  } catch (e) {
    console.error('Failed to get token approval actions', e);
    tokenApprovalActions.value = [];
  }
}

const formattedWithdrawAmount = computed(() => {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 5,
  }).format(parseFloat(tokenOutAmount.value || '0'));
});

const canWithdraw = computed(
  () =>
    rawWithdrawAmount.value.gt(0) &&
    rawWithdrawAmount.value.lte(
      ethers.BigNumber.from(props.availableRaw || '0')
    )
);

async function submitWithdraw() {
  txState.init = true;
  try {
    txState.confirming = true;

    const tx = await stCeloComposable.value.withdrawTx(
      rawWithdrawAmount.value.toString()
    );
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'withdraw',
      summary: `Withdraw ${ethers.utils.formatUnits(
        rawWithdrawAmount.value,
        18
      )} stCELO`,
    });
    return tx;
  } catch (error) {
    txState.confirming = false;
    throw new Error('Failed to submit withdraw transaction.', {
      cause: error,
    });
  } finally {
    txState.init = false;
  }
}

async function submitSwap() {
  return swapping.swap(() => {
    swapping.resetAmounts();

    emit('success');
    emit('close');
  });
}

function selectPercent(p: number) {
  selectedPercent.value = p;
  withdrawPercent.value = '';
}

function onWithdrawPercentInput(e: Event) {
  selectedPercent.value = null;
  withdrawPercent.value = (e.target as HTMLInputElement).value;
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
}

function onStepsFailed() {
  txState.confirming = false;
  loading.value = false;
}

onMounted(async () => {
  const tokenAddr = props.contractAddress;
  if (!tokenAddr) return;

  setTokenInAddress(tokenAddr);
  setTokenOutAddress('0x471EcE3750Da237f93B8E339c536989b8978a438'); // CELO
  setTokenInAmount('0');
  setTokenOutAmount('0');
  setInitialized(true);

  if (account.value) {
    try {
      await stCeloComposable.value.refetch();

      // initialize approval actions for the current amount (may be 0)
      await setTokenApprovalActions();
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
        <div class="flex justify-center items-center w-10 h-10 rounded-full">
          <img :src="vault?.icon" alt="token" class="w-8 h-8 rounded-full" />
        </div>
        <div>
          <h3 class="text-2xl font-semibold">{{ vault?.title }}</h3>
        </div>
      </div>
    </template>

    <div>
      <label class="block mb-4 text-sm">Select your withdrawal amount</label>

      <div class="grid grid-cols-5 gap-3 mb-2">
        <button
          type="button"
          class="flex col-span-1 justify-center items-center h-12 font-semibold bg-gray-50 rounded-xl"
          @click.prevent="selectPercent(10)"
        >
          10%
        </button>
        <button
          type="button"
          class="flex col-span-1 justify-center items-center h-12 font-semibold bg-gray-50 rounded-xl"
          @click.prevent="selectPercent(25)"
        >
          25%
        </button>
        <button
          type="button"
          class="flex col-span-1 justify-center items-center h-12 font-semibold bg-gray-50 rounded-xl"
          @click.prevent="selectPercent(50)"
        >
          50%
        </button>
        <button
          type="button"
          class="flex col-span-1 justify-center items-center h-12 font-semibold bg-gray-50 rounded-xl"
          @click.prevent="selectPercent(100)"
        >
          100%
        </button>

        <div class="col-span-1">
          <div
            class="flex justify-end items-center px-2 h-12 rounded-lg border"
          >
            <input
              v-model="withdrawPercent"
              type="number"
              min="0"
              max="100"
              step="any"
              class="w-full text-right bg-transparent outline-none"
              placeholder="0"
              @input="onWithdrawPercentInput"
            />
            <div class="pl-2 text-sm">%</div>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center mb-2">
        <div class="text-sm text-gray-500">Withdraw Preview</div>
        <div class="text-xs text-gray-400">incl. fees</div>
      </div>

      <div
        class="py-2 text-center bg-pill-light rounded-lg border border-pool-tvl border-dashed"
      >
        <div class="flex gap-3 justify-between px-4">
          <div class="text-xl font-semibold text-refi-text">
            {{ formattedWithdrawAmount }}
          </div>
          <div class="flex gap-2 items-center">
            <img :src="vault?.icon" alt="token" class="w-6 h-6" />
            <div class="font-medium">CELO</div>
          </div>
        </div>
      </div>
      <div class="mt-4"><hr class="border-t border-gray-200" /></div>
    </div>

    <transition>
      <BalActionSteps
        v-if="!txState.confirmed || !txState.receipt"
        :actions="actions"
        primaryActionType="withdraw"
        :disabled="!canWithdraw || loading"
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
