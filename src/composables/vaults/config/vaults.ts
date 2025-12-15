/**
 * Centralized vault configuration
 * All vault addresses and static configuration should be defined here
 */

import { VAULT_TOKENS, TokenConfig } from './tokens';

export interface VaultStaticConfig {
  id: string;
  title: string;
  contractAddress: string;
  /** The primary token this vault accepts/represents */
  tokenAddress: string;
  icon: string;
  depositTokenIcon: string;
  /** Tokens that can be deposited into this vault */
  supportedDepositTokens: TokenConfig[];
  /** Tokens that can be received on withdrawal */
  supportedWithdrawTokens: TokenConfig[];
}

export const VAULT_ADDRESSES = {
  STCELO_VAULT: '0x312F6f5259cCEb789dEf7B3eAAD50b53317129DD',
} as const;

export const VAULT_CONFIGS: Record<string, VaultStaticConfig> = {
  stCelo: {
    id: 'stCelo',
    title: 'Staked CELO',
    contractAddress: VAULT_ADDRESSES.STCELO_VAULT,
    tokenAddress: VAULT_TOKENS.CELO.address,
    icon: VAULT_TOKENS.CELO.icon,
    depositTokenIcon: VAULT_TOKENS.STCELO.icon,
    supportedDepositTokens: [VAULT_TOKENS.CELO, VAULT_TOKENS.STCELO],
    supportedWithdrawTokens: [VAULT_TOKENS.STCELO, VAULT_TOKENS.CELO],
  },
} as const;

// Helper to get vault config by contract address
export function getVaultConfigByAddress(
  address: string
): VaultStaticConfig | undefined {
  return Object.values(VAULT_CONFIGS).find(
    config => config.contractAddress.toLowerCase() === address.toLowerCase()
  );
}

// Helper to get vault config by id
export function getVaultConfigById(id: string): VaultStaticConfig | undefined {
  return VAULT_CONFIGS[id];
}

// Get all vault configs as array
export function getAllVaultConfigs(): VaultStaticConfig[] {
  return Object.values(VAULT_CONFIGS);
}
