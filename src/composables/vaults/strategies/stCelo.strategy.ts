import { ethers } from 'ethers';
import { VaultStrategy } from '../types';
import { MerklApi } from '@merkl/api';

const VAULT_ADDRESS = '0x312F6f5259cCEb789dEf7B3eAAD50b53317129DD';
const STCELO_ADDRESS = '0xC668583dcbDc9ae6FA3CE46462758188adfdfC24';
const CELO_ADDRESS = '0x471EcE3750Da237f93B8E339c536989b8978a438';
const DECIMALS = 18;

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

const VAULT_ABI = [
  'function deposit() payable',
  'function depositStCelo(uint256 amount)',
  'function withdraw(uint256 amount)',
];

async function readBalances(
  getProvider: () => ethers.providers.Provider,
  userAddress: string
) {
  const provider = getProvider();
  const celoToken = new ethers.Contract(CELO_ADDRESS, ERC20_ABI, provider);
  const stCeloToken = new ethers.Contract(STCELO_ADDRESS, ERC20_ABI, provider);
  const vaultContract = new ethers.Contract(VAULT_ADDRESS, ERC20_ABI, provider);

  const [rawVaultBalance, rawCeloBalance, rawStCeloBalance] = await Promise.all(
    [
      vaultContract.balanceOf(userAddress),
      celoToken.balanceOf(userAddress),
      stCeloToken.balanceOf(userAddress),
    ]
  );

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

  return {
    available: celoBalance,
    availableStCelo: stCeloBalance,
    deposit: vaultDeposit,
    depositRaw: vaultRaw,
  };
}

async function deposit(
  getSigner: () => ethers.Signer,
  assetAddress: string,
  amount: number,
  tokenAddress?: string
) {
  const signer = getSigner();
  const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

  // Default: deposit CELO (native)
  if (!tokenAddress || tokenAddress === CELO_ADDRESS) {
    const amountBn = ethers.utils.parseUnits(String(amount), DECIMALS);
    return await vaultContract.deposit({ value: amountBn });
  }

  // Deposit stCELO token
  if (tokenAddress === STCELO_ADDRESS) {
    const stCeloToken = new ethers.Contract(STCELO_ADDRESS, ERC20_ABI, signer);
    const amountBn = ethers.utils.parseUnits(String(amount), DECIMALS);

    // Approve vault to spend stCELO
    const approveTx = await stCeloToken.approve(VAULT_ADDRESS, amountBn);
    await approveTx.wait();

    // Deposit stCELO
    return await vaultContract.depositStCelo(amountBn);
  }

  throw new Error(`Unsupported token address: ${tokenAddress}`);
}

async function withdraw(
  getSigner: () => ethers.Signer,
  assetAddress: string,
  amount: string
) {
  const signer = getSigner();
  const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
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
