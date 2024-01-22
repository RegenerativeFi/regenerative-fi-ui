import { QueryKey, useQuery } from '@tanstack/vue-query';
import { campaignsService } from '@/services/campaigns/campaigns.service';
import useWeb3 from '@/services/web3/useWeb3';
import useNotifications from '../useNotifications';
import useTransactions from '../useTransactions';

export function useAllocations() {
  const { account, chainId } = useWeb3();
  const { addNotification } = useNotifications();
  const { addTransaction } = useTransactions();
  const isClaimingReward = ref(false);

  const queryKey = reactive(['currentAllocation']);
  const queryFn = async () => {
    return await campaignsService.getCurrentAllocation(
      chainId.value,
      account.value
    );
  };

  const { data: currentAllocation, isLoading } = useQuery(
    queryKey as QueryKey,
    queryFn,
    {
      enabled: true,
    }
  );
  const claimReward = async () => {
    isClaimingReward.value = true;
    try {
      const txResponse = await campaignsService.claimAllocantions();
      addTransaction({
        id: txResponse.hash,
        type: 'tx',
        action: 'claimRewards',
        summary: 'Regenerative Finance Rewards',
      });
    } catch (error) {
      console.error('Error upgrading NFT:', error);
      addNotification({
        title: 'Error',
        message: 'The reward could not be claimed',
        type: 'error',
      });
    } finally {
      isClaimingReward.value = false;
    }
  };

  return { currentAllocation, isLoading, claimReward, isClaimingReward };
}
