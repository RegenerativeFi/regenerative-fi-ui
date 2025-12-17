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

  // User deposit limit: 1000 stCELO per user
  const USER_MAX_DEPOSIT = 1000;

  const queryFn = async () => {
    if (!account.value) throw new Error('User not connected');
    const balances = await strategy.readBalances(
      getProviderSafe,
      account.value,
      vault.contractAddress
    );
    Object.assign(vault, balances);

    // Update vault capacity from contract data
    if (balances.vaultMaxCapacity) {
      vault.vaultCapacityLimit = Number(balances.vaultMaxCapacity);
    }
    if (balances.vaultTotalDeposits) {
      vault.vaultCapacityUsed = Number(balances.vaultTotalDeposits);
    }

    // Calculate user's remaining deposit allowance (1000 - current deposit)
    const currentDeposit = Number(balances.deposit) || 0;
    vault.userDepositLimit = USER_MAX_DEPOSIT;
    vault.userRemainingDeposit = Math.max(0, USER_MAX_DEPOSIT - currentDeposit);

    if (vault.tokenAddress) vault.price = priceFor(vault.tokenAddress) || 0;
    const apy = await strategy.getApy(getProviderSafe, vault.contractAddress);
    vault.apy = apy;
    return balances;
  };

  const isEnabled = computed(() => !!vault.contractAddress && !!account.value);

  const { refetch, isError } = useQuery({
    queryKey,
    queryFn,
    enabled: isEnabled,
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
