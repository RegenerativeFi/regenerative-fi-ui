<script lang="ts" setup>
import VeReFiBalanceCard from '@/components/contextual/pages/dashboard/VeReFi/VeReFiBalanceCard.vue';
import VeReFiLockedCard from '@/components/contextual/pages/dashboard/VeReFi/VeReFiLockedCard.vue';
// import ClaimTable from '@/components/contextual/pages/dashboard/DashboardTable/ClaimsTable.vue';
import RewardsTable from '@/components/contextual/pages/dashboard/DashboardTable/RewardsTable.vue';
import StakedPoolsTable from '@/components/contextual/pages/pools/StakedPoolsTable.vue';
import UnstakedLiquidityTable from '@/components/contextual/pages/dashboard/DashboardTable/UnstakedLiquidityTable.vue';
import { provideUserStaking } from '@/providers/local/user-staking.provider';
import { providerUserPools } from '@/providers/local/user-pools.provider';
import useVeBal from '@/composables/useVeBAL';

const userStaking = provideUserStaking();
providerUserPools(userStaking);

const { ReFiBalance, veBalBalance, veBalTokenInfo, ReFiTokenInfo } = useVeBal();
</script>
<template>
  <div
    class="xl:container flex flex-col gap-8 px-4 xl:px-4 xl:mx-auto pt-[30px]"
  >
    <h2 class="text-xl font-medium leading-5 !mb-4">Manage your VeREFI</h2>
    <div class="flex flex-row gap-4">
      <VeReFiBalanceCard :tokenInfo="ReFiTokenInfo" :balance="ReFiBalance" />
      <VeReFiLockedCard :tokenInfo="veBalTokenInfo" :balance="veBalBalance" />
    </div>
    <div>
      <h2 class="text-xl font-medium leading-5 !mb-4">Claim Rewards</h2>
      <!-- <div class="mb-4">
        <h3 class="text-lg font-medium leading-5 !mb-4">Voter Rewards</h3>
        <ClaimTable />
      </div> -->
      <div>
        <h3 class="text-lg font-medium leading-5 !mb-4">Incentives</h3>
        <RewardsTable />
      </div>
    </div>
    <div>
      <h2 class="text-xl font-medium leading-5">My liquidity</h2>
      <h4 class="text-lg font-medium leading-5 !mt-6 !mb-4">Unstaked pools</h4>
      <UnstakedLiquidityTable />
      <h4 class="text-lg font-medium leading-5 !mt-6 !mb-4">Staked pools</h4>
      <StakedPoolsTable />
    </div>
  </div>
</template>
