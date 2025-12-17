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
  protocolIcon: stCeloConfig.protocolIcon,
  protocolInfo: stCeloConfig.protocolInfo,
  userDepositLimit: 1000, // Will be updated dynamically
  userRemainingDeposit: 1000, // Will be calculated based on user's current deposit
  limitTokenSymbol: stCeloConfig.limitTokenSymbol,
  vaultCapacityLimit: 0, // Will be fetched from contract (maxCapacity)
  vaultCapacityUsed: 0, // Will be fetched from contract (totalSupply)
  stCeloTokenIcon: VAULT_TOKENS.STCELO.icon,
};

export default function useStCelo() {
  return useVault('stCelo', ST_CELO_VAULT, createStCeloStrategy());
}
