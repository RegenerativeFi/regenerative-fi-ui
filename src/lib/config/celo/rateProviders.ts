import { convertKeysToLowerCase } from '@/lib/utils/objects';
import { RateProviders } from '../types';

const rateProviders: RateProviders = {
  '*': {
    '0x0000000000000000000000000000000000000000': true,
  },
  '0xba3ae0F0A78579a5e8C4188dcde60DcCc0Dd4Fab': {
    '0x08E4a7c18EE6f41E6C0d439aF9633edfA348aBb9': true,
  },
  '0x5264B1F45616dB619Bb3c8DCeBD86fB33FA0e53F': {
    '0xF7C16683fe9794E5B7D6fd342a2D11e214dCD13f': true,
  },
};

export default convertKeysToLowerCase(rateProviders);
