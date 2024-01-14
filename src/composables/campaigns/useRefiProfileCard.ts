import { useRFNFT } from './useRFNFT';

export function useRefiProfileCard() {
  const { NFTData, isLoading: isLoadingNFT, MintNFT } = useRFNFT();
  return {
    NFTData,
    isLoading: isLoadingNFT,
    MintNFT,
  };
}
