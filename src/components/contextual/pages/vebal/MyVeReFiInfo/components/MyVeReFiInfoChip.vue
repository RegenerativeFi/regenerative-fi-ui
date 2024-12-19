<script setup lang="ts">
const props = defineProps<{
  description: string;
  value: number;
}>();

const formattedValue = computed(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(props.value);
});
</script>

<template>
  <div class="flex flex-row gap-2 items-center">
    <p class="text-disabled">{{ description }}:</p>
    <p>~{{ formattedValue }}</p>
  </div>
</template>
