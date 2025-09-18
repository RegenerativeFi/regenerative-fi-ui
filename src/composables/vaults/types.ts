import { ethers } from 'ethers';

export interface Vault {
  id: string;
  title: string;
  apy: number;
  deposit: string;
  depositRaw: string;
  available: string;
  icon?: string;
  contractAddress: string;
  supplyBalance?: string;
}

export interface VaultStrategy {
  readBalances: (
    getProvider: () => ethers.providers.Provider,
    userAddress: string,
    assetAddress: string
  ) => Promise<{
    available: string;
    deposit: string;
    depositRaw: string;
  }>;
  deposit: (
    getSigner: () => ethers.Signer,
    assetAddress: string,
    amount: number
  ) => Promise<ethers.ContractTransaction>;
  withdraw: (
    getSigner: () => ethers.Signer,
    assetAddress: string,
    amount: string
  ) => Promise<ethers.ContractTransaction>;
}
