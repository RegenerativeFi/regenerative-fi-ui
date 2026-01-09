<script setup lang="ts">
import { computed } from 'vue';

import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import { TokenInfo } from '@/types/TokenList';

import useLockState from '../../../composables/useLockState';
import useNumbers from '@/composables/useNumbers';

/**
 * TYPES
 */
type Props = {
  lockablePoolTokenInfo: TokenInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { lockAmount } = useLockState();
const { toFiat } = useNumbers();

/**
 * COMPUTED
 */
const lockAmountFiatValue = computed(() =>
  toFiat(lockAmount.value, props.lockablePoolTokenInfo.address)
);
</script>

<template>
  <div class="mb-6">
    <div>
      <p class="pb-2 font-semibold">
        {{ $t('getVeBAL.lockForm.lockAmount.title') }}
      </p>
    </div>
    <TokenInput
      v-model:amount="lockAmount"
      :address="lockablePoolTokenInfo.address"
      :tokenValue="lockAmountFiatValue"
      fixedToken
      name="lockAmount"
    />
  </div>
</template>
