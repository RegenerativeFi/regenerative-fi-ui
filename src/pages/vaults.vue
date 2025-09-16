<template>
  <div class="xl:container flex flex-col gap-8 px-4 xl:mx-auto pt-[30px]">
    <div class="flex flex-row gap-4">
      <BalCard class="flex-1 p-8 card-gap">
        <template #header>
          <div class="flex flex-row flex-1 justify-between items-center">
            <h4 class="text-lg font-medium">Your Vaults Deposits</h4>
          </div>
        </template>
        <div>
          <div class="flex flex-row gap-2 items-center">
            <p class="text-xl font-medium">$134.48</p>
          </div>
        </div>
      </BalCard>

      <BalCard class="flex-1 p-8 card-gap">
        <template #header>
          <div class="flex flex-row flex-1 justify-between items-center">
            <h4 class="text-lg font-medium">Your Vaults Deposits</h4>
          </div>
        </template>
        <div>
          <div class="flex flex-row gap-2 items-center">
            <p class="text-xl font-medium">$134.48</p>
          </div>
        </div>
      </BalCard>
    </div>
    <div>
      <h2 class="text-xl font-medium leading-5 !mb-4">Claimable Incentives</h2>
    </div>
    <div class="grid grid-cols-3 gap-4">
      <!-- Primera columna: la única VaultCard real -->
      <div>
        <VaultCard
          v-if="vaults.length > 0"
          :title="vaults[0].title"
          :apy="vaults[0].apy"
          :deposit="vaults[0].deposit"
          :icon="vaults[0].icon"
          @withdraw="onWithdraw(vaults[0], 0)"
          @deposit="onDeposit(vaults[0], 0)"
        />
        <!-- Si no hay vaults, dejar el espacio en blanco -->
        <div
          v-else
          class="flex justify-center items-center h-full text-gray-300"
        >
          &nbsp;
        </div>
      </div>

      <!-- Columnas 2 y 3: espacios vacíos para mantener el layout -->
      <div class="flex justify-center items-center h-full text-gray-300">
        &nbsp;
      </div>
      <div class="flex justify-center items-center h-full text-gray-300">
        &nbsp;
      </div>
    </div>
  </div>
</template>

<script>
import VaultCard from '@/components/VaultCard.vue';

export default {
  components: {
    VaultCard,
  },
  data() {
    return {
      // ejemplo: solo un vault — la UI renderizará 2 espacios en blanco adicionales
      vaults: [
        {
          title: 'Staked CELO',
          apy: 1.9,
          deposit: 1388.88301,
          icon: 'https://cdn.prod.website-files.com/652d421c1214a2eebd967f1d/683f449264407a7213b865fa_Celo.png',
        },
      ],
    };
  },
  computed: {
    // siempre devolver array de longitud 3, con nulls para placeholders
    slots() {
      const max = 3;
      return Array.from({ length: max }, (_, i) => this.vaults[i] || null);
    },
  },
  methods: {
    onWithdraw(slot, idx) {
      // placeholder: conectar con la lógica real
      console.log('withdraw', idx, slot);
    },
    onDeposit(slot, idx) {
      console.log('deposit', idx, slot);
    },
  },
};
</script>
