import { useVault } from './useVault';
import { createStCeloStrategy } from './strategies/stCelo.strategy';
import { Vault } from './types';

const ST_CELO_VAULT: Vault = {
  id: 'stCelo',
  title: 'Staked CELO',
  apy: [{ token: 'CELO', value: 1.85 }],
  deposit: '0',
  depositRaw: '0',
  available: '0',
  contractAddress: '0xC668583dcbDc9ae6FA3CE46462758188adfdfC24',
  tokenAddress: '0x471EcE3750Da237f93B8E339c536989b8978a438',
  icon: 'https://cdn.prod.website-files.com/652d421c1214a2eebd967f1d/683f449264407a7213b865fa_Celo.png',
  depositTokenIcon:
    'https://docs.stcelo.xyz/~gitbook/image?url=https%3A%2F%2F3000964912-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FvQimOwyO476OljyCNwuU%252Ficon%252F5v5AoHHdDbNO4xJ9JQ56%252FProperty%25201%253DstCELO.png%3Falt%3Dmedia%26token%3D593a7df1-4f25-42e8-a03a-c12a8056dcdd&width=32&dpr=4&quality=100&sign=41c5cab3&sv=2',
};

export default function useStCelo() {
  return useVault('stCelo', ST_CELO_VAULT, createStCeloStrategy());
}
