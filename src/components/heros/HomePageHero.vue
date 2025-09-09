<script lang="ts" setup>
import useNumbers from '@/composables/useNumbers';
import usePools from '@/composables/pools/usePools';
import { bnum } from '@/lib/utils';
import { computed } from 'vue';

const { toFiatLabel } = useNumbers();

// Obtener pools ya decoradas mediante usePools (usa los repositorios/decoradores)
const { pools, isLoading: isPoolsVolumesLoading } = usePools({});

const totalLiquidity = computed(() => {
  const list = pools.value || [];
  return list
    .map((p: any) => bnum(p.totalLiquidity || '0'))
    .reduce((acc: any, v: any) => acc.plus(v), bnum(0))
    .toString();
});

const totalVolume = computed(() => {
  const list = pools.value || [];
  return list
    .map((p: any) => bnum(p.totalSwapVolume || '0'))
    .reduce((acc: any, v: any) => acc.plus(v), bnum(0))
    .toString();
});

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
                TVL: ~{{ toFiatLabel(totalLiquidity) }}
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
                Volume: ~{{ toFiatLabel(totalVolume) }}
              </h4>
            </div>
          </div>
          <p class="text-sm font-normal text-complementary-primary">
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
          <h4 class="text-base font-medium">Explore Regenerative</h4>
          <div>
            <p class="text-sm font-normal text-complementary-primary">
              Our platform provides information about the leading ReFi Tokens
              and Organizations.
            </p>
            <a
              class="text-sm font-normal text-complementary-primary underline underline-offset-2"
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
