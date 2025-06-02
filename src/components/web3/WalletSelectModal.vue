<script setup lang="ts">
import { ref } from 'vue';

import WalletButton from '@/components/web3/WalletButton.vue';
import { useUserAgent } from '@/composables/useUserAgent';
import { useWalletHelpers } from '@/composables/useWalletHelpers';
import LS_KEYS from '@/constants/local-storage.keys';
import { SupportedWallets } from '@/providers/wallet.provider';

interface Props {
  isVisible?: boolean;
  onShowThirdParty: () => void;
}

type AcceptedLocalStorageItemType = '0' | '1' | null;

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
});

const emit = defineEmits(['close']);

const { isMobile } = useUserAgent();
const { getIsMetaMaskBrowser } = useWalletHelpers();

const wallets = SupportedWallets.filter(id => {
  // hide metamask wallet on all mobile browsers except metamask
  if (id === 'metamask' && isMobile && !getIsMetaMaskBrowser()) {
    return false;
  }

  // Hide all wallets except metamask on metamask browser
  if (id !== 'metamask' && getIsMetaMaskBrowser()) {
    return false;
  }

  return id !== 'safe';
});

const acceptedlocalStorageItem = localStorage.getItem(
  LS_KEYS.App.TermsAccepted
) as AcceptedLocalStorageItemType;

const accepted = ref<'0' | '1'>(acceptedlocalStorageItem || '0');

const isBalRulesAccepted = computed(() => accepted.value === '1');

function onBalRulesAccepted() {
  accepted.value = isBalRulesAccepted.value ? '0' : '1';
  localStorage.setItem(LS_KEYS.App.TermsAccepted, accepted.value);
}
</script>

<template>
  <BalModal
    :show="props.isVisible"
    title="Connect to a wallet"
    @close="emit('close')"
  >
    <BalRadio
      :checked="isBalRulesAccepted"
      value="bal-rules"
      name="bal-rules"
      size="lg"
      @update:model-value="onBalRulesAccepted"
    >
      <template #label>
        <p class="pb-3 pl-1 -mt-1 mb-2 text-base">
          {{ $t('byConnectingWallet') }}
          <a
            href="https://docs.google.com/document/d/1XGCyBTLJxpmeTzbhDPftKQ0YhJiDdPG5fb2Jmldsr2g/edit?usp=sharing"
            target="_blank"
            @click.stop=""
          >
            <span className="link">{{ $t('policies.termsOfUse') }} </span>,
          </a>
          <a
            href="https://docs.google.com/document/d/1xx0rdN027YxDyyNvJsMoVAf_RtMkHuXeGZFbTspLteE/edit?usp=sharing"
            target="_blank"
            @click.stop=""
          >
            <span className="link">{{ $t('policies.privacyPolicy') }} </span>,
          </a>
          {{ $t('and') }}
          <router-link :to="{ name: 'risks' }" target="_blank" @click.stop="">
            <span className="link">Balancer's risks</span>.
          </router-link>
        </p>
      </template>
    </BalRadio>

    <div
      :class="[
        !isBalRulesAccepted && 'grayscale pointer-events-none opacity-20',
        'transition-opacity duration-200',
      ]"
    >
      <WalletButton v-for="wallet in wallets" :key="wallet" :wallet="wallet" />
    </div>
  </BalModal>
</template>
