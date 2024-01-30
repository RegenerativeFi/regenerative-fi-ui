import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

import { balancerSubgraphClient } from './balancer-subgraph.client';
import PoolActivities from './entities/poolActivities';
import Pools from './entities/pools';
import PoolShares from './entities/poolShares';
import PoolSnapshots from './entities/poolSnapshots';
import PoolSwaps from './entities/poolSwaps';
import TradePairSnapshots from './entities/swapPairs';
import userSwaps from './entities/userSwaps';
import balancers from './entities/balancers';

export default class BalancerSubgraphService {
  pools: Pools;
  poolShares: PoolShares;
  poolActivities: PoolActivities;
  poolSwaps: PoolSwaps;
  poolSnapshots: PoolSnapshots;
  tradePairSnapshots: TradePairSnapshots;
  userSwaps: userSwaps;
  balancers: balancers;

  constructor(
    readonly client = balancerSubgraphClient,
    readonly rpcProviderService = _rpcProviderService
  ) {
    // Init entitiesp
    this.pools = new Pools(this);
    this.poolShares = new PoolShares(this);
    this.poolActivities = new PoolActivities(this);
    this.poolSwaps = new PoolSwaps(this);
    this.poolSnapshots = new PoolSnapshots(this);
    this.tradePairSnapshots = new TradePairSnapshots(this);
    this.userSwaps = new userSwaps(this);
    this.balancers = new balancers(this);
  }
}

export const balancerSubgraphService = new BalancerSubgraphService();
