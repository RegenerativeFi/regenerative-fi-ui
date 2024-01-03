import { reactive, Ref, ref } from 'vue';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';
import QUERY_KEYS from '@/constants/queryKeys';
import useNetwork from '../useNetwork';
import { getApi } from '@/dependencies/balancer-api';
import { GqlTokenPrice } from '@/services/api/graphql/generated/api-types';
import { oneMinInMs } from '../useTime';
import { getAddress } from '@ethersproject/address';
import axios from 'axios';
import {
  geckoTerminalNetworks,
  MockedTestnetTokens,
} from '@/constants/geckoterminal';

/**
 * TYPES
 */
export type TokenPrices = { [address: string]: number };
type QueryResponse = TokenPrices;
type QueryOptions = UseQueryOptions<QueryResponse>;

/**
 * Fetches token prices for all provided addresses.
 */
export default function useTokenPricesQuery(
  pricesToInject: Ref<TokenPrices> = ref({}),
  options: QueryOptions = {}
) {
  const { networkId } = useNetwork();
  const currentGTNetwork = geckoTerminalNetworks[networkId.value];

  const queryKey = reactive(
    QUERY_KEYS.Tokens.Prices(networkId, pricesToInject)
  );

  function priceArrayToMap(prices: GqlTokenPrice[]): TokenPrices {
    return prices.reduce(
      (obj, item) => ((obj[getAddress(item.address)] = item.price), obj),
      {}
    );
  }

  function injectCustomTokens(
    prices: TokenPrices,
    pricesToInject: TokenPrices
  ): TokenPrices {
    for (const address of Object.keys(pricesToInject)) {
      prices[address] = pricesToInject[address];
    }
    return prices;
  }

  const api = getApi();
  const queryFn = async () => {
    if (
      Object.keys(geckoTerminalNetworks).includes(networkId.value.toString())
    ) {
      const reverseMockedAddress = Object.fromEntries(
        Object.entries(MockedTestnetTokens[currentGTNetwork]).map(
          ([original, mock]) => [(mock as string).toLowerCase(), original]
        )
      );
      const response = await axios.get(
        `https://api.geckoterminal.com/api/v2/simple/networks/${
          geckoTerminalNetworks[networkId.value]
        }/token_price/${Object.values(
          MockedTestnetTokens[currentGTNetwork]
        ).join(',')}`
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
      console.log('Fetching', Object.values(formattedPrices).length, 'prices');

      return formattedPrices;
    }

    if (!api) return {};

    const { prices } = await api.GetCurrentTokenPrices();

    let pricesMap = priceArrayToMap(prices);
    pricesMap = injectCustomTokens(pricesMap, pricesToInject.value);
    console.log('Fetching', Object.values(prices).length, 'prices');

    return pricesMap;
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
