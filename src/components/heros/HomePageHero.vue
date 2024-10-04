<script lang="ts" setup>
import usePoolsVolumeQuery from '@/composables/queries/usePoolsVolumeQuery';
import useNumbers from '@/composables/useNumbers';

const { data: poolsVolumes, isLoading: isPoolsVolumesLoading } =
  usePoolsVolumeQuery();
const { toFiatLabel } = useNumbers();
type Props = {
  tokensAmount: number;
};

defineProps<Props>();
</script>



<template>
  <div class="xl:container xl:px-4 pt-10 md:pt-8 xl:mx-auto">
    <div class="flex flex-col lg:flex-row gap-4">
      <BalCard exposeOverflow>
        <div class="flex flex-col gap-4">
          <div class="flex flex-row gap-4 justify-center items-center">
            <div
              class="py-2 px-3 w-full rounded-md border dark:border-gray-900 card-shadow"
            >
              <h4
                v-if="isPoolsVolumesLoading"
                class="w-full text-base font-medium whitespace-nowrap"
              >
                TVL: ~$ --
              </h4>
              <h4 v-else class="w-full text-base font-medium whitespace-nowrap">
                TVL: ~{{ toFiatLabel(poolsVolumes?.totalLiquidity) }}
              </h4>
            </div>
            <div
              class="py-2 px-3 w-full rounded-md border dark:border-gray-900 card-shadow"
            >
              <h4
                v-if="isPoolsVolumesLoading"
                class="w-full text-base font-medium whitespace-nowrap"
              >
                Volume: ~$ --
              </h4>
              <h4 v-else class="w-full text-base font-medium whitespace-nowrap">
                Volume: ~{{ toFiatLabel(poolsVolumes?.totalVolume) }}
              </h4>
            </div>
          </div>
          <p class="text-sm font-normal text-complementary">
            There are currently {{ tokensAmount }} tokens listed.
            <a
              class="underline underline-offset-2"
              href="https://www.regenerative.fi/tokens"
              target="_blank"
              >View all tokens</a
            >
            or
            <a
              class="underline underline-offset-2"
              href="https://tally.so/r/nGLRVz "
              target="_blank"
            >
              request a new token listing.
            </a>
          </p>
        </div>
      </BalCard>
      <BalCard class="w-full" growContent>
        <div class="flex flex-col justify-between items-start w-full h-full">
          <h4 class="text-base font-medium">Explore regenerative</h4>
          <div>
            <p class="text-sm font-normal text-complementary">
              Our platform provides information about the leading ReFi Tokens
              and Organizations.
            </p>
            <a
              class="text-sm font-normal text-complementary underline underline-offset-2"
              href="http://regenerative.fi/"
              target="_blank"
              >Visit the Regenerative platform.</a
            >
          </div>
        </div>
      </BalCard>
    </div>
  </div>
</template>

<style scoped>
.card-shadow {
  box-shadow: 1px 2px 6px 0 #00000024;
}
</style>
