import { ethers } from 'ethers';

export interface ApyComponent {
  token: string;
  value: number;
  icon?: string;
}

export interface Vault {
  id: string;
  title: string;
  apy: ApyComponent[];
  deposit: string;
  depositRaw: string;
  available: string;
  availableStCelo?: string;
  icon?: string;
  contractAddress: string;
  supplyBalance?: string;
  tokenAddress?: string;
  depositTokenIcon?: string;
  stCeloTokenIcon?: string;
  price?: number;
}

export interface VaultStrategy {
  readBalances: (
    getProvider: () => ethers.providers.Provider,
    userAddress: string,
    assetAddress: string
  ) => Promise<{
    available: string;
    availableStCelo?: string;
    deposit: string;
    depositRaw: string;
  }>;
  deposit: (
    getSigner: () => ethers.Signer,
    assetAddress: string,
    amount: number,
    tokenAddress?: string
  ) => Promise<ethers.ContractTransaction>;
  withdraw: (
    getSigner: () => ethers.Signer,
    assetAddress: string,
    amount: string
  ) => Promise<ethers.ContractTransaction>;
  getApy: (
    getProvider: () => ethers.providers.Provider,
    assetAddress: string
  ) => Promise<ApyComponent[]>;
}
