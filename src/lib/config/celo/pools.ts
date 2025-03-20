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
  BlockList: [''],
  IncludedPoolTypes: ['Weighted', 'Stable', 'ComposableStable'],
  Stable: {
    AllowList: [],
  },
  Investment: {
    AllowList: [],
  },
  Weighted: {
    // Only effective after given timestamp here: usePool.ts#createdAfterTimestamp
    // see useDisabledJoinPool.ts#nonAllowedWeightedPoolAfterTimestamp for logic.
    AllowList: [
      '0x1a239aab16b9625c45d80744a4341f8de2200e1a000200000000000000000004', // tCELO-tREFI
      '0x4433f250f4952055784b48fb0df74d0aa1a5126a000200000000000000000003', // tCELO-tcUSD
      '0xada3c5d33261c17011a4cf36cf859af1841a2c74000200000000000000000002', // tCELO-tUSDC
    ],
  },
  Factories: {
    '0xdbd173227b8C07dC46Eb2a38F937B690159Cb40f': 'weightedPool', // Weighted v4
    '0x1051Ec689f101D36271325347c21614eDF03e102': 'composableStablePool', // ComposableStable V4
  },
  Stakable: {
    VotingGaugePools: [
      '0x1a239aab16b9625c45d80744a4341f8de2200e1a000200000000000000000004', // tCELO-tREFI
      '0x4433f250f4952055784b48fb0df74d0aa1a5126a000200000000000000000003', // tCELO-tcUSD
      '0xada3c5d33261c17011a4cf36cf859af1841a2c74000200000000000000000002', // tCELO-tUSDC
    ],
    AllowList: [],
  },
  Metadata: {},
  Deep: [],
  Deprecated: {},
  GaugeMigration: {},
  BoostedApr: [],
  DisabledJoins: [...CSP_ISSUE_POOL_IDS[Network.ZKEVM]],
  Risks: {},
  Issues: {
    // [PoolWarning.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[Network.ZKEVM],
  },
  BrandedRedirect: {},
};

export default pools;
