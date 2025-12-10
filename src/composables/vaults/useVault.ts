import { reactive, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { ethers } from 'ethers';
import useWeb3 from '@/services/web3/useWeb3';
import { useTokens } from '@/providers/tokens.provider';
import { Vault, VaultStrategy } from './types';

export function useVault(
  id: string,
  initialState: Partial<Vault>,
  strategy: VaultStrategy
) {
  const vault = reactive<Vault>({
    id,
    title: '',
    apy: [],
    deposit: '0',
    depositRaw: '0',
    available: '0',
    contractAddress: '',
    ...initialState,
  });

  const { account, getProvider } = useWeb3();
  const { priceFor } = useTokens();

  const getProviderSafe = (): ethers.providers.Provider => {
    try {
      const p = getProvider?.();
      if (p) return p as ethers.providers.Provider;
    } catch (error) {
      console.error('Error getting provider:', error);
    }
    return ethers.getDefaultProvider();
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
    { contractAddress: vault.contractAddress, account: account.value },
  ]);

  const queryFn = async () => {
    if (!account.value) throw new Error('User not connected');
    const balances = await strategy.readBalances(
      getProviderSafe,
      account.value,
      vault.contractAddress
    );
    Object.assign(vault, balances);
    if (vault.tokenAddress) {
      vault.price = priceFor(vault.tokenAddress) || 0;
    }
    const dynamicApy = await strategy.getApy(
      getProviderSafe,
      vault.contractAddress
    );
    vault.apy = dynamicApy;
    return balances;
  };

  const { refetch, isFetching, isError } = useQuery(queryKey.value, queryFn, {
    enabled: computed(() => !!vault.contractAddress && !!account.value),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const depositTx = (amount: number) => {
    return strategy.deposit(getSigner, vault.contractAddress, amount);
  };

  const withdrawTx = (amount: string) => {
    return strategy.withdraw(getSigner, vault.contractAddress, amount);
  };

  return {
    vault,
    depositTx,
    withdrawTx,
    refetch,
    isLoading: isFetching,
    isError,
  };
}
