/**
 * Centralized vault configuration
 * All vault addresses and static configuration should be defined here
 */

import { VAULT_TOKENS, TokenConfig } from './tokens';

/** A single info item shown in the protocol tooltip */
export interface ProtocolInfoItem {
  /** Label shown on the left (e.g., "Managed by:") */
  label: string;
  /** Value/text shown on the right (e.g., "Celo PG") */
  value: string;
  /** Optional URL - if provided, value becomes a link with external arrow */
  url?: string;
}

export interface VaultStaticConfig {
  id: string;
  title: string;
  contractAddress: string;
  /** The primary token this vault accepts/represents */
  tokenAddress: string;
  icon: string;
  depositTokenIcon: string;
  /** Protocol icon shown next to APY */
  protocolIcon: string;
  /** Protocol information items for tooltip (flexible list) */
  protocolInfo: ProtocolInfoItem[];
  /** User's maximum deposit limit (in tokens) - TODO: fetch from contract */
  userDepositLimit: number;
  /** Symbol of the limit token for display */
  limitTokenSymbol: string;
  /** Global vault capacity limit (max tokens the vault can hold) - TODO: fetch from contract */
  vaultCapacityLimit: number;
  /** Current vault capacity used - TODO: fetch from contract */
  vaultCapacityUsed: number;
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
    protocolIcon:
      'https://cdn.prod.website-files.com/6606afba60355d9881684ca4/682235a57111b594b49008aa_Favicon.png',
    protocolInfo: [
      {
        label: 'Managed by:',
        value: 'CeloPG',
        url: 'https://www.celopg.eco/',
      },
      {
        label: 'Advanced info:',
        value: 'Docs',
        url: 'https://docs.stcelo.xyz/',
      },
    ],
    // TODO: Fetch from contract - mocked to 1000 tokens for now
    userDepositLimit: 1000,
    limitTokenSymbol: 'stCELO',
    // TODO: Fetch from contract - mocked values for vault capacity
    vaultCapacityLimit: 100000,
    vaultCapacityUsed: 40234,
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
