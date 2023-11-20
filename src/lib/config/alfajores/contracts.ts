import { Contracts } from '../types';
import * as alfajores from '@/assets/data/contracts/alfajores.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '',
  merkleOrchardV2: '',
  multicall: '0xca11bde05977b3631167028862be2a173976ca11',
  authorizer: alfajores.Authorizer,
  vault: alfajores.Vault,
  weightedPoolFactory: alfajores.WeightedPoolFactory,
  stablePoolFactory: '',
  lidoRelayer: '',
  balancerHelpers: alfajores.BalancerHelpers,
  batchRelayer: '',
  gaugeFactory: '',
  balancerMinter: '',
  gaugeController: '',
  tokenAdmin: '',
  veBAL: '',
  veDelegationProxy: '',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeRewardsHelper: '',
  gaugeWorkingBalanceHelper: '',
  gaugeCheckpointer: '',
};

export default contracts;
