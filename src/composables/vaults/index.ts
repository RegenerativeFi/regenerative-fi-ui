import { computed } from 'vue';
import useStCelo from './stCelo';
import { VaultComposable } from './types';

// Re-export types and config for external use
export * from './types';
export * from './config';

type VaultComposableFactory = () => VaultComposable;

const VAULT_REGISTRY = new Map<string, VaultComposableFactory>();

export function useVaults() {
  const stCelo = useStCelo();
  VAULT_REGISTRY.set(
    stCelo.vault.contractAddress,
    useStCelo as VaultComposableFactory
  );

  const vaults = [stCelo.vault];

  /**
   * Get composable instance for a vault by contract address
   */
  const getComposable = (contractAddress?: string): VaultComposable => {
    if (!contractAddress || contractAddress === stCelo.vault.contractAddress)
      return stCelo;
    const factory = VAULT_REGISTRY.get(contractAddress);
    if (!factory)
      throw new Error(
        `Vault with contract address ${contractAddress} not supported.`
      );
    return factory();
  };

  /**
   * Check if any vault is currently loading
   * Returns false if user is not connected (nothing to load)
   */
  const isLoading = computed(() => {
    const loading = stCelo.isLoading;
    // stCelo.isLoading is now a ComputedRef<boolean>
    return loading?.value ?? false;
  });

  /**
   * Check if any vault has an error
   */
  const isError = computed(() => {
    const error = stCelo.isError;
    return error?.value ?? false;
  });

  return {
    vaults,
    isLoading,
    isError,
    refetchVault: (contractAddress?: string) =>
      getComposable(contractAddress).refetch(),
    getComposable,
  };
}
