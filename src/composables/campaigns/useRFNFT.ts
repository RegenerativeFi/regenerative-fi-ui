import { useQuery, QueryKey, useMutation } from '@tanstack/vue-query';
import {
  RFNFTData,
  campaignsService,
} from '@/services/campaigns/campaigns.service';

export function useRFNFT() {
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
      const data = await campaignsService.getCurrentNFT();
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

  const mintNFTMutationKey: QueryKey = reactive(['mintNFT']);
  const mintNFTMutationFn = async () => {
    return await campaignsService.mintNFT();
  };

  const { mutate: MintNFT } = useMutation(
    mintNFTMutationKey,
    mintNFTMutationFn
  );

  return { NFTData: data, isLoading, MintNFT };
}
