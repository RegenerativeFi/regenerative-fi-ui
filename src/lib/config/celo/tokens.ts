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
    wNativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // CELO
    WETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    BAL: '', // TODO
  },
  Wrappers: [
    {
      underlying: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C', //USDC
      wrapper: '0xba3ae0F0A78579a5e8C4188dcde60DcCc0Dd4Fab',
      aToken: '0xFF8309b9e99bfd2D4021bc71a362aBD93dBd4785', // aUSDC
    },
    {
      underlying: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e', //USDT
      wrapper: '0x5264B1F45616dB619Bb3c8DCeBD86fB33FA0e53F',
      aToken: '0xDeE98402A302e4D707fB9bf2bac66fAEEc31e8Df', // aUSDT
    },
  ],
};

export default tokens;
