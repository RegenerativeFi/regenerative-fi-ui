import { useVault } from './useVault';
import { createStCeloStrategy } from './strategies/stCelo.strategy';
import { Vault } from './types';
import { VAULT_CONFIGS, VAULT_TOKENS } from './config';

// Get static config from centralized configuration
const stCeloConfig = VAULT_CONFIGS.stCelo;

const ST_CELO_VAULT: Vault = {
  id: stCeloConfig.id,
  title: stCeloConfig.title,
  apy: [{ token: VAULT_TOKENS.CELO.symbol, value: 0 }], // Will be updated by getApy()
  deposit: '0',
  depositRaw: '0',
  available: '0',
  availableStCelo: '0',
  contractAddress: stCeloConfig.contractAddress,
  tokenAddress: stCeloConfig.tokenAddress,
  icon: stCeloConfig.icon,
  depositTokenIcon: stCeloConfig.depositTokenIcon,
  stCeloTokenIcon: VAULT_TOKENS.STCELO.icon,
};

export default function useStCelo() {
  return useVault('stCelo', ST_CELO_VAULT, createStCeloStrategy());
}
