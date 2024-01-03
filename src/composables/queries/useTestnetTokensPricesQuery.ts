import { useTokens } from '@/providers/tokens.provider';
import axios from 'axios';
import useNetwork from '../useNetwork';
import QUERY_KEYS from '@/constants/queryKeys';
import { TokenInfoMap } from '@/types/TokenList';
import { oneMinInMs } from '../useTime';
import { UseQueryOptions, useQuery } from '@tanstack/vue-query';
import { TokenPrices } from './useTokenPricesQuery';

const geckoTerminalNetworks = {
  44787: 'celo',
  62320: 'eth',
  137: 'eth',
};
type QueryResponse = TokenPrices;
type QueryOptions = UseQueryOptions<QueryResponse>;

const mockedAddress = {
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE':
    '0x471EcE3750Da237f93B8E339c536989b8978a438',
  '0x524d97a67f50f4a062c28c74f60703aec9028a94':
    '0x66803fb87abd4aac3cbb3fad7c3aa01f6f3fb207',
  '0x1d4C35C3F4a91103bA323fE2f4c3f6eBeF531c11':
    '0x66803fb87abd4aac3cbb3fad7c3aa01f6f3fb207',
  '0x317e1d46ceE079683C82fFfC9b524F55c29B7b91':
    '0x66803fb87abd4aac3cbb3fad7c3aa01f6f3fb207',
  '0x4a4AC35B50DAf081C22856ebB26561F3a22598C6':
    '0x765de816845861e75a25fca122bb6898b8b1282a',
};
const reverseMockedAddress = Object.fromEntries(
  Object.entries(mockedAddress).map(([original, mock]) => [
    mock.toLowerCase(),
    original,
  ])
);
function extractAddresses(dataObject: TokenInfoMap) {
  return Object.values(dataObject).map(item => item.address);
}

export default function useTestnetTokensPriceQuery(options: QueryOptions = {}) {
  const TestnetsIDS = [44787, 62320, 137];

  const { networkId } = useNetwork();
  const { tokens } = useTokens();
  const tokenAddresses = extractAddresses(tokens.value);
  const queryKey = reactive(QUERY_KEYS.Tokens.TestnetPrices(networkId));
  const queryFn = async () => {
    if (!TestnetsIDS.includes(networkId.value)) return {};
    const tokenAddressesMocked = tokenAddresses.map(address => {
      if (mockedAddress[address]) return mockedAddress[address];
      return address;
    });
    const response = await axios.get(
      `https://api.geckoterminal.com/api/v2/simple/networks/${
        geckoTerminalNetworks[networkId.value]
      }/token_price/${tokenAddressesMocked.join(',')}`
    );
    const unformatedPrices = response.data.data.attributes.token_prices;

    const formattedPrices = Object.keys(unformatedPrices).reduce(
      (acc, mockAddress) => {
        const originalAddress =
          reverseMockedAddress[mockAddress.toLowerCase()] || mockAddress;
        acc[originalAddress] = Number(unformatedPrices[mockAddress]);
        return acc;
      },
      {}
    );

    return formattedPrices;
  };
  const queryOptions = reactive({
    enabled: true,
    refetchInterval: oneMinInMs * 5,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...options,
  });
  return useQuery<QueryResponse>(
    queryKey,
    queryFn,
    queryOptions as QueryOptions
  );
}

export { useTestnetTokensPriceQuery };
