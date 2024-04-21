<script lang="ts" setup>
import RefiProfileCard from '@/components/contextual/pages/dashboard/Cards/RefiProfileCard.vue';
import WeeklyCard from '@/components/contextual/pages/dashboard/Cards/WeeklyCard.vue';
import ClaimTable from '@/components/contextual/pages/dashboard/DashboardTable/ClaimsTable.vue';
import LiquidityTable from '@/components/contextual/pages/dashboard/DashboardTable/LiquidityTable.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import useUserSwapVolumeQuery from '@/composables/queries/useUserSwapVolumeQuery';
import { flatten } from 'lodash';
import { provideUserStaking } from '@/providers/local/user-staking.provider';
import { providerUserPools } from '@/providers/local/user-pools.provider';
const { isMobile } = useBreakpoints();

const poolSwapsQuery = useUserSwapVolumeQuery();

const userStaking = provideUserStaking();
providerUserPools(userStaking);

// COMPUTED

const swaps = computed(() =>
  poolSwapsQuery.data.value
    ? flatten(poolSwapsQuery.data.value.pages.map(page => page.weeklySwaps))
    : []
);

const weeklyVolume = computed(() =>
  swaps.value.length > 0
    ? swaps.value.reduce((acc, cur) => acc + parseFloat(cur.valueUSD), 0)
    : 0
);
const isLoadingPoolSwaps = computed(() => poolSwapsQuery.isLoading.value);
</script>
<template>
  <div class="xl:container px-4 xl:px-4 xl:mx-auto pt-[30px]">
    <BalStack vertical spacing="lg">
      <BalStack v-if="isMobile" vertical spacing="lg">
        <BalStack vertical class="w-full" spacing="sm">
          <div class="flex flex-row gap-2 justify-start items-center">
            <h2
              class="text-xl font-medium leading-5 text-gray-900 dark:text-white"
            >
              Campaigns
            </h2>
            <div
              class="flex flex-row gap-2 justify-between items-center px-3 text-sm font-bold text-white rounded-full h-[22px] bg-[#0468BE]"
            >
              <p class="text-xs !font-semibold">Early Growth Campaign</p>
              <div
                class="w-2 h-2 bg-gradient-to-tr rounded-full to-[#05DBF3] from-[#0468BE]"
              />
            </div>
          </div>
          <WeeklyCard
            :weeklyVolume="weeklyVolume"
            :isLoading="isLoadingPoolSwaps"
          />
        </BalStack>
        <BalStack vertical class="w-full" spacing="sm">
          <div class="flex flex-row gap-2 justify-start items-center h-[22px]">
            <h2
              class="text-xl font-medium leading-5 text-gray-900 dark:text-white"
            >
              My Refi Profile
            </h2>
          </div>
          <RefiProfileCard />
        </BalStack>
      </BalStack>
      <div v-else class="flex flex-row gap-5 justify-between items-stretch">
        <div class="flex flex-col gap-4 w-full !mb-0">
          <div class="flex flex-row gap-2 justify-start items-center">
            <h2
              class="mb-0 text-xl font-medium leading-5 text-gray-900 dark:text-white"
            >
              Campaigns
            </h2>
            <div
              class="flex flex-row gap-2 justify-between items-center px-3 text-sm font-bold text-white rounded-full h-[22px] bg-[#0468BE]"
            >
              <p class="text-xs !font-semibold">Early Growth Campaign</p>
              <div
                class="w-2 h-2 bg-gradient-to-tr from-refi-text to-light-blue rounded-full"
              />
            </div>
          </div>
          <WeeklyCard
            :weeklyVolume="weeklyVolume"
            :isLoading="isLoadingPoolSwaps"
          />
        </div>
        <div class="flex flex-col gap-4 w-full !mb-0">
          <div class="h-[22px]">
            <h2
              class="text-xl font-medium leading-5 text-gray-900 dark:text-white"
            >
              My Refi Profile
            </h2>
          </div>
          <RefiProfileCard />
        </div>
      </div>
      <div>
        <h2 class="text-xl font-medium leading-5 !mb-4">Claim Rewards</h2>
        <ClaimTable />
      </div>
      <div>
        <h2 class="text-xl font-medium leading-5 !mb-4">My liquidity</h2>
        <LiquidityTable />
      </div>
    </BalStack>
  </div>
</template>








