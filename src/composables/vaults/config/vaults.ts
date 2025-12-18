import { VAULT_TOKENS, TokenConfig } from './tokens';

export const DEFAULT_USER_MAX_DEPOSIT = 1000;

export interface ProtocolInfoItem {
  label: string;
  value: string;
  url?: string;
}

export interface VaultStaticConfig {
  id: string;
  title: string;
  contractAddress: string;
  tokenAddress: string;
  icon: string;
  depositTokenIcon: string;
  protocolIcon: string;
  protocolInfo: ProtocolInfoItem[];
  userDepositLimit: number;
  limitTokenSymbol: string;
  vaultCapacityLimit: number;
  vaultCapacityUsed: number;
  supportedDepositTokens: TokenConfig[];
  supportedWithdrawTokens: TokenConfig[];
}

export const VAULT_ADDRESSES = {
  STCELO_VAULT: '0x57a4750f4Eb15C16CE65651a6Fc661081be12Dab',
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
      { label: 'Managed by:', value: 'CeloPG', url: 'https://www.celopg.eco/' },
      {
        label: 'Advanced info:',
        value: 'Docs',
        url: 'https://docs.stcelo.xyz/',
      },
    ],
    userDepositLimit: 1000,
    limitTokenSymbol: 'stCELO',
    vaultCapacityLimit: 100000,
    vaultCapacityUsed: 40234,
    supportedDepositTokens: [VAULT_TOKENS.CELO, VAULT_TOKENS.STCELO],
    supportedWithdrawTokens: [VAULT_TOKENS.STCELO, VAULT_TOKENS.CELO],
  },
} as const;

export function getVaultConfigByAddress(
  address: string
): VaultStaticConfig | undefined {
  return Object.values(VAULT_CONFIGS).find(
    c => c.contractAddress.toLowerCase() === address.toLowerCase()
  );
}

export function getVaultConfigById(id: string): VaultStaticConfig | undefined {
  return VAULT_CONFIGS[id];
}

export function getAllVaultConfigs(): VaultStaticConfig[] {
  return Object.values(VAULT_CONFIGS);
}
