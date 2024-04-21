import { Contracts } from '../types';
import * as celo from '@/assets/data/contracts/celo.json';

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
  simpleMinter: celo.SimpleMinter,
  RFNFT: celo.RFNFT,
  RFP: celo.RFP,
};

export default contracts;
