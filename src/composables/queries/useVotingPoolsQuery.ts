import { useQuery, UseQueryOptions } from '@tanstack/vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
// import { getApi } from '@/dependencies/balancer-api';
import {
  GaugeControllerDecorator,
  VotingPoolWithVotes,
} from '@/services/balancer/gauges/gauge-controller.decorator';
import useWeb3 from '@/services/web3/useWeb3';
import { networkId } from '@/composables/useNetwork';
import { VeBalGetVotingListQuery } from '@/services/api/graphql/generated/api-types';
import { Network } from '@/lib/config/types';
import { PoolType } from '@/services/pool/types';
// import { testnetVotingPools } from '@/components/contextual/pages/vebal/LMVoting/testnet-voting-pools';
import { alfajoresVotingPools } from '@/components/contextual/pages/vebal/LMVoting/alfajores-voting-pools';
import { mapApiChain, mapApiPoolType } from '@/services/api/graphql/mappers';
import { useTokens } from '@/providers/tokens.provider';
import { TokenInfo } from '@gnosis.pm/safe-apps-sdk';

/**
 * TYPES
 */

export type ApiVotingPools = VeBalGetVotingListQuery['veBalGetVotingList'];
export type ApiVotingPool = ApiVotingPools[number];
export type ApiVotingGauge = ApiVotingPools[number]['gauge'];

export type VotingPool = VotingPoolWithVotes & {
  network: Network;
  poolType: PoolType;
  bribes: {
    token: TokenInfo;
    amount: string;
    proposal: string;
    gauge: string;
  }[];
};

type QueryOptions = UseQueryOptions<VotingPool[]>;

/**
 * @summary Fetches voting pool list from balancer api and decorates it with onchain votes data
 */
export default function useVotingPoolsQuery(
  options: UseQueryOptions<VotingPool[]> = {}
) {
  /**
   * COMPOSABLES
   */
  const { account } = useWeb3();

  const { getToken } = useTokens();

  /**
   * QUERY KEY
   */
  const queryKey = QUERY_KEYS.Gauges.Voting(account);

  /**
   * QUERY FUNCTION
   */
  const queryFn = async (): Promise<VotingPool[]> => {
    try {
      let apiVotingPools: ApiVotingPools;
      console.log('networkId', networkId.value);
      if (networkId.value === Network.ALFAJORES) {
        apiVotingPools = alfajoresVotingPools();
      } else {
        return [];
      }

      const pools = await new GaugeControllerDecorator().decorateWithVotes(
        apiVotingPools,
        account.value
      );

      const bribesRes = await fetch(
        'https://incentives.regenerativefi.workers.dev/alfajores/get-incentives'
      ).then(res => res.json());

      const { bribes } = bribesRes;

      console.log('pools', pools);
      const poolsWithNetwork = pools.map(pool => {
        const poolBribes = bribes.filter(
          bribe => bribe.gauge === pool.gauge.address
        );
        const poolBribesWithTokens = poolBribes.map(bribe => {
          const bribeToken = getToken(bribe.token);
          return {
            ...bribe,
            token: {
              ...bribeToken,
            },
          };
        });
        return {
          ...pool,
          network: mapApiChain(pool.chain),
          poolType: mapApiPoolType(pool.type),
          bribes: poolBribesWithTokens,
        } as VotingPool;
      });
      return poolsWithNetwork.map(v => Object.freeze(v));
    } catch (error) {
      console.error('Failed to get voting pools', error);
      return [];
    }
  };

  /**
   * QUERY OPTIONS
   */
  const queryOptions = reactive({
    enabled: true,
    ...options,
  });

  return useQuery<VotingPool[]>(
    queryKey,
    queryFn,
    queryOptions as QueryOptions
  );
}
