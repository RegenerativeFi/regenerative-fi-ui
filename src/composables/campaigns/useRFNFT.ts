import { useQuery, QueryKey } from '@tanstack/vue-query';
import {
  RFNFTData,
  campaignsService,
} from '@/services/campaigns/campaigns.service';
import useWeb3 from '@/services/web3/useWeb3';
import useNotifications from '../useNotifications';
import useTransactions from '../useTransactions';

export function useRFNFT() {
  const { addNotification } = useNotifications();
  const { addTransaction } = useTransactions();
  const { account, chainId } = useWeb3();
  const isMintingNFTStatus = ref({
    loading: false,
    success: false,
  });
  const isUpgradingNFTStatus = ref({
    loading: false,
    success: false,
  });
  const fetchNFTImage = async (ipfsHash: string) => {
    const imageUrl = `https://${
      import.meta.env.VITE_IPFS_NODE
    }/ipfs/${ipfsHash}`;
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.blob();
    } catch (error) {
      console.error('Error fetching NFT image:', error);
    }
  };
  const queryKey: QueryKey = ['currentNFT'];

  const queryFn = async () => {
    try {
      const data = await campaignsService.getCurrentNFT(
        chainId.value,
        account.value
      );
      if (data?.image) {
        const ipfsHash = data.image.split('ipfs://')[1];
        const imageData = await fetchNFTImage(ipfsHash);
        const imageDataUrl = URL.createObjectURL(imageData as Blob);
        const RNFTData: RFNFTData & {
          imageData: string;
          id: number;
          points: number;
        } = {
          ...data,
          imageData: imageDataUrl,
        };
        return RNFTData;
      }
      return null;
    } catch (error) {
      // @ts-expect-error TODO: fix this
      if (error.reason === 'ERC721: invalid token ID') {
        return null;
      }
      throw error;
    }
  };

  const { data, isLoading, refetch, isRefetching } = useQuery(
    queryKey,
    queryFn,
    {
      refetchIntervalInBackground: false,
      refetchInterval: 50000,
      enabled: true,
    }
  );

  const MintNFT = async () => {
    isMintingNFTStatus.value.loading = true;
    try {
      const txResponse = await campaignsService.mintNFT();
      addTransaction({
        id: txResponse.hash,
        type: 'tx',
        action: 'mintNFT',
        summary: 'Regenerative Finance NFT',
      });
      await txResponse.wait();
      refetch();
      isMintingNFTStatus.value = {
        success: true,
        loading: false,
      };
    } catch (error) {
      console.error('Error minting NFT:', error);
      addNotification({
        title: 'Error',
        message: 'The NFT could not be minted',
        type: 'error',
      });
    } finally {
      isMintingNFTStatus.value = {
        ...isMintingNFTStatus.value,
        loading: false,
      };
    }
  };

  const UpgradeNFT = async () => {
    isUpgradingNFTStatus.value = {
      loading: true,
      success: false,
    };
    try {
      const txResponse = await campaignsService.upgradeNFT(chainId.value);
      addTransaction({
        id: txResponse.hash,
        type: 'tx',
        action: 'upgradeNFT',
        summary: 'Regenerative Finance NFT',
      });
      await txResponse.wait();
      refetch();
      isUpgradingNFTStatus.value = {
        loading: false,
        success: true,
      };
    } catch (error) {
      console.error('Error upgrading NFT:', error);
      addNotification({
        title: 'Error',
        message: 'The NFT could not be upgraded',
        type: 'error',
      });
    } finally {
      isUpgradingNFTStatus.value = {
        ...isUpgradingNFTStatus.value,
        loading: false,
      };
    }
  };
  return {
    NFTData: data,
    isLoading,
    MintNFT,
    UpgradeNFT,
    isMintingNFTStatus,
    isUpgradingNFTStatus,
    refetchNFTData: refetch,
    isRefetchingNFTData: isRefetching,
  };
}
