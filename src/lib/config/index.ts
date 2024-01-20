import { Config, Network } from './types';

import arbitrum from './arbitrum';
import avalanche from './avalanche';
import base from './base';
import goerli from './goerli';
import gnosisChain from './gnosis-chain';
import mainnet from './mainnet';
import optimism from './optimism';
import polygon from './polygon';
import sepolia from './sepolia';
import zkevm from './zkevm';
import alfajores from './alfajores';
import celo from './celo';

const config: Record<Network | number, Config> = {
  [Network.MAINNET]: mainnet,
  [Network.GOERLI]: goerli,
  [Network.POLYGON]: polygon,
  [Network.ARBITRUM]: arbitrum,
  [Network.OPTIMISM]: optimism,
  [Network.GNOSIS]: gnosisChain,
  [Network.ZKEVM]: zkevm,
  [Network.AVALANCHE]: avalanche,
  [Network.SEPOLIA]: sepolia,
  [Network.BASE]: base,
  [Network.ALFAJORES]: alfajores,
  [Network.CELO]: celo,
};

export default config;
