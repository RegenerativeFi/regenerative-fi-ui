<script setup lang="ts">
import Footer from '@/components/footer/Footer.vue';
import AppNav from '@/components/navs/AppNav/AppNav.vue';
</script>

<template>
  <div>
    <div class="dark:bg-gray-900 app-body">
      <AppNav />
      <div class="pb-16">
        <slot />
      </div>
    </div>
    <Footer />
  </div>
</template>

<style>
.VueQueryDevtoolsPanel + button {
  @apply text-black bg-gray-100 p-2 rounded text-sm;
}

.app-body {
  @apply pb-8 bg-container;

  min-height: calc(100vh - 2rem);
}
</style>