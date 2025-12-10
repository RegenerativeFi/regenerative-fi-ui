<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import BalModal from '@/components/_global/BalModal/BalModal.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import BalActionSteps from '@/components/_global/BalActionSteps/BalActionSteps.vue';
import BalAlert from '@/components/_global/BalAlert/BalAlert.vue';
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
import { useTokens } from '@/providers/tokens.provider';

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

const loading = ref(false);
const withdrawAmount = ref('');
const showFireworks = ref(false);
const showTokenSelector = ref(false);
const selectedTokenAddress = ref('');
const userHasInteracted = ref(false);
const isFetching = ref(false);

const { account } = useWeb3();
const { txState } = useTxState();
const { addTransaction } = useTransactions();
const { networkConfig } = useNetwork();
const { priceFor } = useTokens();
const stCeloComposable = computed(() => props.vaultComposable || useStCelo());

const availableWithdrawTokens = computed(() => {
  return props.acceptedTokens;
});

const selectedWithdrawToken = computed(() => {
  return (
    availableWithdrawTokens.value.find(
      token => token.address === selectedTokenAddress.value
    ) || null
  );
});
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
  const amount = Number(withdrawAmount.value) || 0;
  if (amount <= 0) return ethers.constants.Zero;
  return ethers.utils.parseUnits(amount.toString(), 18);
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

