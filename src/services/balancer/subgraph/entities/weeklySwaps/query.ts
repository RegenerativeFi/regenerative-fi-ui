// import { userAddress } from '@/services/web3/__mocks__/web3.service';
import { merge } from 'lodash';

const defaultArgs = {
  orderBy: 'timestamp',
  orderDirection: 'desc',
  where: {
    userAddress: '0x34107bce5ec357ce31739b84454c2c555a677568',
    // timestamp_gte: 16000,
    // timestamp_lt: 17000,
  },
};

const defaultAttrs = {
  tokenIn: true,
  tokenOut: true,
  tokenAmountIn: true,
  tokenAmountOut: true,
  tx: true,
  valueUSD: true,
  timestamp: true,
  userAddress: {
    id: true,
  },
};

export default (args = {}, attrs = {}) => ({
  swaps: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs),
  },
});
