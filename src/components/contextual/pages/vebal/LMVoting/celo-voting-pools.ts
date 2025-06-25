import {
  GqlChain,
  GqlPoolMinimalType,
} from '@/services/api/graphql/generated/api-types';
import { ApiVotingPool } from '@/services/balancer/gauges/gauge-controller.decorator';

/*
 Fake voting Pool data to test voting list UI in testnet networks
*/
export function celoVotingPools(): ApiVotingPool[] {
  return [
    {
      chain: 'CELO' as GqlChain,
      id: '0x1a239aab16b9625c45d80744a4341f8de2200e1a000200000000000000000004',
      address: '0x1a239aab16b9625c45d80744a4341f8de2200e1a',
      type: GqlPoolMinimalType.Weighted,
      symbol: '50tREFI-50tCELO',
      tokens: [
        {
          address: '0x68df333c5f5835a186aa8bce4a704432006fdf49',
          weight: '0.5',
          symbol: 'tREFI',
          logoURI:
            'https://raw.githubusercontent.com/RegenerativeFi/regenerative-fi-tokenlist/main/REGEN.png',
        },
        {
          address: '0xD1531Aa8F91f5Fd8D5D820CD5841e3880283D1Be',
          weight: '0.5',
          symbol: 'tCELO',
          logoURI:
            'https://assets-global.website-files.com/652d421c1214a2eebd967f36/6537e85c4fe061f13f246111_6531707e952c3242e22b605e_Celo.png',
        },
      ],
      gauge: {
        address: '0x6ACa0EB87a429ad5240f03E56E37b6a3B16F2ddb',
        isKilled: false,
        relativeWeightCap: null,
        addedTimestamp: 1741824000,
      },
    },
    {
      chain: 'CELO' as GqlChain,
      id: '0x4433f250f4952055784b48fb0df74d0aa1a5126a000200000000000000000003',
      address: '0x4433f250f4952055784b48fb0df74d0aa1a5126a',
      type: GqlPoolMinimalType.Weighted,
      symbol: '50tcUSD-50tCELO',
      tokens: [
        {
          address: '0xB08Dd0b53abD8fB842cDec75cc5064FDD74e99C7',
          weight: '0.5',
          symbol: 'tcUSD',
          logoURI: 'https://celoscan.io/token/images/celodollar_32.png',
        },
        {
          address: '0xD1531Aa8F91f5Fd8D5D820CD5841e3880283D1Be',
          weight: '0.5',
          symbol: 'tCELO',
          logoURI:
            'https://assets-global.website-files.com/652d421c1214a2eebd967f36/6537e85c4fe061f13f246111_6531707e952c3242e22b605e_Celo.png',
        },
      ],
      gauge: {
        address: '0x9B75De95CdB73fB961a681812252Fb2f0e6567cf',
        isKilled: false,
        relativeWeightCap: null,
        addedTimestamp: 1741824000,
      },
    },
    {
      chain: 'CELO' as GqlChain,
      id: '0xada3c5d33261c17011a4cf36cf859af1841a2c74000200000000000000000002',
      address: '0xada3c5d33261c17011a4cf36cf859af1841a2c74',
      type: GqlPoolMinimalType.Weighted,
      symbol: '50tCELO-50tUSDC',
      tokens: [
        {
          address: '0xD1531Aa8F91f5Fd8D5D820CD5841e3880283D1Be',
          weight: '0.5',
          symbol: 'tCELO',
          logoURI:
            'https://assets-global.website-files.com/652d421c1214a2eebd967f36/6537e85c4fe061f13f246111_6531707e952c3242e22b605e_Celo.png',
        },
        {
          address: '0x76C12F93ad8975609f95C13782fd8A0B4135e4c6',
          weight: '0.5',
          symbol: 'tUSDC',
          logoURI:
            'https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694',
        },
      ],
      gauge: {
        address: '0x529cF13B660745a07DedC5DC80Ed03f5441e040c',
        isKilled: false,
        relativeWeightCap: null,
        addedTimestamp: 1741824000,
      },
    },
    {
      chain: 'CELO' as GqlChain,
      id: '0xf7fee07d4410af146795021f01c54af179494cb500000000000000000000000c',
      address: '0xf7fee07d4410af146795021f01c54af179494cb5',
      type: GqlPoolMinimalType.Stable,
      symbol: 'USDGLO-cUSD',
      tokens: [
        {
          address: '0x4F604735c1cF31399C6E711D5962b2B3E0225AD3',
          weight: null,
          symbol: 'USDGLO',
          logoURI: 'https://celoscan.io/token/images/glo_32.png',
        },
        {
          address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
          weight: '0.5',
          symbol: 'cUSD',
          logoURI: 'https://celoscan.io/token/images/celodollar_32.png',
        },
      ],
      gauge: {
        address: '0xd9a97B7f2b6C0A366D8F43CCc6f2BC1a834cf065',
        isKilled: false,
        relativeWeightCap: null,
        addedTimestamp: 1741824000,
      },
    },
  ];
}
