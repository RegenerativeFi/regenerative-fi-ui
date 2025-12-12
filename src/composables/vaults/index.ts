import useStCelo from './stCelo';

const VAULT_REGISTRY = new Map<string, () => ReturnType<typeof useStCelo>>();

export function useVaults() {
  const stCelo = useStCelo();
  VAULT_REGISTRY.set(stCelo.vault.contractAddress, useStCelo);

  const vaults = [stCelo.vault];
  const getComposable = (contractAddress?: string) => {
    if (!contractAddress || contractAddress === stCelo.vault.contractAddress)
      return stCelo;
    const factory = VAULT_REGISTRY.get(contractAddress);
    if (!factory)
      throw new Error(
        `Vault with contract address ${contractAddress} not supported.`
      );
    return factory();
  };

  return {
    vaults,
    refetchVault: (contractAddress?: string) =>
      getComposable(contractAddress).refetch(),
    getComposable,
  };
}
