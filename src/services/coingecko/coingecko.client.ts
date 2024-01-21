import axios from 'axios';

export class CoingeckoClient {
  baseUrl: string;

  constructor() {
    this.baseUrl = 'https://pro-api.coingecko.com/api/v3/';
  }

  async get<T>(endpoint: string): Promise<T> {
    const { data } = await axios.get(this.baseUrl + endpoint);
    return data;
  }
}

export const coingeckoClient = new CoingeckoClient();
