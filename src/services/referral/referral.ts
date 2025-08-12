// src/services/referral/referral.ts
import { submitReferral, getReferralTag } from '@divvi/referral-sdk';

const USDT_BY_CHAIN: Record<number, string> = {
  1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  10: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
  42220: '0x48065fBbE25F71C9282dDf5e1Cd6d6a887483d5E',
  43114: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
};

export function getDivviSuffix(account: `0x${string}`) {
  return getReferralTag({
    user: account, // The user address making the transaction
    consumer: '0xe86e5053AB3D18F533d4bFbEE79409C218E70b2e', // Your Divvi Identifier
  });
}
// Normaliza y compara contra el address USDT de la red.
export function isUsdtInvolved(
  tokenIn: string,
  tokenOut: string,
  chainId: number
): boolean {
  const usdt = USDT_BY_CHAIN[chainId];
  if (!usdt) return false;
  const a = (tokenIn || '').toLowerCase();
  const b = (tokenOut || '').toLowerCase();
  return a === usdt.toLowerCase() || b === usdt.toLowerCase();
}

// Reporte para tx on-chain (SOR / JoinExit / Wrap/Unwrap)
export async function reportOnchainReferral(txHash: string, chainId: number) {
  try {
    await submitReferral({
      txHash: txHash as `0x${string}`,
      chainId: chainId,
    });
  } catch (e) {
    console.warn('[Divvi] submitReferral (on-chain) failed', e);
  }
}
