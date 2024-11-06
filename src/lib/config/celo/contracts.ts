import { Contracts } from '../types';
import * as celo from '@/assets/data/contracts/celo.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '',
  merkleOrchardV2: '',
  multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
  authorizer: celo.Authorizer,
  vault: celo.Vault,
  weightedPoolFactory: celo.WeightedPoolFactory,
  stablePoolFactory: celo.ComposableStablePoolFactory,
  lidoRelayer: '',
  balancerHelpers: celo.BalancerHelpers,
  batchRelayer: celo.BalancerRelayer,
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
