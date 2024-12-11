import { Config } from '../types';
import keys from './keys';
import contracts from './contracts';
import pools from './pools';
import tokenlists from './tokenlists';
import tokens from './tokens';
import rateProviders from './rateProviders';

const config: Config = {
  key: '44787',
  chainId: 44787,
  chainName: 'Celo Alfajores',
  name: 'Celo Alfajores',
  shortName: 'Alfajores',
  slug: 'alfajores',
  network: 'celo-alfajores',
  unknown: false,
  visibleInUI: true,
  testNetwork: true,
  rpc: `https://alfajores-forno.celo-testnet.org`,
  ws: ``,
  publicRpc: 'https://alfajores-forno.celo-testnet.org',
  explorer: 'https://alfajores.celoscan.io/',
  explorerName: 'Celoscan',
  subgraph:
    'https://api.studio.thegraph.com/query/92572/regenerative-pools-subgraph-testnet/version/latest',
  balancerApi: '',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      'https://api.studio.thegraph.com/query/92572/regenerative-pools-subgraph-testnet/version/latest',
    ],
    aave: '',
    gauge:
      'https://api.studio.thegraph.com/query/92572/regenerative-gauges-subgraph-testnet/version/latest',
    blocks: '',
  },
  bridgeUrl: 'https://optics.app/',
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
