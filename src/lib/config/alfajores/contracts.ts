import { Contracts } from '../types';
import * as alfajores from '@/assets/data/contracts/alfajores.json';

const contracts: Contracts & { simpleMinter: string } = {
  merkleRedeem: '',
  merkleOrchard: '',
  merkleOrchardV2: '',
  multicall: alfajores.Multicall,
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
  simpleMinter: alfajores.SimpleMinter,
  RFNFT: alfajores.RFNFT,
  RFP: alfajores.RFP,
};

export default contracts;
