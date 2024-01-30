import { merge } from 'lodash';

const defaultArgs = {};
const defaultAttrs = {
  totalLiquidity: true,
  totalSwapVolume: true,
};

export default (args = {}, attrs = {}) => ({
  balancers: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs),
  },
});
