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
  gaugeFactory: '0x1E409712f9cCBE8c6e03d91Dc928486A34061fb5',
  balancerMinter: '',
  gaugeController: '0x6cd1dcf9f20a484d487665a6d06f6ee5de6db16e',
  tokenAdmin: '',
  veBAL: alfajores.VotingEscrow,
  veDelegationProxy: '0x5fab59a8f0791298f5448695FbCB5A2c8C887938',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  gaugeRewardsHelper: '',
  gaugeWorkingBalanceHelper: '',
  gaugeCheckpointer: '',
  simpleMinter: '',
  ReFi: alfajores.TestBalancerToken,
  faucet: '0xae9465eee8c802ac353bd4a90964b2684bb49a68',
  bribeVault: '0x16A3793F3B62C285B7d5dcb36cc4652FF2a46d2A',
  bribeMarket: '0xfc1a572A24a902DEc2706a7A34F2803EaBaEba3C',
  rewardDistributor: '0x60DcBeC73d95ab9E823b0eE7343003df121AA478',
};

export default contracts;
