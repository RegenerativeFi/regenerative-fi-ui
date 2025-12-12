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

interface WithdrawToken {
  symbol: string;
  address: string;
  icon: string;
  balance: string;
}

const STCELO_ADDRESS = '0xC668583dcbDc9ae6FA3CE46462758188adfdfC24';
const CELO_ADDRESS = '0x471EcE3750Da237f93B8E339c536989b8978a438';

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
  (e: 'success', receipt: TransactionReceipt): void;
  (e: 'close'): void;
}>();

const loading = ref(false);
const withdrawAmount = ref('');
const showFireworks = ref(false);
const showTokenSelector = ref(false);
const selectedTokenAddress = ref(STCELO_ADDRESS);
const userHasInteracted = ref(false);
const isFetching = ref(false);
const withdrawnAmount = ref(''); // Track the amount that was actually withdrawn
const stepsInitiated = ref(false); // Lock validation once steps start

const { account } = useWeb3();
const { txState } = useTxState();
const { addTransaction } = useTransactions();
const { networkConfig } = useNetwork();
const stCeloComposable = computed(() => props.vaultComposable);

const availableWithdrawTokens = computed(() => {
  const tokens: WithdrawToken[] = [
    {
      symbol: 'stCELO',
      address: STCELO_ADDRESS,
      icon: 'https://docs.stcelo.xyz/~gitbook/image?url=https%3A%2F%2F3000964912-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FvQimOwyO476OljyCNwuU%252Ficon%252F5v5AoHHdDbNO4xJ9JQ56%252FProperty%25201%253DstCELO.png%3Falt%3Dmedia%26token%3D593a7df1-4f25-42e8-a03a-c12a8056dcdd&width=32&dpr=4&quality=100&sign=41c5cab3&sv=2',
      balance: String(props.available),
    },
    {
      symbol: 'CELO',
      address: CELO_ADDRESS,
      icon: 'https://cdn.prod.website-files.com/652d421c1214a2eebd967f1d/683f449264407a7213b865fa_Celo.png',
      balance: String(props.available),
    },
  ];
  return tokens;
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

function selectToken(token: WithdrawToken) {
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
  txState.confirmed = false;
  txState.receipt = undefined;
  stepsInitiated.value = false; // Reset for next withdrawal
  emit('close');
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
  setTokenOutAddress('0x471EcE3750Da237f93B8E339c536989b8978a438'); // CELO
  setTokenInAmount('0');
  setTokenOutAmount('0');
  setInitialized(true);

  if (account.value) {
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
        <div class="flex justify-center items-center w-10 h-10 rounded-full">
          <img :src="vault?.icon" alt="token" class="w-8 h-8 rounded-full" />
        </div>
        <div>
          <h3 class="text-2xl font-semibold">{{ vault?.title || title }}</h3>
        </div>
      </div>
    </template>

    <transition>
      <div v-if="!txState.confirmed || !txState.receipt">
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
            <span class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {{
                Number(available).toLocaleString('en-US', {
                  maximumFractionDigits: 5,
                })
              }}
            </span>
          </div>
        </div>

        <!-- Withdraw Input -->
        <div>
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
                placeholder="0.00"
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
          <div class="mt-4">
            <hr class="border-t border-gray-200 dark:border-gray-700" />
          </div>
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

        <!-- Slippage Alert -->
        <!-- <transition>
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
                Current demand may cause significant slippage on your
                withdrawal. You can:
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
        </transition> -->

        <BalActionSteps
          :actions="actions"
          primaryActionType="withdraw"
          :disabled="!canWithdraw || loading"
          class="mt-4"
          @success="onStepsSuccess"
          @failed="onStepsFailed"
        />
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
