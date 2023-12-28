import { WeeklyBalance } from '@/services/pool/types';
import { walletService } from '@/services/web3/wallet.service';
import { QueryBuilder } from '@/types/subgraph';

import Service from '../../balancer-subgraph.service';
import queryBuilder from './query';

export default class WeeklySwaps {
  service: Service;
  query: QueryBuilder;

  constructor(service: Service, query: QueryBuilder = queryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<WeeklyBalance[]> {
    const query = this.query(args, attrs);
    const { swaps } = await this.service.client.get(query);
    return await this.serialize(swaps);
  }

  public async swaprDecoration(
    swaps: WeeklyBalance[]
  ): Promise<WeeklyBalance[]> {
    const ensData = await Promise.all(
      swaps.map(async (poolSwap: WeeklyBalance) => {
        const ensName = await walletService.getEnsName(poolSwap.userAddress.id);
        let ensAvatar: null | string = null;

        if (ensName) {
          ensAvatar = await walletService.getEnsAvatar(ensName);
        }

        return {
          ensName,
          ensAvatar,
        };
      })
    );

    return swaps.map((swap: WeeklyBalance, index: number) => ({
      ...swap,
      ensName: ensData[index].ensName,
      ensAvatar: ensData[index].ensAvatar,
    }));
  }

  async serialize(swaps: WeeklyBalance[]) {
    const processedSwaps = await this.swaprDecoration(swaps);

    return processedSwaps.map(swap => ({
      ...swap,
      valueUSD: swap.valueUSD,
    }));
  }
}
