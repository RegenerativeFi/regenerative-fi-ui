import { reactive } from 'vue';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';
import { Pool } from '@/services/pool/types';
import QUERY_KEYS from '@/constants/queryKeys';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';
import { useTokens } from '@/providers/tokens.provider';
import { cloneDeep } from 'lodash';
import useVotingPools from '../useVotingPools';

/**
 * TYPES
 */
type QueryResponse = Pool | undefined;
type QueryOptions = UseQueryOptions<QueryResponse>;

/**
 * Given a pool, uses PoolDecorator to fetch onchain attributes such as token
 * balances and totalSupply to make sure they're as up to date as possible and
 * returns a decorated pool object with those live values.
 */
export default function usePoolDecorationQuery(
  pool: Ref<Pool | undefined>,
  options: QueryOptions = {}
) {
  /**
   * COMPOSABLES
   */
  const { tokens } = useTokens();
  const { votingPools } = useVotingPools();

  /**
   * COMPUTED
   */
  const poolId = computed((): string | undefined => pool.value?.id);

  const queryKey = reactive(QUERY_KEYS.Pool.Decorated(poolId));

  const enabled = computed((): boolean => !!pool.value);

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    if (!pool.value) return undefined;
    // This is kinda ugly, but it's the only easy way to get the votes for the pool I found
    const associatedPool = votingPools.value.find(
      votingPool => pool.value?.id == votingPool.id
    );
    const _pool = cloneDeep(pool.value);
    const poolDecorator = new PoolDecorator([_pool]);
    // Decorate pool updating only the onchain attributes.
    const [decoratedPool] = await poolDecorator.decorate(tokens.value, false);
    return {
      ...decoratedPool,
      votes: associatedPool?.votes,
      userVotes: associatedPool?.userVotes,
      gauge: associatedPool?.gauge,
    };
  };

  /**
   * QUERY OPTIONS
   */
  const queryOptions = reactive({
    enabled,
    ...options,
  });

  return useQuery<QueryResponse>(
    queryKey,
    queryFn,
    queryOptions as QueryOptions
  );
}
