import { useTokens } from '@/providers/tokens.provider';
import useConfig from './useConfig';

export default function useREFI() {
  /**
   * COMPOSABLES
   */
  const { balanceFor, getToken } = useTokens();
  const { networkConfig } = useConfig();

  /**
   * COMPUTED
   */

  const ReFiTokenInfo = computed(() =>
    networkConfig.addresses.ReFi
      ? getToken(networkConfig.addresses.ReFi) || null
      : null
  );

  const ReFiBalance = computed(() =>
    networkConfig.addresses.ReFi
      ? balanceFor(networkConfig.addresses.ReFi)
      : '0.0'
  );

  const hasReFiBalance = computed(() => Number(ReFiBalance.value) > 0);

  const noReFiBalance = computed(() => ReFiBalance.value === '0.0');

  return {
    ReFiTokenInfo,
    ReFiBalance,
    hasReFiBalance,
    noReFiBalance,
  };
}
