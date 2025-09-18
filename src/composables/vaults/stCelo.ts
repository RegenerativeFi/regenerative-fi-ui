import { reactive, computed, Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { ethers } from 'ethers';
import useWeb3 from '@/services/web3/useWeb3';

export interface Vault {
  id: string;
  title: string;
  apy: number;
  deposit: number;
  available: string;
  icon?: string;
  contractAddress?: string;
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
    deposit: 0,
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
      u;
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
    const token = new ethers.Contract(addr, ERC20_ABI, prov);
    const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, prov);
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, ERC20_ABI, prov);

    const [rawTokenBalance, rawVaultBalance] = await Promise.all([
      token.balanceOf(user),
      vaultContract.balanceOf(user),
    ]);

    let decimals = DEFAULT_DECIMALS;
    try {
      decimals = Number(await token.decimals());
    } catch (error) {
      console.error('Error getting token decimals:', error);
    }

    const stBalance = ethers.utils.formatUnits(rawTokenBalance, decimals);
    let tokenSupply = stBalance;
    let vaultSupply = ethers.utils.formatUnits(rawVaultBalance, decimals);

    try {
      const rawTokenSupply = await manager.toCelo(rawTokenBalance);
      tokenSupply = ethers.utils.formatUnits(rawTokenSupply, decimals);
    } catch (error) {
      console.error('Error getting token supply:', error);
    }

    try {
      const rawVaultSupply = await manager.toCelo(rawVaultBalance);
      vaultSupply = ethers.utils.formatUnits(rawVaultSupply, decimals);
    } catch (error) {
      console.error('Error getting vault supply:', error);
    }

    return { stBalance, tokenSupply, vaultSupply, decimals };
  };

  const queryKey = computed(() => [
    'vaults',
    id,
    { contractAddress: resolvedContractAddress.value, account: account.value },
  ]);

  const queryFn = async () => {
    const addr = resolvedContractAddress.value;
    if (!addr || !account.value) return null;
    const { stBalance, tokenSupply, vaultSupply } = await readBalances(
      addr,
      account.value
    );
    vault.available = stBalance;
    vault.supplyBalance = vaultSupply;
    vault.deposit = Number(vaultSupply);
    return { stBalance, tokenSupply, vaultSupply };
  };

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
    vault.deposit = Number(balances.vaultSupply);
    return balances;
  };

  const updateLocalState = (amount: number, isDeposit: boolean) => {
    const aNum = Number(vault.available);
    if (isDeposit) {
      vault.deposit += amount;
      vault.available = String(Math.max(0, aNum - amount));
    } else {
      vault.deposit = Math.max(0, vault.deposit - amount);
      vault.available = String(aNum + amount);
    }
  };

  const executeTx = async (
    amount: number,
    isDeposit: boolean,
    tokenAddr: string,
    vaultAddr: string
  ) => {
    const signer = getSigner();
    const tokenContract = new ethers.Contract(
      tokenAddr,
      [
        'function approve(address,uint256) returns (bool)',
        'function decimals() view returns (uint8)',
      ],
      signer
    );
    const vaultContract = new ethers.Contract(
      vaultAddr,
      ['function deposit(uint256)', 'function withdraw(uint256)'],
      signer
    );

    let decimals = DEFAULT_DECIMALS;
    try {
      decimals = Number(await tokenContract.decimals());
    } catch (error) {
      console.error('Error getting token decimals:', error);
    }

    const amountBn = ethers.utils.parseUnits(String(amount), decimals);

    if (isDeposit) {
      const approveTx = await tokenContract.approve(vaultAddr, amountBn);
      await approveTx.wait();
      const tx = await vaultContract.deposit(amountBn);
      return await tx.wait();
    } else {
      const tx = await vaultContract.withdraw(amountBn);
      return await tx.wait();
    }
  };

  const depositTx = (amount: number) => {
    updateLocalState(amount, true);
    return (async () => {
      try {
        const tokenAddr = resolvedContractAddress.value;
        const vaultAddr = VAULT_ADDRESS;
        if (!tokenAddr) throw new Error('Token address missing');
        const receipt = await executeTx(amount, true, tokenAddr, vaultAddr);
        await fetchOnchainBalance();
        return { success: true, receipt };
      } catch (e: any) {
        await fetchOnchainBalance();
        return { success: false, error: e.message };
      }
    })();
  };

  const withdrawTx = (amount: number) => {
    updateLocalState(amount, false);
    return (async () => {
      try {
        const tokenAddr = resolvedContractAddress.value;
        const vaultAddr = VAULT_ADDRESS;
        if (!tokenAddr) throw new Error('Token address missing');
        const receipt = await executeTx(amount, false, tokenAddr, vaultAddr);
        await fetchOnchainBalance();
        return { success: true, receipt };
      } catch (e: any) {
        await fetchOnchainBalance();
        return { success: false, error: e.message };
      }
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
