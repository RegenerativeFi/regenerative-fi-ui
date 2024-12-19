<script lang="ts" setup>
import VeReFiBalanceCard from '@/components/contextual/pages/dashboard/VeReFi/VeReFiBalanceCard.vue';
import VeReFiLockedCard from '@/components/contextual/pages/dashboard/VeReFi/VeReFiLockedCard.vue';
import ClaimTable from '@/components/contextual/pages/dashboard/DashboardTable/ClaimsTable.vue';
import LiquidityTable from '@/components/contextual/pages/dashboard/DashboardTable/LiquidityTable.vue';
import { provideUserStaking } from '@/providers/local/user-staking.provider';
import { providerUserPools } from '@/providers/local/user-pools.provider';

const userStaking = provideUserStaking();
providerUserPools(userStaking);
</script>
<template>
  <div
    class="xl:container flex flex-col gap-8 px-4 xl:px-4 xl:mx-auto pt-[30px]"
  >
    <h2 class="text-xl font-medium leading-5 !mb-4">Manage your VeREFI</h2>
    <div class="flex flex-row gap-4">
      <VeReFiBalanceCard />
      <VeReFiLockedCard />
    </div>
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








