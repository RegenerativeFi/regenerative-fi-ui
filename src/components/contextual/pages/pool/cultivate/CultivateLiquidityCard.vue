<script setup lang="ts">
import { lsSet, lsGet, scale } from '@/lib/utils';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';
import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { Pool } from '@/services/pool/types';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import BalCheckbox from '@/components/_global/BalCheckbox/BalCheckbox.vue';
import localStorageKeys from '@/constants/local-storage.keys';
import BigNumber from 'bignumber.js';
import CultivateLiquidityPreviewModal from './CultivateLiquidityPreviewModal.vue';
import useVotingPools from '@/composables/useVotingPools';
import BalTooltip from '@/components/_global/BalTooltip/BalTooltip.vue';

type Props = {
  pool: Pool;
};
const props = defineProps<Props>();

/**
 * STATE
 */

const isCultivateLiquidityVisible = ref(false);
const tokenInAddress = ref<string>('');
const tokenInAmount = ref<string>('');
// TODO: add a dynamic allowlist of tokens
const _subsetTokens = ref<string[]>([
  '0xD1531Aa8F91f5Fd8D5D820CD5841e3880283D1Be',
  '0xB08Dd0b53abD8fB842cDec75cc5064FDD74e99C7',
  '0x76C12F93ad8975609f95C13782fd8A0B4135e4c6',
  '0x68DF333c5F5835A186AA8bCe4a704432006fDF49',
]);

const isAlertVisible = ref(false);
const isCheckboxChecked = ref(false);

const ALERT_ACCEPTED_KEY = localStorageKeys.Alerts.CultivateAlertAccepted;

/**
 * COMPOSABLES
 */
const { fNum, toFiat } = useNumbers();
const { isLoadingVotingPools, votingPools } = useVotingPools();

/**
 * COMPUTED
 */

const isAlertAccepted = ref(lsGet<boolean>(ALERT_ACCEPTED_KEY, false));

function handleUnlockClick() {
  if (!isAlertAccepted.value) {
    isAlertVisible.value = true;
  }
}

function handleDepositClick() {
  showCultivateLiquidityPreview();
}

function handleCheckboxChange() {
  isCheckboxChecked.value = !isCheckboxChecked.value;
}

function handleContinueClick() {
  lsSet(ALERT_ACCEPTED_KEY, true);
  isAlertVisible.value = false;
  isAlertAccepted.value = true;
}

function handleInAmountChange(value: string): void {
  tokenInAmount.value = value;
}

function handleInputTokenChange(address: string): void {
  tokenInAddress.value = address;
}

watchEffect(() => {
  tokenInAddress.value = _subsetTokens.value[0];
});

if (lsGet<boolean>(ALERT_ACCEPTED_KEY, false)) {
  isAlertVisible.value = false;
}

const myVotes = computed(() => {
  const normalizedVotes = scale(new BigNumber(props.pool.userVotes), -4);
  return fNum(normalizedVotes.toString(), {
    style: 'percent',
    maximumFractionDigits: 2,
  });
});

const currentIncentives = computed(() => {
  const foundPool = votingPools.value.find(
    pool => pool.address === props.pool.address
  );
  if (!foundPool) {
    return fNum('0', FNumFormats.fiat);
  }
  const totalBribes =
    foundPool?.bribes.reduce(
      (acc, bribe) =>
        acc + Number(toFiat(bribe.amount, bribe.token.address).toString()),
      0
    ) || 0;

  return fNum(totalBribes, FNumFormats.fiat);
});
/**
 * METHODS
 */
function showCultivateLiquidityPreview() {
  isCultivateLiquidityVisible.value = true;
}

function handlePreviewClose() {
  isCultivateLiquidityVisible.value = false;
}
</script>

