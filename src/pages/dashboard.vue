<script lang="ts" setup>
import ClaimTable from '@/components/contextual/pages/dashboard/DashboardTable/ClaimsTable.vue';
import LiquidityTable from '@/components/contextual/pages/dashboard/DashboardTable/LiquidityTable.vue';
</script>
<template>
  <div class="xl:container xl:px-4 xl:mx-auto">
    <BalStack vertical spacing="xl">
      <BalStack horizontal spacing="lg">
        <BalStack vertical class="w-full" spacing="sm">
          <div class="flex flex-row gap-2 justify-start items-center">
            <h2 class="mb-0 text-lg font-medium text-gray-900">Campaigns</h2>
            <p
              class="p-1 px-3 text-sm font-bold text-white rounded-full bg-[#0468BE]"
            >
              Early Growth Campaign
            </p>
          </div>
          <BalCard>
            <div
              class="flex flex-col gap-5 justify-center items-start p-4 h-80"
            >
              <h3 class="text-base">Weekly progress</h3>
              <p class="text-sm text-[#7B7B7B]">
                Participate in the
                <a class="text-[#4654D2]" href="#"> Early Growth Campaign</a> by
                trading each week to level up your ReFi Profile and earn more
                Voting Power. Each Monday at 12:00 CET weekly snapshots are
                taken and rewards are allocated.
              </p>
              <BalStack horizontal spacing="base">
                <div
                  class="flex flex-col justify-center items-center pt-5 rounded-md border-[1px] border-[#B6C7D6]"
                >
                  <div
                    class="flex flex-col justify-center px-10 pb-5 w-full text-center items-cente"
                  >
                    <h4 class="text-sm text-[#7B7B7B]">
                      Your Volume this week
                    </h4>
                    <p>-</p>
                  </div>

                  <div class="w-full h-10 border-t-[1px] border-[#B6C7D6]" />
                </div>
                <div
                  class="flex flex-col justify-center items-center pt-5 rounded-md border-[1px] border-[#B6C7D6]"
                >
                  <div
                    class="flex flex-col justify-center px-10 pb-5 w-full text-center items-cente"
                  >
                    <h4 class="text-sm text-[#7B7B7B]">Volume for next tier</h4>
                    <p>-</p>
                  </div>

                  <div class="w-full h-10 border-t-[1px] border-[#B6C7D6]" />
                </div>
              </BalStack>
            </div>
          </BalCard>
        </BalStack>
        <div>
          <div class="flex flex-row gap-2 justify-start items-center">
            <h2 class="mb-2 text-lg font-medium text-gray-900">
              My Refi Profile
            </h2>
          </div>
          <BalCard>
            <div class="flex flex-row gap-6 p-6 h-80">
              <span class="w-48 h-full rounded-sm bg-slate-500"></span>
              <p class="flex-1">
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