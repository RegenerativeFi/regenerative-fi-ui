import { CSP_ISSUE_POOL_IDS } from '@/constants/pool-lists/csp-issue';
import { Pools } from '@/types/pools';
import { Network } from '../types';

const pools: Pools = {
  IdsMap: {},
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5,
  },
  BoostsEnabled: false,
  DelegateOwner: '0x28f3b901f667fbab647486f4bdfeaef0e588f89c',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: [],
  },
  BlockList: [
    '0x1a239aab16b9625c45d80744a4341f8de2200e1a000200000000000000000004', // tCELO-tREFI
    '0x4433f250f4952055784b48fb0df74d0aa1a5126a000200000000000000000003', // tCELO-tcUSD
    '0xada3c5d33261c17011a4cf36cf859af1841a2c74000200000000000000000002', // tCELO-tUSDC
  ],
  IncludedPoolTypes: ['Weighted', 'Stable', 'ComposableStable'],
  Stable: {
    AllowList: [
      '0x3c090912a183ffde4ec93ae242e8eaa80383dbb7000000000000000000000007', // R-waCelUSDC-waCelUSDT
      '0x1400eecf44933b1a1371792d48bf2561175763ad000000000000000000000008', //CELO-stCELO
    ],
  },
  Investment: {
    AllowList: [],
  },
  Weighted: {
    // Only effective after given timestamp here: usePool.ts#createdAfterTimestamp
    // see useDisabledJoinPool.ts#nonAllowedWeightedPoolAfterTimestamp for logic.
    AllowList: [
      '0x4d58c5766a37be24a78d4571975abf2088dbb9d0000200000000000000000005', // 80CELO-20cUSD
      '0x3d9dea33d347b84db99ce416b363b6eeb68ec199000200000000000000000006', // 50CELO-50cUSD
      '0x797960d015328961fa8e1a3303acf71bcf4b54c8000200000000000000000009', // 50REGEN-50USDC
      '0x1ba154c0bdcfb406090f4379a3f5206549cd6e1400020000000000000000000b', // 50REGEN-50CELO
      '0x13f3adc9683d6f83d592df7ad7178cfd672803ff00020000000000000000000a', // 50USDGLO-50cUSD
    ],
  },
  Factories: {
    '0xdbd173227b8c07dc46eb2a38f937b690159cb40f': 'weightedPool', // Weighted v4
    '0x1051ec689f101d36271325347c21614edf03e102': 'composableStablePool', // ComposableStable V4
  },
  Stakable: {
    VotingGaugePools: [],
    AllowList: [],
  },
  Metadata: {},
  Deep: [],
  Deprecated: {},
  GaugeMigration: {},
  BoostedApr: [],
  DisabledJoins: [...CSP_ISSUE_POOL_IDS[Network.CELO]],
  Risks: {},
  Issues: {
    // [PoolWarning.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[Network.ZKEVM],
  },
  BrandedRedirect: {},
};

export default pools;
