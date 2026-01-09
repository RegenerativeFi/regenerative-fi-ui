import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';

import { useTokens } from '@/providers/tokens.provider';
import { useUserData } from '@/providers/user-data.provider';
import usePoolQuery from './queries/usePoolQuery';
import { fiatValueOf } from './usePoolHelpers';
import useVeBal, { isVeBalSupported } from './useVeBAL';
import useNumbers from './useNumbers';
import { bnum } from '@/lib/utils';

interface Options {
  enabled?: boolean;
}
export function useLock({ enabled = true }: Options = {}) {
  /**
   * COMPOSABLES
   */
  const { lockablePoolId, ReFiTokenInfo } = useVeBal();
  const { getToken, balanceFor } = useTokens();
  const { toFiat } = useNumbers();

  /**
   * QUERIES
   */
  // Only fetch pool if we have a pool ID - for direct REFI locking, we don't need a pool
  const hasLockablePoolId = computed(() => !!lockablePoolId.value);
  const shouldFetchLockPool = computed(
    (): boolean => isVeBalSupported.value && enabled && hasLockablePoolId.value
  );
  const lockPoolQuery = usePoolQuery(
    (lockablePoolId.value || '') as string,
    shouldFetchLockPool
  );
  const { lockQuery } = useUserData();

  /**
   * COMPUTED
   */
  const isLoadingLockPool = computed(
    (): boolean => lockPoolQuery.isLoading.value
  );

  const isLoadingLockInfo = computed((): boolean => lockQuery.isLoading.value);

  const isLoadingLock = computed(
    (): boolean => isLoadingLockPool.value || isLoadingLockInfo.value
  );

  const lockPool = computed<Pool | undefined>(() => lockPoolQuery.data.value);

  const lockPoolToken = computed((): TokenInfo | null => {
    if (lockPool.value) {
      return getToken(lockPool.value.address);
    }
    // For direct REFI locking, use REFI token info
    return ReFiTokenInfo.value;
  });

  const lock = computed(() => lockQuery.data.value);

  // Total fiat value of locked tokens.
  const totalLockedValue = computed((): string => {
    if (!lock.value?.hasExistingLock) return '0';
    if (lockPool.value) {
      return fiatValueOf(lockPool.value, lock.value.lockedAmount);
    }
    // For direct REFI locking, use token price
    if (ReFiTokenInfo.value) {
      return toFiat(lock.value.lockedAmount, ReFiTokenInfo.value.address);
    }
    return '0';
  });

  // Total locked shares (veBAL).
  const totalLockedShares = computed((): string =>
    lock.value?.hasExistingLock ? lock.value.lockedAmount : '0'
  );

  const bptPrice = computed(() => {
    if (lockPool.value) {
      return bnum(lockPool.value.totalLiquidity).div(
        lockPool.value.totalShares
      );
    }
    // For direct REFI locking, price is 1:1 (or use token price)
    return bnum(1);
  });

  const bptBalance = computed(() => {
    if (lockPool.value) {
      return balanceFor(lockPool.value.address);
    }
    // For direct REFI locking, use REFI token balance
    if (ReFiTokenInfo.value) {
      return balanceFor(ReFiTokenInfo.value.address);
    }
    return bnum(0);
  });

  const fiatTotal = computed(() => {
    if (lockPool.value) {
      return bptPrice.value.times(bptBalance.value).toString();
    }
    // For direct REFI locking, use token price
    if (ReFiTokenInfo.value) {
      return toFiat(bptBalance.value.toString(), ReFiTokenInfo.value.address);
    }
    return '0';
  });

  return {
    isLoadingLockPool,
    isLoadingLockInfo,
    isLoadingLock,
    lockPoolToken,
    lockPool,
    lock,
    totalLockedValue,
    totalLockedShares,
    bptBalance,
    fiatTotal,
  };
}
