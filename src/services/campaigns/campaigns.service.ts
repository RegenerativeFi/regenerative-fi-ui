import { call } from '@/lib/utils/balancer/contract';
import { walletService as walletServiceInstance } from '@/services/web3/wallet.service';
import { default as SimpleMinterAbi } from '@/lib/abi/KolectivoSimpleMinter.json';
import { getRpcProviderService } from '@/dependencies/rpc-provider.service';
import { Network } from '@/lib/config/types';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { networkId } from '@/composables/useNetwork';

export default class CampaignsService {
  constructor(private readonly walletService = walletServiceInstance) {}

  public async getCurrentAllocation() {
    const provider = getRpcProviderService().getJsonProvider(Network.ALFAJORES);
    const currentUserAddress = await this.walletService.getUserAddress();
    console.debug(currentUserAddress);
    if (networkId.value === Network.ALFAJORES) {
      const currentAllocation = await call(provider, SimpleMinterAbi, [
        '0xEc9EC0e51DBfA5aB969d91313C64f7eEF0348272',
        'allocations',
        [currentUserAddress],
      ]);
      return formatUnits(BigNumber.from(currentAllocation), 18);
    }
  }
}

export const campaignsService = new CampaignsService();
