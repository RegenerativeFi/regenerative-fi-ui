// import { EthereumTransactionData } from 'bnc-sdk/dist/types/src/interfaces';
import { watch } from 'vue';

import { BLOCKED_ADDRESSES } from '@/constants/blocked';
import { includesAddress } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';

// import useBlocknative from '../useBlocknative';
// import { useTokens } from '@/providers/tokens.provider';
import useTransactions /* { ReplacementReason }  */ from '../useTransactions';

export default function useWeb3Watchers() {
  // COMPOSABLES
  // const { blocknative, supportsBlocknative } = useBlocknative();
  const { account, blockNumber, isWalletReady, disconnectWallet } = useWeb3();
  // const { refetchBalances, refetchAllowances } = useTokens();
  const { handlePendingTransactions /* updateTransaction */ } =
    useTransactions();

  // function handleTransactionReplacement(
  //   tx: EthereumTransactionData,
  //   replacementReason: ReplacementReason
  // ) {
  //   const originalHash = tx.replaceHash;

  //   if (originalHash != null) {
  //     updateTransaction(originalHash, 'tx', {
  //       // new id
  //       id: tx.hash,
  //       replacementReason,
  //     });
  //   }
  // }

  // Watch for user account change:
  // -> Unsubscribe Blocknative from old account if exits
  // -> Listen to new account for transactions and update balances
  // watch(
  //   () => account.value,
  //   (newAccount, oldAccount) => {
  //     // if (supportsBlocknative.value) {
  //     //   if (oldAccount) blocknative.unsubscribe(oldAccount);
  //     //   if (!newAccount) return;

  //     //   const { emitter } = blocknative.account(newAccount);
  //     //   emitter.on('txConfirmed', () => {
  //     //     refetchBalances();
  //     //     refetchAllowances();
  //     //   });

  //     //   emitter.on('txSpeedUp', tx =>
  //     //     handleTransactionReplacement(
  //     //       tx as EthereumTransactionData,
  //     //       'txSpeedUp'
  //     //     )
  //     //   );

  //     //   emitter.on('txCancel', tx =>
  //     //     handleTransactionReplacement(
  //     //       tx as EthereumTransactionData,
  //     //       'txCancel'
  //     //     )
  //     //   );
  //     // }
  //   }
  // );

  watch(blockNumber, async () => {
    if (isWalletReady.value) {
      handlePendingTransactions();
    }
  });

  watch(account, () => {
    if (includesAddress(BLOCKED_ADDRESSES, account.value)) {
      disconnectWallet();
    }
  });
}
