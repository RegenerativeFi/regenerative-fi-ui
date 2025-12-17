import { ethers } from 'ethers';
import { Ref } from 'vue';
import { TokenConfig } from './config';

export interface ApyComponent {
  token: string;
  value: number;
  icon?: string;
}

export interface VaultBalanceData {
  deposit: string;
  depositRaw: string;
  available: string;
  availableStCelo?: string;
  vaultTotalDeposits?: string;
  vaultMaxCapacity?: string;
}

export interface Vault {
  id: string;
  title: string;
  icon?: string;
  contractAddress: string;
  tokenAddress?: string;
  depositTokenIcon?: string;
  stCeloTokenIcon?: string;
  protocolIcon?: string;
  protocolInfo?: Array<{ label: string; value: string; url?: string }>;
  userDepositLimit?: number;
  limitTokenSymbol?: string;
  vaultCapacityLimit?: number;
  vaultCapacityUsed?: number;
  userRemainingDeposit?: number;
  apy: ApyComponent[];
  deposit: string;
  depositRaw: string;
  available: string;
  availableStCelo?: string;
  supplyBalance?: string;
  price?: number;
}

export interface VaultStrategy {
  readBalances: (
    getProvider: () => ethers.providers.Provider,
    userAddress: string,
    assetAddress: string
  ) => Promise<VaultBalanceData>;
  deposit: (
    getSigner: () => ethers.Signer,
    amount: number,
    tokenAddress?: string
  ) => Promise<ethers.ContractTransaction>;
  withdraw: (
    getSigner: () => ethers.Signer,
    amount: string
  ) => Promise<ethers.ContractTransaction>;
  getApy: (
    getProvider: () => ethers.providers.Provider,
    assetAddress: string
  ) => Promise<ApyComponent[]>;
}

export interface VaultComposable {
  vault: Vault;
  depositTx: (
    amount: number,
    tokenAddress?: string
  ) => Promise<ethers.ContractTransaction>;
  depositTxForToken: (
    tokenAddress: string,
    amount: number
  ) => Promise<ethers.ContractTransaction>;
  withdrawTx: (amount: string) => Promise<ethers.ContractTransaction>;
  refetch: () => Promise<unknown>;
  isError: Ref<boolean> | boolean;
  getProvider: () => ethers.providers.Provider;
}

export interface VaultTokenInfo extends TokenConfig {
  balance: string;
}

export interface VaultModalProps {
  show: boolean;
  vault?: Partial<Vault>;
  available?: string | number;
  contractAddress: string;
  vaultComposable?: VaultComposable;
  acceptedTokens?: VaultTokenInfo[];
}
