<script setup lang="ts">
import { Pool } from '@/services/pool/types';
import TokenAmounts from '@/components/forms/pool_actions/shared/TokenAmounts.vue';
import { TokenAmountMap } from '@/types';
import { TokenInfoMap } from '@/types/TokenList';
import { useTokens } from '@/providers/tokens.provider';
import useNumbers from '@/composables/useNumbers';
import { bnum } from '@/lib/utils';
import { useTxState } from '@/composables/useTxState';
import { TransactionActionInfo } from '@/types/transactions';
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import useTokenApprovalActions from '@/composables/approvals/useTokenApprovalActions';
import { ApprovalAction } from '@/composables/approvals/types';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import useWeb3 from '@/services/web3/useWeb3';
import useConfig from '@/composables/useConfig';
import BribesMarketAbi from '@/lib/abi/BribesMarket.json';
import { Interface } from '@ethersproject/abi';
import { solidityPack, keccak256 } from 'ethers/lib/utils'; // eslint-disable-line no-restricted-imports
import { parseFixed } from '@ethersproject/bignumber';
import useTransactions from '@/composables/useTransactions';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import StarsIcon from '@/components/_global/icons/StarsIcon.vue';
/**
 * TYPES
 */
type Props = {
  isVisible: boolean;
  pool: Pool;
  tokenInAddress: string;
  tokenInAmount: string;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success', receipt: TransactionReceipt): void;
}>();

/**
 * COMPUTED
 */
const amountInMap = computed((): TokenAmountMap => {
  const amountMap = {};
  amountMap[props.tokenInAddress] = props.tokenInAmount;
  return amountMap;
});

const tokenInMap = computed((): TokenInfoMap => {
  const tokenMap = {};
  Object.keys(amountInMap.value).forEach(address => {
    tokenMap[address] = getToken(address);
  });
  return tokenMap;
});

const fiatAmountInMap = computed((): TokenAmountMap => {
  const fiatAmountMap = {};
  Object.keys(amountInMap.value).forEach(address => {
    fiatAmountMap[address] = toFiat(amountInMap.value[address], address);
  });
  return fiatAmountMap;
});

const fiatValueIn = computed((): string => {
  return toFiat(props.tokenInAmount, props.tokenInAddress);
});

const missingPricesIn = computed(
  (): boolean => !bnum(priceFor(props.tokenInAddress)).gt(0)
);

/**
 * STATE
 */
const showFireworks = ref(false);
const approvalActions = ref<TransactionActionInfo[]>([]);

/**
 * COMPUTED
 */
const actions = computed((): TransactionActionInfo[] => [
  ...approvalActions.value,
  {
    label: 'Cultivate Liquidity',
    loadingLabel: 'Cultivating Liquidity',
    confirmingLabel: 'Confirming',
    action: submit,
    stepTooltip: 'Confirm your liquidity cultivation',
  },
]);
console.debug({ actions: actions.value });

/**
 * COMPOSABLES
 */
const { getToken, priceFor } = useTokens();
const { toFiat } = useNumbers();
const { txState } = useTxState();
const { getSigner } = useWeb3();
const { networkConfig } = useConfig();
const { getTokenApprovalActions } = useTokenApprovalActions();
const { addTransaction } = useTransactions();

/**
 * METHODS
 */
function handleClose() {
  showFireworks.value = false;
  emit('close');
}

async function handleSuccess(
  receipt: TransactionReceipt,
  confirmedAt: string
): Promise<void> {
  showFireworks.value = true;
  txState.receipt = receipt;
  txState.confirmedAt = confirmedAt;
  txState.confirmed = true;
  txState.confirming = false;
  emit('success', receipt);
}

async function setApprovalActions() {
  try {
    if (!networkConfig.addresses.bribeVault) {
      throw new Error('Bribe vault address not found');
    }
    const tokenApprovalActions = await getTokenApprovalActions({
      amountsToApprove: [
        {
          address: props.tokenInAddress,
          amount: props.tokenInAmount,
        },
      ],
      spender: networkConfig.addresses.bribeVault,
      actionType: ApprovalAction.AddLiquidity,
    });

    approvalActions.value = tokenApprovalActions;
    console.log('Approval Actions Set:', approvalActions.value);
  } catch (error) {
    console.error('Error setting approval actions:', error);
  }
}

async function submit(): Promise<TransactionResponse> {
  txState.init = true;
  try {
    await setApprovalActions();
    txState.confirming = true;

    const token = getToken(props.tokenInAddress);

    const amount = parseFixed(
      props.tokenInAmount || '0',
      token.decimals
    ).toString();

    const proposal = keccak256(
      solidityPack(['address'], [props.pool.gauge.address])
    );

    const BribeMarket = new Interface(BribesMarketAbi);

    const data = BribeMarket.encodeFunctionData('depositBribe', [
      proposal,
      props.tokenInAddress,
      amount,
      0n,
      1n,
    ]);

    const txBuilder = new TransactionBuilder(getSigner());
    const tx = await txBuilder.raw.sendTransaction({
      to: networkConfig.addresses.bribeMarket,
      data,
      value: '0',
    });

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'cultivate',
      summary: `Cultivate ${props.tokenInAmount} ${token.symbol}`,
      details: {
        total: toFiat(props.tokenInAmount, props.tokenInAddress),
      },
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

function handleFailed() {
  txState.confirming = false;
}

/**
 * WATCHERS
 */

onMounted(async () => {
  await setApprovalActions();
});

const confirmed = ref(false);
const title = computed((): string =>
  confirmed.value
    ? 'Cultivate Liquidity confirmed'
    : 'Cultivate Liquidity preview'
);

console.debug({
  pool: props.pool,
  tokenInAddress: props.tokenInAddress,
  tokenInAmount: props.tokenInAmount,
});
</script>

<template>
  <teleport to="#modal">
    <BalModal :show="isVisible" :fireworks="showFireworks" @close="handleClose">
      <template #header>
        <div class="flex items-center">
          <BalCircle
            v-if="confirmed"
            size="8"
            color="green"
            class="mr-2 text-white"
          >
            <BalIcon name="check" />
          </BalCircle>
          <h4>
            {{ title }}
          </h4>
        </div>
      </template>

      <TokenAmounts
        :title="'You’re providing'"
        :amountMap="amountInMap"
        :tokenMap="tokenInMap"
        :fiatAmountMap="fiatAmountInMap"
        :fiatTotal="fiatValueIn"
      />

      <BalAlert
        v-if="missingPricesIn"
        type="warning"
        :title="$t('noPriceInfo')"
        class="mt-4"
        block
      />

      <transition>
        <BalActionSteps
          v-if="!txState.confirmed || !txState.receipt"
          :actions="actions"
          primaryActionType="invest"
          :disabled="false"
          class="mt-4"
          @success="handleSuccess"
          @failed="handleFailed"
        />
        <div v-else class="mt-4">
          <ConfirmationIndicator :txReceipt="txState.receipt" />
          <BalBtn
            tag="router-link"
            :to="{ name: 'vebal' }"
            color="gradient"
            block
            class="flex mt-2"
          >
            <StarsIcon class="mr-2 h-5 text-orange-300" />
            Go to votes page
          </BalBtn>
          <BalBtn
            color="gray"
            outline
            block
            size="sm"
            class="mt-2"
            @click="handleClose"
          >
            Return to pool Page
          </BalBtn>
        </div>
      </transition>
      <transition name="pop">
        <FeedbackCard
          v-if="txState.confirming || txState.confirmed"
          class="mt-3"
        />
      </transition>
    </BalModal>
  </teleport>
</template>
