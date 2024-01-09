<script setup lang="ts">
import NFTImage from '@/assets/images/mocks/NFT.png';
import useBreakpoints from '@/composables/useBreakpoints';
import useWeb3 from '@/services/web3/useWeb3';
const { startConnectWithInjectedProvider } = useWeb3();
const { isMobile, bp } = useBreakpoints();
</script>
<template>
  <template v-if="isMobile">
    <BalCard v-if="bp === 'xs'">
      <div class="flex flex-col gap-5 justify-center items-start px-4 h-fit">
        <img :src="NFTImage" class="w-full h-full rounded-md bg-slate-500" />
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
              class="flex justify-between items-center text-base text-disabled"
            >
              <p>Next level</p>
              <p>- RFP</p>
            </div>
          </div>
          <BalBtn
            color="gradient"
            class="self-end w-fit"
            size="sm"
            @click="startConnectWithInjectedProvider"
            >Connect wallet</BalBtn
          >
        </div>
      </div>
    </BalCard>
    <BalCard v-else>
      <div class="flex flex-row gap-5 justify-center items-start px-4 h-80">
        <img :src="NFTImage" class="w-48 h-full rounded-md bg-slate-500" />
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
              class="flex justify-between items-center text-base text-disabled"
            >
              <p>Next level</p>
              <p>- RFP</p>
            </div>
          </div>
          <BalBtn
            color="gradient"
            class="self-end w-fit"
            size="sm"
            @click="startConnectWithInjectedProvider"
            >Connect wallet</BalBtn
          >
        </div>
      </div>
    </BalCard>
  </template>
  <template v-else>
    <div class="p-8 h-full bg-white dark:bg-gray-850 rounded-lg shadow-lg">
      <div
        class="flex flex-row gap-8 justify-center items-center h-full h-[265px]"
      >
        <img
          :src="NFTImage"
          class="rounded-md h-[224px] w-[168px] bg-slate-500"
        />
        <div class="flex flex-col gap-6 w-full">
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
              <p class="text-sm">My Points</p>
              <p class="text-sm">- RFP</p>
            </div>
            <div
              class="flex justify-between items-center text-base text-disabled"
            >
              <p class="text-sm">Next level</p>
              <p class="text-sm">- RFP</p>
            </div>
          </div>
          <BalBtn
            color="gradient-blue-light"
            class="self-end w-fit"
            size="sm"
            @click="startConnectWithInjectedProvider"
            >Connect wallet</BalBtn
          >
        </div>
      </div>
    </div>
  </template>
</template>