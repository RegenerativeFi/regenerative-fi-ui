import { reactive, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { ethers } from 'ethers';
import useWeb3 from '@/services/web3/useWeb3';
import { useTokens } from '@/providers/tokens.provider';
import { Vault, VaultStrategy } from './types';
import { DEFAULT_USER_MAX_DEPOSIT } from './config';

export function useVault(
  id: string,
  initialState: Vault,
  strategy: VaultStrategy
) {
  const vault = reactive<Vault>(initialState);
  const { account, getProvider } = useWeb3();
  const { priceFor } = useTokens();

  const getProviderSafe = (): ethers.providers.Provider => {
    return (
      (getProvider?.() as ethers.providers.Provider) ??
      ethers.getDefaultProvider()
    );
  };

  const getSigner = () => {
    const prov = getProviderSafe() as any;
    if (prov.getSigner && account.value) return prov.getSigner(account.value);
    throw new Error('No signer available');
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

    if (balances.vaultMaxCapacity)
      vault.vaultCapacityLimit = Number(balances.vaultMaxCapacity);
    if (balances.vaultTotalDeposits)
      vault.vaultCapacityUsed = Number(balances.vaultTotalDeposits);

    const maxDeposit = vault.userDepositLimit ?? DEFAULT_USER_MAX_DEPOSIT;
    vault.userDepositLimit = maxDeposit;
    vault.userRemainingDeposit = Math.max(
      0,
      maxDeposit - (Number(balances.deposit) || 0)
    );

    if (vault.tokenAddress) vault.price = priceFor(vault.tokenAddress) || 0;
    vault.apy = await strategy.getApy(getProviderSafe, vault.contractAddress);

    return balances;
  };

  const { refetch, isError } = useQuery({
    queryKey,
    queryFn,
    enabled: computed(() => !!vault.contractAddress && !!account.value),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  return {
    vault,
    depositTx: (amount: number, tokenAddress?: string) =>
      strategy.deposit(getSigner, amount, tokenAddress),
    depositTxForToken: (tokenAddress: string, amount: number) =>
      strategy.deposit(getSigner, amount, tokenAddress),
    withdrawTx: (amount: string) => strategy.withdraw(getSigner, amount),
    refetch,
    isError,
    getProvider: getProviderSafe,
  };
}
