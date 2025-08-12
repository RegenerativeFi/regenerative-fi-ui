import { Contracts } from '../types';
import * as celo from '@/assets/data/contracts/celo.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '',
  merkleOrchardV2: '',
  multicall: '0xca11bde05977b3631167028862be2a173976ca11',
  authorizer: celo.Authorizer,
  vault: celo.Vault,
  weightedPoolFactory: celo.WeightedPoolFactory,
  stablePoolFactory: celo.ComposableStablePoolFactory,
  lidoRelayer: '',
  balancerHelpers: celo.BalancerHelpers,
  batchRelayer: celo.BalancerRelayer,
  gaugeFactory: '0xbe3a536940d5e629f257b5758347f2d47b07362c',
  balancerMinter: '0x28D89a683515409D382cc8C5dda113FAcA594423',
  gaugeController: '0xaa6D84773d993d3d09490a96e244C71592D6b6f1',
  tokenAdmin: '',
  veBAL: '0x05B87e716393F76b5854b4c194b90C26c24Cd90D',
  veDelegationProxy: '',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '0x471d434Cd48015d662D575B53712c75ED0Af83E8',
  gaugeRewardsHelper: '',
  gaugeWorkingBalanceHelper: '',
  gaugeCheckpointer: '',
  simpleMinter: celo.SimpleMinter,
  ReFi: celo.TestBalancerToken,
  RFNFT: celo.RFNFT,
  RFP: celo.RFP,
  bribeVault: '0xEBC4Bb8727FEa1f81a007E877A6e0b874a285255',
  bribeMarket: '0xB367CB71B16D45a362600f37b77DD01699A5Dd23',
  rewardDistributor: '0x2874321070A9B6a9c81827BcA9Dd4F9EcD0631b8',
};

export default contracts;
