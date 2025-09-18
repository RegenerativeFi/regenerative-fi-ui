import useStCelo from './stCelo';
import { reactive, ref } from 'vue';

export function useVaults() {
  const stCelo = useStCelo();

  const vaults = reactive([stCelo.vault]);
  const isLoading = ref(false);

  // map contractAddress => composable instance
  const composables = new Map<string, ReturnType<typeof useStCelo>>();
  // register default composable
  composables.set(stCelo.vault.contractAddress, stCelo);

  function getOrCreateComposable(contractAddress?: string) {
    if (!contractAddress) return stCelo;
    const existing = composables.get(contractAddress);
    if (existing) return existing;
    const c = useStCelo(contractAddress);
    composables.set(contractAddress, c);
    // register vault ref in the shared array so UI can bind to it
    vaults.push(c.vault);
    return c;
  }

  async function fetchBalances(
    contractAddress?: string,
    userAddress?: string,
    provider?: any
  ) {
    if (!contractAddress || !userAddress) return null;
    isLoading.value = true;
    try {
      const composable = getOrCreateComposable(contractAddress);
      const val = await composable.fetchOnchainBalance(
        contractAddress,
        userAddress,
        provider
      );
      // val already applied to composable.vault.available inside fetchOnchainBalance
      return val;
    } finally {
      isLoading.value = false;
    }
  }

  async function refetchAll() {
    // refetch all known vault composables
    const promises: Promise<any>[] = [];
    composables.forEach(c => promises.push(c.refetch()));
    await Promise.all(promises);
  }

  async function refetchVault(contractAddress?: string) {
    if (!contractAddress) return null;
    const composable = getOrCreateComposable(contractAddress);
    return await composable.refetch();
  }

  return {
    vaults,
    isLoading,
    fetchBalances,
    refetchAll,
    refetchVault,
  };
}
