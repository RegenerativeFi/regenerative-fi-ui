import { TokenConstants } from '../types';

const tokens: TokenConstants = {
  Popular: {
    Symbols: ['WBTC', 'DAI', 'USDC', 'BAL', 'WETH'],
  },
  InitialSwapTokens: {
    input: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    output: '0x4a4ac35b50daf081c22856ebb26561f3a22598c6', // cUSD
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0x524d97a67f50f4a062c28c74f60703aec9028a94',
    WETH: '0x524d97a67f50f4a062c28c74f60703aec9028a94',
    BAL: '0x120eF59b80774F02211563834d8E3b72cb1649d6', // TODO
  },
};

export default tokens;
