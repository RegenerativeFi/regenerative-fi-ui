<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';

const { isMobile, upToSmallBreakpoint } = useBreakpoints();
</script>
<template>
  <template v-if="isMobile">
    <BalCard v-if="upToSmallBreakpoint">
      <div class="flex flex-col gap-5 justify-center items-center px-4 h-fit">
        <h3 class="self-start text-lg">Weekly progress</h3>
        <p class="text-base text-[#7B7B7B]">
          Participate in the
          <a class="font-medium text-[#4654D2]" href="#">
            Early Growth Campaign</a
          >
          by trading each week to level up your ReFi Profile and earn more
          Voting Power. Each Monday at 12:00 CET weekly snapshots are taken and
          rewards are allocated.
        </p>
        <div class="flex flex-row gap-5 w-full">
          <div
            class="flex flex-col justify-center items-center pt-5 w-full rounded-md border-[1px] border-[#B6C7D6]"
          >
            <div
              class="flex flex-col justify-center pb-5 mr-0 w-full text-center items-cente"
            >
              <h4 class="text-[10px] text-[#7B7B7B]">Your Volume this week</h4>
              <p class="text-xl">-</p>
            </div>

            <div class="w-full h-10 border-t-[1px] border-[#B6C7D6]" />
          </div>
          <div
            class="flex flex-col justify-center items-center pt-5 w-full rounded-md border-[1px] border-[#B6C7D6]"
          >
            <div
              class="flex flex-col justify-center pb-5 mr-0 w-full text-center items-cente"
            >
              <h4 class="text-[10px] text-[#7B7B7B]">Volume for next tier</h4>
              <p class="text-xl">-</p>
            </div>

            <div class="w-full h-10 border-t-[1px] border-[#B6C7D6]" />
          </div>
        </div>
      </div>
    </BalCard>
    <BalCard v-else>
      <div class="flex flex-col gap-5 justify-center items-center px-4 h-80">
        <h3 class="self-start text-lg leading-[1.125rem]">Weekly progress</h3>
        <p class="text-base text-[#7B7B7B]">
          Participate in the
          <a class="font-medium text-[#4654D2]" href="#">
            Early Growth Campaign</a
          >
          by trading each week to level up your ReFi Profile and earn more
          Voting Power. Each Monday at 12:00 CET weekly snapshots are taken and
          rewards are allocated.
        </p>
        <div class="flex flex-row gap-5 w-full">
          <div
            class="flex flex-col justify-center items-center pt-5 w-full rounded-md border-[1px] border-[#B6C7D6]"
          >
            <div
              class="flex flex-col justify-center pb-5 mr-0 w-full text-center items-cente"
            >
              <h4 class="text-[10px] text-[#7B7B7B]">Your Volume this week</h4>
              <p class="text-xl">-</p>
            </div>

            <div class="w-full h-10 border-t-[1px] border-[#B6C7D6]" />
          </div>
          <div
            class="flex flex-col justify-center items-center pt-5 w-full rounded-md border-[1px] border-[#B6C7D6]"
          >
            <div
              class="flex flex-col justify-center items-center pb-5 mr-0 w-full text-center"
            >
              <h4 class="text-[10px] text-[#7B7B7B]">Volume for next tier</h4>
              <p class="text-xl">-</p>
            </div>

            <div class="w-full h-10 border-t-[1px] border-[#B6C7D6]" />
          </div>
        </div>
      </div>
    </BalCard>
  </template>
  <template v-else>
    <div class="p-4 h-full bg-white rounded-lg shadow-lg">
      <div
        class="flex flex-col gap-4 justify-center items-center px-4 min-h-[265px]"
      >
        <h3 class="self-start text-lg leading-[1.125rem]">Weekly progress</h3>
        <p class="text-base text-[#7B7B7B]">
          Participate in the
          <a class="font-medium text-[#4654D2]" href="#">
            Early Growth Campaign</a
          >
          by trading each week to level up your ReFi Profile and earn more
          Voting Power. Each Monday at 12:00 CET weekly snapshots are taken and
          rewards are allocated.
        </p>
        <div class="flex flex-row gap-5 w-full">
          <div
            class="flex flex-col justify-center items-center pt-5 w-full rounded-md border-[1px] border-[#B6C7D6]"
          >
            <div
              class="flex flex-col justify-center pb-5 w-full text-center items-cente"
            >
              <h4 class="text-[10px] text-[#7B7B7B]">Your Volume this week</h4>
              <p class="text-xl">-</p>
            </div>

            <div class="w-full h-10 border-t-[1px] border-[#B6C7D6]" />
          </div>
          <div
            class="flex flex-col justify-center items-center pt-5 w-full rounded-md border-[1px] border-[#B6C7D6]"
          >
            <div
              class="flex flex-col justify-center pb-5 w-full text-center items-cente"
            >
              <h4 class="text-[10px] text-[#7B7B7B]">Volume for next tier</h4>
              <p class="text-xl">-</p>
            </div>

            <div class="w-full h-10 border-t-[1px] border-[#B6C7D6]" />
          </div>
        </div>
      </div>
    </div>
  </template>
</template>