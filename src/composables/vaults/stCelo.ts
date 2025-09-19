import { ref } from 'vue';
import { useVault } from './useVault';
import { createStCeloStrategy } from './strategies/stCelo.strategy';
import { Vault } from './types';

export default function useStCelo() {
  const vaultState = ref<Vault>({
    id: 'stCelo',
    title: 'Staked CELO',
    apy: 1.85,
    deposit: '0',
    depositRaw: '0',
    available: '0',
    icon: 'https://cdn.prod.website-files.com/652d421c1214a2eebd967f1d/683f449264407a7213b865fa_Celo.png',
    contractAddress: '0xC668583dcbDc9ae6FA3CE46462758188adfdfC24',
    supplyBalance: '0',
  });

  const strategy = createStCeloStrategy();

  return useVault('stCelo', vaultState.value, strategy);
}
