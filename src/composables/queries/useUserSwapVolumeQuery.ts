import useWeb3 from '@/services/web3/useWeb3';
import useNetwork from '../useNetwork';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { WeeklyBalance } from '@/services/pool/types';
import { UseInfiniteQueryOptions, useInfiniteQuery } from '@tanstack/vue-query';

type WeeklySwapsQueryResponse = {
  weeklySwaps: WeeklyBalance[];
};

type QueryOptions = UseInfiniteQueryOptions<WeeklySwapsQueryResponse>;

export default function useUserSwapVolumeQuery(options: QueryOptions = {}) {
  // COMPOSABLES
  const { account, isWalletReady } = useWeb3();
  const { networkId } = useNetwork();

  // COMPUTED
  const enabled = computed(() => isWalletReady.value && account.value != null);

  // DATA
  const { timestamp_gte, timestamp_lte } = getWeekRange();
  const queryKey = reactive(
    QUERY_KEYS.Swaps.Week(networkId, account, timestamp_gte, timestamp_lte)
  );

  // METHODS
  function getWeekRange() {
    const now = new Date();

    // Find the previous Wednesday
    const lastWednesday = new Date(now);
    lastWednesday.setUTCHours(23, 59, 59, 999);
    lastWednesday.setUTCDate(
      lastWednesday.getUTCDate() - ((lastWednesday.getUTCDay() + 4) % 7)
    );

    // Find the next Thursday
    const nextThursday = new Date(lastWednesday);
    nextThursday.setUTCDate(lastWednesday.getUTCDate() + 7);
    nextThursday.setUTCHours(0, 0, 0, 0);

    return {
      timestamp_gte: Math.floor(lastWednesday.getTime() / 1000),
      timestamp_lte: Math.floor(nextThursday.getTime() / 1000),
    };
  }

  const queryFn = async ({ pageParam = 0 }) => {
    console.debug(timestamp_gte, timestamp_lte);
    const weeklySwaps = await balancerSubgraphService.userSwaps.get({
      skip: pageParam,
      first: 1000,
      where: {
        userAddress: account.value.toLocaleLowerCase(),
        timestamp_gte,
        timestamp_lte,
      },
    });
    console.debug(weeklySwaps);
    return {
      weeklySwaps: weeklySwaps,
    };
  };
  const queryOptions = reactive({
    enabled,
    ...options,
  });

  return useInfiniteQuery<WeeklySwapsQueryResponse>(
    queryKey,
    queryFn,
    queryOptions as QueryOptions
  );
}
