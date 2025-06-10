import { Goals, trackGoal } from '@/composables/useFathom';
import { WalletError, WalletErrorMetadata } from '@/types';
import {
  JsonRpcSigner,
  TransactionResponse,
  TransactionRequest,
} from '@ethersproject/providers';
import { ContractInterface } from 'ethers';
import {
  verifyNetwork,
  verifyTransactionSender,
} from '@/providers/wallet.provider';
import { TransactionConcern } from './transaction.concern';
import {
  EthersContract,
  getEthersContract,
} from '@/dependencies/EthersContract';
import { getDataSuffix, submitReferral } from '@divvi/referral-sdk';

export type SendTransactionOpts = {
  contractAddress: string;
  abi: ContractInterface;
  action: string;
  params?: any[];
  options?: TransactionRequest;
};

export class ContractConcern extends TransactionConcern {
  constructor(private readonly signer: JsonRpcSigner) {
    super();
  }

  public async sendTransaction({
    contractAddress,
    abi,
    action,
    params = [],
    options = {},
  }: SendTransactionOpts): Promise<TransactionResponse> {
    const EthersContract = getEthersContract();
    const contractWithSigner = new EthersContract(
      contractAddress,
      abi,
      this.signer
    );

    const block = await this.signer.provider.getBlockNumber();
    console.log(`Contract: ${contractAddress} Action: ${action}`);
    console.log('Params: ', JSON.stringify(params));

    try {
      const gasSettings = await this.gas.settingsForContractCall(
        contractWithSigner,
        action,
        params,
        options
      );

      const divviSuffix = getDataSuffix({
        consumer: '0xe86e5053AB3D18F533d4bFbEE79409C218E70b2e',
        providers: [
          '0x0423189886d7966f0dd7e7d256898daeee625dca',
          '0xc95876688026be9d6fa7a7c33328bd013effa2bb',
          '0x7beb0e14f8d2e6f6678cc30d867787b384b19e20',
        ],
      });

      console.debug('Divvi suffix', divviSuffix);
      console.debug('Options', JSON.stringify(options));

      const calldata = contractWithSigner.interface.encodeFunctionData(
        action,
        params
      );
      const dataWithSuffix = `${calldata}${divviSuffix}`;

      const txOptions = {
        ...options,
        ...gasSettings,
        to: contractAddress,
        data: dataWithSuffix,
      };

      console.debug('Tx options', txOptions);

      await Promise.all([
        verifyTransactionSender(this.signer),
        verifyNetwork(this.signer),
      ]);

      trackGoal(Goals.ContractTransactionSubmitted);

      const tx: TransactionResponse = await this.signer.sendTransaction(
        txOptions
      );
      await submitReferral({
        txHash: tx.hash as `0x${string}`,
        chainId: await this.signer.getChainId(),
      });
      return tx;
    } catch (err) {
      const error = err as WalletError;

      try {
        error.metadata = await this.getErrorMetadata(
          contractWithSigner,
          action,
          params,
          block,
          options
        );
      } catch (metaErr) {
        console.error('Failed to set error metadata', metaErr);
      }

      return Promise.reject(error);
    }
  }

  public async callStatic<T>({
    contractAddress,
    abi,
    action,
    params = [],
    options = {},
  }: SendTransactionOpts): Promise<T> {
    console.log('Sending transaction');
    console.log('Contract', contractAddress);
    console.log('Action', `"${action}"`);
    console.log('Params', params);
    const EthersContract = getEthersContract();
    const contract = new EthersContract(contractAddress, abi, this.signer);
    const contractWithSigner = contract.connect(this.signer);
    return await contractWithSigner.callStatic[action](...params, options);
  }

  private async getErrorMetadata(
    contract: EthersContract,
    action: string,
    params: any,
    block: number,
    overrides: any
  ): Promise<WalletErrorMetadata> {
    let sender, chainId, calldata;
    try {
      sender = await this.signer.getAddress();
      chainId = await this.signer.getChainId();
      calldata = contract.interface.encodeFunctionData(action, params);
    } catch (err) {
      console.error('Threw second error when collecting error metadata: ', err);
    }

    const msgValue = overrides.value ? overrides.value.toString() : 0;

    return {
      simulation: `https://dashboard.tenderly.co/balancer/v2/simulator/new?rawFunctionInput=${calldata}&block=${block}&blockIndex=0&from=${sender}&gas=8000000&gasPrice=0&value=${msgValue}&contractAddress=${contract.address}&network=${chainId}`,
      sender,
      action,
      block,
      chainId,
      ethValue: msgValue,
      params: JSON.stringify(params),
    };
  }
}
