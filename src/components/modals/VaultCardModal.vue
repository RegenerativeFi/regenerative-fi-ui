<template>
  <BalModal :show="show" @close="$emit('close')">
    <template #header>
      <div class="flex gap-3 items-center">
        <div class="flex justify-center items-center w-10 h-10 rounded-full">
          <img :src="vault?.icon" alt="token" class="w-8 h-8 rounded-full" />
        </div>
        <div>
          <h3 class="text-2xl font-semibold">{{ vault?.title || title }}</h3>
        </div>
      </div>
    </template>

    <div>
      <!-- añadir padding horizontal y ajustar vertical -->
      <template v-if="action === 'deposit'">
        <label class="block mb-3 text-sm">Deposit</label>

        <div class="p-4 bg-white rounded-lg border border-gray-200">
          <div class="flex justify-between items-start">
            <input
              v-model="depositAmount"
              type="number"
              min="0"
              step="any"
              :disabled="loading"
              placeholder="0.00"
              class="w-full text-4xl font-semibold leading-tight placeholder-gray-300 bg-transparent outline-none"
              @input="onDepositInput"
            />

            <div class="flex flex-col items-end ml-4">
              <div
                class="flex gap-3 items-center py-2 px-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div
                  class="flex justify-center items-center w-8 h-8 bg-white rounded-full"
                >
                  <img :src="vault?.icon" alt="token" class="w-6 h-6" />
                </div>
                <div class="font-medium">CELO</div>
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center text-sm text-gray-500">
            <div>${{ formattedFiat }}</div>
            <div class="flex gap-2 items-center">
              <div>
                Available: <span class="font-medium">{{ available }}</span>
              </div>
              <button
                class="text-sm font-medium underline"
                :disabled="loading"
                @click.prevent="setMaxDeposit"
              >
                MAX
              </button>
            </div>
          </div>
        </div>
      </template>

      <template v-if="action === 'withdraw'">
        <label class="block mb-4 text-sm">Select your withdrawal amount</label>

        <div class="grid grid-cols-5 gap-3 mb-2">
          <button
            type="button"
            class="flex col-span-1 justify-center items-center h-12 font-semibold bg-gray-50 rounded-xl"
            @click.prevent="selectPercent(10)"
          >
            10%
          </button>
          <button
            type="button"
            class="flex col-span-1 justify-center items-center h-12 font-semibold bg-gray-50 rounded-xl"
            @click.prevent="selectPercent(25)"
          >
            25%
          </button>
          <button
            type="button"
            class="flex col-span-1 justify-center items-center h-12 font-semibold bg-gray-50 rounded-xl"
            @click.prevent="selectPercent(50)"
          >
            50%
          </button>
          <button
            type="button"
            class="flex col-span-1 justify-center items-center h-12 font-semibold bg-gray-50 rounded-xl"
            @click.prevent="selectPercent(100)"
          >
            100%
          </button>

          <div class="col-span-1">
            <div
              class="flex justify-end items-center px-2 h-12 rounded-lg border"
            >
              <input
                v-model="withdrawPercent"
                type="number"
                min="0"
                max="100"
                step="any"
                class="w-full text-right bg-transparent outline-none"
                placeholder="0"
                @input="onWithdrawPercentInput"
              />
              <div class="pl-2 text-sm">%</div>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center mb-2">
          <div class="text-sm text-gray-500">Withdraw Preview</div>
          <div class="text-xs text-gray-400">incl. fees</div>
        </div>

        <div
          class="py-2 text-center bg-pill-light rounded-lg border border-pool-tvl border-dashed"
        >
          <div class="flex gap-3 justify-between px-4">
            <div class="text-xl font-semibold text-refi-text">
              {{ formattedWithdrawAmount }}
            </div>
            <div class="flex gap-2 items-center">
              <img :src="vault?.icon" alt="token" class="w-6 h-6" />
              <div class="font-medium">CELO</div>
            </div>
          </div>
        </div>
      </template>

      <div class="mt-4"><hr class="border-t border-gray-200" /></div>
    </div>

    <template #footer>
      <div v-if="action === 'deposit'" class="flex flex-col gap-3 w-full">
        <BalBtn
          :disabled="!canDeposit || loading"
          :label="loading ? 'Processing...' : 'Deposit'"
          :color="canDeposit ? 'gradient' : 'gray'"
          class="w-full h-14 text-lg font-semibold rounded-lg"
          @click="confirm"
        />

        <div class="text-sm text-center text-gray-500">
          Low on CELO? <a class="underline" href="#">Top up balance</a>
        </div>
      </div>

      <div v-if="action === 'withdraw'" class="flex flex-row gap-3 w-full">
        <BalBtn
          outline
          class="flex-1 w-full"
          label="Cancel"
          :disabled="loading"
          @click="$emit('close')"
        />
        <BalBtn
          :disabled="!canWithdraw || loading"
          :label="loading ? 'Processing...' : 'Withdraw'"
          class="flex-1 w-full"
          color="gradient"
          @click="confirmWithdraw"
        />
      </div>
    </template>
  </BalModal>
