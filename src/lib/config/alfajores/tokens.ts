import { TokenConstants } from '../types';

const tokens: TokenConstants = {
  Popular: {
    Symbols: ['tCELO', 'tREFI', 'tUSDC', 'tcUSD'],
  },
  InitialSwapTokens: {
    input: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    output: '0x68DF333c5F5835A186AA8bCe4a704432006fDF49', // REGEN
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0x524d97A67f50F4A062C28c74F60703Aec9028a94',
    WETH: '0x524d97A67f50F4A062C28c74F60703Aec9028a94',
    BAL: '0x68DF333c5F5835A186AA8bCe4a704432006fDF49',
  },
};

export default tokens;
