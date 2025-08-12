import { Goals, trackGoal } from '@/composables/useFathom';
import {
  verifyNetwork,
  verifyTransactionSender,
} from '@/providers/wallet.provider';
import { WalletError, WalletErrorMetadata } from '@/types';
import {
  JsonRpcSigner,
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/providers';
import { TransactionConcern } from './transaction.concern';
import {
  getDivviSuffix,
  reportOnchainReferral,
} from '@/services/referral/referral';

export class RawConcern extends TransactionConcern {
  constructor(private readonly signer: JsonRpcSigner) {
    super();
  }

  public async sendTransaction(
    options: TransactionRequest
  ): Promise<TransactionResponse> {
    console.log('sendTransaction', options);

    try {
      const gasSettings = await this.gas.settings(this.signer, options);

      //HERE
      const divviSuffix = getDivviSuffix(this.signer._address as `0x${string}`);
      options.data = `${options.data}${divviSuffix}`;
      const txOptions = { ...options, ...gasSettings };

      await Promise.all([
        verifyTransactionSender(this.signer),
        verifyNetwork(this.signer),
      ]);

      trackGoal(Goals.RawTransactionSubmitted);
      const result = await this.signer.sendTransaction(txOptions);
      reportOnchainReferral(result.hash, await this.signer.getChainId());
      return result;
    } catch (err) {
      const error = err as WalletError;
      try {
        error.metadata = await this.getErrorMetadata(options);
      } catch (metaErr) {
        console.error('Failed to set error metadata', metaErr);
      }

      return Promise.reject(error);
    }
  }

  public async call(options: TransactionRequest): Promise<string> {
    const gasSettings = await this.gas.settings(this.signer, options);
    options = { ...options, ...gasSettings };

    return await this.signer.call(options);
  }

  private async getErrorMetadata(
    options: TransactionRequest
  ): Promise<WalletErrorMetadata> {
    const sender = await this.signer.getAddress();
    const chainId = await this.signer.getChainId();
    const block = await this.signer.provider.getBlockNumber();
    const msgValue = options.value ? options.value.toString() : 0;

    return {
      simulation: `https://dashboard.tenderly.co/balancer/v2/simulator/new?contractAddress=${options.to}&rawFunctionInput=${options.data}&block=${block}&blockIndex=0&from=${sender}&gas=8000000&gasPrice=0&value=${msgValue}&network=${chainId}`,
      sender,
      block,
      chainId,
      ethValue: msgValue,
      options,
    };
  }
}
