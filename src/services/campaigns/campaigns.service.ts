import { call } from '@/lib/utils/balancer/contract';
import { walletService as walletServiceInstance } from '@/services/web3/wallet.service';
import { default as SimpleMinterAbi } from '@/lib/abi/KolektivoSimpleMinter.json';
import { default as RFNFTAbi } from '@/lib/abi/KolektivoRNFT.json';
import { getRpcProviderService } from '@/dependencies/rpc-provider.service';
import { Network } from '@/lib/config/types';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { ipfsService } from '../ipfs/ipfs.service';
import { configService } from '../config/config.service';
import { Address } from '@kolektivo-labs/sdk';

type Attributes = {
  trait_type: string;
  value: string;
};

export type RFNFTData = {
  attributes: Attributes[];
  description: string;
  image: string;
  name: string;
};

export default class CampaignsService {
  private addresses;
  constructor(private readonly walletService = walletServiceInstance) {
    this.addresses = configService.network.addresses;
  }

  public async getCurrentAllocation(userAddress?: Address) {
    const provider = getRpcProviderService().getJsonProvider(Network.ALFAJORES);
    if (!userAddress) return 0;
    const currentUserAddress = await this.walletService.getUserAddress();
    if (!currentUserAddress) return 0;
    if (this.addresses.simpleMinter) {
      const currentAllocation = await call(provider, SimpleMinterAbi, [
        this.addresses.simpleMinter,
        'allocations',
        [userAddress],
      ]);
      if (currentAllocation) {
        return formatUnits(BigNumber.from(currentAllocation), 18);
      }
      return 0;
    }
  }

  public async getCurrentNFT(userAddress?: Address) {
    const provider = getRpcProviderService().getJsonProvider(Network.ALFAJORES);
    if (this.addresses.RFNFT) {
      const currentNFTId = await call(provider, RFNFTAbi, [
        this.addresses.RFNFT,
        'ownerTokenId',
        [userAddress],
      ]);
      const currentNFTTier = await call(provider, RFNFTAbi, [
        this.addresses.RFNFT,
        'tokenIdTier',
        [currentNFTId],
      ]);
      const currentNFTPoints = await this.getCurrentPoints(currentNFTId);
      const currentNFT = await call(provider, RFNFTAbi, [
        this.addresses.RFNFT,
        'tokenURI',
        [BigNumber.from(currentNFTId).toNumber()],
      ]);
      const NFTData: RFNFTData = await ipfsService.get(
        currentNFT.split('ipfs://')[1]
      );
      return {
        ...NFTData,
        id: Number(currentNFTTier),
        points: currentNFTPoints,
      };
    }
    return null;
  }

  public async mintNFT() {
    const currentUserAddress = await this.walletService.getUserAddress();
    return await this.walletService.txBuilder.contract.sendTransaction({
      contractAddress: this.addresses.RFNFT,
      abi: RFNFTAbi,
      action: 'mint',
      params: [currentUserAddress],
    });
  }

  public async claimAllocantions() {
    const currentUserAddress = await this.walletService.getUserAddress();
    return this.walletService.txBuilder.contract.sendTransaction({
      contractAddress: this.addresses.simpleMinter,
      abi: SimpleMinterAbi,
      action: 'claim',
      params: [currentUserAddress],
    });
  }

  public async getCurrentPoints(id: number) {
    const currentRFP =
      await this.walletService.txBuilder.contract.sendTransaction({
        contractAddress: this.addresses.RFNFT,
        abi: RFNFTAbi,
        action: 'tokenIdPoints',
        params: [id],
      });

    const formatedCurrentRFP = formatUnits(BigNumber.from(currentRFP), 18);
    return parseInt(formatedCurrentRFP);
  }
}

export const campaignsService = new CampaignsService();
