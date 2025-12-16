<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import BalModal from '@/components/_global/BalModal/BalModal.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import BalActionSteps from '@/components/_global/BalActionSteps/BalActionSteps.vue';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import { useTxState } from '@/composables/useTxState';
import useTransactions from '@/composables/useTransactions';
import useWeb3 from '@/services/web3/useWeb3';
import useSwapping from '@/composables/swap/useSwapping';
import useTokenApprovalActions from '@/composables/approvals/useTokenApprovalActions';
import useNetwork from '@/composables/useNetwork';
import { useSwapState } from '@/composables/swap/useSwapState';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { TransactionActionInfo } from '@/types/transactions';
import { ApprovalAction } from '@/composables/approvals/types';
import { ethers } from 'ethers';
import { TOKEN_ADDRESSES, VAULT_TOKENS } from '@/composables/vaults/config';
import type {
  VaultComposable,
  VaultTokenInfo,
} from '@/composables/vaults/types';

// Use centralized config
const STCELO_ADDRESS = TOKEN_ADDRESSES.STCELO;
const CELO_ADDRESS = TOKEN_ADDRESSES.CELO;

const props = withDefaults(
  defineProps<{
    show: boolean;
    vault?: any;
    available?: string;
    availableRaw?: string;
    title?: string;
    contractAddress: string;
    vaultComposable?: VaultComposable;
    acceptedTokens?: VaultTokenInfo[];
  }>(),
  { available: '0', acceptedTokens: () => [] }
);

const emit = defineEmits<{
  (e: 'success', receipt: TransactionReceipt): void;
  (e: 'close'): void;
}>();

const loading = ref(false);
const withdrawAmount = ref('');
const showFireworks = ref(false);
const showTokenSelector = ref(false);
const selectedTokenAddress = ref<string>(STCELO_ADDRESS);
const userHasInteracted = ref(false);
const isFetching = ref(false);
const withdrawnAmount = ref(''); // Track the amount that was actually withdrawn
const stepsInitiated = ref(false); // Lock validation once steps start
const showPreview = ref(false); // Toggle between input and preview screens
const showDetailsInTokens = ref(true); // Toggle between TOKENS and USD display

const { account } = useWeb3();
const { txState } = useTxState();
const { addTransaction } = useTransactions();
const { networkConfig } = useNetwork();
const stCeloComposable = computed(() => props.vaultComposable);

// Use acceptedTokens from props if available, otherwise build from config
const availableWithdrawTokens = computed(() => {
  if (props.acceptedTokens && props.acceptedTokens.length > 0) {
    return props.acceptedTokens;
  }
  // Fallback to centralized config
  return [
    {
      ...VAULT_TOKENS.STCELO,
      balance: String(props.available),
    },
    {
      ...VAULT_TOKENS.CELO,
      balance: String(props.available),
    },
  ];
});

const selectedToken = computed(
  () =>
    availableWithdrawTokens.value.find(
      token => token.address === selectedTokenAddress.value
    ) || null
);

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

const rawWithdrawAmount = computed(() => {
  const amount = Number(withdrawAmount.value) || 0;
  if (amount <= 0) return ethers.constants.Zero;
  return ethers.utils.parseUnits(amount.toString(), 18);
});

const canWithdraw = computed(
  () =>
    // Once steps are initiated (stepsInitiated = true), always allow
    stepsInitiated.value ||
    (!isFetching.value &&
      rawWithdrawAmount.value.gt(0) &&
      rawWithdrawAmount.value.lte(
        ethers.BigNumber.from(props.availableRaw || '0')
      ))
);

// Preview calculations (mocked fees for now)
const MOCK_MINT_FEE_PERCENT = 0.01; // 0.01% fee
const estimatedReceived = computed(() => {
  const amount = Number(withdrawAmount.value) || 0;
  // Apply mock fee
  const fee = amount * MOCK_MINT_FEE_PERCENT;
  return Math.max(0, amount - fee);
});

const mintFee = computed(() => {
  const amount = Number(withdrawAmount.value) || 0;
  return amount * MOCK_MINT_FEE_PERCENT;
});

const formattedWithdrawAmount = computed(() => {
  const amount = Number(withdrawAmount.value) || 0;
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
});

const formattedEstimatedReceived = computed(() => {
  return estimatedReceived.value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
});

