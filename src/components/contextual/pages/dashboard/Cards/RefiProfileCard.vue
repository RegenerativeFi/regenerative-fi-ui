<script setup lang="ts">
import NFTImage from '@/assets/images/mocks/NFT.png';
import useBreakpoints from '@/composables/useBreakpoints';
import useWeb3 from '@/services/web3/useWeb3';
const { startConnectWithInjectedProvider } = useWeb3();
const { isMobile, bp } = useBreakpoints();
import { useRefiProfileCard } from '@/composables/campaigns/useRefiProfileCard';

const { NFTData, isLoading, MintNFT } = useRefiProfileCard();
const { isWalletReady } = useWeb3();

function handleMintNFT() {
  MintNFT();
}

const nftImageSrc = computed(() => NFTData.value?.imageData || NFTImage);

const levels = ref([
  { nextLevel: '100', votes: 1 },
  { nextLevel: '250', votes: 10 },
  { nextLevel: '500', votes: 30 },
  { nextLevel: '1000', votes: 75 },
  { nextLevel: '2000', votes: 150 },
  { nextLevel: 'MAX', votes: 250 },
]);
</script>
<template>
  <template v-if="isMobile">
    <BalCard v-if="bp === 'xs'">
      <div class="flex flex-col gap-5 justify-center items-start px-4 h-fit">
        <img :src="nftImageSrc" class="w-full h-full rounded-md bg-slate-500" />
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
              <p v-if="NFTData">{{ levels[NFTData?.id - 1].votes }} Votes</p>
              <p v-else>- Votes</p>
            </div>
          </div>
          <div class="w-full border-t-2" />
          <div class="flex flex-col gap-1">
            <div class="flex justify-between items-center text-base">
              <p class="text-sm">My Points</p>
              <p v-if="isLoading" class="text-sm">- RFP</p>
              <p class="text-sm">{{ NFTData?.points }} RFP</p>
            </div>
            <div
              class="flex justify-between items-center text-base text-disabled"
            >
              <p class="text-sm">Next level</p>
              <p v-if="NFTData" class="text-sm">
                {{ levels[NFTData?.id - 1].nextLevel }} RFP
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
            v-else-if="!NFTData"
            color="gradient-blue-light"
            class="self-end w-fit"
            size="sm"
            @click="handleMintNFT"
            >Mint NFT</BalBtn
          >
          <BalBtn
            v-else
            color="gray"
            class="self-end w-fit"
            size="sm"
            @click="handleMintNFT"
            >Level Up</BalBtn
          >
        </div>
      </div>
    </BalCard>
    <BalCard v-else>
      <div class="flex flex-row gap-5 justify-center items-start px-4 h-80">
        <img :src="nftImageSrc" class="w-48 h-full rounded-md bg-slate-500" />
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
              <p v-if="NFTData">{{ levels[NFTData?.id - 1].votes }} Votes</p>
              <p v-else>- Votes</p>
            </div>
          </div>
          <div class="w-full border-t-2" />
          <div class="flex flex-col gap-1">
            <div class="flex justify-between items-center text-base">
              <p class="text-sm">My Points</p>
              <p v-if="isLoading" class="text-sm">- RFP</p>
              <p class="text-sm">{{ NFTData?.points }} RFP</p>
            </div>
            <div
              class="flex justify-between items-center text-base text-disabled"
            >
              <p class="text-sm">Next level</p>
              <p v-if="NFTData" class="text-sm">
                {{ levels[NFTData?.id - 1].nextLevel }} RFP
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
            v-else-if="!NFTData"
            color="gradient-blue-light"
            class="self-end w-fit"
            size="sm"
            @click="handleMintNFT"
            >Mint NFT</BalBtn
          >
          <BalBtn
            v-else
            color="gray"
            class="self-end w-fit"
            size="sm"
            @click="handleMintNFT"
            >Level Up</BalBtn
          >
        </div>
      </div>
    </BalCard>
  </template>
  <template v-else>
    <div class="p-8 h-full bg-white dark:bg-gray-850 rounded-lg shadow-lg">
      <div
        class="flex flex-row gap-8 justify-center items-center h-full h-[265px]"
      >
        <img
          :src="nftImageSrc"
          class="rounded-md h-[224px] w-[168px] bg-slate-500"
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
              <p v-if="NFTData">{{ levels[NFTData?.id - 1].votes }} Votes</p>
              <p v-else>- Votes</p>
            </div>
          </div>
          <div class="w-full border-t-2" />
          <div class="flex flex-col gap-1">
            <div class="flex justify-between items-center text-base">
              <p class="text-sm">My Points</p>
              <p v-if="isLoading" class="text-sm">- RFP</p>
              <p class="text-sm">{{ NFTData?.points }} RFP</p>
            </div>
            <div
              class="flex justify-between items-center text-base text-disabled"
            >
              <p class="text-sm">Next level</p>
              <p v-if="NFTData" class="text-sm">
                {{ levels[NFTData?.id - 1].nextLevel }} RFP
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
            v-else-if="!NFTData"
            color="gradient-blue-light"
            class="self-end w-fit"
            size="sm"
            @click="handleMintNFT"
            >Mint NFT</BalBtn
          >
          <BalBtn
            v-else
            color="gray"
            class="self-end w-fit"
            size="sm"
            @click="handleMintNFT"
            >Level Up</BalBtn
          >
        </div>
      </div>
    </div>
  </template>
</template>