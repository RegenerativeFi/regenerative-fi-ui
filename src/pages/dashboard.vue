<script lang="ts" setup>
import NFTImage from '@/assets/images/mocks/NFT.png';
import ClaimTable from '@/components/contextual/pages/dashboard/DashboardTable/ClaimsTable.vue';
import LiquidityTable from '@/components/contextual/pages/dashboard/DashboardTable/LiquidityTable.vue';
import useWeb3 from '@/services/web3/useWeb3';
const { startConnectWithInjectedProvider } = useWeb3();
</script>
<template>
  <div class="xl:container xl:px-4 xl:mx-auto">
    <BalStack vertical spacing="xl">
      <BalStack horizontal spacing="lg">
        <BalStack vertical class="w-full" spacing="sm">
          <div class="flex flex-row gap-2 justify-start items-center">
            <h2 class="text-lg font-medium text-gray-900">Campaigns</h2>
            <p
              class="p-1 px-3 text-sm font-bold text-white rounded-full bg-[#0468BE]"
            >
              Early Growth Campaign
            </p>
          </div>
          <BalCard>
            <div
              class="flex flex-col gap-5 justify-center items-center p-4 h-80"
            >
              <h3 class="self-start text-lg">Weekly progress</h3>
              <p class="text-base text-[#7B7B7B]">
                Participate in the
                <a class="text-[#4654D2]" href="#"> Early Growth Campaign</a> by
                trading each week to level up your ReFi Profile and earn more
                Voting Power. Each Monday at 12:00 CET weekly snapshots are
                taken and rewards are allocated.
              </p>
              <BalStack horizontal class="w-full" spacing="base">
                <div
                  class="flex flex-col justify-center items-center pt-5 w-full rounded-md border-[1px] border-[#B6C7D6]"
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
                  class="flex flex-col justify-center items-center pt-5 w-full rounded-md border-[1px] border-[#B6C7D6]"
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
        <BalStack vertical class="w-full" spacing="sm">
          <div class="flex flex-row gap-2 justify-start items-center p-1">
            <h2 class="text-lg font-medium text-gray-900">My Refi Profile</h2>
          </div>
          <BalCard>
            <div
              class="flex flex-row gap-5 justify-center items-start p-4 h-80"
            >
              <img
                :src="NFTImage"
                class="w-48 h-full rounded-md bg-slate-500"
              />
              <div class="flex flex-col gap-10 w-full">
                <div class="flex flex-col gap-4">
                  <h3 class="self-start text-lg">Connect wallet</h3>
                  <div class="flex justify-between items-center text-base">
                    <p>Voting Power</p>
                    <p>- Votes</p>
                  </div>
                </div>
                <div class="w-full border-t-2" />
                <div class="flex flex-col gap-1">
                  <div class="flex justify-between items-center text-base">
                    <p>My Points</p>
                    <p>- RFP</p>
                  </div>
                  <div
                    class="flex justify-between items-center text-base text-[#9F9F9F]"
                  >
                    <p>Next level</p>
                    <p>- RFP</p>
                  </div>
                </div>
                <BalBtn
                  color="gradient-blue"
                  class="self-end w-fit"
                  size="sm"
                  @click="startConnectWithInjectedProvider"
                  >Connect wallet</BalBtn
                >
              </div>
              <!-- <div class="flex flex-col gap-10 w-80">
                <div>
                  <h3 class="text-base font-medium">Connect Wallet</h3>
                  <div class="flex justify-between items-center text-sm">
                    <p>Voting Power</p>
                    <p>- Votes</p>
                  </div>
                </div>
                
                <button>Connect Wallet</button>
              </div> -->
            </div>
          </BalCard>
        </BalStack>
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