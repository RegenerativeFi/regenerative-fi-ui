<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { ethers } from 'ethers';
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
    action: 'deposit' | 'withdraw';
    vault?: any;
    available?: string | number;
    title?: string;
    contractAddress?: string;
  }>(),
  { available: '0' }
);

const emit = defineEmits<{
  (
    e: 'confirm',
    payload: { action: 'deposit' | 'withdraw'; amount: number }
  ): void;
  (e: 'success', receipt: TransactionReceipt): void;
  (e: 'close'): void;
}>();

const depositAmount = ref('');
const loading = ref(false);
const withdrawPercent = ref('');
const selectedPercent = ref<number | null>(null);
const showFireworks = ref(false);

const { getProvider, account } = useWeb3();
const { getTokenApprovalActions } = useTokenApprovalActions();
const { txState } = useTxState();
const { addTransaction } = useTransactions();

const DEFAULT_DECIMALS = 18;

const approvalActions = ref<TransactionActionInfo[]>([]);
const stCeloComposable = ref<any>(null);

const displayedAvailable = computed(() => {
  if (Number(props.available) > 0) return String(props.available);
  if (
    stCeloComposable.value &&
    stCeloComposable.value.vault &&
    stCeloComposable.value.vault.available
  ) {
    return String(stCeloComposable.value.vault.available);
  }
  return '0';
});

const actions = computed(() => {
  if (props.action !== 'deposit') return [];
  return [
    ...approvalActions.value,
    {
      label: 'Deposit',
      loadingLabel: 'Depositing',
      confirmingLabel: 'Confirming',
      action: submit,
      stepTooltip: 'Deposit stCELO into vault',
    },
  ];
});

const formattedFiat = computed(() => {
  const amt = Number(depositAmount.value) || 0;
  return (amt * 1).toFixed(2);
});

const availableNum = computed(() => Number(displayedAvailable.value) || 0);

const withdrawAmount = computed(() => {
  const p = Number(selectedPercent.value ?? withdrawPercent.value) || 0;
  return (availableNum.value * p) / 100;
});

const formattedWithdrawAmount = computed(() => {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 5,
  }).format(withdrawAmount.value);
});

const canDeposit = computed(() => {
  const v = Number(depositAmount.value);
  return v > 0 && v <= Number(displayedAvailable.value);
});

const canWithdraw = computed(
  () => withdrawAmount.value > 0 && withdrawAmount.value <= availableNum.value
);

async function submit() {
  txState.init = true;
  try {
    await setApprovalActions();
    txState.confirming = true;

    const tokenAddr =
      props.contractAddress || (props.vault && props.vault.contractAddress);
    const vaultAddr = '0x794163F6f73dA948D1392cedE445e851e9681cEc';
    const prov = getProvider();
    const signer = (prov as any).getSigner();
    const vaultWithSigner = new ethers.Contract(
      vaultAddr,
      ['function deposit(uint256)'],
      signer
    );
    const tokenWithSigner = new ethers.Contract(
      tokenAddr,
      ['function decimals() view returns (uint8)'],
      signer
    );
    let decimals = DEFAULT_DECIMALS;
    try {
      decimals = Number(await tokenWithSigner.decimals());
    } catch (e) {
      // ignore if decimals fails
    }
    const amountBn = ethers.utils.parseUnits(
      String(depositAmount.value || '0'),
      decimals
    );
    const tx = await vaultWithSigner.deposit(amountBn);
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'invest',
      summary: `Deposit ${depositAmount.value} stCELO`,
      // details: {

      // },
    });
    return tx;
  } catch (error) {
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

function confirmWithdraw() {
  if (!canWithdraw.value) return;
  loading.value = true;
  setTimeout(() => {
    emit('confirm', {
      action: 'withdraw',
      amount: Number(withdrawAmount.value),
    });
    loading.value = false;
    emit('close');
  }, 5000);
}

function onStepsSuccess(receipt: TransactionReceipt, confirmedAt?: string) {
  showFireworks.value = true;
  txState.receipt = receipt;
  txState.confirmedAt = confirmedAt || new Date().toISOString();
  txState.confirmed = true;
  txState.confirming = false;
  loading.value = false;
  // update local available from composable if present
  try {
    if (props.contractAddress) {
      const st = useStCelo(props.contractAddress);
      st.fetchOnchainBalance(
        props.contractAddress,
        undefined,
        getProvider ? getProvider() : undefined
      );
    }
  } catch (e) {
    console.error('Failed to fetch balances', e);
  }
  emit('success', receipt);
  // emit('close'); // Remove auto-close to show confirmation
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
    if (props.action === 'deposit') {
      await setApprovalActions();
    }
    stCeloComposable.value = useStCelo(tokenAddr);
    try {
      await stCeloComposable.value.fetchOnchainBalance(
        tokenAddr,
        account.value,
        getProvider ? getProvider() : undefined
      );
    } catch (e) {
      console.error('Failed to fetch balances', e);
    }
  } else {
    const stop = watch(account, async newAccount => {
      if (newAccount) {
        if (props.action === 'deposit') {
          await setApprovalActions();
        }
        stCeloComposable.value = useStCelo(tokenAddr);
        try {
          await stCeloComposable.value.fetchOnchainBalance(
            tokenAddr,
            newAccount,
            getProvider ? getProvider() : undefined
          );
        } catch (e) {
          console.error('Failed to fetch balances', e);
        }
        stop();
      }
    });
  }
});

watch(depositAmount, async () => {
  if (props.action === 'deposit' && account.value) {
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
      <!-- añadir padding horizontal y ajustar vertical -->
      <template v-if="action === 'deposit'">
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
      </template>

      <template v-if="action === 'withdraw'">
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
      </template>
      <div class="mt-4"><hr class="border-t border-gray-200" /></div>
    </div>

    <template #footer>
      <div v-if="action === 'withdraw'" class="flex flex-row gap-3 w-full">
        <BalBtn
          outline
          class="flex-1 w-full"
          label="Cancel"
          :disabled="loading"
          @click="$emit('close')"
        />
        <BalBtn
          :disabled="!canWithdraw || loading"
          :label="loading ? 'Processing...' : 'Withdraw'"
          class="flex-1 w-full"
          color="gradient"
          @click="confirmWithdraw"
        />
      </div>
    </template>

    <template v-if="action === 'deposit'">
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
    </template>
  </BalModal>
</template>
