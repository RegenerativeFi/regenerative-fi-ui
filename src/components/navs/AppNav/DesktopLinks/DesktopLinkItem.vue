<script lang="ts" setup>
import PrefetchLinks from '@/components/links/PrefetchLinks.vue';
import { RouterLinkProps } from 'vue-router';

interface Props extends RouterLinkProps {
  active: boolean;
  prefetch?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  prefetch: false,
});

const classes = computed(() => ({
  'border-white dark:border-gray-900': !props.active,
  'border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-400':
    props.active,
}));
</script>

<template>
  <router-link v-bind="props" :class="['desktop-link-item', classes]">
    <slot />
    <PrefetchLinks v-if="prefetch" :to="props.to" />
  </router-link>
</template>

<style scoped>
.desktop-link-item {
  @apply h-full flex-col justify-center cursor-pointer hover:text-accent-refi dark:hover:text-yellow-500 flex relative
    overflow-hidden p-0 transition-all
    ease-in-out duration-500 !font-medium;
}

.desktop-link-item::before {
  content: '';

  @apply top-0 left-0 w-full block absolute overflow-hidden transition-all;

  transform: translate3d(0%, -101%, 0);
}

.dark .desktop-link-item::before {
  border-color: theme('colors.yellow.500');
}

.desktop-link-item.router-link-active::before {
  content: '';

  @apply w-full block absolute top-0 left-0 border-refi-text;

  transform: translate3d(0, 0, 0);
}

.dark .desktop-link-item.router-link-active::before {
  content: '';
  border-color: theme('colors.blue.400');
}

.desktop-link-item.router-link-active:hover::before {
  border-color: theme('colors.blue.700');
}

.dark .desktop-link-item.router-link-active:hover::before {
  border-color: theme('colors.blue.300');
}

.desktop-link-item.router-link-active {
  @apply text-refi-text dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors !font-semibold;
}

.desktop-link-item:hover::before {
  transform: translate3d(0, 0, 0);
}
</style>