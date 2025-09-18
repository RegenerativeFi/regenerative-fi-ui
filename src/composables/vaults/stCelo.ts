import { reactive, computed, Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { ethers } from 'ethers';
import useWeb3 from '@/services/web3/useWeb3';

export interface Vault {
  id: string;
  title: string;
  apy: number;
  deposit: string; // CELO-render value (converted)
  depositRaw: string; // raw stCELO amount (token units) for on-chain operations
  available: string; // stCELO available
  icon?: string;
  contractAddress: string;
  supplyBalance?: string;
}

export default function useStCelo(
  contractAddressInput?: string | Ref<string | undefined>
) {
  const id = 'stCelo';
  const DEFAULT_DECIMALS = 18;
  const MANAGER_ADDRESS = '0x0239b96D10a434a56CC9E09383077A0490cF9398';
  const ERC20_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
  ];
  const MANAGER_ABI = ['function toCelo(uint256) view returns (uint256)'];
  const VAULT_ADDRESS = '0x794163F6f73dA948D1392cedE445e851e9681cEc';

  const vault = reactive<Vault>({
    id,
    title: 'Staked CELO',
    apy: 1.9,
    deposit: '0',
    depositRaw: '0',
    available: '0',
    icon: 'https://cdn.prod.website-files.com/652d421c1214a2eebd967f1d/683f449264407a7213b865fa_Celo.png',
    contractAddress: '0xC668583dcbDc9ae6FA3CE46462758188adfdfC24',
    supplyBalance: '0',
  });

  const { account, getProvider } = useWeb3();

  const resolvedContractAddress = computed(() => {
    if (typeof contractAddressInput === 'string') return contractAddressInput;
    return (
      (contractAddressInput as Ref<string | undefined>)?.value ||
      vault.contractAddress
    );
  });

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

  const readBalances = async (
    addr: string,
    user: string,
    provider?: ethers.providers.Provider
  ) => {
    const prov = provider || getProviderSafe();
    const token = new ethers.Contract(addr, ERC20_ABI, prov as any);
    const manager = new ethers.Contract(
      MANAGER_ADDRESS,
      MANAGER_ABI,
      prov as any
    );
    const vaultContract = new ethers.Contract(
      VAULT_ADDRESS,
      ERC20_ABI,
      prov as any
    );

    const [rawTokenBalance, rawVaultBalance] = await Promise.all([
      token.balanceOf(user),
      vaultContract.balanceOf(user),
    ]);

    let decimals = DEFAULT_DECIMALS;
    try {
      const d = await token.decimals();
      decimals = Number(d);
    } catch {
      // fallback to default
    }

    const stBalance = ethers.utils.formatUnits(rawTokenBalance, decimals);

    // raw vault supply in token units (stCELO) as raw string
    const vaultRaw = rawVaultBalance.toString();

    // supplyBalance for token (stCELO -> CELO) and vault (rStCelo -> CELO)
    let tokenSupply = stBalance;
    let vaultSupply = vaultRaw;
    try {
      const rawTokenSupply = await manager.toCelo(rawTokenBalance);
      const rawVaultSupply = await manager.toCelo(rawVaultBalance);

      tokenSupply = ethers.utils.formatUnits(rawTokenSupply, decimals);
      vaultSupply = ethers.utils.formatUnits(rawVaultSupply, decimals);
    } catch (error) {
      console.error('Error converting to CELO:', error);
    }

    return { stBalance, tokenSupply, vaultSupply, vaultRaw, decimals };
  };

  const queryKey = computed(() => [
    'vaults',
    id,
    { contractAddress: resolvedContractAddress.value, account: account.value },
  ]);

  const queryFn = () =>
    fetchOnchainBalance(resolvedContractAddress.value, account.value);

  const { refetch, isFetching, isError } = useQuery(queryKey.value, queryFn, {
    enabled: computed(() => !!resolvedContractAddress.value && !!account.value),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const fetchOnchainBalance = async (
    contractAddr?: string,
    userAddress?: string,
    provider?: ethers.providers.Provider
  ) => {
    const addr = contractAddr || resolvedContractAddress.value;
    const user = userAddress || account.value;
    if (!addr || !user) throw new Error('Missing addresses');
    const balances = await readBalances(addr, user, provider);
    vault.available = balances.stBalance;
    vault.supplyBalance = balances.vaultSupply;
    vault.deposit = balances.vaultSupply;
    vault.depositRaw = balances.vaultRaw;
    return balances;
  };

  const executeDepositTx = async (
    amount: number,
    underlyingAddr: string,
    vaultAddr: string
  ) => {
    const signer = getSigner();
    const underlyingContract = new ethers.Contract(
      underlyingAddr,
      ['function decimals() view returns (uint8)'],
      signer
    );
    const vaultContract = new ethers.Contract(
      vaultAddr,
      ['function deposit(uint256)'],
      signer
    );

    let decimals = DEFAULT_DECIMALS;
    try {
      decimals = Number(await underlyingContract.decimals());
    } catch (error) {
      console.error('Error getting token decimals:', error);
    }

    const amountBn = ethers.utils.parseUnits(String(amount), decimals);

    return await vaultContract.deposit(amountBn);
  };

  const executeWithdrawTx = async (
    amount: string,
    underlyingAddr: string,
    vaultAddr: string
  ) => {
    const signer = getSigner();
    const vaultContract = new ethers.Contract(
      vaultAddr,
      ['function withdraw(uint256)'],
      signer
    );

    return await vaultContract.withdraw(amount);
  };

  const depositTx = (amount: number) => {
    return (async () => {
      const tokenAddr = resolvedContractAddress.value;
      const vaultAddr = VAULT_ADDRESS;
      if (!tokenAddr) throw new Error('Token address missing');
      return await executeDepositTx(amount, tokenAddr, vaultAddr);
    })();
  };

  const withdrawTx = (amount: string) => {
    return (async () => {
      const tokenAddr = resolvedContractAddress.value;
      const vaultAddr = VAULT_ADDRESS;
      if (!tokenAddr) throw new Error('Token address missing');
      return await executeWithdrawTx(amount, tokenAddr, vaultAddr);
    })();
  };

  return {
    vault,
    depositTx,
    withdrawTx,
    fetchOnchainBalance,
    refetch,
    isLoading: isFetching,
    isError,
  };
}
