import useWeb3 from '@/services/web3/useWeb3';
import useNetwork from '../useNetwork';
import QUERY_KEYS from '@/constants/queryKeys';
import { POOLS } from '@/constants/pools';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { WeeklyBalance } from '@/services/pool/types';
import { UseInfiniteQueryOptions, useInfiniteQuery } from '@tanstack/vue-query';

type WeeklySwapsQueryResponse = {
  poolSwaps: WeeklyBalance[];
  skip?: number;
};

type QueryOptions = UseInfiniteQueryOptions<WeeklySwapsQueryResponse>;

export default function useUserSwapVolumeQuery(
  id: string,
  options: QueryOptions = {}
) {
  // COMPOSABLES
  const { account, isWalletReady } = useWeb3();
  const { networkId } = useNetwork();

  // COMPUTED
  const enabled = computed(() => isWalletReady.value && account.value != null);

  // DATA
  const queryKey = reactive(QUERY_KEYS.Pools.UserSwaps(networkId, id, account));

  // METHODS

  function getWeekRange() {
    const now = new Date();
    const getStartOfWeek = d => {
      const result = new Date(d);
      result.setUTCHours(0, 0, 0, 0); // Set to midnight
      result.setUTCDate(result.getUTCDate() - result.getUTCDay() + 1); // Move to Monday
      return result;
    };

    const startOfWeek = getStartOfWeek(now);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 7); // Next Monday (end of week)

    return {
      timestamp_gte: Math.floor(startOfWeek.getTime() / 1000), // Start of the week in seconds
      timestamp_lte: Math.floor(endOfWeek.getTime() / 1000), // End of the week in seconds
    };
  }
  const { timestamp_gte, timestamp_lte } = getWeekRange();

  const queryFn = async ({ pageParam = 0 }) => {
    const poolSwaps = await balancerSubgraphService.weekly.get({
      skip: pageParam,
      where: {
        userAddress: account.value.toLocaleLowerCase(),
        timestamp_gte,
        timestamp_lte,
      },
    });
    console.debug('poolSwaps', poolSwaps);
    return {
      poolSwaps,
      skip:
        poolSwaps.length >= POOLS.Pagination.PerPage
          ? pageParam + POOLS.Pagination.PerPage
          : undefined,
    };
  };
  const queryOptions = reactive({
    enabled,
    getNextPageParam: (lastPage: WeeklySwapsQueryResponse) => lastPage.skip,
    ...options,
  });

  return useInfiniteQuery<WeeklySwapsQueryResponse>(
    queryKey,
    queryFn,
    queryOptions as QueryOptions
  );
}
