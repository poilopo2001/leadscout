/**
 * Lead Quality Score Calculator
 *
 * Calculates quality scores for leads based on multiple factors:
 * - Description length and detail
 * - Contact information completeness
 * - Budget estimation
 * - Photo/attachment count
 * - Scout reputation
 *
 * Score range: 0-10
 */

import { getMinDescriptionLength } from "./constants";

/**
 * Quality factors for a lead
 */
export interface LeadQualityFactors {
  descriptionLength: number;  // Length of description in characters
  hasContactEmail: boolean;   // Email provided
  hasContactPhone: boolean;   // Phone provided
  hasWebsite: boolean;        // Company website provided
  hasBudget: boolean;         // Budget estimate provided
  photoCount: number;         // Number of photos/attachments
  scoutReputation: number;    // Scout's quality score (0-10)
}

/**
 * Calculated quality breakdown (0-100 for each factor)
 */
export interface QualityBreakdown {
  descriptionLength: number;    // 0-100 based on description detail
  contactCompleteness: number;  // 0-100 based on contact info provided
  budgetAccuracy: number;       // 0-100 based on budget estimation
  photoCount: number;           // 0-100 based on attachments
  scoutReputation: number;      // 0-100 from scout's historical quality
}

/**
 * Calculate overall quality score for a lead
 *
 * @param factors - Lead quality factors
 * @returns Quality score (0-10)
 *
 * @example
 * calculateLeadQuality({
 *   descriptionLength: 250,
 *   hasContactEmail: true,
 *   hasContactPhone: true,
 *   hasWebsite: true,
 *   hasBudget: true,
 *   photoCount: 2,
 *   scoutReputation: 8.0
 * }) // Returns ~8.5
 */
export function calculateLeadQuality(factors: LeadQualityFactors): number {
  const breakdown = calculateQualityBreakdown(factors);

  // Weighted average of all factors
  const weights = {
    description: 0.25,      // 25% - Description detail
    contact: 0.20,          // 20% - Contact completeness
    budget: 0.15,           // 15% - Budget estimation
    photos: 0.10,           // 10% - Visual evidence
    scoutReputation: 0.30,  // 30% - Scout's track record
  };

  const weightedScore =
    breakdown.descriptionLength * weights.description +
    breakdown.contactCompleteness * weights.contact +
    breakdown.budgetAccuracy * weights.budget +
    breakdown.photoCount * weights.photos +
    breakdown.scoutReputation * weights.scoutReputation;

  // Convert from 0-100 to 0-10 scale
  return Math.round(weightedScore / 10) / 10; // Round to 1 decimal
}

/**
 * Calculate detailed quality breakdown for display
 *
 * @param factors - Lead quality factors
 * @returns Breakdown scores (0-100 for each)
 *
 * @example
 * calculateQualityBreakdown(factors)
 * // {
 * //   descriptionLength: 85,
 * //   contactCompleteness: 100,
 * //   budgetAccuracy: 100,
 * //   photoCount: 40,
 * //   scoutReputation: 80
 * // }
 */
export function calculateQualityBreakdown(
  factors: LeadQualityFactors
): QualityBreakdown {
  return {
    descriptionLength: calculateDescriptionScore(factors.descriptionLength),
    contactCompleteness: calculateContactScore(factors),
    budgetAccuracy: factors.hasBudget ? 100 : 0,
    photoCount: calculatePhotoScore(factors.photoCount),
    scoutReputation: factors.scoutReputation * 10, // Convert 0-10 to 0-100
  };
}

/**
 * Calculate description quality score
 * Based on length - longer, more detailed descriptions score higher
 *
 * @param length - Description length in characters
 * @returns Score 0-100
 */
function calculateDescriptionScore(length: number): number {
  const minLength = getMinDescriptionLength(); // Default: 100 chars
  const excellentLength = 500; // Target for high quality

  if (length < minLength) {
    // Below minimum = low score
    return Math.min(50, (length / minLength) * 50);
  } else if (length >= excellentLength) {
    // Excellent length = max score
    return 100;
  } else {
    // Linear scale between minimum and excellent
    const progress = (length - minLength) / (excellentLength - minLength);
    return 50 + progress * 50;
  }
}

/**
 * Calculate contact information completeness score
 * More complete contact info = higher score
 *
 * @param factors - Lead factors
 * @returns Score 0-100
 */
function calculateContactScore(factors: LeadQualityFactors): number {
  let score = 0;

  // Each piece of contact info is worth points
  if (factors.hasContactEmail) score += 40; // Email is most important
  if (factors.hasContactPhone) score += 30; // Phone is valuable
  if (factors.hasWebsite) score += 30;      // Website adds credibility

  return score;
}

/**
 * Calculate photo/attachment score
 * More visual evidence = higher score
 *
 * @param photoCount - Number of photos/attachments
 * @returns Score 0-100
 */
function calculatePhotoScore(photoCount: number): number {
  if (photoCount === 0) return 0;
  if (photoCount === 1) return 30;
  if (photoCount === 2) return 60;
  if (photoCount >= 3) return 100;
  return 0;
}

/**
 * Get quality score display label
 * Converts numeric score to human-readable label
 *
 * @param score - Quality score (0-10)
 * @returns Label string
 *
 * @example
 * getQualityLabel(8.5) // "Excellent"
 * getQualityLabel(6.0) // "Good"
 * getQualityLabel(3.5) // "Fair"
 */
export function getQualityLabel(score: number): string {
  if (score >= 8.0) return "Excellent";
  if (score >= 6.5) return "Very Good";
  if (score >= 5.0) return "Good";
  if (score >= 3.5) return "Fair";
  return "Needs Improvement";
}

/**
 * Get quality score color for UI display
 *
 * @param score - Quality score (0-10)
 * @returns Tailwind color class
 *
 * @example
 * getQualityColor(8.5) // "green"
 * getQualityColor(6.0) // "blue"
 * getQualityColor(3.5) // "yellow"
 */
export function getQualityColor(score: number): string {
  if (score >= 8.0) return "green";   // Excellent
  if (score >= 6.5) return "blue";    // Very Good
  if (score >= 5.0) return "teal";    // Good
  if (score >= 3.5) return "yellow";  // Fair
  return "red";                        // Needs Improvement
}

/**
 * Validate if lead meets minimum quality threshold for approval
 * Admin helper to quickly assess if lead should be approved
 *
 * @param score - Quality score (0-10)
 * @returns true if meets threshold
 *
 * @example
 * meetsQualityThreshold(7.5) // true
 * meetsQualityThreshold(4.0) // false
 */
export function meetsQualityThreshold(score: number): boolean {
  const minimumScore = parseFloat(
    process.env.MINIMUM_QUALITY_THRESHOLD ?? "5.0"
  );
  return score >= minimumScore;
}
