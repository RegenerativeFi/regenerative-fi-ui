<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers from '@/composables/useNumbers';

type Props = {
  isLoading: boolean;
  weeklyVolume: number;
};

const props = defineProps<Props>();
const { toFiatLabel } = useNumbers();

const { isMobile, upToSmallBreakpoint } = useBreakpoints();
</script>
<template>
  <template v-if="isMobile">
    <BalCard v-if="upToSmallBreakpoint" class="dark:bg-gray-850">
      <div class="flex flex-col gap-5 justify-center items-center px-4 h-fit">
        <h3 class="self-start text-lg">Weekly progress</h3>
        <p class="text-base text-complementary">
          Participate in the
          <a class="font-medium text-blue-700" href="#">
            Early Growth Campaign</a
          >
          by trading each week to level up your ReFi Profile and earn more
          Voting Power. Each Monday at 12:00 CET weekly snapshots are taken and
          rewards are allocated.
        </p>
        <div class="flex flex-row gap-5 w-full">
          <div
            class="flex flex-col justify-center items-center pt-5 w-full rounded-md border-complementary-b border-[1px]"
          >
            <div
              class="flex flex-col justify-center pb-5 mr-0 w-full text-center items-cente"
            >
              <h4 class="text-complementary text-[10px]">
                Your Volume this week
              </h4>
              <p v-if="!props.isLoading" class="text-xl">
                {{ toFiatLabel(props.weeklyVolume) }}
              </p>
              <p v-else class="text-xl">-</p>
            </div>

            <div class="w-full h-10 border-complementary-b border-t-[1px]" />
          </div>
          <div
            class="flex flex-col justify-center items-center pt-5 w-full rounded-md border-complementary-b border-[1px]"
          >
            <div
              class="flex flex-col justify-center pb-5 mr-0 w-full text-center items-cente"
            >
              <h4 class="text-complementary text-[10px]">
                Volume for next tier
              </h4>
              <p class="text-xl">-</p>
            </div>

            <div class="w-full h-10 border-complementary-b border-t-[1px]" />
          </div>
        </div>
      </div>
    </BalCard>
    <BalCard v-else>
      <div
        class="flex flex-col gap-5 justify-center items-center px-4 h-80 dark:bg-gray-850"
      >
        <h3 class="self-start text-lg dark:text-white leading-[1.125rem]">
          Weekly progress
        </h3>
        <p class="text-base text-complementary">
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
            class="flex flex-col justify-center items-center pt-5 w-full rounded-md border-complementary-b border-[1px]"
          >
            <div
              class="flex flex-col justify-center pb-5 mr-0 w-full text-center items-cente"
            >
              <h4 class="text-complementary text-[10px]">
                Your Volume this week
              </h4>
              <p v-if="!props.isLoading" class="text-xl">
                {{ toFiatLabel(props.weeklyVolume) }}
              </p>
              <p v-else class="text-xl">-</p>
            </div>

            <div class="w-full h-10 border-complementary-b border-t-[1px]" />
          </div>
          <div
            class="flex flex-col justify-center items-center pt-5 w-full rounded-md border-complementary-b border-[1px]"
          >
            <div
              class="flex flex-col justify-center items-center pb-5 mr-0 w-full text-center"
            >
              <h4 class="text-complementary text-[10px]">
                Volume for next tier
              </h4>
              <p class="text-xl">-</p>
            </div>

            <div class="w-full h-10 border-complementary-b border-t-[1px]" />
          </div>
        </div>
      </div>
    </BalCard>
  </template>
  <template v-else>
    <div class="p-4 h-full bg-white dark:bg-gray-850 rounded-lg shadow-lg">
      <div
        class="flex flex-col gap-4 justify-center items-center px-4 min-h-[265px]"
      >
        <h3 class="self-start text-lg leading-[1.125rem]">Weekly progress</h3>
        <p class="text-base text-complementary">
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
            class="flex flex-col justify-center items-center pt-5 w-full rounded-md border-complementary-b border-[1px]"
          >
            <div
              class="flex flex-col justify-center pb-5 w-full text-center items-cente"
            >
              <h4 class="text-complementary text-[10px]">
                Your Volume this week
              </h4>
              <p v-if="!props.isLoading" class="text-xl">
                {{ toFiatLabel(props.weeklyVolume) }}
              </p>
              <p v-else class="text-xl">-</p>
            </div>

            <div class="w-full h-10 border-complementary-b border-t-[1px]" />
          </div>
          <div
            class="flex flex-col justify-center items-center pt-5 w-full rounded-md border-complementary-b border-[1px]"
          >
            <div
              class="flex flex-col justify-center pb-5 w-full text-center items-cente"
            >
              <h4 class="text-complementary text-[10px]">
                Volume for next tier
              </h4>
              <p class="text-xl">-</p>
            </div>

            <div class="w-full h-10 border-complementary-b border-t-[1px]" />
          </div>
        </div>
      </div>
    </div>
  </template>
</template>