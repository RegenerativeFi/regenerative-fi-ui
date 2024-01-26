<script setup lang="ts">
import NFTImage from '@/assets/images/mocks/NFT.png';
import { useRFNFT } from '@/composables/campaigns/useRFNFT';
import useBreakpoints from '@/composables/useBreakpoints';
import useWeb3 from '@/services/web3/useWeb3';
import UpgradeNFTModal from '../Modals/UpgradeNFTModal.vue';
import MintNFTModal from '../Modals/MintNFTModal.vue';
import { NFTData as TNFTData } from '@/services/campaigns/campaigns.service';
import IsMintingNFTModal from '../Modals/IsMintingNFTModal.vue';
import IsUpgradingNFTModal from '../Modals/IsUpgradingNFTModal.vue';

const { startConnectWithInjectedProvider } = useWeb3();
const { isMobile, bp } = useBreakpoints();

const {
  NFTData,
  isLoading,
  MintNFT,
  UpgradeNFT,
  isMintingNFTStatus,
  isUpgradingNFTStatus,
  isRefetchingNFTData,
} = useRFNFT();
const { isWalletReady } = useWeb3();

const nftImageSrc = computed(() => NFTData.value?.imageData);
const hasNFT = computed(
  () => !!NFTData.value?.imageData && isWalletReady.value
);

const isAbleToUpgradeNFT = computed(() => NFTData?.value?.isAbleToUpgrade[0]);

const isImageLoaded = ref(false);

const levels = ref([
  { nextLevel: '50', votes: 1 },
  { nextLevel: '250', votes: 10 },
  { nextLevel: '1000', votes: 30 },
  { nextLevel: '2500', votes: 75 },
  { nextLevel: '5000', votes: 150 },
  { nextLevel: 'MAX', votes: 250 },
]);
const isOpenUpgradeNFTModal = ref(false);
const isOpenMintNFTModal = ref(false);

watch([isRefetchingNFTData, isUpgradingNFTStatus.value], () => {
  if (!isRefetchingNFTData.value && isUpgradingNFTStatus.value.success) {
    isOpenUpgradeNFTModal.value = true;
    isUpgradingNFTStatus.value = {
      loading: false,
      success: false,
      loadingTxn: false,
    };
  }
});

watch([isRefetchingNFTData, isMintingNFTStatus.value], () => {
  console.debug(isRefetchingNFTData, isMintingNFTStatus.value.success);
  if (!isRefetchingNFTData.value && isMintingNFTStatus.value.success) {
    isOpenMintNFTModal.value = true;
    isMintingNFTStatus.value = {
      loading: false,
      success: false,
      loadingTxn: false,
    };
  }
});
watch(NFTData, () => {
  console.debug(NFTData.value);
});

onMounted(() => {
  isUpgradingNFTStatus.value = {
    loading: false,
    success: false,
    loadingTxn: false,
  };
});

