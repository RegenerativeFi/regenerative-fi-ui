<script setup lang="ts">
/**
 * veBAL page
 */
import LMVoting from '@/components/contextual/pages/vebal/LMVoting/LMVoting.vue';
import { isVeBalSupported } from '@/composables/useVeBAL';
import { provideUserStaking } from '@/providers/local/user-staking.provider';
import { providerUserPools } from '@/providers/local/user-pools.provider';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
import { provideVoting } from '@/components/contextual/pages/vebal/providers/voting.provider';
import MyVeReFiInfo from '@/components/contextual/pages/vebal/MyVeReFiInfo/MyVeReFiInfo.vue';

const userStaking = provideUserStaking();
providerUserPools(userStaking);
providePoolStaking();
provideVoting();
</script>

<template>
  <div>
    <div
      v-if="isVeBalSupported"
      class="xl:container lg:px-4 xl:px-0 pt-16 xl:pt-20 xl:mx-auto"
    >
      <div class="px-0 mb-8"><MyVeReFiInfo /></div>
    </div>
    <div
      v-if="isVeBalSupported"
      class="xl:container lg:px-4 xl:px-0 pt-16 xl:pt-20 xl:mx-auto"
    >
      <div class="xl:px-0 mb-16">
        <LMVoting />
      </div>
    </div>
    <div v-else class="text-center">
      <div class="text-lg font-semibold">
        {{ $t('veBAL.notSupported.title') }}
      </div>
      <div>{{ $t('veBAL.notSupported.description') }}</div>
    </div>
  </div>
</template>
