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

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ReFiTokenInfo = computed(() => getToken(networkConfig.addresses.ReFi!));

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
