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
  rpc: `https://celo-alfajores.infura.io/v3/${keys.infura}`,
  ws: ``,
  publicRpc: 'https://alfajores-forno.celo-testnet.org  ',
  explorer: 'https://alfajores.celoscan.io/',
  explorerName: 'Celoscan',
  subgraph: 'http://127.0.0.1:8000/subgraphs/name/balancer-labs/balancer-v2',
  balancerApi: '',
  poolsUrlV2: '',
  subgraphs: {
    main: ['http://127.0.0.1:8000/subgraphs/name/balancer-labs/balancer-v2'],
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
    logoURI: 'tokens/eth.png',
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
