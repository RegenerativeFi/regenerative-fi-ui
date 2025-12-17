import { useVault } from './useVault';
import { createStCeloStrategy } from './strategies/stCelo.strategy';
import { Vault } from './types';
import { VAULT_CONFIGS, VAULT_TOKENS } from './config';

const config = VAULT_CONFIGS.stCelo;

const ST_CELO_VAULT: Vault = {
  id: config.id,
  title: config.title,
  apy: [{ token: VAULT_TOKENS.CELO.symbol, value: 0 }],
  deposit: '0',
  depositRaw: '0',
  available: '0',
  availableStCelo: '0',
  contractAddress: config.contractAddress,
  tokenAddress: config.tokenAddress,
  icon: config.icon,
  depositTokenIcon: config.depositTokenIcon,
  protocolIcon: config.protocolIcon,
  protocolInfo: config.protocolInfo,
  userDepositLimit: config.userDepositLimit,
  userRemainingDeposit: config.userDepositLimit,
  limitTokenSymbol: config.limitTokenSymbol,
  vaultCapacityLimit: 0,
  vaultCapacityUsed: 0,
  stCeloTokenIcon: VAULT_TOKENS.STCELO.icon,
};

export default function useStCelo() {
  return useVault('stCelo', ST_CELO_VAULT, createStCeloStrategy());
}
