<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
// import useGaugesDecorationQuery from '@/composables/queries/useGaugesDecorationQuery';
// import useGaugesQuery from '@/composables/queries/useGaugesQuery';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import TxActionBtn from '../TxActionBtn/TxActionBtn.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { walletService } from '@/services/web3/wallet.service';
import { useRewardsQuery } from '@/composables/queries/useRewardsQuery';

/**
 * TYPES
 */
type Props = {
  fiatValue: string;
  rewards?: any[]; // raw rewards from Merkl
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES`
 */
const { t } = useI18n();
const { fNum } = useNumbers();
// const { data: subgraphGauges } = useGaugesQuery();
const { account, chainId } = useWeb3();
// const gaugesQuery = useGaugesDecorationQuery(subgraphGauges);

// Rewards query (vue-query style) — used to refetch Merkl rewards after claim
const rewardsQuery = useRewardsQuery();

/**
 * STATE
 */

/**
 * METHODS
 */
const DISTRIBUTOR_ADDRESS = '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae';

function claimTx() {
  const rewardsToClaim = props.rewards;
  if (!rewardsToClaim || rewardsToClaim.length === 0) {
    throw new Error('No rewards provided to claim');
  }

  return (async () => {
    const address = account.value;

    const users: string[] = [];
    const tokens: string[] = [];
    const amounts: string[] = [];
    const proofs: string[][] = [];

    const dataSource = [
      { chain: { id: chainId.value }, rewards: rewardsToClaim },
    ];

    for (const rewardsGroup of dataSource) {
      if (Number(rewardsGroup.chain.id) !== Number(chainId.value)) continue;
      for (const reward of rewardsGroup.rewards) {
        users.push(address);
        tokens.push(reward.token.address);
        amounts.push(String(reward.amount));
        proofs.push(reward.proofs || []);
      }
    }

    if (tokens.length === 0) throw new Error('No tokens to claim');

    const distributorAbi = [
      {
        inputs: [
          {
            internalType: 'address[]',
            name: 'users',
            type: 'address[]',
          },
          {
            internalType: 'address[]',
            name: 'tokens',
            type: 'address[]',
          },
          {
            internalType: 'uint256[]',
            name: 'amounts',
            type: 'uint256[]',
          },
          {
            internalType: 'bytes32[][]',
            name: 'proofs',
            type: 'bytes32[][]',
          },
        ],
        name: 'claim',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    return await walletService.txBuilder.contract.sendTransaction({
      contractAddress: DISTRIBUTOR_ADDRESS,
      abi: distributorAbi,
      action: 'claim',
      params: [users, tokens, amounts, proofs],
    });
  })();
}
</script>

<template>
  <TxActionBtn
    label="Claim all"
    color="gradient"
    size="sm"
    :actionFn="claimTx"
    :onConfirmFn="rewardsQuery.refetch"
    action="claim"
    :summary="`${t('claim')} ${fNum(props.fiatValue, FNumFormats.fiat)}`"
    :confirmingLabel="t('claiming')"
  />
</template>
