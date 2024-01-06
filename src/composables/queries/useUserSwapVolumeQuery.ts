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
    const getStartOfWeek = d => {
      const result = new Date(d);
      result.setUTCHours(0, 0, 0, 0);
      result.setUTCDate(result.getUTCDate() - result.getUTCDay() + 1);
      return result;
    };

    const startOfWeek = getStartOfWeek(now);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 7);

    return {
      timestamp_gte: Math.floor(startOfWeek.getTime() / 1000),
      timestamp_lte: Math.floor(endOfWeek.getTime() / 1000),
    };
  }
  function filterFirstSubSwaps(swaps: WeeklyBalance[]): WeeklyBalance[] {
    const seenTxHashes = new Map();

    return swaps.filter(swap => {
      if (!seenTxHashes.has(swap.tx)) {
        seenTxHashes.set(swap.tx, true);
        return true;
      }
      return false;
    });
  }

  const queryFn = async ({ pageParam = 0 }) => {
    const weeklySwaps = await balancerSubgraphService.userSwaps.get({
      skip: pageParam,
      first: 1000,
      where: {
        userAddress: account.value.toLocaleLowerCase(),
        timestamp_gte,
        timestamp_lte,
      },
    });
    const filteredWeeklySwaps = filterFirstSubSwaps(weeklySwaps);
    return {
      weeklySwaps: filteredWeeklySwaps,
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
