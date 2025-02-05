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
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
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
    AllowList: [],
  },
  Factories: {
    '0x1051Ec689f101D36271325347c21614eDF03e102': 'weightedPool', // Weighted v4
    '0xBFb9F49E468eB87F2FE22F8062C57E34c57A278C': 'composableStablePool',
    // '0x8ea89804145c007e7d226001a96955ad53836087': 'composableStablePool', // ComposableStable V4
    // '0x956ccab09898c0af2aca5e6c229c3ad4e93d9288': 'composableStablePool',
    // '0x6b1da720be2d11d95177ccfc40a917c2688f396c': 'erc4626Linear', // ERC4626 LinearPool
    // '0x5d56ea1b2595d2dbe4f5014b967c78ce75324f0c': 'gyroE',
  },
  Stakable: {
    VotingGaugePools: [
      '0xf1a6f7570f0eefbb824ea05d32c88e78f0ed1564000200000000000000000002',
      '0x614eb78cf5e2a78bd017a85190e998963d4febb9000200000000000000000003',
      '0xc60165f780da1dd32d969866bfd5b9c7007d8820000000000000000000000004',
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
