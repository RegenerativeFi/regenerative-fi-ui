import { reactive, computed, Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { ethers } from 'ethers';
import useWeb3 from '@/services/web3/useWeb3';

export interface Vault {
  id: string;
  title: string;
  apy: number;
  deposit: number; // CELO-equivalent (what we want to show as 'deposit')
  available: string; // stCELO balance (string for precision)
  icon?: string;
  contractAddress?: string;
  supplyBalance?: string; // optional: raw CELO-equivalent as string
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
  const VAULT_ADDRESS = '0x794163F6f73dA948D1392cedE445e851e9681cEc'; // rStCelo (vault)

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

  function getProviderSafe(): ethers.providers.Provider {
    try {
      const p = getProvider ? getProvider() : undefined;
      if (p) return p as unknown as ethers.providers.Provider;
    } catch (e) {
      // fallthrough
    }
    return ethers.getDefaultProvider();
  }

  async function readBalances(
    addr: string,
    user: string,
    provider?: ethers.providers.Provider
  ) {
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
    } catch (e) {
      // keep default
    }

    const stBalance = ethers.utils.formatUnits(rawTokenBalance, decimals);

    // supplyBalance for token (stCELO -> CELO) and vault (rStCelo -> CELO)
    let tokenSupply = stBalance;
    let vaultSupply = ethers.utils.formatUnits(rawVaultBalance, decimals);
    try {
      const rawTokenSupply = await manager.toCelo(rawTokenBalance);
      tokenSupply = ethers.utils.formatUnits(rawTokenSupply, decimals);
    } catch (e) {
      // fallback to stBalance
    }

    try {
      const rawVaultSupply = await manager.toCelo(rawVaultBalance);
      vaultSupply = ethers.utils.formatUnits(rawVaultSupply, decimals);
    } catch (e) {
      // fallback to raw vault token units
    }

    return { stBalance, tokenSupply, vaultSupply, decimals };
  }

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
    // available = user's stCELO balance
    vault.available = String(stBalance);
    // supplyBalance = CELO-equivalent of the user's balance in the vault (rStCelo)
    vault.supplyBalance = String(vaultSupply);
    // deposit shown in UI should be the CELO-equivalent held in the vault
    vault.deposit = Number(parseFloat(vaultSupply));
    return { stBalance, tokenSupply, vaultSupply };
  };

  const { refetch, isFetching, isError } = useQuery(
    queryKey.value as any,
    queryFn,
    {
      enabled: computed(
        () => !!resolvedContractAddress.value && !!account.value
      ),
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30,
    }
  );

  async function fetchOnchainBalance(
    contractAddr?: string,
    userAddress?: string,
    provider?: ethers.providers.Provider
  ) {
    const addr = contractAddr || resolvedContractAddress.value;
    const user = userAddress || account.value;
    if (!addr || !user)
      throw new Error('contractAddress and userAddress are required');
    const { stBalance, tokenSupply, vaultSupply } = await readBalances(
      addr,
      user,
      provider
    );
    vault.available = String(stBalance);
    vault.supplyBalance = String(vaultSupply);
    vault.deposit = Number(parseFloat(vaultSupply));
    return { stBalance, tokenSupply, vaultSupply };
  }

  async function deposit(amount: number) {
    // Simular transacción: esperar 5s
    await new Promise(resolve => setTimeout(resolve, 5000));
    vault.deposit = Number((vault.deposit + amount).toFixed(6));
    const aNum = Number(vault.available) || 0;
    const newAvailable = Math.max(0, aNum - amount);
    vault.available = String(Number(newAvailable.toFixed(6)));
    return { success: true };
  }

  async function withdraw(amount: number) {
    // Simular transacción: esperar 5s
    await new Promise(resolve => setTimeout(resolve, 5000));
    vault.deposit = Number(Math.max(0, vault.deposit - amount).toFixed(6));
    const aNum = Number(vault.available) || 0;
    const newAvailable = aNum + amount;
    vault.available = String(Number(newAvailable.toFixed(6)));
    return { success: true };
  }

  // Placeholder TX functions intended to be called from UI modals.
  // These update local vault state immediately and act as thin adapters
  // to the simulated deposit/withdraw above. Later these should perform
  // the real on-chain transactions.
  function depositTx(amount: number) {
    // update state immediately (no artificial delay)
    // keep quick local update for optimistic UI, then try actual on-chain flow
    vault.deposit = Number((vault.deposit + amount).toFixed(6));
    const aNum = Number(vault.available) || 0;
    const newAvailable = Math.max(0, aNum - amount);
    vault.available = String(Number(newAvailable.toFixed(6)));

    // Try to perform on-chain approve + deposit. Return a promise that resolves when done.
    return (async () => {
      const tokenAddr = resolvedContractAddress.value;
      const vaultAddr = '0x794163F6f73dA948D1392cedE445e851e9681cEc';
      if (!tokenAddr) return { success: false, error: 'token address missing' };

      const prov = getProviderSafe();
      // Need a signer to send txs
      let signer: any | undefined;
      try {
        if ((prov as any).getSigner) {
          signer = (prov as any).getSigner(account.value);
        }
      } catch (e) {
        // ignore
      }

      if (!signer) {
        return {
          success: false,
          error: 'No signer available. Connect wallet.',
        };
      }

      try {
        const tokenWithSigner = new ethers.Contract(
          tokenAddr,
          [
            'function approve(address,uint256) returns (bool)',
            'function decimals() view returns (uint8)',
          ],
          signer
        );
        const vaultWithSigner = new ethers.Contract(
          vaultAddr,
          ['function deposit(uint256)'],
          signer
        );

        // read decimals
        let decimals = DEFAULT_DECIMALS;
        try {
          const d = await tokenWithSigner.decimals();
          decimals = Number(d);
        } catch (e) {
          // fallback
        }

        const amountBn = ethers.utils.parseUnits(String(amount), decimals);

        // approve
        console.debug(
          'Sending approve',
          tokenAddr,
          vaultAddr,
          amountBn.toString()
        );
        const approveTx = await tokenWithSigner.approve(vaultAddr, amountBn);
        console.debug('Approve tx sent', approveTx.hash);
        await approveTx.wait();
        console.debug('Approve confirmed');

        // deposit
        console.debug(
          'Sending deposit to vault',
          vaultAddr,
          amountBn.toString()
        );
        const depositTx = await vaultWithSigner.deposit(amountBn);
        console.debug('Deposit tx sent', depositTx.hash);
        const receipt = await depositTx.wait();
        console.debug('Deposit confirmed', receipt.transactionHash);

        // refresh on-chain balances to keep state consistent
        try {
          await fetchOnchainBalance(tokenAddr, account.value, prov);
        } catch (e) {
          // ignore refresh errors
        }

        return { success: true, receipt };
      } catch (e: any) {
        console.error('depositTx failed', e);
        // revert optimistic local update on failure: refetch from chain
        try {
          await fetchOnchainBalance(tokenAddr, account.value, prov);
        } catch (_) {
          // ignore fetch errors
        }
        return { success: false, error: e?.message || String(e) };
      }
    })();
  }

  function withdrawTx(amount: number) {
    // update state immediately (no artificial delay)
    vault.deposit = Number(Math.max(0, vault.deposit - amount).toFixed(6));
    const aNum = Number(vault.available) || 0;
    const newAvailable = aNum + amount;
    vault.available = String(Number(newAvailable.toFixed(6)));
    return Promise.resolve({ success: true });
  }

  function getVault() {
    return vault;
  }

  return {
    id,
    vault,
    deposit,
    withdraw,
    // new tx-facing placeholders
    depositTx,
    withdrawTx,
    fetchOnchainBalance,
    refetch,
    isLoading: isFetching,
    isError,
    getVault,
  };
}
