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
  rpc: `https://celo-mainnet.infura.io/v3/${keys.infura}`,
  ws: ``,
  publicRpc: 'https://forno.celo.org',
  explorer: 'https://celoscan.io/',
  explorerName: 'Celoscan',
  subgraph:
    'https://api.studio.thegraph.com/query/63886/refi-celo/version/latest',
  balancerApi: '',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      'https://api.studio.thegraph.com/query/63886/refi-celo/version/latest',
    ],
    aave: '',
    gauge: '',
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
