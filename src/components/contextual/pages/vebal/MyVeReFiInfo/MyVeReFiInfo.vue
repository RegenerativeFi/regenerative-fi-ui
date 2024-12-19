<script setup lang="ts">
import MyVeReFiInfoChip from './components/MyVeReFiInfoChip.vue';
</script>

<template>
  <BalCard>
    <div class="flex justify-between items-center p-2">
      <div class="flex gap-2">
        <p class="text-sm">Total voting power available for this epoch</p>
        <span class="px-3 text-sm rounded-xl bg-[#CEE9FF]">102,294.82 </span>
      </div>
      <div class="flex gap-6 justify-evenly items-center text-center">
        <MyVeReFiInfoChip description="Total Fees" :value="1342124" />
        <MyVeReFiInfoChip description="Total Incentives" :value="1342124" />
        <MyVeReFiInfoChip description="Total Rewards" :value="1342124" />
      </div>
    </div>
  </BalCard>
</template>
