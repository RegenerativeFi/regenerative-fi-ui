<template>
  <BalCard class="flex-1">
    <template #header>
      <div class="flex justify-between items-center w-full">
        <div v-if="!placeholder" class="flex gap-3 items-center">
          <div class="flex justify-center items-center w-10 h-10 rounded-full">
            <img :src="icon" alt="icon" class="w-8 h-8 rounded-full" />
          </div>
          <h4 class="text-lg font-medium">{{ title }}</h4>
        </div>
        <div v-else class="h-10" />

        <div v-if="!placeholder" class="flex items-center">
          <div
            class="flex gap-1 items-center py-2 px-4 text-sm bg-gray-100 rounded-lg"
          >
            <span class="font-medium">APY:</span>
            <span class="font-semibold">{{ formattedApy }}%</span>
            <div class="flex justify-center items-center w-6 h-6 rounded-full">
              <img :src="icon" alt="token" class="w-4 h-4 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- Header divider (extend to card edges compensating internal padding) -->
    <div class="-mx-6"><hr class="border-t border-gray-200" /></div>

    <div>
      <div
        v-if="placeholder"
        class="flex justify-center items-center p-6 h-full bg-transparent rounded-xl border-2 border-dashed border-teal-200"
      >
        <div class="text-sm text-gray-300">&nbsp;</div>
      </div>

      <div v-else class="mt-4">
        <div
          class="p-6 text-center rounded-xl border-2 border-dashed border-teal-200 bg-teal-50"
        >
          <div class="text-sm text-gray-500">My Deposit</div>
          <div class="flex gap-3 justify-center items-center mt-3">
            <img :src="icon" alt="token" class="w-7 h-7" />
            <div class="text-2xl font-semibold">{{ formattedDeposit }}</div>
          </div>
        </div>

        <!-- Footer divider (extend to card edges compensating internal padding) -->
        <div class="my-6 -mx-6"><hr class="border-t border-gray-200" /></div>

        <div class="grid grid-cols-2 gap-4">
          <!-- Abrir modal en lugar de emitir directamente -->
          <BalBtn
            label="Withdraw"
            outline
            class="w-full h-12"
            @click="openWithdrawModal"
          />

          <BalBtn
            label="Deposit"
            color="gradient"
            class="w-full h-12"
            @click="openDepositModal"
          />
        </div>
      </div>
    </div>
  </BalCard>

  <!-- Withdraw Modal (use VaultCardModal) -->
  <VaultCardModal
    :show="showWithdraw"
    action="withdraw"
    :vault="{ title, apy, deposit, icon }"
    :available="available"
    @close="closeWithdraw"
    @confirm="handleModalConfirm"
  />

  <VaultCardModal
    :show="showDeposit"
    action="deposit"
    :vault="{ title, apy, deposit, icon }"
    :available="available"
    @close="closeDeposit"
    @confirm="handleModalConfirm"
  />
</template>

<script>
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import VaultCardModal from '@/components/modals/VaultCardModal.vue';

export default {
  name: 'VaultCard',
  components: {
    BalBtn,
    VaultCardModal,
  },
  props: {
    title: { type: String, required: false },
    apy: { type: [Number, String], required: false },
    deposit: { type: [Number, String], required: false },
    icon: { type: String, required: false },
    placeholder: { type: Boolean, default: false },
  },
  emits: ['withdraw', 'deposit'],
  data() {
    return {
      showWithdraw: false,
      showDeposit: false,
      depositAmount: '',
      // ejemplo: disponible en wallet (valor largo para mockup)
      available: '9.000000982027831',
    };
  },
  computed: {
    formattedDeposit() {
      const num = Number(this.deposit) || 0;
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
      }).format(num);
    },
    formattedFiat() {
      const amt = Number(this.depositAmount) || 0;
      // placeholder conversión: 1 CELO = $1 (ajustar según precios reales)
      return (amt * 1).toFixed(2);
    },
    formattedApy() {
      const n = Number(this.apy) || 0;
      return n % 1 === 0 ? String(n) : n.toFixed(1);
    },
    canDeposit() {
      const v = Number(this.depositAmount);
      return v > 0 && v <= Number(this.available);
    },
  },
  methods: {
    openWithdrawModal() {
      this.showWithdraw = true;
    },
    closeWithdraw() {
      this.showWithdraw = false;
    },
    confirmWithdraw() {
      this.$emit('withdraw');
      this.closeWithdraw();
    },
    openDepositModal() {
      this.showDeposit = true;
    },
    closeDeposit() {
      this.showDeposit = false;
      this.depositAmount = '';
    },
    // manejar confirmación desde VaultCardModal
    handleModalConfirm(payload) {
      // payload: { action: 'deposit'|'withdraw', amount }
      if (!payload || !payload.action) return;
      if (payload.action === 'deposit') {
        this.$emit('deposit', payload.amount);
        this.closeDeposit();
      } else if (payload.action === 'withdraw') {
        this.$emit('withdraw', payload.amount);
        this.closeWithdraw();
      }
    },
    onDepositInput(e) {
      // mantener sólo números y punto
      // v-model already sets depositAmount, pero normalizamos aquí
      const val = e.target.value;
      this.depositAmount = val;
    },
    setMaxDeposit() {
      this.depositAmount = String(this.available);
    },
    confirmDeposit() {
      if (!this.canDeposit) return;
      this.$emit('deposit', Number(this.depositAmount));
      this.closeDeposit();
    },
  },
};
</script>

<style scoped>
/* Ajustes mínimos si hace falta */
</style>
