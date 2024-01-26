<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie';
import LoadingAnimation from '@/assets/css/animations/RegenerativeLoadingAnimation.json';
</script>
<template>
  <BalModal blockHideOnClick fitContent class="w-[100px]" show>
    <div class="flex flex-col justify-center items-center py-20 px-10 w-full">
      <Vue3Lottie
        :animationData="LoadingAnimation"
        :height="100"
        :width="100"
      />
      <p class="text-base font-medium">Minting NFT</p>
    </div>
  </BalModal>
</template>