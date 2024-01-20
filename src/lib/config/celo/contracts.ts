import { Contracts } from '../types';
import * as celo from '@/assets/data/contracts/alfajores.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '',
  merkleOrchardV2: '',
  multicall: celo.Multicall,
  authorizer: celo.Authorizer,
  vault: celo.Vault,
  weightedPoolFactory: celo.WeightedPoolFactory,
  stablePoolFactory: '',
  lidoRelayer: '',
  balancerHelpers: celo.BalancerHelpers,
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
