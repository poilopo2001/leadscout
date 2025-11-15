/**
 * Unit tests for commission calculation functions
 */

import {
  calculateCommission,
  calculateBatchEarnings,
  calculatePlatformRevenue,
  formatCurrency,
  calculateEarningsRange,
  canProcessPayout,
  calculateStripeFee,
  calculateNetRevenue,
} from '../../../convex/lib/calculateCommission';

describe('calculateCommission', () => {
  beforeEach(() => {
    process.env.PLATFORM_COMMISSION_RATE = '0.5';
    process.env.PAYOUT_MINIMUM_THRESHOLD = '20';
  });

  describe('calculateCommission', () => {
    it('should split 30 euro lead 50/50', () => {
      const breakdown = calculateCommission(30);

      expect(breakdown.salePrice).toBe(30);
      expect(breakdown.scoutEarning).toBe(15);
      expect(breakdown.platformCommission).toBe(15);
      expect(breakdown.commissionRate).toBe(0.5);
    });

    it('should split 25 euro lead 50/50', () => {
      const breakdown = calculateCommission(25);

      expect(breakdown.salePrice).toBe(25);
      expect(breakdown.scoutEarning).toBe(12.5);
      expect(breakdown.platformCommission).toBe(12.5);
    });

    it('should handle custom commission rate', () => {
      process.env.PLATFORM_COMMISSION_RATE = '0.6';

      const breakdown = calculateCommission(30);

      expect(breakdown.scoutEarning).toBe(18); // 60% to scout
      expect(breakdown.platformCommission).toBe(12); // 40% to platform
      expect(breakdown.commissionRate).toBe(0.6);
    });

    it('should round to 2 decimal places', () => {
      const breakdown = calculateCommission(33.33);

      const scoutDecimals = (breakdown.scoutEarning.toString().split('.')[1] || '').length;
      const platformDecimals = (breakdown.platformCommission.toString().split('.')[1] || '').length;

      expect(scoutDecimals).toBeLessThanOrEqual(2);
      expect(platformDecimals).toBeLessThanOrEqual(2);
    });

    it('should maintain total when split', () => {
      const breakdown = calculateCommission(50);

      const total = breakdown.scoutEarning + breakdown.platformCommission;
      expect(total).toBeCloseTo(50, 2);
    });
  });

  describe('calculateBatchEarnings', () => {
    it('should sum earnings for multiple sales', () => {
      const sales = [30, 25, 30];
      const totalEarnings = calculateBatchEarnings(sales);

      // 15 + 12.5 + 15 = 42.5
      expect(totalEarnings).toBe(42.5);
    });

    it('should handle single sale', () => {
      const totalEarnings = calculateBatchEarnings([30]);
      expect(totalEarnings).toBe(15);
    });

    it('should handle empty array', () => {
      const totalEarnings = calculateBatchEarnings([]);
      expect(totalEarnings).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      const sales = [33.33, 44.44, 55.55];
      const totalEarnings = calculateBatchEarnings(sales);

      const decimals = (totalEarnings.toString().split('.')[1] || '').length;
      expect(decimals).toBeLessThanOrEqual(2);
    });
  });

  describe('calculatePlatformRevenue', () => {
    it('should calculate total platform commission', () => {
      const sales = [30, 25, 30];
      const revenue = calculatePlatformRevenue(sales);

      // 15 + 12.5 + 15 = 42.5
      expect(revenue).toBe(42.5);
    });

    it('should match batch earnings (50/50 split)', () => {
      const sales = [30, 25, 30];
      const scoutEarnings = calculateBatchEarnings(sales);
      const platformRevenue = calculatePlatformRevenue(sales);

      expect(scoutEarnings).toBe(platformRevenue);
    });
  });

  describe('formatCurrency', () => {
    it('should format euros with Luxembourg locale', () => {
      const formatted = formatCurrency(1245.50);

      expect(formatted).toContain('€');
      expect(formatted).toContain('1');
      expect(formatted).toContain('245');
      expect(formatted).toContain('50');
    });

    it('should handle whole numbers', () => {
      const formatted = formatCurrency(1000);

      expect(formatted).toContain('€');
      expect(formatted).toContain('1');
      expect(formatted).toContain('000');
    });

    it('should handle zero', () => {
      const formatted = formatCurrency(0);

      expect(formatted).toContain('€');
      expect(formatted).toContain('0');
    });

    it('should handle negative amounts', () => {
      const formatted = formatCurrency(-50);

      expect(formatted).toContain('€');
      expect(formatted).toContain('50');
    });
  });

  describe('calculateEarningsRange', () => {
    beforeEach(() => {
      process.env.LEAD_PRICE_IT = '30';
      process.env.LEAD_PRICE_MARKETING = '25';
    });

    it('should return earning range for IT Services', () => {
      const range = calculateEarningsRange('IT Services');

      expect(range.min).toBe(15);
      expect(range.max).toBe(15);
    });

    it('should return earning range for Marketing', () => {
      const range = calculateEarningsRange('Marketing');

      expect(range.min).toBe(12.5);
      expect(range.max).toBe(12.5);
    });
  });

  describe('canProcessPayout', () => {
    it('should return true for amount >= threshold', () => {
      expect(canProcessPayout(20)).toBe(true);
      expect(canProcessPayout(25)).toBe(true);
      expect(canProcessPayout(100)).toBe(true);
    });

    it('should return false for amount < threshold', () => {
      expect(canProcessPayout(19.99)).toBe(false);
      expect(canProcessPayout(15)).toBe(false);
      expect(canProcessPayout(0)).toBe(false);
    });

    it('should use custom threshold from environment', () => {
      process.env.PAYOUT_MINIMUM_THRESHOLD = '50';

      expect(canProcessPayout(50)).toBe(true);
      expect(canProcessPayout(49.99)).toBe(false);
    });
  });

  describe('calculateStripeFee', () => {
    it('should calculate fee for 30 euro transaction', () => {
      const fee = calculateStripeFee(30);

      // 30 * 0.029 + 0.30 = 0.87 + 0.30 = 1.17
      expect(fee).toBeCloseTo(1.17, 2);
    });

    it('should calculate fee for 100 euro transaction', () => {
      const fee = calculateStripeFee(100);

      // 100 * 0.029 + 0.30 = 2.9 + 0.30 = 3.20
      expect(fee).toBeCloseTo(3.20, 2);
    });

    it('should calculate fee for small transaction', () => {
      const fee = calculateStripeFee(10);

      // 10 * 0.029 + 0.30 = 0.29 + 0.30 = 0.59
      expect(fee).toBeCloseTo(0.59, 2);
    });

    it('should round to 2 decimal places', () => {
      const fee = calculateStripeFee(33.33);

      const decimals = (fee.toString().split('.')[1] || '').length;
      expect(decimals).toBeLessThanOrEqual(2);
    });
  });

  describe('calculateNetRevenue', () => {
    it('should calculate net revenue after Stripe fees', () => {
      const net = calculateNetRevenue(30);

      expect(net.grossRevenue).toBe(15); // Platform's 50%
      expect(net.stripeFee).toBeCloseTo(1.17, 2); // Stripe fee
      expect(net.netRevenue).toBeCloseTo(13.83, 2); // 15 - 1.17
    });

    it('should show Stripe fees eat into platform revenue', () => {
      const net = calculateNetRevenue(30);

      // Platform keeps less than 50% after Stripe fees
      expect(net.netRevenue).toBeLessThan(net.grossRevenue);
    });

    it('should calculate correctly for larger transaction', () => {
      const net = calculateNetRevenue(100);

      expect(net.grossRevenue).toBe(50);
      expect(net.stripeFee).toBeCloseTo(3.20, 2);
      expect(net.netRevenue).toBeCloseTo(46.80, 2);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero sale price', () => {
      const breakdown = calculateCommission(0);

      expect(breakdown.salePrice).toBe(0);
      expect(breakdown.scoutEarning).toBe(0);
      expect(breakdown.platformCommission).toBe(0);
    });

    it('should handle very large sale price', () => {
      const breakdown = calculateCommission(10000);

      expect(breakdown.scoutEarning).toBe(5000);
      expect(breakdown.platformCommission).toBe(5000);
    });

    it('should handle decimal sale prices', () => {
      const breakdown = calculateCommission(27.99);

      expect(breakdown.scoutEarning + breakdown.platformCommission).toBeCloseTo(27.99, 2);
    });

    it('should handle missing environment variables', () => {
      delete process.env.PLATFORM_COMMISSION_RATE;

      const breakdown = calculateCommission(30);

      // Should use default rate
      expect(breakdown.commissionRate).toBeGreaterThan(0);
      expect(breakdown.scoutEarning).toBeGreaterThan(0);
    });
  });
});
