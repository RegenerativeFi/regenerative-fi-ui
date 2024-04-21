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
  IncludedPoolTypes: ['Weighted'],
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
    '0x997252b17F61fFc6Ca2fDDd7fa1Cb0cdb98f202D': 'weightedPool', // Weighted v4
    // '0x8ea89804145c007e7d226001a96955ad53836087': 'composableStablePool', // ComposableStable V4
    // '0x956ccab09898c0af2aca5e6c229c3ad4e93d9288': 'composableStablePool',
    // '0x6b1da720be2d11d95177ccfc40a917c2688f396c': 'erc4626Linear', // ERC4626 LinearPool
    // '0x5d56ea1b2595d2dbe4f5014b967c78ce75324f0c': 'gyroE',
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
  DisabledJoins: [...CSP_ISSUE_POOL_IDS[Network.ZKEVM]],
  Risks: {},
  Issues: {
    // [PoolWarning.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[Network.ZKEVM],
  },
  BrandedRedirect: {},
};

export default pools;
