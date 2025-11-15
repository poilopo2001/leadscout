/**
 * Unit tests for lead quality score calculation
 */

import {
  calculateLeadQuality,
  calculateQualityBreakdown,
  getQualityLabel,
  getQualityColor,
  meetsQualityThreshold,
  type LeadQualityFactors,
} from '../../../convex/lib/calculateQualityScore';

describe('calculateQualityScore', () => {
  beforeEach(() => {
    process.env.MIN_DESCRIPTION_LENGTH = '100';
    process.env.MINIMUM_QUALITY_THRESHOLD = '5.0';
  });

  describe('calculateLeadQuality', () => {
    it('should calculate excellent score for high-quality lead', () => {
      const factors: LeadQualityFactors = {
        descriptionLength: 500,
        hasContactEmail: true,
        hasContactPhone: true,
        hasWebsite: true,
        hasBudget: true,
        photoCount: 3,
        scoutReputation: 9.0,
      };

      const score = calculateLeadQuality(factors);
      expect(score).toBeGreaterThan(8.0);
      expect(score).toBeLessThanOrEqual(10.0);
    });

    it('should calculate low score for minimal lead', () => {
      const factors: LeadQualityFactors = {
        descriptionLength: 50,
        hasContactEmail: false,
        hasContactPhone: false,
        hasWebsite: false,
        hasBudget: false,
        photoCount: 0,
        scoutReputation: 5.0,
      };

      const score = calculateLeadQuality(factors);
      expect(score).toBeLessThan(5.0);
    });

    it('should give appropriate score for good lead', () => {
      const factors: LeadQualityFactors = {
        descriptionLength: 250,
        hasContactEmail: true,
        hasContactPhone: true,
        hasWebsite: false,
        hasBudget: true,
        photoCount: 1,
        scoutReputation: 7.5,
      };

      const score = calculateLeadQuality(factors);
      expect(score).toBeGreaterThanOrEqual(6.0);
      expect(score).toBeLessThan(8.0);
    });

    it('should weight scout reputation heavily (30%)', () => {
      const baseFactors: LeadQualityFactors = {
        descriptionLength: 200,
        hasContactEmail: true,
        hasContactPhone: true,
        hasWebsite: true,
        hasBudget: true,
        photoCount: 2,
        scoutReputation: 5.0,
      };

      const lowReputationScore = calculateLeadQuality(baseFactors);

      const highReputationScore = calculateLeadQuality({
        ...baseFactors,
        scoutReputation: 10.0,
      });

      // High reputation should significantly boost score
      expect(highReputationScore - lowReputationScore).toBeGreaterThan(1.0);
    });

    it('should round score to 1 decimal place', () => {
      const factors: LeadQualityFactors = {
        descriptionLength: 234,
        hasContactEmail: true,
        hasContactPhone: false,
        hasWebsite: true,
        hasBudget: true,
        photoCount: 2,
        scoutReputation: 7.3,
      };

      const score = calculateLeadQuality(factors);
      const decimals = (score.toString().split('.')[1] || '').length;
      expect(decimals).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateQualityBreakdown', () => {
    it('should return breakdown for all factors', () => {
      const factors: LeadQualityFactors = {
        descriptionLength: 250,
        hasContactEmail: true,
        hasContactPhone: true,
        hasWebsite: true,
        hasBudget: true,
        photoCount: 2,
        scoutReputation: 8.0,
      };

      const breakdown = calculateQualityBreakdown(factors);

      expect(breakdown.descriptionLength).toBeGreaterThan(0);
      expect(breakdown.contactCompleteness).toBeGreaterThan(0);
      expect(breakdown.budgetAccuracy).toBe(100);
      expect(breakdown.photoCount).toBeGreaterThan(0);
      expect(breakdown.scoutReputation).toBe(80); // 8.0 * 10
    });

    it('should score description length correctly', () => {
      // Minimum length (100 chars) should give ~50 score
      const minFactors: LeadQualityFactors = {
        descriptionLength: 100,
        hasContactEmail: false,
        hasContactPhone: false,
        hasWebsite: false,
        hasBudget: false,
        photoCount: 0,
        scoutReputation: 0,
      };

      const minBreakdown = calculateQualityBreakdown(minFactors);
      expect(minBreakdown.descriptionLength).toBeGreaterThanOrEqual(40);
      expect(minBreakdown.descriptionLength).toBeLessThanOrEqual(60);

      // Excellent length (500+ chars) should give 100 score
      const excellentFactors: LeadQualityFactors = {
        ...minFactors,
        descriptionLength: 500,
      };

      const excellentBreakdown = calculateQualityBreakdown(excellentFactors);
      expect(excellentBreakdown.descriptionLength).toBe(100);
    });

    it('should score contact completeness correctly', () => {
      // All contact info = 100
      const completeFactors: LeadQualityFactors = {
        descriptionLength: 0,
        hasContactEmail: true,
        hasContactPhone: true,
        hasWebsite: true,
        hasBudget: false,
        photoCount: 0,
        scoutReputation: 0,
      };

      const completeBreakdown = calculateQualityBreakdown(completeFactors);
      expect(completeBreakdown.contactCompleteness).toBe(100);

      // Only email = 40
      const emailOnlyFactors: LeadQualityFactors = {
        ...completeFactors,
        hasContactEmail: true,
        hasContactPhone: false,
        hasWebsite: false,
      };

      const emailBreakdown = calculateQualityBreakdown(emailOnlyFactors);
      expect(emailBreakdown.contactCompleteness).toBe(40);
    });

    it('should score photos correctly', () => {
      const baseFactors: LeadQualityFactors = {
        descriptionLength: 0,
        hasContactEmail: false,
        hasContactPhone: false,
        hasWebsite: false,
        hasBudget: false,
        photoCount: 0,
        scoutReputation: 0,
      };

      expect(calculateQualityBreakdown({...baseFactors, photoCount: 0}).photoCount).toBe(0);
      expect(calculateQualityBreakdown({...baseFactors, photoCount: 1}).photoCount).toBe(30);
      expect(calculateQualityBreakdown({...baseFactors, photoCount: 2}).photoCount).toBe(60);
      expect(calculateQualityBreakdown({...baseFactors, photoCount: 3}).photoCount).toBe(100);
      expect(calculateQualityBreakdown({...baseFactors, photoCount: 5}).photoCount).toBe(100);
    });

    it('should score budget correctly', () => {
      const withBudget: LeadQualityFactors = {
        descriptionLength: 0,
        hasContactEmail: false,
        hasContactPhone: false,
        hasWebsite: false,
        hasBudget: true,
        photoCount: 0,
        scoutReputation: 0,
      };

      const withoutBudget: LeadQualityFactors = {
        ...withBudget,
        hasBudget: false,
      };

      expect(calculateQualityBreakdown(withBudget).budgetAccuracy).toBe(100);
      expect(calculateQualityBreakdown(withoutBudget).budgetAccuracy).toBe(0);
    });
  });

  describe('getQualityLabel', () => {
    it('should return "Excellent" for score >= 8.0', () => {
      expect(getQualityLabel(8.0)).toBe('Excellent');
      expect(getQualityLabel(9.5)).toBe('Excellent');
      expect(getQualityLabel(10.0)).toBe('Excellent');
    });

    it('should return "Very Good" for score 6.5-7.9', () => {
      expect(getQualityLabel(6.5)).toBe('Very Good');
      expect(getQualityLabel(7.0)).toBe('Very Good');
      expect(getQualityLabel(7.9)).toBe('Very Good');
    });

    it('should return "Good" for score 5.0-6.4', () => {
      expect(getQualityLabel(5.0)).toBe('Good');
      expect(getQualityLabel(5.5)).toBe('Good');
      expect(getQualityLabel(6.4)).toBe('Good');
    });

    it('should return "Fair" for score 3.5-4.9', () => {
      expect(getQualityLabel(3.5)).toBe('Fair');
      expect(getQualityLabel(4.0)).toBe('Fair');
      expect(getQualityLabel(4.9)).toBe('Fair');
    });

    it('should return "Needs Improvement" for score < 3.5', () => {
      expect(getQualityLabel(0.0)).toBe('Needs Improvement');
      expect(getQualityLabel(2.0)).toBe('Needs Improvement');
      expect(getQualityLabel(3.4)).toBe('Needs Improvement');
    });
  });

  describe('getQualityColor', () => {
    it('should return correct colors for each quality tier', () => {
      expect(getQualityColor(8.5)).toBe('green');   // Excellent
      expect(getQualityColor(7.0)).toBe('blue');    // Very Good
      expect(getQualityColor(5.5)).toBe('teal');    // Good
      expect(getQualityColor(4.0)).toBe('yellow');  // Fair
      expect(getQualityColor(2.0)).toBe('red');     // Needs Improvement
    });
  });

  describe('meetsQualityThreshold', () => {
    it('should return true for score >= threshold', () => {
      expect(meetsQualityThreshold(5.0)).toBe(true);
      expect(meetsQualityThreshold(7.5)).toBe(true);
      expect(meetsQualityThreshold(10.0)).toBe(true);
    });

    it('should return false for score < threshold', () => {
      expect(meetsQualityThreshold(4.9)).toBe(false);
      expect(meetsQualityThreshold(3.0)).toBe(false);
      expect(meetsQualityThreshold(0.0)).toBe(false);
    });

    it('should use custom threshold from environment variable', () => {
      process.env.MINIMUM_QUALITY_THRESHOLD = '7.0';

      expect(meetsQualityThreshold(7.0)).toBe(true);
      expect(meetsQualityThreshold(6.9)).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero values for all factors', () => {
      const zeroFactors: LeadQualityFactors = {
        descriptionLength: 0,
        hasContactEmail: false,
        hasContactPhone: false,
        hasWebsite: false,
        hasBudget: false,
        photoCount: 0,
        scoutReputation: 0,
      };

      const score = calculateLeadQuality(zeroFactors);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThan(3);
    });

    it('should handle maximum values for all factors', () => {
      const maxFactors: LeadQualityFactors = {
        descriptionLength: 1000,
        hasContactEmail: true,
        hasContactPhone: true,
        hasWebsite: true,
        hasBudget: true,
        photoCount: 10,
        scoutReputation: 10,
      };

      const score = calculateLeadQuality(maxFactors);
      expect(score).toBeGreaterThan(9.0);
      expect(score).toBeLessThanOrEqual(10.0);
    });

    it('should handle very short descriptions gracefully', () => {
      const shortDesc: LeadQualityFactors = {
        descriptionLength: 1,
        hasContactEmail: true,
        hasContactPhone: true,
        hasWebsite: true,
        hasBudget: true,
        photoCount: 3,
        scoutReputation: 8.0,
      };

      const score = calculateLeadQuality(shortDesc);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(10.0);
    });
  });
});
