<script setup lang="ts">
import Logo from '@/assets/images/icons/VeREFI/logo-light.svg';
import Locked from '@/assets/images/icons/VeREFI/lock.svg';
</script>



<template>
  <BalCard noPad class="flex-1 gap-4 p-8 card-gap">
    <template #header>
      <div class="flex flex-row flex-1 justify-between items-center">
        <h4 class="text-lg font-medium">veREFI Balance</h4>
        <img :src="Locked" />
      </div>
    </template>
    <div>
      <div class="flex flex-row gap-2">
        <img :src="Logo" class="brightness-50" width="18" height="18" />
        <p class="text-xl font-medium">0</p>
      </div>
      <span class="text-sm text-disabled"> $0.00</span>
    </div>
    <template #footer>
      <BalBtn
        size="sm"
        color="blue"
        flat="true"
        outline="true"
        class="font-medium"
        >Extend lock</BalBtn
      >
    </template>
  </BalCard>
</template>

<style scoped>
.card-gap >>> .card-container {
  gap: 16px; /* Ajusta el espacio entre los hijos */
}
</style>