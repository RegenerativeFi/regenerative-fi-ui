import { Config } from '../types';
import keys from './keys';
import contracts from './contracts';
import pools from './pools';
import tokenlists from './tokenlists';
import tokens from './tokens';
import rateProviders from './rateProviders';

const config: Config = {
  key: '42220',
  chainId: 42220,
  chainName: 'Celo',
  name: 'Celo',
  shortName: 'Celo',
  slug: 'celo',
  network: 'celo',
  unknown: false,
  visibleInUI: true,
  testNetwork: false,
  rpc: `https://lb.drpc.org/celo/AuajrTfUKUDcljFTxiXAxPPe30q1ZBAR8Kx-EklbR4ac`,
  ws: ``,
  publicRpc:
    'https://lb.drpc.org/celo/AuajrTfUKUDcljFTxiXAxPPe30q1ZBAR8Kx-EklbR4ac',
  explorer: 'https://celoscan.io/',
  explorerName: 'Celoscan',
  subgraph:
    'https://api.goldsky.com/api/public/project_cmameg3xd03rh01yxazddhlgj/subgraphs/regenerative-pools-subgraph/1.0.0/gn',
  balancerApi: '',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      'https://api.goldsky.com/api/public/project_cmameg3xd03rh01yxazddhlgj/subgraphs/regenerative-pools-subgraph/1.0.0/gn',
    ],
    aave: '',
    gauge:
      'https://api.goldsky.com/api/public/project_cmameg3xd03rh01yxazddhlgj/subgraphs/regenerative-gauges-subgraph/prod/gn',
    blocks:
      'https://gateway.thegraph.com/api/9c9c78167dd5f4b6bfea84de50cc2cb1/subgraphs/id/68pKaceT6yxMc2EgBbptM1rVksY5NDKu2AsTQaP4z3ER',
  },
  bridgeUrl: 'https://superbridge.app/',
  supportsEIP1559: false,
  supportsElementPools: false,
  blockTime: 5,
  nativeAsset: {
    name: 'Celo',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'CELO',
    decimals: 18,
    deeplinkId: 'ether',
    logoURI: 'tokens/celo.png',
    minTransactionBuffer: '0.05',
  },
  thirdParty: {
    coingecko: {
      nativeAssetId: 'celo',
      platformId: 'celo',
    },
  },
  addresses: {
    ...contracts,
  },
  pools,
  tokens,
  keys,
  gauges: {
    type: 3,
    weight: 0,
  },
  tokenlists,
  rateProviders,
};

export default config;
