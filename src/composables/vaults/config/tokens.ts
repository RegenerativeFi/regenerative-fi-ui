export interface TokenConfig {
  symbol: string;
  address: string;
  decimals: number;
  icon: string;
}

export const VAULT_TOKENS = {
  CELO: {
    symbol: 'CELO',
    address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    decimals: 18,
    icon: 'https://cdn.prod.website-files.com/652d421c1214a2eebd967f1d/683f449264407a7213b865fa_Celo.png',
  },
  STCELO: {
    symbol: 'stCELO',
    address: '0xC668583dcbDc9ae6FA3CE46462758188adfdfC24',
    decimals: 18,
    icon: 'https://docs.stcelo.xyz/~gitbook/image?url=https%3A%2F%2F3000964912-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FvQimOwyO476OljyCNwuU%252Ficon%252F5v5AoHHdDbNO4xJ9JQ56%252FProperty%25201%253DstCELO.png%3Falt%3Dmedia%26token%3D593a7df1-4f25-42e8-a03a-c12a8056dcdd&width=32&dpr=4&quality=100&sign=41c5cab3&sv=2',
  },
} as const;

export const TOKEN_ADDRESSES = {
  CELO: VAULT_TOKENS.CELO.address,
  STCELO: VAULT_TOKENS.STCELO.address,
} as const;

export function getTokenByAddress(address: string): TokenConfig | undefined {
  return Object.values(VAULT_TOKENS).find(
    t => t.address.toLowerCase() === address.toLowerCase()
  );
}

export function getTokenBySymbol(symbol: string): TokenConfig | undefined {
  return Object.values(VAULT_TOKENS).find(
    t => t.symbol.toLowerCase() === symbol.toLowerCase()
  );
}
