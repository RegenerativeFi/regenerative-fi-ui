import { computed } from 'vue';
import useStCelo from './stCelo';
import { VaultComposable } from './types';

export * from './types';
export * from './config';

type VaultComposableFactory = () => VaultComposable;

const VAULT_REGISTRY = new Map<string, VaultComposableFactory>();
const composableCache = new Map<string, VaultComposable>();

function initRegistry() {
  if (VAULT_REGISTRY.size > 0) return;
  const stCeloInstance = useStCelo();
  VAULT_REGISTRY.set(
    stCeloInstance.vault.contractAddress,
    useStCelo as VaultComposableFactory
  );
}

export function useVaults() {
  initRegistry();
  const stCelo = useStCelo();

  if (!composableCache.has(stCelo.vault.contractAddress)) {
    composableCache.set(stCelo.vault.contractAddress, stCelo);
  }

  const vaults = [stCelo.vault];

  const getComposable = (contractAddress?: string): VaultComposable => {
    const addr = contractAddress || stCelo.vault.contractAddress;
    const cached = composableCache.get(addr);
    if (cached) return cached;

    const factory = VAULT_REGISTRY.get(addr);
    if (!factory) throw new Error(`Vault ${addr} not supported`);

    const instance = factory();
    composableCache.set(addr, instance);
    return instance;
  };

  const isError = computed(() => stCelo.isError?.value ?? false);

  const totalDepositsUsd = computed(() =>
    vaults.reduce((acc, v) => acc + Number(v.deposit) * (v.price || 0), 0)
  );

  const globalDepositsUsd = computed(() =>
    vaults.reduce(
      (acc, v) => acc + Number(v.vaultCapacityUsed || 0) * (v.price || 0),
      0
    )
  );

  const averageApy = computed(() => {
    if (!vaults.length) return 0;
    const total = vaults.reduce(
      (acc, v) => acc + v.apy.reduce((s, c) => s + c.value, 0),
      0
    );
    return Number((total / vaults.length).toFixed(2));
  });

  return {
    vaults,
    isError,
    totalDepositsUsd,
    globalDepositsUsd,
    averageApy,
    refetchVault: (addr?: string) => getComposable(addr).refetch(),
    getComposable,
  };
}
