import { differenceInWeeks } from 'date-fns';

import { isStable } from '@/composables/usePoolHelpers';
import { oneSecondInMs } from '@/composables/useTime';
import { bnum } from '@/lib/utils';
import {
  OnchainPoolData,
  Pool,
  PoolToken,
  RawOnchainPoolData,
} from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';

import { OnchainDataFormater } from './decorators/onchain-data.formater';
import { AprBreakdown } from '@regenerative/sdk';
import useNetwork, { networkId } from '@/composables/useNetwork';
import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import { Pool as SDKPool } from '@regenerative/sdk';
import { captureBalancerException } from '@/lib/utils/errors';
import { formatUnits } from '@ethersproject/units';
import { subgraphRequest } from '@/lib/utils/subgraph';

export default class PoolService {
  constructor(public pool: Pool) {
    this.format();
  }

  /**
   * @summary Statically format various pool attributes.
   */
  public format(): Pool {
    this.pool.isNew = this.isNew;
    this.pool.chainId = networkId.value;
    this.formatPoolTokens();
    return this.pool;
  }

  public get bptPrice(): string {
    return bnum(this.pool.totalLiquidity).div(this.pool.totalShares).toString();
  }

  /**
   * @summary Calculates and sets total liquidity of pool.
   */
  public async setTotalLiquidity(): Promise<string> {
    let totalLiquidity = this.pool.totalLiquidity;

    try {
      const sdkTotalLiquidity = await getBalancerSDK().pools.liquidity(
        this.pool as unknown as SDKPool
      );
      // if totalLiquidity can be computed from coingecko prices, use that
      // else, use the value retrieved from the subgraph
      if (bnum(totalLiquidity).gt(0)) {
        totalLiquidity = sdkTotalLiquidity;
      }
    } catch (error) {
      captureBalancerException({ error });
      console.error(`Failed to calc liquidity for: ${this.pool.id}`, error);
    }

    return (this.pool.totalLiquidity = totalLiquidity);
  }

  /**
   * @summary Calculates APRs for pool.
   */
  public async setAPR(rewards?: any): Promise<AprBreakdown> {
    let apr = this.pool.apr;

    try {
      const sdkApr = await getBalancerSDK().pools.apr(this.pool);
      if (sdkApr) apr = sdkApr;
    } catch (error) {
      apr = {
        swapFees: 0,
        tokenAprs: {
          total: 0,
          breakdown: {},
        },
        stakingApr: {
          min: 0,
          max: 0,
        },
        rewardAprs: {
          total: 0,
          breakdown: {},
        },
        protocolApr: 0,
        min: 0,
        max: 0,
      };
      captureBalancerException({ error });
      console.error(`Failed to calc APR for: ${this.pool.id}`, error);
    }

    if (rewards && rewards[this.pool.id]) {
      console.log('has rewards');
      const totalSupply = await gaugeTotalSupply(this.pool.address);
      const totalSupplyUsd = Number(this.bptPrice) * totalSupply;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const poolRewards = rewards[this.pool.id];

      // Fetch token prices from API
      const tokenPrices = await this.fetchTokenPrices();

      poolRewards.forEach(reward => {
        console.log(reward);
        const yearlyReward = BigInt(reward.rate) * BigInt(86400) * BigInt(365);

        const tokenPrice = tokenPrices[reward.token] || 0;
        const yearlyRewardUsd =
          parseFloat(formatUnits(yearlyReward.toString(), 18)) * tokenPrice;
        const rewardValue =
          yearlyRewardUsd / parseFloat(totalSupplyUsd.toString());
        const rewardValueScaled = Math.round(10000 * rewardValue);
        if (apr) {
          apr.rewardAprs = {
            total: apr.rewardAprs.total + rewardValueScaled,
            breakdown: {
              ...apr.rewardAprs.breakdown,
              [reward.token]: rewardValueScaled,
            },
          };
        }
      });
    }

    // Calculate total APR including staking APR
    if (apr) {
      const totalSwapFees = apr.swapFees || 0;
      const totalTokenAprs = apr.tokenAprs?.total || 0;
      const totalRewardAprs = apr.rewardAprs?.total || 0;
      const totalProtocolApr = apr.protocolApr || 0;

      // Add staking APR to the total
      const stakingAprMin = apr.stakingApr?.min || 0;
      const stakingAprMax = apr.stakingApr?.max || 0;

      apr.min =
        totalSwapFees +
        totalTokenAprs +
        totalRewardAprs +
        totalProtocolApr +
        stakingAprMin;
      apr.max =
        totalSwapFees +
        totalTokenAprs +
        totalRewardAprs +
        totalProtocolApr +
        stakingAprMax;
    }

    return (this.pool.apr = apr as AprBreakdown);
  }

