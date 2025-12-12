import { reactive, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { ethers } from 'ethers';
import useWeb3 from '@/services/web3/useWeb3';
import { useTokens } from '@/providers/tokens.provider';
import { Vault, VaultStrategy } from './types';

export function useVault(
  id: string,
  initialState: Vault,
  strategy: VaultStrategy
) {
  const vault = reactive<Vault>(initialState);
  const { account, getProvider } = useWeb3();
  const { priceFor } = useTokens();

  const getProviderSafe = (): ethers.providers.Provider => {
    try {
      return getProvider?.() as ethers.providers.Provider;
    } catch {
      return ethers.getDefaultProvider();
    }
  };

  const getSigner = () => {
    const prov = getProviderSafe();
    if ((prov as any).getSigner && account.value) {
      return (prov as any).getSigner(account.value);
    }
    throw new Error('No signer available. Connect wallet.');
  };

  const queryKey = computed(() => [
    'vaults',
    id,
    vault.contractAddress,
    account.value,
  ]);

  const queryFn = async () => {
    if (!account.value) throw new Error('User not connected');
    const balances = await strategy.readBalances(
      getProviderSafe,
      account.value,
      vault.contractAddress
    );
    Object.assign(vault, balances);
    if (vault.tokenAddress) vault.price = priceFor(vault.tokenAddress) || 0;
    vault.apy = await strategy.getApy(getProviderSafe, vault.contractAddress);
    return balances;
  };

  const { refetch, isFetching, isError } = useQuery(queryKey.value, queryFn, {
    enabled: computed(() => !!vault.contractAddress && !!account.value),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  return {
    vault,
    depositTx: (amount: number, tokenAddress?: string) =>
      strategy.deposit(getSigner, vault.contractAddress, amount, tokenAddress),
    depositTxForToken: (tokenAddress: string, amount: number) =>
      strategy.deposit(getSigner, vault.contractAddress, amount, tokenAddress),
    withdrawTx: (amount: string) =>
      strategy.withdraw(getSigner, vault.contractAddress, amount),
    refetch,
    isLoading: isFetching,
    isError,
    getProvider: getProviderSafe,
  };
}
