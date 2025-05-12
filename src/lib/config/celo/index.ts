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
  rpc: `https://forno.celo.org`,
  ws: ``,
  publicRpc: 'https://forno.celo.org',
  explorer: 'https://celoscan.io/',
  explorerName: 'Celoscan',
  subgraph:
    'https://api.studio.thegraph.com/query/92572/regenerative-pools-subgraph/version/latest',
  balancerApi: '',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      'https://api.studio.thegraph.com/query/92572/regenerative-pools-subgraph/version/latest',
    ],
    aave: '',
    gauge:
      'https://api.studio.thegraph.com/query/92572/regenerative-gauges-subgraph/1.0.1',
    blocks:
      'https://gateway.thegraph.com/api/9c9c78167dd5f4b6bfea84de50cc2cb1/subgraphs/id/68pKaceT6yxMc2EgBbptM1rVksY5NDKu2AsTQaP4z3ER',
  },
  bridgeUrl: 'https://portalbridge.com/',
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
