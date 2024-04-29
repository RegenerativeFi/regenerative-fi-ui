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
  BlockList: [
    '0xac95f160947a68d222f70760f0c6d40a7aa639cd000200000000000000000002',
    '0x518282155ff9d72dfb2c6d205a402ebd86625999000200000000000000000003',
    '0xeb1aa80b91f8b7146e15cc6ab1939f579cac32bc000200000000000000000001',
    '0x0bb36015d267708ffda79c9d71c8820238358017000200000000000000000004',
  ],
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
      '0xd218f56d30a3699c9de4c82cd37e23a6dfefe479000200000000000000000005',
    ],
  },
  Factories: {
    '0xeb1055c017a1427726f01368c8247649c5a79bf9': 'weightedPool', // Weighted v4
    '0xA66501F277e27fEB17f653174954590e319404c4': 'composableStablePool', // ComposableStable V4
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
