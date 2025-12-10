<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import BalModal from '@/components/_global/BalModal/BalModal.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import BalActionSteps from '@/components/_global/BalActionSteps/BalActionSteps.vue';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { useTxState } from '@/composables/useTxState';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import useTransactions from '@/composables/useTransactions';

interface DepositToken {
  symbol: string;
  address: string;
  icon: string;
  balance: string;
}

const props = withDefaults(
  defineProps<{
    show: boolean;
    vault?: any;
    available?: string | number;
    title?: string;
    contractAddress: string;
    vaultComposable?: any;
    acceptedTokens?: DepositToken[];
  }>(),
  {
    available: '0',
    acceptedTokens: () => [],
  }
);

const emit = defineEmits<{
  (e: 'success', receipt: TransactionReceipt): void;
  (e: 'close'): void;
}>();

const depositAmount = ref('');
const loading = ref(false);
const showFireworks = ref(false);
const showTokenSelector = ref(false);
const selectedTokenAddress = ref('');
const selectedToken = computed(() => {
  return (
    availableTokens.value.find(
      token => token.address === selectedTokenAddress.value
    ) || null
  );
});

const { account } = useWeb3();
const { txState } = useTxState();
const { addTransaction } = useTransactions();

const availableTokens = computed(() => {
  return props.acceptedTokens;
});

const stCeloComposable = computed(() => {
  return props.vaultComposable;
});

onMounted(() => {
  if (availableTokens.value.length > 0 && !selectedTokenAddress.value) {
    selectedTokenAddress.value = availableTokens.value[0].address;
  }
});

const availableAmount = computed(() => {
  if (selectedToken.value) {
    return Number(selectedToken.value.balance) || 0;
  }
  return Number(props.available) > 0
    ? Number(props.available)
    : Number(stCeloComposable.value?.vault?.available || '0');
});

const displayedAvailable = computed(() => {
  return availableAmount.value.toLocaleString('en-US', {
    maximumFractionDigits: 5,
  });
});

const actions = computed(() => [
  {
    label: 'Deposit',
    loadingLabel: 'Depositing',
    confirmingLabel: 'Confirming',
    action: submit,
    stepTooltip: 'Deposit stCELO into vault',
  },
]);

const canDeposit = computed(() => {
  const v = Number(depositAmount.value);
  return v > 0 && v <= availableAmount.value;
});

async function submit() {
  txState.init = true;
  try {
    txState.confirming = true;

    // Si tenemos un token seleccionado diferente, usar su método de depósito
    // de lo contrario usar el método por defecto
    let tx;
    if (selectedToken.value && stCeloComposable.value?.depositTxForToken) {
      tx = await stCeloComposable.value.depositTxForToken(
        selectedToken.value.address,
        Number(depositAmount.value)
      );
    } else {
      tx = await stCeloComposable.value?.depositTx?.(
        Number(depositAmount.value)
      );
    }

    if (!tx) {
      throw new Error('Failed to get transaction from composable');
    }

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'invest',
      summary: `Deposit ${depositAmount.value} ${
        selectedToken.value?.symbol || 'CELO'
      }`,
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
  depositAmount.value = String(availableAmount.value);
}

function handleClose() {
  showFireworks.value = false;
  depositAmount.value = '';
  showTokenSelector.value = false;
  txState.confirmed = false;
  txState.receipt = undefined;
  txState.confirming = false;
  emit('close');
}

function selectToken(token: DepositToken) {
  selectedTokenAddress.value = token.address;
  showTokenSelector.value = false;
}

function onStepsSuccess(receipt: TransactionReceipt, confirmedAt?: string) {
  showFireworks.value = true;
  txState.receipt = receipt;
  txState.confirmedAt = confirmedAt || new Date().toISOString();
  txState.confirmed = true;
  txState.confirming = false;
  loading.value = false;
  emit('success', receipt);

  // The new useVault refetches on its own, so we just trigger it.
  if (stCeloComposable.value?.refetch) {
    stCeloComposable.value.refetch();
  }
}

function onStepsFailed() {
  txState.confirming = false;
  loading.value = false;
}

onMounted(async () => {
  const tokenAddr =
    props.contractAddress || (props.vault && props.vault.contractAddress);
  if (!tokenAddr) return;

  if (account.value) {
    try {
      if (stCeloComposable.value?.refetch) {
        await stCeloComposable.value.refetch();
      }
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
            <img :src="vault?.icon" alt="stcelo" class="w-8 h-8 rounded-full" />
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
                :disabled="loading"
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
                :disabled="loading"
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
          :disabled="!canDeposit || loading"
          class="mt-4"
          @success="onStepsSuccess"
          @failed="onStepsFailed"
        />
      </div>
      <div v-else>
        <!-- Success State -->
        <div>
          <!-- Success Header with Icon -->
          <div class="flex gap-3 items-center mb-4">
            <div
              class="flex flex-shrink-0 justify-center items-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full"
            >
              <svg
                class="w-5 h-5 text-green-600 dark:text-green-300"
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
          <p
            class="mb-4 text-sm font-medium tracking-wide leading-relaxed text-gray-700 dark:text-gray-300"
          >
            You added
            <span class="font-semibold"
              >{{ depositAmount }} {{ selectedToken?.symbol || 'CELO' }}</span
            >
            to the {{ vault?.title || 'CELO' }} vault.
          </p>

          <!-- Updated Position Card -->
          <div
            class="pt-4 mb-4 bg-blue-50 dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-gray-700"
          >
            <div class="px-4">
              <p
                class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Updated position (stCELO)
              </p>
            </div>
            <hr class="border-gray-300 dark:border-gray-700" />
            <div class="flex gap-2 items-center p-4">
              <img
                :src="vault?.depositTokenIcon"
                alt="token"
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

          <!-- Transaction Details -->
          <div class="mb-4">
            <ConfirmationIndicator :txReceipt="txState.receipt" />
          </div>
        </div>

        <BalBtn
          class="flex-1 w-full"
          label="Continue"
          color="gradient"
          :disabled="loading"
          @click="handleClose"
        />
      </div>
    </transition>
  </BalModal>
</template>
