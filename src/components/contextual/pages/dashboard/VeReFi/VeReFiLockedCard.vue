<script setup lang="ts">
import Logo from '@/assets/images/icons/VeREFI/veREFI.svg';
import Locked from '@/assets/images/icons/VeREFI/lock.svg';
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

const VeReFiBalance = computed(() => Number(props.balance).toFixed(2));
const VeReFiBalanceFiat = computed(() =>
  props.tokenInfo
    ? toFiat(Number(props.balance), props.tokenInfo.address)
    : '0.00'
);
</script>

<template>
  <BalTooltip
    text="REFI token launching soon."
    class="w-full opacity-50 cursor-not-allowed"
    placement="bottom"
  >
    <template #activator>
      <BalCard noPad class="flex-1 gap-4 p-8 card-gap">
        <template #header>
          <div class="flex flex-row flex-1 justify-between items-center">
            <h4 class="text-lg font-medium">veREFI Balance</h4>
            <img :src="Locked" />
          </div>
        </template>
        <div>
          <div class="flex flex-row gap-2 items-center">
            <img :src="Logo" width="18" height="18" class="h-[18px] w-[18px]" />
            <p class="text-xl font-medium">{{ VeReFiBalance }}</p>
          </div>
          <span class="block text-sm text-left text-disabled">
            ${{ VeReFiBalanceFiat }}</span
          >
        </div>
        <template #footer>
          <BalBtn
            size="sm"
            color="blue"
            flat="true"
            outline="true"
            class="font-medium cursor-not-allowed"
            @click="
              () => {}
              // $router.push({
              //   name: 'get-verefi',
              //   query: { returnRoute: 'dashboard' },
              // })
            "
            >Extend lock</BalBtn
          >
        </template>
      </BalCard>
    </template>
  </BalTooltip>
</template>

<style scoped>
.card-gap >>> .card-container {
  gap: 16px; /* Ajusta el espacio entre los hijos */
}
</style>
