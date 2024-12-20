<script setup lang="ts">
import Logo from '@/assets/images/icons/VeREFI/logo-light.svg';
import Unlocked from '@/assets/images/icons/VeREFI/unlock.svg';
import useNumbers from '@/composables/useNumbers';
import { TokenInfo } from '@/types/TokenList';
const props = withDefaults(
  defineProps<{
    balance: string;
    tokenInfo: TokenInfo | null;
  }>(),
  {
    balance: '0.0',
  }
);

const { toFiat } = useNumbers();

const ReFiBalance = computed(() => Number(props.balance).toFixed(2));
const ReFiBalanceFiat = computed(() =>
  props.tokenInfo
    ? toFiat(Number(props.balance), props.tokenInfo.address)
    : '0.00'
);
</script>



<template>
  <BalCard noPad class="flex-1 gap-4 p-8 card-gap">
    <template #header>
      <div class="flex flex-row flex-1 justify-between items-center">
        <h4 class="text-lg font-medium">Available REFI</h4>
        <img :src="Unlocked" />
      </div>
    </template>
    <div>
      <div class="flex flex-row gap-2">
        <img :src="Logo" width="18" height="18" />
        <p class="text-xl font-medium">{{ ReFiBalance }}</p>
      </div>
      <span class="text-sm text-disabled"> ${{ ReFiBalanceFiat }}</span>
    </div>
    <template #footer>
      <BalBtn
        size="sm"
        color="blue"
        flat="true"
        outline="true"
        class="font-medium"
        @click="
          $router.push({
            name: 'get-verefi',
            query: { returnRoute: 'dashboard' },
          })
        "
        >Lock for VeREFI</BalBtn
      >
    </template>
  </BalCard>
</template>

<style scoped>
.card-gap >>> .card-container {
  gap: 16px; /* Ajusta el espacio entre los hijos */
}
</style>