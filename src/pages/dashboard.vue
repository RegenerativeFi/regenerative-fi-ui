<script lang="ts" setup>
import ClaimTable from '@/components/contextual/pages/dashboard/DashboardTable/ClaimsTable.vue';
import LiquidityTable from '@/components/contextual/pages/dashboard/DashboardTable/LiquidityTable.vue';
</script>
<template>
  <div class="xl:container xl:px-4 xl:mx-auto">
    <BalStack vertical spacing="xl">
      <BalStack horizontal spacing="lg">
        <div>
          <div class="flex flex-row gap-2 justify-center items-center">
            <h2 class="text-lg font-light">Campaigns</h2>
            <p
              class="p-1 text-sm font-bold text-white rounded-full bg-[#0468BE]"
            >
              Early Growth Campaign
            </p>
          </div>
          <BalCard>
            <div>
              <h3>Weekly progress</h3>
              <p>
                Participate in the <a href="#"> Early Growth Campaign</a> by
                trading each week to level up your ReFi Profile and earn more
                Voting Power. Each Monday at 12:00 CET weekly snapshots are
                taken and rewards are allocated.
              </p>
            </div>
          </BalCard>
        </div>
        <div>
          <div class="flex flex-row gap-2 justify-center items-center">
            <h2 class="text-lg font-light">Campaigns</h2>
            <p
              class="p-1 text-sm font-bold text-white rounded-full bg-[#0468BE]"
            >
              Early Growth Campaign
            </p>
          </div>
          <BalCard>
            <div>
              <h3>Weekly progress</h3>
              <p>
                Participate in the <a href="#"> Early Growth Campaign</a> by
                trading each week to level up your ReFi Profile and earn more
                Voting Power. Each Monday at 12:00 CET weekly snapshots are
                taken and rewards are allocated.
              </p>
            </div>
          </BalCard>
        </div>
      </BalStack>
      <BalStack vertical spacing="2xl">
        <BalStack vertical spacing="sm">
          <h2 class="text-lg font-light">Claim Rewards</h2>
          <ClaimTable :isLoading="false" />
        </BalStack>
        <BalStack vertical spacing="sm">
          <h2 class="text-lg font-light">My liquidity</h2>
          <LiquidityTable />
        </BalStack>
      </BalStack>
    </BalStack>
  </div>
</template>