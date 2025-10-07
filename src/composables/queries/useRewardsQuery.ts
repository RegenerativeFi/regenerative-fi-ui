import { MerklApi } from '@merkl/api';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';
import QUERY_KEYS from '@/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import { computed, reactive } from 'vue';
import { VAULT_ADDRESS } from '../vaults/strategies/stCelo.strategy';

// Module-level (shared) state kept for backwards compatibility if needed
type QueryResponse =
  | {
      chain: {
        id: number;
        name: string;
        icon: string;
        liveCampaigns: number;
        endOfDisputePeriod: number;
        explorers?:
          | {
              type: 'BLOCKSCOUT' | 'ETHERSCAN';
              url: string;
              chainId: number;
            }[]
          | undefined;
      };
      rewards: {
        root: string;
        recipient: string;
        proofs: string[];
        token: {
          address: string;
          chainId: number;
          symbol: string;
          decimals: number;
        };
        breakdowns: {
          reason: string;
          amount: string;
          claimed: string;
          pending: string;
          campaignId: string;
          campaignStatus?:
            | {
                computedUntil: string | number;
                processingStarted: string | number;
                status: string;
                delay?: number | undefined;
                error?: string | undefined;
                details?: any;
              }
            | undefined;
        }[];
        claimed: string | bigint;
        amount: string | bigint;
        pending: string | bigint;
      }[];
    }[]
  | null;

// Vue-query style composable following project patterns. This mirrors the
// idiomatic approach used by the gauges queries: it receives refs and returns
export function useRewardsQuery(options: UseQueryOptions = {}) {
  const { account, isWalletReady, chainId } = useWeb3();
  const queryKey = reactive(QUERY_KEYS.Claims.MerklRewards(account, chainId));

  const queryFn = async () => {
    if (!account.value || !chainId.value) return null;
    try {
      const { data } = await MerklApi('https://api.merkl.xyz')
        .v4.users({ address: account.value })
        .rewards.get({
          query: {
            chainId: ['42220'],
            breakdownPage: 0,
            claimableOnly: true,
            reloadChainId: 42220,
          },
        });

      console.debug('Merkl rewards data fetched');
      console.debug({ data });

      if (!data) return null;

      const { data: campaignsData } = await MerklApi(
        'https://api.merkl.xyz'
      ).v4.campaigns.get({
        query: {
          chainId: 42220,
          mainProtocolId: 'regenerative',
        },
      });

      const { data: vaultsCampaignsData } = await MerklApi(
        'https://api.merkl.xyz'
      ).v4.campaigns.get({
        query: {
          mainParameter: VAULT_ADDRESS,
        },
      });

      // Crear un Set de campaignIds válidos
      const validCampaignIds = new Set<string>();
      if (campaignsData) {
        campaignsData.forEach((campaign: any) => {
          if (campaign.campaignId) {
            validCampaignIds.add(campaign.campaignId);
          }
        });
      }

      if (vaultsCampaignsData) {
        vaultsCampaignsData.forEach((campaign: any) => {
          if (campaign.campaignId) {
            validCampaignIds.add(campaign.campaignId);
          }
        });
      }

      // Filtrar rewards basados en campaignIds válidos
      const filteredData = data.map(chainData => ({
        ...chainData,
        rewards: chainData.rewards.filter(reward => {
          if (!reward.breakdowns || reward.breakdowns.length === 0)
            return false;
          const campaignsIds = reward.breakdowns.map(b => b.campaignId);
          return (
            campaignsIds.length > 0 &&
            campaignsIds.some(id => validCampaignIds.has(id))
          );
        }),
      }));

      return filteredData;
    } catch (err) {
      console.error('Merkl rewards query failed', err);
      throw err;
    }
  };

  const enabled = computed(
    (): boolean => !!account.value && !!chainId.value && isWalletReady.value
  );

  const queryOptions = reactive({
    enabled,
    refetchOnWindowFocus: false,
    ...options,
  }) as UseQueryOptions<QueryResponse>;

  return useQuery<QueryResponse>(queryKey as any, queryFn, queryOptions);
}
