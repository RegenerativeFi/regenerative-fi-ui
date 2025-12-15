import { ethers } from 'ethers';
import { Ref } from 'vue';
import { TokenConfig } from './config';

// =============================================================================
// APY Types
// =============================================================================

export interface ApyComponent {
  token: string;
  value: number;
  icon?: string;
}

// =============================================================================
// Vault Balance DTOs (raw data from contracts)
// =============================================================================

/**
 * Raw balance data returned from vault strategy
 */
export interface VaultBalanceData {
  /** Formatted deposit balance for display */
  deposit: string;
  /** Raw deposit balance (BigNumber string) for transactions */
  depositRaw: string;
  /** Formatted available balance of primary token */
  available: string;
  /** Formatted available balance of secondary token (e.g., stCELO) */
  availableStCelo?: string;
}

// =============================================================================
// Vault View Model (for UI consumption)
// =============================================================================

/**
 * Complete vault state for UI rendering
 * Combines static config with dynamic balance/price data
 */
export interface Vault {
  // Static properties (from config)
  id: string;
  title: string;
  icon?: string;
  contractAddress: string;
  tokenAddress?: string;
  depositTokenIcon?: string;
  stCeloTokenIcon?: string;

  // Dynamic properties (fetched/calculated)
  apy: ApyComponent[];
  /** Formatted deposit amount for display */
  deposit: string;
  /** Raw deposit amount for transactions */
  depositRaw: string;
  /** Formatted available balance */
  available: string;
  /** Available stCELO balance (specific to stCELO vault) */
  availableStCelo?: string;
  /** Legacy field - use deposit instead */
  supplyBalance?: string;
  /** Token price in USD */
  price?: number;
}

// =============================================================================
// Vault Strategy Interface
// =============================================================================

/**
 * Strategy pattern interface for vault operations
 * Each vault type implements this to handle its specific logic
 */
export interface VaultStrategy {
  /**
   * Read user balances from the vault contract
   */
  readBalances: (
    getProvider: () => ethers.providers.Provider,
    userAddress: string,
    assetAddress: string
  ) => Promise<VaultBalanceData>;

  /**
   * Deposit tokens into the vault
   */
  deposit: (
    getSigner: () => ethers.Signer,
    amount: number,
    tokenAddress?: string
  ) => Promise<ethers.ContractTransaction>;

  /**
   * Withdraw tokens from the vault
   */
  withdraw: (
    getSigner: () => ethers.Signer,
    amount: string
  ) => Promise<ethers.ContractTransaction>;

  /**
   * Get current APY components for the vault
   */
  getApy: (
    getProvider: () => ethers.providers.Provider,
    assetAddress: string
  ) => Promise<ApyComponent[]>;
}

// =============================================================================
// Vault Composable Interface
// =============================================================================

/**
 * Public interface for vault composables
 * This provides type safety when passing composables as props
 */
export interface VaultComposable {
  /** Reactive vault state */
  vault: Vault;
  /** Deposit primary token (e.g., CELO) */
  depositTx: (
    amount: number,
    tokenAddress?: string
  ) => Promise<ethers.ContractTransaction>;
  /** Deposit specific token by address */
  depositTxForToken: (
    tokenAddress: string,
    amount: number
  ) => Promise<ethers.ContractTransaction>;
  /** Withdraw from vault */
  withdrawTx: (amount: string) => Promise<ethers.ContractTransaction>;
  /** Refetch vault data */
  refetch: () => Promise<unknown>;
  /** Loading state */
  isLoading: Ref<boolean> | boolean;
  /** Error state */
  isError: Ref<boolean> | boolean;
  /** Get provider */
  getProvider: () => ethers.providers.Provider;
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Token info for deposit/withdraw modals
 */
export interface VaultTokenInfo extends TokenConfig {
  balance: string;
}

/**
 * Props for vault modal components
 */
export interface VaultModalProps {
  show: boolean;
  vault?: Partial<Vault>;
  available?: string | number;
  contractAddress: string;
  vaultComposable?: VaultComposable;
  acceptedTokens?: VaultTokenInfo[];
}
