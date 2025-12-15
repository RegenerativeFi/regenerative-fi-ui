<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue';
import BalModal from '@/components/_global/BalModal/BalModal.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import BalActionSteps from '@/components/_global/BalActionSteps/BalActionSteps.vue';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import { useTxState } from '@/composables/useTxState';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import useTransactions from '@/composables/useTransactions';
import useWeb3 from '@/services/web3/useWeb3';
import { ethers } from 'ethers';
import {
  TOKEN_ADDRESSES,
  VAULT_TOKENS,
  VAULT_ADDRESSES,
} from '@/composables/vaults/config';
import type {
  VaultComposable,
  VaultTokenInfo,
} from '@/composables/vaults/types';

// Use centralized config
const CELO_ADDRESS = TOKEN_ADDRESSES.CELO;
const STCELO_ADDRESS = TOKEN_ADDRESSES.STCELO;
const VAULT_ADDRESS = VAULT_ADDRESSES.STCELO_VAULT;

const props = withDefaults(
  defineProps<{
    show: boolean;
    vault?: any;
    available?: string | number;
    availableStCelo?: string | number;
    title?: string;
    contractAddress: string;
    vaultComposable?: VaultComposable;
    acceptedTokens?: VaultTokenInfo[];
  }>(),
  {
    available: '0',
    availableStCelo: '0',
    acceptedTokens: () => [],
  }
);

const emit = defineEmits<{
  (e: 'success', receipt: TransactionReceipt): void;
  (e: 'close'): void;
}>();

const depositAmount = ref('');
const showFireworks = ref(false);
const showTokenSelector = ref(false);
const selectedTokenAddress = ref<string>(CELO_ADDRESS);

const { txState } = useTxState();
const { addTransaction } = useTransactions();
const { getProvider, account } = useWeb3();

const stCeloComposable = computed(() => props.vaultComposable);

// Use acceptedTokens from props if available, otherwise build from config
const availableTokens = computed(() => {
  if (props.acceptedTokens && props.acceptedTokens.length > 0) {
    return props.acceptedTokens;
  }
  // Fallback to centralized config
  return [
    {
      ...VAULT_TOKENS.CELO,
      balance: String(props.available),
    },
    {
      ...VAULT_TOKENS.STCELO,
      balance: String(props.availableStCelo),
    },
  ];
});

const selectedToken = computed(
  () =>
    availableTokens.value.find(
      token => token.address === selectedTokenAddress.value
    ) || null
);

const availableAmount = computed(() => {
  if (selectedToken.value) return Number(selectedToken.value.balance) || 0;
  return 0;
});

const displayedAvailable = computed(() =>
  availableAmount.value.toLocaleString('en-US', { maximumFractionDigits: 5 })
);

const canDeposit = computed(() => {
  const v = Number(depositAmount.value);
  return v > 0 && v <= availableAmount.value;
});

const actions = reactive<any[]>([
  {
    label: 'Deposit',
    loadingLabel: 'Depositing',
    confirmingLabel: 'Confirming',
    action: submit,
    stepTooltip: `Deposit CELO into vault`,
  },
]);

onMounted(() => {
  // Default to CELO
  selectedTokenAddress.value = CELO_ADDRESS;
});

// Watch for token changes and update the stepper dynamically
watch(
  () => selectedTokenAddress.value,
  newAddress => {
    console.log('Token changed to:', newAddress);

    // Recalculate actions based on new token
    actions.length = 0; // Clear the array

    if (selectedToken.value?.address === STCELO_ADDRESS) {
      // For stCELO: Approve first, then Deposit
      actions.push(
        {
          label: 'Approve',
          loadingLabel: 'Approving',
          confirmingLabel: 'Confirming',
          action: approveStCelo,
          stepTooltip: `Approve stCELO for vault deposit`,
        },
        {
          label: 'Deposit',
          loadingLabel: 'Depositing',
          confirmingLabel: 'Confirming',
          action: submit,
          stepTooltip: `Deposit ${
            selectedToken.value?.symbol || 'token'
          } into vault`,
        }
      );
    } else {
      // For CELO: Just Deposit
      actions.push({
        label: 'Deposit',
        loadingLabel: 'Depositing',
        confirmingLabel: 'Confirming',
        action: submit,
        stepTooltip: `Deposit ${
          selectedToken.value?.symbol || 'token'
        } into vault`,
      });
    }
  }
);

async function approveStCelo() {
  try {
    const signer = getProvider()?.getSigner(account.value);
    const amount = Number(depositAmount.value);
    const amountBn = ethers.utils.parseUnits(String(amount), 18);

    if (!signer) throw new Error('No signer available');

    const ERC20_ABI = [
      'function approve(address spender, uint256 amount) returns (bool)',
    ];

    console.log('Starting approval for amount:', amount);
    const stCeloToken = new ethers.Contract(STCELO_ADDRESS, ERC20_ABI, signer);
    const tx = await stCeloToken.approve(VAULT_ADDRESS, amountBn);

    console.log('Approval tx sent:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Approval confirmed:', receipt);

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'approve',
      summary: `Approve stCELO for vault`,
    });

    return tx;
  } catch (error) {
    console.error('Approval error:', error);
    throw error;
  }
}

