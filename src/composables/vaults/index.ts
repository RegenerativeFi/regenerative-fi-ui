import useStCelo from './stCelo';
import { reactive, ref } from 'vue';

export function useVaults() {
  const stCelo = useStCelo();

  const vaults = reactive([stCelo.vault]);
  const isLoading = ref(false);

  async function fetchBalances(
    contractAddress?: string,
    userAddress?: string,
    provider?: any
  ) {
    if (!contractAddress || !userAddress) return null;
    isLoading.value = true;
    try {
      const val = await stCelo.fetchOnchainBalance(
        contractAddress,
        userAddress,
        provider
      );
      // val already applied to stCelo.vault.available inside fetchOnchainBalance
      return val;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    vaults,
    isLoading,
    fetchBalances,
  };
}
