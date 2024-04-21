import { reactive, Ref, ref } from 'vue';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';
import QUERY_KEYS from '@/constants/queryKeys';
import useNetwork from '../useNetwork';
import { getApi } from '@/dependencies/balancer-api';
import { GqlTokenPrice } from '@/services/api/graphql/generated/api-types';
import { oneMinInMs } from '../useTime';
import { getAddress } from '@ethersproject/address';
import axios, { AxiosResponse } from 'axios';
import { Tokens } from '@/constants/coingecko';

/**
 * TYPES
 */
export type TokenPrices = { [address: string]: number };
type CGResponse = {
  [address: string]: {
    usd: number;
  };
};
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

  const idToAddressMap = Tokens.celo.mocks.reduce((map, item) => {
    const key = Object.keys(item)[0];
    map[item[key]] = key;
    return map;
  }, {});

  const queryFn = async () => {
    if (networkId.value === 42220) {
      const tokenAddresses = Tokens.celo.addreses.map(token => token).join(',');
      const tokenIds = Tokens.celo.mocks
        .map(token => Object.values(token)[0])
        .join(',');
      const celoTokensURL = `https://pro-api.coingecko.com/api/v3/simple/token_price/celo?contract_addresses=${tokenAddresses}&vs_currencies=usd&x_cg_pro_api_key=${
        import.meta.env.VITE_COINGECKO_API_KEY
      }`;
      const otherTokensURL = `https://pro-api.coingecko.com/api/v3/simple/price/?ids=${tokenIds}&vs_currencies=usd&x_cg_pro_api_key=${
        import.meta.env.VITE_COINGECKO_API_KEY
      }`;
      const { data: celoTokensValues } = await axios.get<
        AxiosResponse<CGResponse>
      >(celoTokensURL);
      const { data: otherTokensValues } = await axios.get<
        AxiosResponse<CGResponse>
      >(otherTokensURL);
      console.debug({ otherTokensValues });

      const otherChainsPrices = Object.entries(otherTokensValues).map(
        ([id, priceData]) => {
          return {
            address: idToAddressMap[id],
            price: priceData.usd,
          };
        }
      );
      const celoPrices: GqlTokenPrice[] = [];
      for (const key in celoTokensValues) {
        celoPrices.push({
          address: key,
          price: celoTokensValues[key].usd as number,
        });
      }

      let pricesMap = priceArrayToMap([...celoPrices, ...otherChainsPrices]);
      pricesMap = injectCustomTokens(pricesMap, pricesToInject.value);
      console.debug({ pricesMap });
      console.log('Fetching', Object.values(celoPrices).length, 'prices');
      return pricesMap;
    }

    if (!api) return {};

    const { prices } = await api.GetCurrentTokenPrices();
    console.debug({ prices });
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