function handleUpgradeNFTClose() {
  isImageLoaded.value = false;
  isOpenUpgradeNFTModal.value = false;
}
function handleMintNFTClose() {
  isImageLoaded.value = false;
  isOpenMintNFTModal.value = false;
}
</script>
<template>
  <template v-if="isMobile">
    <BalCard v-if="bp === 'xs'">
      <div class="flex flex-col gap-5 justify-center items-start px-4 h-fit">
        <img
          :src="hasNFT ? nftImageSrc : NFTImage"
          :class="`w-full h-full rounded-md bg-slate-500 ${
            !hasNFT && 'filter grayscale'
          }`"
        />
        <div class="flex flex-col gap-10 w-full">
          <div class="flex flex-col gap-4">
            <h3 v-if="!isWalletReady" class="self-start text-lg">
              Connect wallet
            </h3>
            <h3 v-else-if="!isLoading" class="self-start text-lg">
              {{ NFTData?.name }}
            </h3>
            <div class="flex justify-between items-center text-base">
              <p>Voting Power</p>
              <p v-if="NFTData">{{ NFTData.attributes[1].value }} Votes</p>
              <p v-else>- Votes</p>
            </div>
          </div>
          <div class="w-full border-t-2" />
          <div class="flex flex-col gap-1">
            <div class="flex justify-between items-center text-base">
              <p class="text-sm">My Points</p>
              <p v-if="isLoading" class="text-sm">- RFP</p>
              <p v-else class="text-sm">{{ NFTData?.points }} RFP</p>
            </div>
            <div
              class="flex justify-between items-center text-base text-disabled"
            >
              <p class="text-sm">Next level</p>
              <p v-if="NFTData" class="text-sm">
                {{ levels[NFTData?.tier - 1].nextLevel }} RFP
              </p>
              <p v-else class="text-sm">- RFP</p>
            </div>
          </div>
          <BalBtn
            v-if="!isWalletReady"
            color="gradient-blue-light"
            class="self-end w-fit"
            size="sm"
            @click="startConnectWithInjectedProvider"
            >Connect wallet</BalBtn
          >
          <BalBtn
            v-else-if="hasNFT"
            :disabled="!isAbleToUpgradeNFT"
            :color="!isAbleToUpgradeNFT ? 'gray' : 'gradient-blue-light'"
            class="self-end w-fit"
            size="sm"
            @click="() => UpgradeNFT(NFTData?.id as number)"
            >Upgrade</BalBtn
          >
          <BalBtn
            v-else
            :color="isMintingNFTStatus.loading ? 'gray' : 'gradient-blue-light'"
            :disabled="isMintingNFTStatus.loading"
            class="self-end w-fit"
            size="sm"
            @click="() => MintNFT()"
            >Mint NFT</BalBtn
          >
        </div>
      </div>
    </BalCard>
    <BalCard v-else>
      <div class="flex flex-row gap-5 justify-center items-start px-4 h-80">
        <img
          :src="hasNFT ? nftImageSrc : NFTImage"
          :class="`w-48 h-full rounded-md bg-slate-500 ${
            !hasNFT && 'filter grayscale'
          }`"
        />
        <div class="flex flex-col gap-10 w-full">
          <div class="flex flex-col gap-4">
            <h3 v-if="!isWalletReady" class="self-start text-lg">
              Connect wallet
            </h3>
            <h3 v-else-if="!isLoading" class="self-start text-lg">
              {{ NFTData?.name }}
            </h3>
            <div class="flex justify-between items-center text-base">
              <p>Voting Power</p>
              <p v-if="NFTData">{{ NFTData.attributes[1].value }} Votes</p>
              <p v-else>- Votes</p>
            </div>
          </div>
          <div class="w-full border-t-2" />
          <div class="flex flex-col gap-1">
            <div class="flex justify-between items-center text-base">
              <p class="text-sm">My Points</p>
              <p v-if="isLoading" class="text-sm">- RFP</p>
              <p v-else class="text-sm">{{ NFTData?.points }} RFP</p>
            </div>
            <div
              class="flex justify-between items-center text-base text-disabled"
            >
              <p class="text-sm">Next level</p>
              <p v-if="NFTData" class="text-sm">
                {{ levels[NFTData?.tier - 1].nextLevel }} RFP
              </p>
              <p v-else class="text-sm">- RFP</p>
            </div>
          </div>
          <BalBtn
            v-if="!isWalletReady"
            color="gradient-blue-light"
            class="self-end w-fit"
            size="sm"
            @click="startConnectWithInjectedProvider"
            >Connect wallet</BalBtn
          >
          <BalBtn
            v-else-if="hasNFT"
            :disabled="!isAbleToUpgradeNFT"
            :color="!isAbleToUpgradeNFT ? 'gray' : 'gradient-blue-light'"
            class="self-end w-fit"
            size="sm"
            @click="() => UpgradeNFT(NFTData?.id as number)"
            >Upgrade</BalBtn
          >
          <BalBtn
            v-else
            :color="isMintingNFTStatus.loading ? 'gray' : 'gradient-blue-light'"
            :disabled="isMintingNFTStatus.loading"
            class="self-end w-fit"
            size="sm"
            @click="() => MintNFT()"
            >Mint NFT</BalBtn
          >
        </div>
      </div>
    </BalCard>
  </template>
  <template v-else>
    <div class="p-8 h-full bg-white dark:bg-gray-850 rounded-lg shadow-lg">
      <div class="flex flex-row gap-8 justify-center items-center h-full">
        <img
          :src="hasNFT ? nftImageSrc : NFTImage"
          :class="`rounded-md h-[224px] w-[168px] bg-slate-500 ${
            !hasNFT && 'filter grayscale'
          }`"
        />
        <div class="flex flex-col gap-6 w-full">
          <div class="flex flex-col gap-4">
            <h3 v-if="!isWalletReady" class="self-start text-lg">
              Connect wallet
            </h3>
            <h3 v-else-if="!isLoading && NFTData" class="self-start text-lg">
              {{ NFTData.name }}
            </h3>
            <h3 v-else class="self-start text-lg">Mint NFT</h3>
            <div class="flex justify-between items-center text-base">
              <p>Voting Power</p>
              <p v-if="NFTData">{{ NFTData.attributes[1].value }} Votes</p>
              <p v-else>- Votes</p>
            </div>
          </div>
          <div class="w-full border-t-2" />
          <div class="flex flex-col gap-1">
            <div class="flex justify-between items-center text-base">
              <p class="text-sm">My Points</p>
              <p v-if="isLoading" class="text-sm">- RFP</p>
              <p v-else class="text-sm">{{ NFTData?.points }} RFP</p>
            </div>
            <div
              class="flex justify-between items-center text-base text-disabled"
            >
              <p class="text-sm">Next level</p>
              <p v-if="NFTData" class="text-sm">
                {{ levels[NFTData?.tier - 1].nextLevel }} RFP
              </p>
              <p v-else class="text-sm">- RFP</p>
            </div>
          </div>
          <BalBtn
            v-if="!isWalletReady"
            color="gradient-blue-light"
            class="self-end w-fit"
            size="sm"
            @click="startConnectWithInjectedProvider"
            >Connect wallet</BalBtn
          >
          <BalBtn
            v-else-if="hasNFT"
            :disabled="!isAbleToUpgradeNFT"
            :color="!isAbleToUpgradeNFT ? 'gray' : 'gradient-blue-light'"
            class="self-end w-fit"
            size="sm"
            @click="() => UpgradeNFT(NFTData?.id as number)"
            >Upgrade</BalBtn
          >
          <BalBtn
            v-else
            :color="isMintingNFTStatus.loading ? 'gray' : 'gradient-blue-light'"
            :disabled="isMintingNFTStatus.loading"
            class="self-end w-fit"
            size="sm"
            @click="() => MintNFT()"
            >Mint NFT</BalBtn
          >
        </div>
      </div>
    </div>
  </template>
  <teleport to="#modal">
    <UpgradeNFTModal
      :nftData="(NFTData as TNFTData)"
      :isOpenModal="isOpenUpgradeNFTModal"
      :nftImage="(nftImageSrc as string)"
      @load="isImageLoaded = true"
      @close="handleUpgradeNFTClose"
    />
    <MintNFTModal
      :nftData="(NFTData as TNFTData)"
      :isOpenModal="isOpenMintNFTModal"
      :nftImage="(nftImageSrc as string)"
      @close="handleMintNFTClose"
      @load="isImageLoaded = true"
    />
    <IsMintingNFTModal v-if="isMintingNFTStatus.loadingTxn && !isImageLoaded" />
    <IsUpgradingNFTModal
      v-if="isUpgradingNFTStatus.loadingTxn && !isImageLoaded"
    />
  </teleport>
</template>
