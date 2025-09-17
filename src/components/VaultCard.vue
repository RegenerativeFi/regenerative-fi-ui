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
    :available="localAvailable || available"
    :contractAddress="contractAddress"
    @close="closeWithdraw"
    @success="handleModalSuccess"
  />

  <VaultCardModal
    :show="showDeposit"
    action="deposit"
    :vault="{ title, apy, deposit, icon }"
    :available="localAvailable || available"
    :contractAddress="contractAddress"
    @close="closeDeposit"
    @success="handleModalSuccess"
  />
</template>

<script>
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import VaultCardModal from '@/components/modals/VaultCardModal.vue';
import { watch } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import useStCelo from '@/composables/vaults/stCelo';

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
    available: { type: [Number, String], required: false },
    icon: { type: String, required: false },
    placeholder: { type: Boolean, default: false },
    // address del contrato ERC20 para leer balanceOf
    contractAddress: { type: String, required: false },
  },
  emits: ['withdraw', 'deposit'],
  data() {
    return {
      showWithdraw: false,
      showDeposit: false,
      depositAmount: '',
      // ejemplo: disponible en wallet (valor largo para mockup) --- if not provided via prop
      // available prop will override this data when present
      localAvailable: undefined,
      // referencia al composable
      stCeloComposable: null,
    };
  },

  computed: {
    formattedDeposit() {
      const num = Number(this.deposit) || 0;
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 5,
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

  mounted() {
    // Si se pasa una contractAddress, obtener la cuenta desde useWeb3 y leer balance on-chain
    if (!this.contractAddress) return;
    const { account, getProvider } = useWeb3();

    const doFetch = async userAddress => {
      if (!userAddress) return;
      try {
        const st = useStCelo();
        this.stCeloComposable = st;
        const provider = getProvider ? getProvider() : undefined;
        const val = await st.fetchOnchainBalance(
          this.contractAddress,
          userAddress,
          provider
        );
        // val puede ser un objeto { stBalance, tokenSupply, vaultSupply }
        if (val && typeof val === 'object') {
          if (val.stBalance !== undefined) {
            this.localAvailable = String(val.stBalance);
          } else if (st && st.vault && st.vault.available) {
            this.localAvailable = String(st.vault.available);
          } else {
            this.localAvailable = String(val);
          }
        } else {
          this.localAvailable = String(val);
        }
      } catch (e) {
        // noop
      }
    };

    // si ya hay cuenta conecta la leemos
    if (account && account.value) {
      void doFetch(account.value);
    }

    // observar cambios en la cuenta y ejecutar sólo la primera vez que aparece
    if (account) {
      const stop = watch(account, val => {
        if (val) {
          void doFetch(val);
          stop();
        }
      });
    }
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
    handleModalSuccess() {
      // El modal ya manejó la transacción y muestra la confirmación
      // No cerrar el modal aquí, dejar que el usuario lo cierre manualmente
      // Opcionalmente, refrescar datos si es necesario
      if (this.stCeloComposable) {
        try {
          // Sincronizar available con el composable
          this.localAvailable = String(
            this.stCeloComposable.vault.available || 0
          );
        } catch (e) {
          // ignorar errores
        }
      }
    },
    onDepositInput(e) {
      // mantener sólo números y punto
      // v-model already sets depositAmount, pero normalizamos aquí
      const val = e.target.value;
      this.depositAmount = val;
    },
    setMaxDeposit() {
      this.depositAmount = String(this.localAvailable || this.available || '');
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
