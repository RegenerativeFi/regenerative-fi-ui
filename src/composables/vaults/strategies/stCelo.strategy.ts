import { ethers } from 'ethers';
import { VaultStrategy, VaultBalanceData, ApyComponent } from '../types';
import { VAULT_TOKENS, TOKEN_ADDRESSES, VAULT_ADDRESSES } from '../config';
import { MerklApi } from '@merkl/api';

// Use centralized config - keep exports for backward compatibility
export const VAULT_ADDRESS = VAULT_ADDRESSES.STCELO_VAULT;
export const STCELO_ADDRESS = TOKEN_ADDRESSES.STCELO;
export const CELO_ADDRESS = TOKEN_ADDRESSES.CELO;

const DECIMALS = VAULT_TOKENS.CELO.decimals;

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

const VAULT_ABI = [
  'function deposit() payable',
  'function depositStCelo(uint256 amount)',
  'function withdraw(uint256 amount)',
  'function balanceOf(address) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function getCapacity() view returns (uint256 maxCapacity, uint256 remainingCapacity)',
];

async function readBalances(
  getProvider: () => ethers.providers.Provider,
  userAddress: string
): Promise<VaultBalanceData> {
  const provider = getProvider();
  const celoToken = new ethers.Contract(CELO_ADDRESS, ERC20_ABI, provider);
  const stCeloToken = new ethers.Contract(STCELO_ADDRESS, ERC20_ABI, provider);
  const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);

  const [rawVaultBalance, rawCeloBalance, rawStCeloBalance, capacityData] =
    await Promise.all([
      vaultContract.balanceOf(userAddress),
      celoToken.balanceOf(userAddress),
      stCeloToken.balanceOf(userAddress),
      vaultContract.getCapacity(),
    ]);

  // getCapacity() returns (maxCapacity, remainingCapacity)
  const [rawMaxCapacity, rawRemainingCapacity] = capacityData;
  // Calculate total deposits: maxCapacity - remainingCapacity = totalDeposits
  const rawTotalDeposits = rawMaxCapacity.sub(rawRemainingCapacity);

  let decimals = DECIMALS;
  try {
    decimals = await celoToken.decimals();
  } catch {
    // fallback
  }

  const celoBalance = ethers.utils.formatUnits(rawCeloBalance, decimals);
  const stCeloBalance = ethers.utils.formatUnits(rawStCeloBalance, decimals);
  const vaultRaw = rawVaultBalance.toString();
  const vaultDeposit = ethers.utils.formatUnits(rawVaultBalance, decimals);
  const totalDeposits = ethers.utils.formatUnits(rawTotalDeposits, decimals);
  const maxCapacity = ethers.utils.formatUnits(rawMaxCapacity, decimals);

  return {
    available: celoBalance,
    availableStCelo: stCeloBalance,
    deposit: vaultDeposit,
    depositRaw: vaultRaw,
    vaultTotalDeposits: totalDeposits,
    vaultMaxCapacity: maxCapacity,
  };
}

async function deposit(
  getSigner: () => ethers.Signer,
  amount: number,
  tokenAddress?: string
): Promise<ethers.ContractTransaction> {
  const signer = getSigner();
  const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

  // Default: deposit CELO (native)
  if (!tokenAddress || tokenAddress === CELO_ADDRESS) {
    const amountBn = ethers.utils.parseUnits(String(amount), DECIMALS);
    const tx = await vaultContract.deposit({ value: amountBn });
    await tx.wait();
    return tx;
  }

  // Deposit stCELO token
  if (tokenAddress === STCELO_ADDRESS) {
    const stCeloToken = new ethers.Contract(STCELO_ADDRESS, ERC20_ABI, signer);
    const amountBn = ethers.utils.parseUnits(String(amount), DECIMALS);

    // Approve vault to spend stCELO
    const approveTx = await stCeloToken.approve(VAULT_ADDRESS, amountBn);
    await approveTx.wait();

    // Deposit stCELO
    const tx = await vaultContract.depositStCelo(amountBn);
    await tx.wait();
    return tx;
  }

  throw new Error(`Unsupported token address: ${tokenAddress}`);
}

async function withdraw(getSigner: () => ethers.Signer, amount: string) {
  const signer = getSigner();
  const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
  const tx = await vaultContract.withdraw(amount);
  // Return tx immediately - BalActionSteps will handle waiting for confirmation
  return tx;
}

async function getApy(): Promise<ApyComponent[]> {
  // stCELO base APR (staking rewards)
  const STCELO_BASE_APR = 1.85;

  try {
    const { status, data } = await MerklApi(
      'https://api.merkl.xyz'
    ).v4.campaigns.get({
      query: {
        mainParameter: VAULT_ADDRESS,
      },
    });
    if (status !== 200) throw new Error('Failed to fetch APY data');

    const celoApr =
      data?.reduce((acc: number, curr: any) => acc + (curr.apr || 0), 0) || 0;

    return [
      {
        token: VAULT_TOKENS.STCELO.symbol,
        value: STCELO_BASE_APR,
        icon: VAULT_TOKENS.STCELO.icon,
      },
      {
        token: VAULT_TOKENS.CELO.symbol,
        value: celoApr,
        icon: VAULT_TOKENS.CELO.icon,
      },
    ];
  } catch (error) {
    console.error('Error fetching APY:', error);
    // Fallback to stCELO base APR if Merkl fetch fails
    return [
      {
        token: VAULT_TOKENS.STCELO.symbol,
        value: STCELO_BASE_APR,
        icon: VAULT_TOKENS.STCELO.icon,
      },
      {
        token: VAULT_TOKENS.CELO.symbol,
        value: 0,
        icon: VAULT_TOKENS.CELO.icon,
      },
    ];
  }
}

export function createStCeloStrategy(): VaultStrategy {
  return {
    readBalances,
    deposit,
    withdraw,
    getApy,
  };
}
