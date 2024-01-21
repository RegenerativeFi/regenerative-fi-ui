<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers from '@/composables/useNumbers';

type Props = {
  isLoading: boolean;
  weeklyVolume: number;
};

const WeeklyTiers = [
  { level: 1, volume: 0, points: 0 },
  { level: 2, volume: 5, points: 5 },
  { level: 3, volume: 250, points: 10 },
  { level: 4, volume: 1000, points: 20 },
  { level: 5, volume: 2500, points: 35 },
  { level: 6, volume: 5000, points: 50 },
];
const currentWeeklyTier = computed(() => {
  const currentTier = WeeklyTiers.find(
    tier => props.weeklyVolume >= tier.volume
  );
  return currentTier ? currentTier : WeeklyTiers[0];
});

const nextWeeklyTier = computed(() => {
  const nextTierIndex = WeeklyTiers.findIndex(
    tier => props.weeklyVolume < tier.volume
  );
  return nextTierIndex !== -1
    ? WeeklyTiers[nextTierIndex]
    : WeeklyTiers[WeeklyTiers.length - 1];
});

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
          <a class="hover:text-accent-refi font-mediumtext-[#4654D2]" href="#">
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
          <a class="font-medium hover:text-accent-refi text-[#4654D2]" href="#">
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
    <div class="p-8 h-full bg-white dark:bg-gray-850 rounded-lg shadow-lg">
      <div
        class="flex flex-col gap-4 justify-center items-center h-full min-h-[265px]"
      >
        <h3 class="self-start h-full text-lg leading-[1.125rem]">
          Weekly progress
        </h3>
        <p class="text-base text-complementary">
          Participate in the
          <a class="font-medium hover:text-accent-refi text-[#4654D2]" href="#">
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
            <div
              class="flex justify-center items-center w-full h-10 border-complementary-b border-t-[1px]"
            >
              <p class="w-full text-xs text-center text-complementary">
                Tier {{ currentWeeklyTier.level }}: +
                {{ currentWeeklyTier.points }} Points
              </p>
            </div>
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
              <p v-if="!props.isLoading" class="text-xl">
                {{ toFiatLabel(nextWeeklyTier.volume) }}
              </p>
              <p v-else class="text-xl">-</p>
            </div>

            <div
              class="flex justify-center items-center w-full h-10 border-complementary-b border-t-[1px]"
            >
              <p class="w-full text-xs text-center text-complementary">
                Tier {{ nextWeeklyTier.level }}: +{{ nextWeeklyTier.points }}
                Points
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>