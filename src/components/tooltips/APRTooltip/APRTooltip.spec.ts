import { AprBreakdown } from '@regenerative/sdk';
import { EmptyPoolMock } from '@/__mocks__/pool';

import APRTooltip from './APRTooltip.vue';
import { Pool } from '@/services/pool/types';
import { configService } from '@/services/config/config.service';
import { POOLS } from '@/constants/pools';
import { renderComponent } from '@tests/renderComponent';

vi.mock('@/providers/tokens.provider');

const EmptyAprBreakdownMock: AprBreakdown = {
  swapFees: 0,
  tokenAprs: {
    total: 0,
    breakdown: {},
  },
  stakingApr: {
    min: 0,
    max: 0,
  },
  rewardAprs: {
    total: 0,
    breakdown: {},
  },
  protocolApr: 0,
  min: 0,
  max: 0,
};

describe('APRTooltip', () => {
  describe('Swap Fees', () => {
    it('Should render a single swap fee value for pools without staking', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        swapFees: 1522,
        min: 1522,
        max: 1522,
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: EmptyPoolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr')).toBeTruthy();
      expect(getByTestId('total-apr').textContent).toBe('Total APR15.22%');
      expect(getByTestId('swap-fee-apr')).toBeTruthy();
      expect(getByTestId('swap-fee-apr').textContent).toBe(
        'Swap fees APR 15.22%'
      );
    });
  });

  describe('Protocol APR', () => {
    it('Should show veBAL locking rewards', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        swapFees: 78,
        protocolApr: 117,
        min: 78,
        max: 195,
      };
      const poolMock: Pool = {
        ...EmptyPoolMock,
        id: POOLS.IdsMap?.veBAL || '',
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: poolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe(
        'Total APR0.78% - 1.95%'
      );
      expect(getByTestId('vebal-apr').textContent).toContain(
        'Max locking/veBAL APR1.17%'
      );
    });
  });

  describe('Staking Rewards', () => {
    it('Should render an apr range for a pool with staking', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        stakingApr: {
          min: 44,
          max: 567,
        },
        min: 44,
        max: 567,
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: EmptyPoolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe(
        'Total APR0.44% - 5.67%'
      );
      expect(getByTestId('swap-fee-apr').textContent).toBe(
        'Swap fees APR 0.00%'
      );
      expect(getByTestId('staking-apr').textContent).toContain(
        'Staking APR 0.44% - 5.67%'
      );
      expect(getByTestId('staking-apr').textContent).toContain(
        'Min BAL APR 0.44%'
      );
      expect(getByTestId('staking-apr').textContent).toContain(
        'Max BAL APR 5.67%'
      );
    });

    it('Should show swap fees and staking rewards', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        swapFees: 223,
        stakingApr: {
          min: 48,
          max: 555,
        },
        min: 271,
        max: 778,
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: EmptyPoolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe(
        'Total APR2.71% - 7.78%'
      );
      expect(getByTestId('swap-fee-apr').textContent).toBe(
        'Swap fees APR 2.23%'
      );
      expect(getByTestId('staking-apr').textContent).toContain(
        'Staking APR 0.48% - 5.55%'
      );
      expect(getByTestId('staking-apr').textContent).toContain(
        'Min BAL APR 0.48%'
      );
      expect(getByTestId('staking-apr').textContent).toContain(
        'Max BAL APR 5.55%'
      );
    });

    it('Should show staking rewards as a single line item if min and max are the same', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        stakingApr: {
          min: 763,
          max: 763,
        },
        protocolApr: 0,
        min: 763,
        max: 763,
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: EmptyPoolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('staking-apr').textContent).toBe('Staking APR 7.63%');
    });
  });

  describe('Token Aprs', () => {
    it('Should show WETH token APRs', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        tokenAprs: {
          total: 166,
          breakdown: {
            [configService.network.tokens.Addresses.WETH || '']: 166,
          },
        },
        min: 166,
        max: 166,
      };
      const poolMock: Pool = {
        ...EmptyPoolMock,
        tokensList: [configService.network.tokens.Addresses.WETH || ''],
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: poolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toContain('Total APR1.66%');
      expect(getByTestId('yield-apr').textContent).toContain('WETH APR 1.66%');
    });

    it('Should show multiple token APRs with a generic header', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        swapFees: 48,
        tokenAprs: {
          total: 254,
          breakdown: {
            '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0': 118,
            '0xac3E018457B222d93114458476f3E3416Abbe38F': 104,
            '0xae78736Cd615f374D3085123A210448E74Fc6393': 32,
          },
        },
        min: 102,
        max: 102,
      };
      const poolMock: Pool = {
        ...EmptyPoolMock,
        tokensList: [configService.network.tokens.Addresses.rETH || ''],
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: poolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe('Total APR1.02%');
      const yieldAprBreakdown = getByTestId('yield-apr');
      expect(yieldAprBreakdown.textContent).toContain('Boosted APR 2.54%');
      expect(yieldAprBreakdown.textContent).toContain('wstETH APR 1.18%');
      expect(yieldAprBreakdown.textContent).toContain('sfrxETH APR 1.04%');
      expect(yieldAprBreakdown.textContent).toContain('rETH APR 0.32%');
    });

    it('Should show a breakdown of a boosted pools linear pool APRs and staking rewards', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        swapFees: 14,
        tokenAprs: {
          total: 131,
          breakdown: {
            '0x2F4eb100552ef93840d5aDC30560E5513DFfFACb': 115,
            '0x82698aeCc9E28e9Bb27608Bd52cF57f704BD1B83': 4,
            '0xae37D54Ae477268B9997d4161B96b8200755935c': 12,
          },
        },
        stakingApr: {
          min: 30,
          max: 75,
        },
        min: 175,
        max: 220,
      };
      const poolMock: Pool = {
        ...EmptyPoolMock,
        id: '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f',
        tokensList: [
          '0x2F4eb100552ef93840d5aDC30560E5513DFfFACb',
          '0x82698aeCc9E28e9Bb27608Bd52cF57f704BD1B83',
          '0xae37D54Ae477268B9997d4161B96b8200755935c',
        ],
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: poolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe(
        'Total APR1.75% - 2.20%'
      );
      const yieldAprBreakdown = getByTestId('yield-apr');
      expect(yieldAprBreakdown.textContent).toContain('Boosted APR 1.31%');
      expect(yieldAprBreakdown.textContent).toContain('bb-a-USDT APR 1.15%');
      expect(yieldAprBreakdown.textContent).toContain('bb-a-USDC APR 0.04%');
      expect(yieldAprBreakdown.textContent).toContain('bb-a-DAI APR 0.12%');
      expect(getByTestId('staking-apr').textContent).toContain(
        'Staking APR 0.30% - 0.75%'
      );
      expect(getByTestId('staking-apr').textContent).toContain(
        'Min BAL APR 0.30%'
      );
      expect(getByTestId('staking-apr').textContent).toContain(
        'Max BAL APR 0.75%'
      );
    });

    it('Should show boosted staking rewards as a line item for pools that contain a boosted pool', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        tokenAprs: {
          total: 28,
          breakdown: {
            '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd': 28,
          },
        },
        stakingApr: {
          min: 567,
          max: 1418,
        },
        min: 595,
        max: 1446,
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: EmptyPoolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe(
        'Total APR5.95% - 14.46%'
      );
      expect(getByTestId('yield-apr').textContent).toContain(
        'Boosted APR 0.28%'
      );
      expect(getByTestId('staking-apr').textContent).toContain(
        'Staking APR 5.67% - 14.18%'
      );
      expect(getByTestId('staking-apr').textContent).toContain(
        'Min BAL APR 5.67%'
      );
      expect(getByTestId('staking-apr').textContent).toContain(
        'Max BAL APR 14.18%'
      );
    });

    it('Should show veBAL staking rewards as a line item for pools that contain the 80/20 veBAL pool', () => {
      const veBalPoolAddress = POOLS.IdsMap?.veBAL?.slice(0, 42) || '';
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        tokenAprs: {
          total: 17,
          breakdown: {
            [veBalPoolAddress]: 17,
          },
        },
        min: 17,
        max: 17,
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: EmptyPoolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe('Total APR0.17%');
      expect(getByTestId('yield-apr').textContent).toContain(
        'Boosted APR 0.17%'
      );
    });
  });

  describe('Staking Reward APRs', () => {
    it('Should show BAL Breakdown + additional staking rewards together', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        stakingApr: {
          min: 44,
          max: 522,
        },
        rewardAprs: {
          total: 123,
          breakdown: {
            '0xc3c7d422809852031b44ab29eec9f1eff2a58756': 123,
          },
        },
        min: 167,
        max: 645,
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: EmptyPoolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe(
        'Total APR1.67% - 6.45%'
      );
      expect(getByTestId('swap-fee-apr').textContent).toBe(
        'Swap fees APR 0.00%'
      );
      expect(getByTestId('staking-apr').textContent).toContain(
        'Staking APR 1.67% - 6.45%'
      );
      expect(getByTestId('staking-apr').textContent).toContain(
        'Min BAL APR 0.44%'
      );
      expect(getByTestId('staking-apr').textContent).toContain(
        'Max BAL APR 5.22%'
      );
      expect(getByTestId('staking-apr').textContent).toContain(
        'Rewards APR 1.23%'
      );
    });

    it('Should show BAL + staking rewards as line items if staking APR is the same but there are rewards', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        stakingApr: {
          min: 763,
          max: 763,
        },
        rewardAprs: {
          total: 288,
          breakdown: {
            '0xc3c7d422809852031b44ab29eec9f1eff2a58756': 288,
          },
        },
        min: 1051,
        max: 1051,
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: EmptyPoolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('staking-apr').textContent).toContain(
        'Staking APR 10.51%'
      );
      expect(getByTestId('staking-apr').textContent).toContain('BAL APR 7.63%');
      expect(getByTestId('staking-apr').textContent).toContain(
        'Rewards APR 2.88%'
      );
    });
  });
});
