<script lang="ts" setup>
import ClaimTable from '@/components/contextual/pages/dashboard/DashboardTable/ClaimsTable.vue';
import LiquidityTable from '@/components/contextual/pages/dashboard/DashboardTable/LiquidityTable.vue';
import { provideUserStaking } from '@/providers/local/user-staking.provider';
import { providerUserPools } from '@/providers/local/user-pools.provider';

const userStaking = provideUserStaking();
providerUserPools(userStaking);
</script>
<template>
  <div class="xl:container px-4 xl:px-4 xl:mx-auto pt-[30px]">
    <div>
      <h2 class="text-xl font-medium leading-5 !mb-4">Claim Rewards</h2>
      <ClaimTable />
    </div>
    <div>
      <h2 class="text-xl font-medium leading-5 !mb-4">My liquidity</h2>
      <LiquidityTable />
    </div>
  </div>
</template>








