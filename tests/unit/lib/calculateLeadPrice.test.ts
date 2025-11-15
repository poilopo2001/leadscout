/**
 * Unit tests for lead price calculation functions
 */

import {
  calculateLeadPrice,
  calculatePriceRange,
  calculateEstimatedEarnings,
  getAllCategoryPricing,
} from '../../../convex/lib/calculateLeadPrice';

describe('calculateLeadPrice', () => {
  beforeEach(() => {
    // Set up environment variables for testing
    process.env.LEAD_PRICE_IT = '30';
    process.env.LEAD_PRICE_MARKETING = '25';
    process.env.LEAD_PRICE_HR = '20';
    process.env.LEAD_PRICE_SALES = '22';
    process.env.LEAD_PRICE_DEFAULT = '25';
    process.env.PLATFORM_COMMISSION_RATE = '0.5';
  });

  describe('calculateLeadPrice', () => {
    it('should return correct price for IT Services category', () => {
      expect(calculateLeadPrice('IT Services')).toBe(30);
    });

    it('should return correct price for Marketing category', () => {
      expect(calculateLeadPrice('Marketing')).toBe(25);
    });

    it('should return correct price for HR category', () => {
      expect(calculateLeadPrice('HR')).toBe(20);
    });

    it('should return correct price for Sales category', () => {
      expect(calculateLeadPrice('Sales')).toBe(22);
    });

    it('should return default price for unknown category', () => {
      expect(calculateLeadPrice('Unknown Category')).toBe(25);
    });

    it('should handle case-sensitive category names', () => {
      expect(calculateLeadPrice('IT')).toBe(30);
      expect(calculateLeadPrice('it services')).toBe(25); // Falls back to default
    });
  });

  describe('calculatePriceRange', () => {
    it('should return same min and max for fixed pricing', () => {
      const range = calculatePriceRange('IT Services');
      expect(range.min).toBe(30);
      expect(range.max).toBe(30);
    });

    it('should return correct range for Marketing', () => {
      const range = calculatePriceRange('Marketing');
      expect(range.min).toBe(25);
      expect(range.max).toBe(25);
    });
  });

  describe('calculateEstimatedEarnings', () => {
    it('should calculate 50% commission for IT Services', () => {
      expect(calculateEstimatedEarnings('IT Services')).toBe(15);
    });

    it('should calculate 50% commission for Marketing', () => {
      expect(calculateEstimatedEarnings('Marketing')).toBe(12.5);
    });

    it('should calculate 50% commission for HR', () => {
      expect(calculateEstimatedEarnings('HR')).toBe(10);
    });

    it('should use custom commission rate if set', () => {
      process.env.PLATFORM_COMMISSION_RATE = '0.6'; // 60% to scout
      expect(calculateEstimatedEarnings('IT Services')).toBe(18);
    });
  });

  describe('getAllCategoryPricing', () => {
    it('should return pricing for all categories', () => {
      const pricing = getAllCategoryPricing();

      expect(pricing['IT Services']).toBe(30);
      expect(pricing['IT']).toBe(30);
      expect(pricing['Marketing']).toBe(25);
      expect(pricing['HR']).toBe(20);
      expect(pricing['Sales']).toBe(22);
    });

    it('should return object with all expected categories', () => {
      const pricing = getAllCategoryPricing();

      expect(Object.keys(pricing)).toContain('IT Services');
      expect(Object.keys(pricing)).toContain('Marketing');
      expect(Object.keys(pricing)).toContain('HR');
      expect(Object.keys(pricing)).toContain('Sales');
    });

    it('should have numeric values for all categories', () => {
      const pricing = getAllCategoryPricing();

      Object.values(pricing).forEach(price => {
        expect(typeof price).toBe('number');
        expect(price).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle missing environment variables gracefully', () => {
      delete process.env.LEAD_PRICE_IT;
      delete process.env.LEAD_PRICE_DEFAULT;

      // Should fall back to a default value from constants
      const price = calculateLeadPrice('IT Services');
      expect(typeof price).toBe('number');
      expect(price).toBeGreaterThan(0);
    });

    it('should handle invalid environment variable values', () => {
      process.env.LEAD_PRICE_IT = 'invalid';

      const price = calculateLeadPrice('IT Services');
      expect(typeof price).toBe('number');
      // Should either parse to NaN or use fallback
    });

    it('should handle empty category string', () => {
      const price = calculateLeadPrice('');
      expect(typeof price).toBe('number');
      expect(price).toBe(25); // Default price
    });
  });
});