const canWithdraw = computed(
  () =>
    !isFetching.value &&
    rawWithdrawAmount.value.gt(0) &&
    rawWithdrawAmount.value.lte(
      ethers.BigNumber.from(props.availableRaw || '0')
    ) &&
    (!showSlippageAlert.value || acknowledgedSlippage.value)
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

function selectWithdrawToken(token: WithdrawToken) {
  selectedTokenAddress.value = token.address;
  showTokenSelector.value = false;
}

function onWithdrawAmountInput(e: Event) {
  withdrawAmount.value = (e.target as HTMLInputElement).value;
  if (!userHasInteracted.value && withdrawAmount.value) {
    userHasInteracted.value = true;
  }
}

function handleClose() {
  showFireworks.value = false;
  showTokenSelector.value = false;
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

  // Inicializar token selector con stCELO por defecto
  if (availableWithdrawTokens.value.length > 0 && !selectedTokenAddress.value) {
    selectedTokenAddress.value = availableWithdrawTokens.value[0].address;
  }

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

const slippageThreshold = 3; // 3% threshold
const showSlippageAlert = ref(false);
const acknowledgedSlippage = ref(false);

watch(
  [tokenInAmount, tokenOutAmount],
  async ([newTokenInAmount, newTokenOutAmount]) => {
    // Solo calcular slippage si el usuario ha interactuado
    if (!userHasInteracted.value) return;

    isFetching.value = true;
    try {
      const providedRatio =
        newTokenOutAmount && newTokenInAmount > '0'
          ? parseFloat(newTokenOutAmount) / parseFloat(newTokenInAmount)
          : 0;
      const ratioDifference = await calculateRatioDifferenceStCeloCelo(
        providedRatio
      );

      if (ratioDifference !== null && ratioDifference > slippageThreshold) {
        showSlippageAlert.value = true;
      } else {
        showSlippageAlert.value = false;
        acknowledgedSlippage.value = false;
      }
    } finally {
      isFetching.value = false;
    }
  }
);

async function calculateRatioDifferenceStCeloCelo(
  providedRatio: number
): Promise<number | null> {
  try {
    const priceStCelo = priceFor(props.contractAddress);
    const priceCelo = priceFor('0x471EcE3750Da237f93B8E339c536989b8978a438');

    if (priceStCelo > 0 && priceCelo > 0) {
      const marketRatio = priceStCelo / priceCelo;

      if (marketRatio < providedRatio) {
        return 1;
      }

      const absoluteDifference = Math.abs(providedRatio - marketRatio);
      const relativeDifference = (absoluteDifference / marketRatio) * 100;

      return relativeDifference;
    }

    return null;
  } catch (error) {
    console.error('Error calculating ratio difference for stCELO/CELO:', error);
    return null;
  }
}
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
      <label class="block mb-4 text-sm">My position (stCELO)</label>

      <div
        class="p-4 mb-6 bg-blue-50 dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-gray-700"
      >
        <div class="flex gap-2 items-center">
          <img :src="vault?.icon" alt="stcelo" class="w-8 h-8 rounded-full" />
          <span class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{
              Number(available).toLocaleString('en-US', {
                maximumFractionDigits: 5,
              })
            }}
          </span>
        </div>
      </div>

      <div
        class="p-4 mb-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div class="flex gap-2 items-center mb-3">
          <!-- Token Selector Button -->
          <div class="relative">
            <button
              class="flex gap-2 items-center py-2 px-3 text-sm whitespace-nowrap bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 transition-colors"
              :disabled="loading"
              @click="showTokenSelector = !showTokenSelector"
            >
              <img
                :src="selectedWithdrawToken?.icon"
                alt="token"
                class="w-5 h-5 rounded-full"
              />
              <span class="font-medium">{{
                selectedWithdrawToken?.symbol
              }}</span>
            </button>

            <!-- Token Dropdown Menu -->
            <transition
              enterActiveClass="transition ease-out duration-100"
              enterFromClass="transform opacity-0 scale-95"
              enterToClass="transform opacity-100 scale-100"
              leaveActiveClass="transition ease-in duration-75"
              leaveFromClass="transform opacity-100 scale-100"
              leaveToClass="transform opacity-0 scale-95"
            >
              <div
                v-show="showTokenSelector && availableWithdrawTokens.length > 1"
                class="absolute top-full left-0 z-10 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <div class="p-2">
                  <button
                    v-for="token in availableWithdrawTokens"
                    :key="token.address"
                    class="flex gap-3 items-center p-3 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    :class="{
                      'bg-gray-100 dark:bg-gray-700':
                        selectedWithdrawToken?.address === token.address,
                    }"
                    @click="selectWithdrawToken(token)"
                  >
                    <img
                      :src="token.icon"
                      alt="token"
                      class="flex-shrink-0 w-6 h-6 rounded-full"
                    />
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium truncate">
                        {{ token.symbol }}
                      </div>
                      <div class="text-xs text-gray-500 truncate">
                        {{
                          Number(token.balance).toLocaleString('en-US', {
                            maximumFractionDigits: 5,
                          })
                        }}
                      </div>
                    </div>
                    <svg
                      v-if="selectedWithdrawToken?.address === token.address"
                      class="flex-shrink-0 w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </transition>
          </div>

          <!-- Withdraw Amount Input -->
          <input
            v-model="withdrawAmount"
            type="number"
            min="0"
            step="any"
            :disabled="loading"
            placeholder="0.00"
            class="flex-1 min-w-0 text-2xl font-semibold placeholder-gray-300 text-right bg-transparent outline-none"
            @input="onWithdrawAmountInput"
          />
        </div>

        <!-- Balance info row -->
        <div class="flex justify-between items-center text-sm text-gray-500">
          <span class="truncate">
            Balance:
            <span class="font-medium">
              {{
                Number(available).toLocaleString('en-US', {
                  maximumFractionDigits: 5,
                })
              }}
            </span>
          </span>
          <button
            class="flex-shrink-0 ml-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            :disabled="loading"
            @click.prevent="withdrawAmount = String(available)"
          >
            Max
          </button>
        </div>
      </div>

      <hr class="mt-4 border-t border-gray-200 dark:border-gray-700" />
    </div>

    <!-- Loading indicator while fetching slippage data -->
    <transition>
      <div
        v-if="isFetching && userHasInteracted"
        class="flex gap-2 justify-center items-center p-4 mb-4 bg-blue-50 rounded-lg border border-blue-200 dark:border-blue-700 dark:bg-blue-900/20"
      >
        <svg
          class="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span class="text-sm font-medium text-blue-600 dark:text-blue-400">
          Calculating slippage...
        </span>
      </div>
    </transition>

    <transition>
      <BalAlert
        v-if="showSlippageAlert"
        type="warning"
        size="md"
        block
        title="High demand detected"
        class="p-4 mb-4"
      >
        <div class="flex flex-col gap-4 text-sm">
          <p class="text-gray-700 dark:text-gray-300">
            Current demand may cause significant slippage on your withdrawal.
            You can:
          </p>
          <ul
            class="ml-1 space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300"
          >
            <li>Continue anyway</li>
            <li>Withdraw less to reduce slippage</li>
            <li>Wait for lower demand to receive more CELO</li>
          </ul>
          <label
            class="flex gap-3 items-center mt-3 cursor-pointer select-none"
          >
            <input
              v-model="acknowledgedSlippage"
              type="checkbox"
              class="rounded"
            />
            <span class="font-medium text-gray-700 dark:text-gray-300">
              I acknowledge the slippage and want to proceed
            </span>
          </label>
        </div>
      </BalAlert>
    </transition>

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
  </BalModal>
</template>
