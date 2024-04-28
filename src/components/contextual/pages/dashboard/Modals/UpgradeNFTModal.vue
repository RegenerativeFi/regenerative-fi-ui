<script lang="ts" setup>
import { NFTData } from '@/services/campaigns/campaigns.service';
type Props = {
  nftData: NFTData;
  isOpenModal: boolean;
  nftImage: string;
};
const props = defineProps<Props>();
const emit = defineEmits(['close', 'load']);

const { isOpenModal, nftImage, nftData } = toRefs(props);
const showFireworks = ref(false);

const handleCloseModal = () => {
  showFireworks.value = false;
  emit('close');
};

const isImageLoaded = ref(false);
function onImageLoad() {
  emit('load');
  isImageLoaded.value = true;
}
</script>
<template>
  <BalModal
    :class="isImageLoaded ? 'visible' : 'invisible'"
    :show="isOpenModal"
    customBgColor="bg-refi-gray"
    :fireworks="true"
    @close="handleCloseModal"
  >
    <div class="flex flex-col gap-4 justify-center items-center">
      <div class="flex flex-col gap-2 justify-center items-center w-full">
        <h4>Congratulations on leveling up!</h4>
        <p>Here is your new NFT</p>
      </div>
      <img
        class="rounded-md nft-image"
        :src="nftImage"
        alt="New NFT"
        @load="onImageLoad"
      />
      <div class="flex flex-col justify-center items-center w-full">
        <h2>{{ nftData?.name }}</h2>
        <p>
          <span class="font-semibold">{{ nftData?.attributes[1].value }}</span>
          Votes
        </p>
      </div>
    </div>
  </BalModal>
</template>