<template>
  <div>
    <AnimatePresence :isVisible="!isLoadingVotingPools">
      <div class="relative">
        <BalTooltip
          text="Liquidity cultivation coming soon."
          class="w-full opacity-50 cursor-not-allowed"
          placement="bottom"
          textAlign="center"
        >
          <template #activator>
            <BalAccordion
              :class="['shadow-2xl', { handle: false }]"
              :sections="[
                {
                  title: 'Cultivate Liquidity',
                  id: 'staking-incentives',
                  handle: 'staking-handle',
                  isDisabled: false,
                },
              ]"
              :reCalcKey="0"
              :isOpenedByDefault="false"
            >
              <template #staking-handle>
                <button
                  class="p-4 w-full hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  disabled
                >
                  <BalStack horizontal justify="between" align="center">
                    <BalStack spacing="sm" align="center">
                      <div
                        :class="[
                          'flex items-center p-1 text-white rounded-full bg-gray-400',
                        ]"
                      >
                        <BalIcon size="sm" name="x" />
                      </div>
                      <h6>Cultivate Liquidity</h6>
                    </BalStack>
                    <BalStack horizontal spacing="sm" align="center">
                      <BalIcon name="chevron-down" class="text-gray-400" />
                    </BalStack>
                  </BalStack>
                </button>
              </template>
              <template #staking-incentives>
                <div class="relative bg-white dark:bg-gray-850 rounded-b-lg">
                  <BalStack
                    vertical
                    spacing="sm"
                    class="p-4 rounded-b-lg border-t dark:border-gray-900"
                  >
                    <span>Incentive for {{ pool.symbol }} pool</span>
                    <BalStack horizontal justify="between">
                      <span>Current votes</span>
                      <BalStack horizontal spacing="sm" align="center">
                        <span>
                          {{ myVotes }}
                        </span>
                      </BalStack>
                    </BalStack>
                    <BalStack horizontal justify="between">
                      <span>Current incentives</span>
                      <BalStack horizontal spacing="sm" align="center">
                        <AnimatePresence :isVisible="isLoadingVotingPools">
                          <BalLoadingBlock class="h-5" />
                        </AnimatePresence>
                        <AnimatePresence :isVisible="!isLoadingVotingPools">
                          <span> {{ currentIncentives }} </span>
                        </AnimatePresence>
                      </BalStack>
                    </BalStack>
                    <hr />
                    <h6 class="text-base font-semibold">Deposit incentive</h6>

                    <TokenInput
                      name="tokenIn"
                      :disabled="!isAlertAccepted"
                      :address="tokenInAddress"
                      :amount="tokenInAmount"
                      :subsetTokens="_subsetTokens"
                      @update:amount="handleInAmountChange"
                      @update:address="handleInputTokenChange"
                    />
                    <BalStack horizontal justify="start">
                      <BalBtn
                        v-if="!isAlertAccepted"
                        outline
                        color="blue"
                        size="md"
                        class="px-3 w-20 h-8 py-[6px] rounded-[4px]"
                        @click="handleUnlockClick"
                        >Unlock</BalBtn
                      >
                      <BalBtn
                        v-else
                        color="gradient"
                        class="px-3 w-24 h-4 py-[6px] rounded-[4px]"
                        @click="handleDepositClick"
                        >Deposit</BalBtn
                      >
                    </BalStack>
                  </BalStack>
                </div>
              </template>
            </BalAccordion>
          </template>
        </BalTooltip>
        <transition name="fade">
          <div
            v-if="isAlertVisible"
            class="absolute top-0 bottom-0 left-0 py-16 px-8 text-white rounded-md bg-[#222732F0]"
            :title="$t('staking.restakeGauge')"
          >
            <BalStack vertical spacing="base">
              <p>
                By continuing with the next steps you acknowledge that you
                understand the mechanics of the protocol and after depositing
                any rewards as incentives you won't be able to withdraw them.
              </p>
              <div class="flex gap-2 items-center text-accent">
                <BalCheckbox
                  color="#FA7369"
                  name="understand-checkbox"
                  class="w-5 h-5"
                  noMargin
                  :modelValue="isCheckboxChecked"
                  @click.stop
                  @input="handleCheckboxChange()"
                />
                <label for="understand-checkbox"
                  >I understand I will NOT be able to withdraw incentives</label
                >
              </div>
              <BalBtn
                color="blue"
                :disabled="!isCheckboxChecked"
                size="md"
                class="px-3 w-full h-8 py-[6px] rounded-[4px]"
                @click="handleContinueClick"
                >Continue</BalBtn
              >
            </BalStack>
          </div>
        </transition>
      </div>
    </AnimatePresence>
    <AnimatePresence :isVisible="isLoadingVotingPools" unmountInstantly>
      <BalLoadingBlock class="h-12" />
    </AnimatePresence>
    <CultivateLiquidityPreviewModal
      v-if="!!pool"
      :isVisible="isCultivateLiquidityVisible"
      :pool="pool"
      :tokenInAddress="tokenInAddress"
      :tokenInAmount="tokenInAmount"
      action="stake"
      @close="handlePreviewClose"
    />
  </div>
</template>

<style>
.handle {
  @apply overflow-hidden rounded-xl;
}

.handle::before {
  @apply absolute left-0 w-full opacity-100;

  content: '';
  top: -2px;
  height: calc(100% + 4px);
  background: linear-gradient(90deg, #4254ff, #f441a5, #ffeb3b, #4254ff);
  background-size: 400%;
  animation: anim-half 3s ease-out both;
  border-radius: 14px;
  z-index: -1;
}

.handle:hover::before {
  animation: anim 12s linear infinite;
}

.handle .bal-card {
  @apply mx-auto;

  width: calc(100% - 4px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}

@keyframes anim-half {
  from {
    background-position: 0;
  }

  to {
    background-position: 125%;
  }
}

@keyframes anim {
  from {
    background-position: 125%;
  }

  to {
    background-position: 600%;
  }
}
</style>
