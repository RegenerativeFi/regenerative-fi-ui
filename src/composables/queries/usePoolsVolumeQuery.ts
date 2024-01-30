import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { useQuery } from '@tanstack/vue-query';
import useNetwork from '../useNetwork';
import QUERY_KEYS from '@/constants/queryKeys';

export default function usePoolsVolumeQuery() {
  const { networkId } = useNetwork();

  const getPoolsVolumesQueryFn = async () => {
    try {
      const { balancers: volumes } =
        await balancerSubgraphService.balancers.get();
      return {
        totalLiquidity: volumes[0].totalLiquidity,
        totalVolume: volumes[0].totalSwapVolume,
      };
    } catch (error) {
      console.error('Error fetching TVL:', error);
      throw error;
    }
  };
  const getPoolsVolumesQueryKey = reactive(
    QUERY_KEYS.Balancers.Pools(networkId)
  );

  return useQuery(getPoolsVolumesQueryKey, getPoolsVolumesQueryFn);
}
