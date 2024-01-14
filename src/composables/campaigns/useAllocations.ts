import { QueryKey, useMutation, useQuery } from '@tanstack/vue-query';
import { campaignsService } from '@/services/campaigns/campaigns.service';

export function useAllocations() {
  const queryKey = reactive(['currentAllocation']);
  const queryFn = async () => {
    return await campaignsService.getCurrentAllocation();
  };

  const { data: currentAllocation, isLoading } = useQuery(
    queryKey as QueryKey,
    queryFn,
    {
      enabled: true,
    }
  );
  const mutationKey = reactive(['claimReward']);
  const mutationFn = async () => {
    return await campaignsService.claimAllocantions();
  };

  const { mutate } = useMutation(mutationKey as QueryKey, mutationFn);

  return { currentAllocation, isLoading, claimReward: mutate };
}
