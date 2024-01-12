import { QueryKey, useQuery } from '@tanstack/vue-query';
import { campaignsService } from '@/services/campaigns/campaigns.service';

export default function useAllocance() {
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

  return { currentAllocation, isLoading };
}
