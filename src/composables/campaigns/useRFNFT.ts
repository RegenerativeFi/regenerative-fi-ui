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
  const { account } = useWeb3();
  const fetchNFTImage = async (ipfsHash: string) => {
    try {
      const imageUrl = `https://${
        import.meta.env.VITE_IPFS_NODE
      }/ipfs/${ipfsHash}`;
      return imageUrl;
    } catch (error) {
      console.error('Failed to fetch NFT image:', error);
      // Consider how you want to handle image fetch errors - ignore or throw.
    }
  };
  const queryKey: QueryKey = ['currentNFT'];

  const queryFn = async () => {
    try {
      const data = await campaignsService.getCurrentNFT(account.value);
      if (data?.image) {
        const ipfsHash = data.image.split('ipfs://')[1];
        const imageData = await fetchNFTImage(ipfsHash);
        const RNFTData: RFNFTData & {
          imageData: string;
          id: number;
          points: number;
        } = {
          ...data,
          imageData: imageData as string,
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

  const { data, isLoading } = useQuery(queryKey, queryFn, {
    enabled: true,
  });

  const MintNFT = async () => {
    try {
      const txResponse = await campaignsService.mintNFT();
      addTransaction({
        id: txResponse.hash,
        type: 'tx',
        action: 'mintNFT',
        summary: 'Regenerative Finance NFT',
      });
    } catch (error) {
      console.error('Error minting NFT:', error);
      addNotification({
        title: 'Error',
        message: 'The NFT could not be minted',
        type: 'error',
      });
    }
  };

  return {
    NFTData: data,
    isLoading,
    MintNFT,
  };
}