const formattedMintFee = computed(() => {
  return mintFee.value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
});

// USD values (mocked 1:1 for now)
const withdrawAmountUsd = computed(() => {
  const amount = Number(withdrawAmount.value) || 0;
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
});

const estimatedReceivedUsd = computed(() => {
  return `$${estimatedReceived.value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
});

const mintFeeUsd = computed(() => {
  return `$${mintFee.value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
});

const priceImpactPercent = computed(() => {
  return `${(MOCK_MINT_FEE_PERCENT * 100).toFixed(2)}%`;
});

const actions = computed((): TransactionActionInfo[] => {
  const arr: any[] = [
    {
      label: 'Withdraw',
      loadingLabel: 'Withdrawing',
      confirmingLabel: 'Confirming',
      action: submitWithdraw,
      stepTooltip: 'Withdraw stCELO from vault',
    },
  ];

  // Only add approval and swap if withdrawing to CELO
  if (selectedToken.value?.address === CELO_ADDRESS) {
    arr.push(...tokenApprovalActions.value);
    arr.push({
      label: 'Swap stCELO to CELO',
      loadingLabel: 'Swapping',
      confirmingLabel: 'Confirming swap',
      action: submitSwap,
      stepTooltip: 'Swap withdrawn stCELO to CELO',
    });
  }

  return arr as TransactionActionInfo[];
});

watch(rawWithdrawAmount, async newVal => {
  if (selectedToken.value?.address === CELO_ADDRESS) {
    // Only recalculate approval if we haven't withdrawn yet
    if (!withdrawnAmount.value) {
      await setTokenApprovalActions();
      setTokenInAmount(ethers.utils.formatUnits(newVal.toString(), 18));
      await swapping.handleAmountChange();
    }
  }
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
          address: STCELO_ADDRESS,
          amount: amt,
        },
      ],
      spender: networkConfig.addresses.vault,
      actionType: ApprovalAction.Swapping,
      forceMax: false,
    });
    tokenApprovalActions.value = actions;
  } catch (e) {
    console.error('❌ Failed to get token approval actions', e);
    tokenApprovalActions.value = [];
  }
}

async function submitWithdraw() {
  stepsInitiated.value = true; // Lock validation for entire sequence
  txState.init = true;
  try {
    if (!stCeloComposable.value) {
      throw new Error('Vault composable not available');
    }

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

    // Store withdrawn amount before refetch updates balance
    withdrawnAmount.value = rawWithdrawAmount.value.toString();

    // Refetch balances after successful withdrawal
    await stCeloComposable.value?.refetch?.();

    return tx;
  } catch (error) {
    console.error('❌ Failed to submit withdraw transaction:', error);
    txState.confirming = false;
    stepsInitiated.value = false; // Unlock validation on error
    throw new Error('Failed to submit withdraw transaction.', {
      cause: error,
    });
  } finally {
    txState.init = false;
  }
}

async function submitSwap() {
  txState.init = true;
  try {
    txState.confirming;
    const tx = await swapping.swap(() => {
      swapping.resetAmounts();
    });
    return tx;
  } catch (e) {
    txState.confirming = false;
    throw new Error('Failed to submit swap transaction.');
  } finally {
    txState.init = false;
  }
}

function selectToken(token: VaultTokenInfo) {
  selectedTokenAddress.value = token.address;
  showTokenSelector.value = false;
  withdrawAmount.value = '';
  txState.confirmed = false;
  txState.receipt = undefined;

  // Reset swap state when changing tokens
  if (token.address === CELO_ADDRESS) {
    setTokenInAddress(STCELO_ADDRESS); // El token que estamos swapeando es stCELO
    setTokenOutAddress(CELO_ADDRESS);
  }
}

function setMaxWithdraw() {
  withdrawAmount.value = String(props.available);
}

function handleClose() {
  withdrawAmount.value = '';
  showFireworks.value = false;
  showTokenSelector.value = false;
  showPreview.value = false;
  txState.confirmed = false;
  txState.receipt = undefined;
  stepsInitiated.value = false; // Reset for next withdrawal
  emit('close');
}

function goToPreview() {
  showPreview.value = true;
}

function goBackToInput() {
  showPreview.value = false;
}

function onWithdrawAmountInput(e: Event) {
  withdrawAmount.value = (e.target as HTMLInputElement).value;
  if (!userHasInteracted.value && withdrawAmount.value) {
    userHasInteracted.value = true;
  }
}

