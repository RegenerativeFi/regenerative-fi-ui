import config from '@/lib/config';
import { Config } from '@/lib/config/types';
import { Address } from '@/types';

const fs = require('fs');

// type AddressMap = Record<Address, { task: string; name: string }>;
type ContractMap = Record<string, Address>;

async function generate() {
  Object.values(config).forEach(async (config: Config) => {
    if (!config.monorepoName) return;

    const network = 'celoAlfajores';
    console.log(`Generating contract addresses for network ${network}...`);
    const deployments = require(`@regenerative/v2-deployments/dist/addresses/${network}.json`);

    const contracts: ContractMap = {};
    Object.values(deployments).forEach((deployment: any) => {
      deployment.contracts.forEach(
        (contract: { name: string; address: string }) => {
          contracts[contract.name] = contract.address;
        }
      );
    });

    const sortedContracts = Object.fromEntries(
      Object.entries(contracts).sort(([nameA], [nameB]) =>
        nameA.localeCompare(nameB)
      )
    ) as ContractMap;

    fs.writeFileSync(
      `./src/assets/data/contracts/${network}.json`,
      JSON.stringify(sortedContracts, null, 2) + '\n'
    );
  });
}

(async () => {
  try {
    console.log('⏳ Generating contract addresses...');
    await generate();
    console.log(
      '✅ Generated contract addresses at /src/assets/data/contracts/*'
    );
  } catch (error) {
    console.error('Failed to generate contract addresses:', error);
    process.exit(1);
  }
})();
