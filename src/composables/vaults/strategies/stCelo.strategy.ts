import { ethers } from 'ethers';
import { VaultStrategy, VaultBalanceData, ApyComponent } from '../types';
import { VAULT_TOKENS, TOKEN_ADDRESSES, VAULT_ADDRESSES } from '../config';
import { MerklApi } from '@merkl/api';

export const VAULT_ADDRESS = VAULT_ADDRESSES.STCELO_VAULT;
export const STCELO_ADDRESS = TOKEN_ADDRESSES.STCELO;
export const CELO_ADDRESS = TOKEN_ADDRESSES.CELO;

const DECIMALS = VAULT_TOKENS.CELO.decimals;
const STCELO_BASE_APR = 1.85;

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

const VAULT_ABI = [
  'function deposit() payable',
  'function depositStCelo(uint256 amount)',
  'function withdraw(uint256 amount)',
  'function balanceOf(address) view returns (uint256)',
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

  const [
    rawVaultBalance,
    rawCeloBalance,
    rawStCeloBalance,
    [rawMaxCapacity, rawRemainingCapacity],
  ] = await Promise.all([
    vaultContract.balanceOf(userAddress),
    celoToken.balanceOf(userAddress),
    stCeloToken.balanceOf(userAddress),
    vaultContract.getCapacity(),
  ]);

  const rawTotalDeposits = rawMaxCapacity.sub(rawRemainingCapacity);

  return {
    available: ethers.utils.formatUnits(rawCeloBalance, DECIMALS),
    availableStCelo: ethers.utils.formatUnits(rawStCeloBalance, DECIMALS),
    deposit: ethers.utils.formatUnits(rawVaultBalance, DECIMALS),
    depositRaw: rawVaultBalance.toString(),
    vaultTotalDeposits: ethers.utils.formatUnits(rawTotalDeposits, DECIMALS),
    vaultMaxCapacity: ethers.utils.formatUnits(rawMaxCapacity, DECIMALS),
  };
}

async function deposit(
  getSigner: () => ethers.Signer,
  amount: number,
  tokenAddress?: string
): Promise<ethers.ContractTransaction> {
  const signer = getSigner();
  const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
  const amountBn = ethers.utils.parseUnits(String(amount), DECIMALS);

  if (!tokenAddress || tokenAddress === CELO_ADDRESS) {
    const tx = await vaultContract.deposit({ value: amountBn });
    await tx.wait();
    return tx;
  }

  if (tokenAddress === STCELO_ADDRESS) {
    const stCeloToken = new ethers.Contract(STCELO_ADDRESS, ERC20_ABI, signer);
    await (await stCeloToken.approve(VAULT_ADDRESS, amountBn)).wait();
    const tx = await vaultContract.depositStCelo(amountBn);
    await tx.wait();
    return tx;
  }

  throw new Error(`Unsupported token: ${tokenAddress}`);
}

async function withdraw(getSigner: () => ethers.Signer, amount: string) {
  const signer = getSigner();
  const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
  return vaultContract.withdraw(amount);
}

async function getApy(): Promise<ApyComponent[]> {
  try {
    const { status, data } = await MerklApi(
      'https://api.merkl.xyz'
    ).v4.campaigns.get({
      query: { mainParameter: VAULT_ADDRESS },
    });

    const celoApr =
      status === 200
        ? data?.reduce((acc: number, c: any) => acc + (c.apr || 0), 0) || 0
        : 0;

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
  } catch {
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
  return { readBalances, deposit, withdraw, getApy };
}
