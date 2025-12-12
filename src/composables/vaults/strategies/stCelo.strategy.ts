import { ethers } from 'ethers';
import { VaultStrategy } from '../types';
import { MerklApi } from '@merkl/api';

const VAULT_ADDRESS = '0x1b8c73e2aB2FB34ADA2dFaCD1F59bEAb76B6C410';
const CELO_ADDRESS = '0x471EcE3750Da237f93B8E339c536989b8978a438';
const DECIMALS = 18;

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

async function readBalances(
  getProvider: () => ethers.providers.Provider,
  userAddress: string
) {
  const provider = getProvider();
  const celoToken = new ethers.Contract(CELO_ADDRESS, ERC20_ABI, provider);
  const vaultContract = new ethers.Contract(VAULT_ADDRESS, ERC20_ABI, provider);

  const [rawVaultBalance, rawCeloTokenBalance] = await Promise.all([
    vaultContract.balanceOf(userAddress),
    celoToken.balanceOf(userAddress),
  ]);

  let decimals = DECIMALS;
  try {
    decimals = await celoToken.decimals();
  } catch {
    // fallback
  }

  const celoBalance = ethers.utils.formatUnits(rawCeloTokenBalance, decimals);
  const vaultRaw = rawVaultBalance.toString();
  const vaultDeposit = ethers.utils.formatUnits(rawVaultBalance, decimals);

  return {
    available: celoBalance,
    deposit: vaultDeposit,
    depositRaw: vaultRaw,
  };
}

async function deposit(
  getSigner: () => ethers.Signer,
  assetAddress: string,
  amount: number
) {
  const signer = getSigner();
  const underlyingContract = new ethers.Contract(
    assetAddress,
    ['function decimals() view returns (uint8)'],
    signer
  );
  const vaultContract = new ethers.Contract(
    VAULT_ADDRESS,
    ['function deposit() payable'],
    signer
  );

  let decimals = DECIMALS;
  try {
    decimals = await underlyingContract.decimals();
  } catch (error) {
    console.error('Error getting token decimals:', error);
  }

  const amountBn = ethers.utils.parseUnits(String(amount), decimals);
  return await vaultContract.deposit({ value: amountBn });
}

async function withdraw(
  getSigner: () => ethers.Signer,
  assetAddress: string,
  amount: string
) {
  const signer = getSigner();
  const vaultContract = new ethers.Contract(
    VAULT_ADDRESS,
    ['function withdraw(uint256)'],
    signer
  );
  return await vaultContract.withdraw(amount);
}

async function getApy(): Promise<
  { token: string; value: number; icon?: string }[]
> {
  const { status, data } = await MerklApi(
    'https://api.merkl.xyz'
  ).v4.campaigns.get({
    query: {
      mainParameter: VAULT_ADDRESS,
    },
  });
  if (status !== 200) throw 'Failed to fetch APY data';

  const celoApr = data?.reduce((acc, curr) => acc + (curr.apr || 0), 0) || 0;

  return [
    {
      token: 'CELO',
      value: celoApr,
      icon: 'https://cdn.prod.website-files.com/652d421c1214a2eebd967f1d/683f449264407a7213b865fa_Celo.png',
    },
  ];
}

export function createStCeloStrategy(): VaultStrategy {
  return {
    readBalances,
    deposit,
    withdraw,
    getApy,
  };
}
