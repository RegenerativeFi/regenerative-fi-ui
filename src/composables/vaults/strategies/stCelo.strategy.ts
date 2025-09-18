import { ethers } from 'ethers';
import { VaultStrategy } from '../types';

const DEFAULT_DECIMALS = 18;
const MANAGER_ADDRESS = '0x0239b96D10a434a56CC9E09383077A0490cF9398';
const VAULT_ADDRESS = '0x794163F6f73dA948D1392cedE445e851e9681cEc';

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
];
const MANAGER_ABI = ['function toCelo(uint256) view returns (uint256)'];

async function readBalances(
  getProvider: () => ethers.providers.Provider,
  userAddress: string,
  assetAddress: string
) {
  const provider = getProvider();
  const token = new ethers.Contract(assetAddress, ERC20_ABI, provider);
  const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, provider);
  const vaultContract = new ethers.Contract(VAULT_ADDRESS, ERC20_ABI, provider);

  const [rawTokenBalance, rawVaultBalance] = await Promise.all([
    token.balanceOf(userAddress),
    vaultContract.balanceOf(userAddress),
  ]);

  let decimals = DEFAULT_DECIMALS;
  try {
    decimals = await token.decimals();
  } catch {
    // fallback
  }

  const stBalance = ethers.utils.formatUnits(rawTokenBalance, decimals);
  const vaultRaw = rawVaultBalance.toString();

  let vaultSupply = vaultRaw;
  try {
    const rawVaultSupply = await manager.toCelo(rawVaultBalance);
    vaultSupply = ethers.utils.formatUnits(rawVaultSupply, decimals);
  } catch (error) {
    console.error('Error converting to CELO:', error);
  }

  return {
    available: stBalance,
    deposit: vaultSupply,
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
    ['function deposit(uint256)'],
    signer
  );

  let decimals = DEFAULT_DECIMALS;
  try {
    decimals = await underlyingContract.decimals();
  } catch (error) {
    console.error('Error getting token decimals:', error);
  }

  const amountBn = ethers.utils.parseUnits(String(amount), decimals);
  return await vaultContract.deposit(amountBn);
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

export function createStCeloStrategy(): VaultStrategy {
  return {
    readBalances,
    deposit,
    withdraw,
  };
}