  /**
   * Fetch token prices from Regenerative Prices API
   */
  private async fetchTokenPrices(): Promise<{ [address: string]: number }> {
    try {
      const response = await fetch(
        'https://regenerative-prices.deno.dev/tokens'
      );
      const data = await response.json();

      // Get prices for current network (42220 for Celo)
      const networkId = useNetwork().networkConfig.chainId.toString();
      const networkPrices = data[networkId] || {};

      // Convert string prices to numbers
      const prices: { [address: string]: number } = {};
      for (const [address, price] of Object.entries(networkPrices)) {
        prices[address.toLowerCase()] = parseFloat(price as string);
      }

      return prices;
    } catch (error) {
      console.warn('Failed to fetch token prices from API:', error);
      return {};
    }
  }

  formatPoolTokens(): PoolToken[] {
    if (isStable(this.pool.poolType)) return this.pool.tokens;

    return (this.pool.tokens = this.pool.tokens.sort(
      (a, b) => parseFloat(b.weight || '0') - parseFloat(a.weight || '0')
    ));
  }

  public setFeesSnapshot(poolSnapshot: Pool | undefined): string {
    let snapshotFees = '0';
    if (poolSnapshot) snapshotFees = poolSnapshot.totalSwapFee || '0';

    const feesSnapshot = bnum(this.pool.totalSwapFee || 0)
      .minus(snapshotFees)
      .toString();

    return (this.pool.feesSnapshot = feesSnapshot);
  }

  public setVolumeSnapshot(poolSnapshot: Pool | undefined): string {
    let snapshotVolume = '0';
    if (poolSnapshot) snapshotVolume = poolSnapshot.totalSwapVolume || '0';

    const volumeSnapshot = bnum(this.pool.totalSwapVolume || 0)
      .minus(snapshotVolume)
      .toString();

    return (this.pool.volumeSnapshot = volumeSnapshot);
  }

  public setOnchainData(
    rawOnchainData: RawOnchainPoolData,
    tokenMeta: TokenInfoMap
  ): OnchainPoolData | undefined {
    try {
      const onchainData = new OnchainDataFormater(
        this.pool,
        rawOnchainData,
        tokenMeta
      );
      this.pool.isInRecoveryMode = rawOnchainData.isInRecoveryMode;
      this.pool.isPaused = rawOnchainData.isPaused;
      return (this.pool.onchain = onchainData.format());
    } catch (e) {
      console.warn(e);
    }
  }

  public get isNew(): boolean {
    if (!this.pool.createTime) return false;

    return (
      differenceInWeeks(Date.now(), this.pool.createTime * oneSecondInMs) < 1
    );
  }
}

const gaugeTotalSupply = async (poolAddress: string): Promise<number> => {
  try {
    const data = await subgraphRequest<{
      pool: { preferentialGauge: { totalSupply: number } };
    }>({
      url: useNetwork().networkConfig.subgraphs.gauge,
      query: {
        pool: {
          __args: {
            id: poolAddress.toLowerCase(),
          },
          preferentialGauge: {
            totalSupply: true,
          },
        },
      },
    });

    return data.pool.preferentialGauge.totalSupply;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
