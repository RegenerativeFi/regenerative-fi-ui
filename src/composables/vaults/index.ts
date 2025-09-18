import useStCelo from './stCelo';
import { reactive, ref } from 'vue';

export function useVaults() {
  const stCelo = useStCelo();

  const vaults = reactive([stCelo.vault]);
  const isLoading = ref(false);

  const composables = new Map<string, ReturnType<typeof useStCelo>>();
  composables.set(stCelo.vault.contractAddress, stCelo);

  function getOrCreateComposable(contractAddress?: string) {
    if (!contractAddress) return stCelo;
    const existing = composables.get(contractAddress);
    if (existing) return existing;

    // This part is tricky without a generic factory.
    // For now, we only support stCelo.
    if (contractAddress === stCelo.vault.contractAddress) {
      const c = useStCelo();
      composables.set(contractAddress, c);
      if (!vaults.some(v => v.id === c.vault.id)) {
        vaults.push(c.vault);
      }
      return c;
    }
    // In the future, a factory would decide which vault composable to create.
    throw new Error(
      `Vault with contract address ${contractAddress} not supported.`
    );
  }

  async function fetchBalances(contractAddress?: string, userAddress?: string) {
    if (!contractAddress || !userAddress) return null;
    isLoading.value = true;
    try {
      const composable = getOrCreateComposable(contractAddress);
      // The new useVault refetches on its own, so we just trigger it.
      await composable.refetch();
    } finally {
      isLoading.value = false;
    }
  }

  async function refetchAll() {
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
    getComposable: getOrCreateComposable,
  };
}