function onStepsSuccess(receipt: TransactionReceipt) {
  txState.confirmed = true;
  txState.receipt = receipt;
  txState.confirming = false;
  showFireworks.value = true;
  emit('success', receipt);

  stCeloComposable.value?.refetch?.().catch((e: any) => {
    console.error('Failed to refetch balances:', e);
  });
}

function onStepsFailed() {
  txState.confirming = false;
}

onMounted(async () => {
  const tokenAddr = props.contractAddress;
  if (!tokenAddr) return;

  // Inicializar token selector con stCELO por defecto
  if (availableWithdrawTokens.value.length > 0 && !selectedTokenAddress.value) {
    selectedTokenAddress.value = availableWithdrawTokens.value[0].address;
  }

  setTokenInAddress(STCELO_ADDRESS);
  setTokenOutAddress(CELO_ADDRESS);
  setTokenInAmount('0');
  setTokenOutAmount('0');
  setInitialized(true);

  if (account.value && stCeloComposable.value) {
    try {
      await stCeloComposable.value.refetch();
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
        <!-- Back button when in preview mode -->
        <button
          v-if="showPreview && !txState.confirmed"
          class="flex justify-center items-center w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          @click="goBackToInput"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div class="flex justify-center items-center w-10 h-10 rounded-full">
          <img :src="vault?.icon" alt="token" class="w-8 h-8 rounded-full" />
        </div>
        <div>
          <h3 class="text-2xl font-semibold">
            Withdraw from {{ vault?.title || title }}
          </h3>
        </div>
      </div>
    </template>

    <transition>
      <div v-if="!txState.confirmed || !txState.receipt">
        <!-- STEP 1: Input Screen -->
        <div v-if="!showPreview">
          <!-- My Position Section -->
          <div
            class="pt-4 mb-6 bg-blue-50 dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-gray-700"
          >
            <div class="px-4">
              <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                My position (stCELO)
              </p>
            </div>
            <hr class="border-gray-300 dark:border-gray-700" />
            <div class="flex gap-2 items-center p-4">
              <img
                :src="vault?.depositTokenIcon"
                alt="stcelo"
                class="w-8 h-8 rounded-full"
              />
              <div class="flex flex-col">
                <span
                  class="text-2xl font-bold text-gray-900 dark:text-gray-100"
                >
                  {{
                    Number(available).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                    })
                  }}
                  stCELO
                </span>
                <span class="text-sm text-gray-500"
                  >${{
                    Number(available).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  }}</span
                >
              </div>
            </div>
          </div>

          <!-- Withdraw Input -->
          <div
            class="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
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
                    :src="selectedToken?.icon"
                    alt="token"
                    class="w-5 h-5 rounded-full"
                  />
                  <span class="font-medium">{{ selectedToken?.symbol }}</span>
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
                    v-show="
                      showTokenSelector && availableWithdrawTokens.length > 1
                    "
                    class="absolute top-full left-0 z-10 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg"
                  >
                    <div class="p-2">
                      <button
                        v-for="token in availableWithdrawTokens"
                        :key="token.address"
                        class="flex gap-3 items-center p-3 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        :class="{
                          'bg-gray-100 dark:bg-gray-700':
                            selectedToken?.address === token.address,
                        }"
                        @click="selectToken(token)"
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
                          v-if="selectedToken?.address === token.address"
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

              <!-- Input Field -->
              <input
                v-model="withdrawAmount"
                type="number"
                min="0"
                step="any"
                :disabled="loading"
                placeholder="0.0"
                class="flex-1 min-w-0 text-2xl font-semibold placeholder-gray-300 text-right bg-transparent outline-none"
                @input="onWithdrawAmountInput"
              />
            </div>

            <!-- Balance info row -->
            <div
              class="flex justify-between items-center text-sm text-gray-500"
            >
              <span class="truncate">
                Balance:
                <span class="font-medium">{{
                  Number(available).toLocaleString('en-US', {
                    maximumFractionDigits: 5,
                  })
                }}</span>
              </span>
              <button
                class="flex-shrink-0 ml-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                :disabled="loading"
                @click.prevent="setMaxWithdraw"
              >
                Max
              </button>
            </div>
          </div>

          <!-- Preview Withdrawal Button -->
          <BalBtn
            class="mt-4 w-full h-12"
            label="Preview Withdrawal"
            color="gradient"
            :disabled="!canWithdraw"
            @click="goToPreview"
          />
        </div>

        <!-- STEP 2: Preview Screen -->
        <div v-else>
          <!-- Withdrawal Preview Card -->
          <div
            class="pt-4 mb-4 bg-blue-50 dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-gray-700"
          >
            <div class="px-4">
              <p class="mb-3 text-sm text-gray-600 dark:text-gray-400">
                Withdrawal Preview
              </p>
            </div>
            <hr class="border-gray-300 dark:border-gray-700" />

            <!-- From: stCELO amount -->
            <div class="flex gap-3 items-center p-4">
              <img
                :src="vault?.depositTokenIcon"
                alt="stcelo"
                class="w-10 h-10 rounded-full"
              />
              <div class="flex-1">
                <span
                  class="text-xl font-bold text-gray-900 dark:text-gray-100"
                >
                  {{ formattedWithdrawAmount }} stCELO
                </span>
                <p class="text-sm text-gray-500">{{ withdrawAmountUsd }}</p>
              </div>
            </div>

            <!-- Arrow indicator -->
            <div class="flex justify-end px-4 -my-2">
              <div
                class="flex justify-center items-center w-8 h-8 bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600"
              >
                <svg
                  class="w-4 h-4 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </div>

            <!-- To: Selected token amount -->
            <div class="flex gap-3 items-center p-4 pt-2">
              <img
                :src="selectedToken?.icon"
                alt="token"
                class="w-10 h-10 rounded-full"
              />
              <div class="flex-1">
                <span
                  class="text-xl font-bold text-gray-900 dark:text-gray-100"
                >
                  {{ formattedEstimatedReceived }} {{ selectedToken?.symbol }}
                </span>
                <p class="text-sm text-gray-500">
                  {{ estimatedReceivedUsd }} / Mint price impact:
                  {{ priceImpactPercent }}
                </p>
              </div>
            </div>
          </div>

          <!-- Swap Details Card -->
          <div
            class="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <!-- Header with toggle -->
            <div class="flex justify-between items-center mb-3">
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                Swap details
              </span>
              <div
                class="flex p-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                <button
                  class="py-1 px-2 rounded-md transition-colors"
                  :class="
                    showDetailsInTokens
                      ? 'bg-white dark:bg-gray-600 shadow-sm font-medium'
                      : 'text-gray-500'
                  "
                  @click="showDetailsInTokens = true"
                >
                  TOKENS
                </button>
                <button
                  class="py-1 px-2 rounded-md transition-colors"
                  :class="
                    !showDetailsInTokens
                      ? 'bg-white dark:bg-gray-600 shadow-sm font-medium'
                      : 'text-gray-500'
                  "
                  @click="showDetailsInTokens = false"
                >
                  USD
                </button>
              </div>
            </div>

            <!-- Details rows -->
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Estimated total received</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{
                    showDetailsInTokens
                      ? `${formattedEstimatedReceived} ${selectedToken?.symbol}`
                      : estimatedReceivedUsd
                  }}
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Fee (mint price)</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{
                    showDetailsInTokens
                      ? `${formattedMintFee} ${selectedToken?.symbol}`
                      : mintFeeUsd
                  }}
                </span>
              </div>
            </div>
          </div>

          <!-- Action Steps -->
          <BalActionSteps
            :actions="actions"
            primaryActionType="withdraw"
            :disabled="!canWithdraw || loading"
            class="mt-4"
            @success="onStepsSuccess"
            @failed="onStepsFailed"
          />
        </div>
      </div>
      <div v-else>
        <!-- Success State -->
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
            >{{ withdrawAmount }} {{ selectedToken?.symbol || 'stCELO' }}</span
          >
          from the {{ vault?.title || 'stCELO' }} vault.
        </p>

        <!-- Transaction Details -->
        <div class="pb-6 mb-6 border-b border-gray-200 dark:border-gray-700">
          <ConfirmationIndicator :txReceipt="txState.receipt" />
        </div>

        <!-- Continue Button -->
        <BalBtn
          class="w-full h-12"
          label="Continue"
          color="gradient"
          :disabled="txState.confirming"
          @click="handleClose"
        />
      </div>
    </transition>
  </BalModal>
</template>
