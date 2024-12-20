import { Contracts } from '../types';
import * as alfajores from '@/assets/data/contracts/celoAlfajores.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '',
  merkleOrchardV2: '',
  multicall: '0xca11bde05977b3631167028862be2a173976ca11',
  authorizer: alfajores.Authorizer,
  vault: alfajores.Vault,
  weightedPoolFactory: alfajores.WeightedPoolFactory,
  stablePoolFactory: alfajores.ComposableStablePoolFactory,
  lidoRelayer: '',
  balancerHelpers: alfajores.BalancerHelpers,
  batchRelayer: alfajores.BalancerRelayer,
  gaugeFactory: '',
  balancerMinter: '',
  gaugeController: alfajores.GaugeController,
  tokenAdmin: '',
  veBAL: alfajores.VotingEscrow,
  veDelegationProxy: '',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeRewardsHelper: '',
  gaugeWorkingBalanceHelper: '',
  gaugeCheckpointer: '',
  simpleMinter: '',
  ReFi: alfajores.TestBalancerToken,
};

export default contracts;
