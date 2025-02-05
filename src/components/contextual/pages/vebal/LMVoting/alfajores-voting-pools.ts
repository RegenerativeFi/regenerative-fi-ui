import {
  GqlChain,
  GqlPoolMinimalType,
} from '@/services/api/graphql/generated/api-types';
import { ApiVotingPool } from '@/services/balancer/gauges/gauge-controller.decorator';

/*
 Fake voting Pool data to test voting list UI in testnet networks
*/
export function alfajoresVotingPools(): ApiVotingPool[] {
  return [
    {
      chain: 'ALFAJORES' as GqlChain,
      id: '0xf1a6f7570f0eefbb824ea05d32c88e78f0ed1564000200000000000000000002',
      address: '0xf8a0623ab66F0xf1a6f7570f0eefbb824ea05d32c88e78f0ed1564',
      type: GqlPoolMinimalType.Weighted,
      symbol: '80tREGEN-20tCELO',
      tokens: [
        {
          address: '0x68df333c5f5835a186aa8bce4a704432006fdf49',
          weight: '0.8',
          symbol: 'tREFI',
          logoURI:
            'https://raw.githubusercontent.com/RegenerativeFi/regenerative-fi-tokenlist/main/REGEN.png',
        },
        {
          address: '0xe036290f41c367aec59aec5b69c2b72068c441f6',
          weight: '0.2',
          symbol: 'tCELO',
          logoURI:
            'https://assets-global.website-files.com/652d421c1214a2eebd967f36/6537e85c4fe061f13f246111_6531707e952c3242e22b605e_Celo.png',
        },
      ],
      gauge: {
        address: '0xd031e387129a0f8ab6500c4e9fb4342e568256d7',
        isKilled: false,
        relativeWeightCap: null,
        addedTimestamp: 1654312627,
      },
    },
    {
      chain: 'ALFAJORES' as GqlChain,
      id: '0x614eb78cf5e2a78bd017a85190e998963d4febb9000200000000000000000003',
      address: '0x614eb78cf5e2a78bd017a85190e998963d4febb9',
      type: GqlPoolMinimalType.Weighted,
      symbol: '50tcUSD-50tCELO',
      tokens: [
        {
          address: '0x51f29e07c7cf53d2603e1a224e27b1c74e181a17',
          weight: '0.5',
          symbol: 'tcUSD',
          logoURI: 'https://celoscan.io/token/images/celodollar_32.png',
        },
        {
          address: '0xe036290f41c367aec59aec5b69c2b72068c441f6',
          weight: '0.5',
          symbol: 'tCELO',
          logoURI:
            'https://assets-global.website-files.com/652d421c1214a2eebd967f36/6537e85c4fe061f13f246111_6531707e952c3242e22b605e_Celo.png',
        },
      ],
      gauge: {
        address: '0x30629e6ef6dbcfc7e16a746b5204173efa50f606',
        isKilled: false,
        relativeWeightCap: null,
        addedTimestamp: 1654312627,
      },
    },
    {
      chain: 'ALFAJORES' as GqlChain,
      id: '0xc60165f780da1dd32d969866bfd5b9c7007d8820000000000000000000000004',
      address: '0xc60165f780da1dd32d969866bfd5b9c7007d8820',
      type: GqlPoolMinimalType.Stable,
      symbol: 'tcUSD-tUSDC',
      tokens: [
        {
          address: '0x51f29e07c7cf53d2603e1a224e27b1c74e181a17',
          weight: null,
          symbol: 'tcUSD',
          logoURI: 'https://celoscan.io/token/images/celodollar_32.png',
        },
        {
          address: '0x9a3a52f4462585c31025e2242c9b4074a9fb4a1f',
          weight: '0.5',
          symbol: 'tUSDC',
          logoURI:
            'https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694',
        },
      ],
      gauge: {
        address: '0x215586111f9c15bda4e0754f1c38b2789a504914',
        isKilled: false,
        relativeWeightCap: null,
        addedTimestamp: 1654312627,
      },
    },
  ];
}
