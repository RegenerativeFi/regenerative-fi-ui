import { Network } from '@balancer-labs/sdk';
import { Pools } from '@/types/pools';
import { TokenListURLMap } from '@/types/TokenList';

export type CommonTokens = {
  nativeAsset: string;
  wNativeAsset: string;
  WETH: string;
  BAL: string;
  bbaUSD?: string;
  bbaUSDv2?: string;
};

export type TokenConstants = {
  Popular: {
    Symbols: string[];
  };
  Addresses: CommonTokens;
  PriceChainMap?: Record<string, string>;
};

export interface Contracts {
  merkleRedeem: string;
  merkleOrchard: string;
  merkleOrchardV2?: string;
  multicall: string;
  authorizer: string;
  vault: string;
  weightedPoolFactory: string;
  stablePoolFactory: string;
  weth: string;
  rETH: string;
  stMATIC: string;
  stETH: string;
  wstETH: string;
  lidoRelayer: string;
  balancerHelpers: string;
  batchRelayer: string;
  batchRelayerV4: string;
  veBAL: string;
  gaugeController: string;
  gaugeFactory: string;
  balancerMinter: string;
  tokenAdmin: string;
  veDelegationProxy: string;
  veBALHelpers: string;
  feeDistributor: string;
  feeDistributorDeprecated: string;
  faucet: string;
  gaugeRewardsHelper?: string;
}

export interface RateProviders {
  [tokenAddress: string]: {
    [providerAddress: string]: boolean;
  };
}

export interface Keys {
  infura?: string;
  alchemy?: string;
  graph?: string;
  balancerApi?: string;
}

export interface Config {
  key: string;
  chainId: Network | 12345 | 17;
  chainName: string;
  name: string;
  shortName: string;
  slug: string;
  network: string;
  unknown: boolean;
  rpc: string;
  publicRpc?: string;
  ws: string;
  explorer: string;
  explorerName: string;
  subgraph: string;
  balancerApi?: string;
  poolsUrlV2: string;
  subgraphs: {
    main: string[];
    aave: string;
    gauge: string;
    blocks: string;
  };
  supportsEIP1559: boolean;
  supportsElementPools: boolean;
  blockTime: number;
  nativeAsset: {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    deeplinkId: string;
    logoURI: string;
    minTransactionBuffer: string;
  };
  addresses: Contracts;
  pools: Pools;
  tokens: TokenConstants;
  keys: Keys;
  gauges: {
    type: number;
    weight: number;
  };
  tokenlists: TokenListURLMap;
  rateProviders: Record<string, Record<string, boolean>>;
}