async function submit() {
  txState.init = true;
  try {
    const amount = Number(depositAmount.value);
    const tokenAddress = selectedToken.value?.address;

    if (!stCeloComposable.value) {
      throw new Error('Vault composable not available');
    }

    txState.confirming = true;
    let tx;
    if (tokenAddress === CELO_ADDRESS) {
      tx = await stCeloComposable.value.depositTx(amount);
    } else if (tokenAddress === STCELO_ADDRESS) {
      tx = await stCeloComposable.value.depositTxForToken(tokenAddress, amount);
    } else {
      throw new Error('Invalid token selected');
    }

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'invest',
      summary: `Deposit ${amount} ${selectedToken.value?.symbol || 'token'}`,
    });

    return tx;
  } catch (error) {
    txState.confirming = false;
    console.error('Deposit error:', error);
    throw error;
  } finally {
    txState.init = false;
  }
}

function setMaxDeposit() {
  depositAmount.value = String(availableAmount.value);
}

function selectToken(token: VaultTokenInfo) {
  selectedTokenAddress.value = token.address;
  showTokenSelector.value = false;
  depositAmount.value = '';

  // Reset transaction state when switching tokens
  txState.confirmed = false;
  txState.receipt = undefined;
  txState.confirming = false;
}

function onDepositInput(e: Event) {
  depositAmount.value = (e.target as HTMLInputElement).value;
}

function handleClose() {
  depositAmount.value = '';
  showFireworks.value = false;
  showTokenSelector.value = false;
  txState.confirmed = false;
  txState.receipt = undefined;
  emit('close');
}

function onStepsSuccess(receipt: TransactionReceipt) {
  console.log('Steps success, receipt:', receipt);

  // Set transaction state
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
                stCeloComposable?.vault?.deposit
                  ? Number(stCeloComposable.vault.deposit).toLocaleString(
                      'en-US',
                      { maximumFractionDigits: 5 }
                    )
                  : '0'
              }}
            </span>
          </div>
        </div>

        <div>
          <div
            class="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div class="flex gap-2 items-center mb-3">
              <!-- Token Selector Button -->
              <div class="relative">
                <button
                  class="flex gap-2 items-center py-2 px-3 text-sm whitespace-nowrap bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 transition-colors"
                  :disabled="txState.confirming"
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
                    v-show="showTokenSelector && availableTokens.length > 1"
                    class="absolute top-full left-0 z-10 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg"
                  >
                    <div class="p-2">
                      <button
                        v-for="token in availableTokens"
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
                v-model="depositAmount"
                type="number"
                min="0"
                step="any"
                :disabled="txState.confirming"
                placeholder="0.00"
                class="flex-1 min-w-0 text-2xl font-semibold placeholder-gray-300 text-right bg-transparent outline-none"
                @input="onDepositInput"
              />
            </div>

            <!-- Balance info row -->
            <div
              class="flex justify-between items-center text-sm text-gray-500"
            >
              <span class="truncate">
                Balance:
                <span class="font-medium">{{ displayedAvailable }}</span>
              </span>
              <button
                class="flex-shrink-0 ml-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                :disabled="txState.confirming"
                @click.prevent="setMaxDeposit"
              >
                Max
              </button>
            </div>
          </div>
          <div class="mt-4">
            <hr class="border-t border-gray-200 dark:border-gray-700" />
          </div>
        </div>

        <BalActionSteps
          :actions="actions"
          primaryActionType="invest"
          :disabled="!canDeposit || txState.confirming"
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
            Deposit Successful
          </h3>
        </div>

        <!-- Deposit Summary -->
        <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
          You added
          <span class="font-semibold text-gray-900 dark:text-gray-100"
            >{{ depositAmount }} {{ selectedToken?.symbol || 'CELO' }}</span
          >
          to the {{ vault?.title || 'CELO' }} vault.
        </p>

        <!-- Updated Position Card -->
        <div
          class="p-4 mb-6 bg-blue-50 rounded-lg border border-blue-200 dark:bg-gray-800/50 dark:border-blue-900/30"
        >
          <div class="mb-3">
            <p
              class="text-xs font-medium tracking-wide text-gray-600 dark:text-gray-400 uppercase"
            >
              Updated position (stCELO)
            </p>
          </div>
          <div class="flex gap-3 items-center">
            <img
              :src="vault?.depositTokenIcon"
              alt="token"
              class="w-8 h-8 rounded-full"
            />
            <span class="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {{
                stCeloComposable?.vault?.deposit
                  ? Number(stCeloComposable.vault.deposit).toLocaleString(
                      'en-US',
                      { maximumFractionDigits: 5 }
                    )
                  : '0'
              }}
            </span>
          </div>
        </div>

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
