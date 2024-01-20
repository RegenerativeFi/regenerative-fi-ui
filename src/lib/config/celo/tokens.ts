import { TokenConstants } from '../types';

const tokens: TokenConstants = {
  Popular: {
    Symbols: ['CELO', 'cUSD', 'cEUR'],
  },
  InitialSwapTokens: {
    input: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    output: '0x765de816845861e75a25fca122bb6898b8b1282a', // cUSD
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0x471EcE3750Da237f93B8E339c536989b8978a438', // CELO
    WETH: '0x66803FB87aBd4aaC3cbB3fAd7C3aa01f6F3FB207',
    BAL: '', // TODO
  },
};

export default tokens;