</template>

<script>
import BalModal from '@/components/_global/BalModal/BalModal.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';

export default {
  name: 'VaultCardModal',
  components: {
    BalModal,
    BalBtn,
  },
  props: {
    show: { type: Boolean, required: true },
    action: { type: String, required: true }, // 'deposit' | 'withdraw'
    vault: { type: Object, required: false },
    available: { type: [Number, String], required: false, default: '0' },
    title: { type: String, required: false },
  },
  emits: ['confirm', 'close'],
  data() {
    return {
      depositAmount: '',
      loading: false,
      // withdraw state
      withdrawPercent: '',
      selectedPercent: null,
    };
  },
  computed: {
    formattedDeposit() {
      const num = Number(this.vault?.deposit) || 0;
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
      }).format(num);
    },
    formattedApy() {
      const n = Number(this.vault?.apy) || 0;
      return n % 1 === 0 ? String(n) : n.toFixed(1);
    },
    formattedFiat() {
      const amt = Number(this.depositAmount) || 0;
      return (amt * 1).toFixed(2);
    },
    // cantidad a retirar calculada desde available * percent
    availableNum() {
      return Number(this.available) || 0;
    },
    withdrawAmount() {
      const p = Number(this.selectedPercent || this.withdrawPercent) || 0;
      return (this.availableNum * p) / 100;
    },
    formattedWithdrawAmount() {
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
      }).format(this.withdrawAmount);
    },
    canDeposit() {
      const v = Number(this.depositAmount);
      return v > 0 && v <= Number(this.available);
    },
    canWithdraw() {
      return (
        this.withdrawAmount > 0 && this.withdrawAmount <= this.availableNum
      );
    },
  },
  methods: {
    onDepositInput(e) {
      this.depositAmount = e.target.value;
    },
    setMaxDeposit() {
      this.depositAmount = String(this.available);
    },
    confirm() {
      if (this.action === 'deposit') {
        if (!this.canDeposit) return;
        // Simular transacción: mostrar loader durante 5 segundos
        this.loading = true;
        // pequeña protección: evitar dobles clicks
        setTimeout(() => {
          this.$emit('confirm', {
            action: 'deposit',
            amount: Number(this.depositAmount),
          });
          this.loading = false;
          this.$emit('close');
        }, 5000);
      } else {
        this.$emit('confirm', {
          action: 'withdraw',
          amount: Number(this.vault?.deposit) || 0,
        });
        this.$emit('close');
      }
    },
    selectPercent(p) {
      this.selectedPercent = p;
      this.withdrawPercent = '';
    },
    onWithdrawPercentInput(e) {
      this.selectedPercent = null;
      this.withdrawPercent = e.target.value;
    },
    confirmWithdraw() {
      if (!this.canWithdraw) return;
      this.loading = true;
      setTimeout(() => {
        this.$emit('confirm', {
          action: 'withdraw',
          amount: Number(this.withdrawAmount),
        });
        this.loading = false;
        this.$emit('close');
      }, 5000);
    },
  },
};
</script>
