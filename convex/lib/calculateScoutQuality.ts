/**
 * Scout Quality Score Calculator
 *
 * Calculates scout reputation score based on:
 * - Lead conversion rate (submitted vs sold)
 * - Average lead quality scores
 * - Approval rate (submitted vs approved)
 * - Company feedback ratings
 *
 * Score range: 0-10
 */

import { getQualityScoreWeights, getBadgeThresholds } from "./constants";

/**
 * Scout statistics for quality calculation
 */
export interface ScoutStats {
  totalLeadsSubmitted: number;  // All-time submissions
  totalLeadsApproved: number;   // Approved by admin
  totalLeadsSold: number;       // Purchased by companies
  totalLeadsRejected: number;   // Rejected by admin
  averageLeadQuality: number;   // Average quality score of all leads
  averageFeedbackRating?: number; // Average company feedback (future)
}

/**
 * Scout badge level based on leads sold
 */
export type ScoutBadge = "bronze" | "silver" | "gold" | "platinum";

/**
 * Calculate overall scout quality score
 *
 * Uses weighted formula:
 * - 40% conversion rate (sold / submitted)
 * - 30% approval rate (approved / submitted)
 * - 30% average lead quality
 *
 * Weights are configurable via environment variables.
 *
 * @param stats - Scout statistics
 * @returns Quality score (0-10)
 *
 * @example
 * calculateScoutQuality({
 *   totalLeadsSubmitted: 50,
 *   totalLeadsApproved: 45,
 *   totalLeadsSold: 30,
 *   totalLeadsRejected: 5,
 *   averageLeadQuality: 7.5
 * }) // Returns ~8.2
 */
export function calculateScoutQuality(stats: ScoutStats): number {
  const weights = getQualityScoreWeights();

  // Calculate individual metrics (0-10 scale)
  const conversionScore = calculateConversionScore(stats);
  const approvalScore = calculateApprovalScore(stats);
  const qualityScore = stats.averageLeadQuality;
  const feedbackScore = stats.averageFeedbackRating ?? 5.0; // Default if no feedback

  // Weighted average
  const totalWeight = weights.sold + weights.approval + weights.feedback;
  const weightedScore =
    (conversionScore * weights.sold +
      approvalScore * weights.approval +
      qualityScore * weights.feedback) /
    totalWeight;

  // Round to 1 decimal place
  return Math.round(weightedScore * 10) / 10;
}

/**
 * Calculate conversion rate score
 * Percentage of submitted leads that were purchased
 *
 * @param stats - Scout statistics
 * @returns Score 0-10
 */
function calculateConversionScore(stats: ScoutStats): number {
  if (stats.totalLeadsSubmitted === 0) return 0;

  const conversionRate = stats.totalLeadsSold / stats.totalLeadsSubmitted;

  // Convert percentage to 0-10 scale
  // 60% conversion = 10/10 (excellent)
  // 30% conversion = 5/10 (average)
  // 0% conversion = 0/10
  const targetConversion = 0.6; // 60% is considered excellent
  const score = (conversionRate / targetConversion) * 10;

  return Math.min(10, score); // Cap at 10
}

/**
 * Calculate approval rate score
 * Percentage of submitted leads that were approved by admin
 *
 * @param stats - Scout statistics
 * @returns Score 0-10
 */
function calculateApprovalScore(stats: ScoutStats): number {
  if (stats.totalLeadsSubmitted === 0) return 0;

  const approvalRate = stats.totalLeadsApproved / stats.totalLeadsSubmitted;

  // Convert percentage to 0-10 scale
  // 90% approval = 10/10 (excellent)
  // 70% approval = 7.8/10 (good)
  // 50% approval = 5.6/10 (fair)
  const targetApproval = 0.9; // 90% is considered excellent
  const score = (approvalRate / targetApproval) * 10;

  return Math.min(10, score); // Cap at 10
}

/**
 * Determine scout badge level based on leads sold
 *
 * Badge thresholds are configurable via environment variables:
 * - Bronze: 0-19 sold
 * - Silver: 20-49 sold
 * - Gold: 50-99 sold
 * - Platinum: 100+ sold
 *
 * @param leadsSold - Total leads sold
 * @returns Badge level
 *
 * @example
 * calculateScoutBadge(5)   // "bronze"
 * calculateScoutBadge(25)  // "silver"
 * calculateScoutBadge(75)  // "gold"
 * calculateScoutBadge(150) // "platinum"
 */
export function calculateScoutBadge(leadsSold: number): ScoutBadge {
  const thresholds = getBadgeThresholds();

  if (leadsSold >= thresholds.platinum) return "platinum";
  if (leadsSold >= thresholds.gold) return "gold";
  if (leadsSold >= thresholds.silver) return "silver";
  return "bronze";
}

/**
 * Get badge display information
 *
 * @param badge - Badge level
 * @returns Display name, icon, and color
 *
 * @example
 * getBadgeInfo("gold")
 * // {
 * //   name: "Gold Scout",
 * //   icon: "🥇",
 * //   color: "yellow",
 * //   description: "50-99 leads sold"
 * // }
 */
export function getBadgeInfo(badge: ScoutBadge): {
  name: string;
  icon: string;
  color: string;
  description: string;
} {
  const thresholds = getBadgeThresholds();

  const badges = {
    bronze: {
      name: "Bronze Scout",
      icon: "🥉",
      color: "orange",
      description: `0-${thresholds.silver - 1} leads sold`,
    },
    silver: {
      name: "Silver Scout",
      icon: "🥈",
      color: "gray",
      description: `${thresholds.silver}-${thresholds.gold - 1} leads sold`,
    },
    gold: {
      name: "Gold Scout",
      icon: "🥇",
      color: "yellow",
      description: `${thresholds.gold}-${thresholds.platinum - 1} leads sold`,
    },
    platinum: {
      name: "Platinum Scout",
      icon: "💎",
      color: "purple",
      description: `${thresholds.platinum}+ leads sold`,
    },
  };

  return badges[badge];
}

/**
 * Calculate next badge milestone
 * Shows scouts how many more leads they need to unlock next badge
 *
 * @param currentBadge - Current badge level
 * @param leadsSold - Current leads sold count
 * @returns Next badge info and leads needed
 *
 * @example
 * getNextBadgeMilestone("silver", 35)
 * // {
 * //   nextBadge: "gold",
 * //   leadsNeeded: 15,
 * //   nextBadgeThreshold: 50
 * // }
 */
export function getNextBadgeMilestone(
  currentBadge: ScoutBadge,
  leadsSold: number
): {
  nextBadge: ScoutBadge | null;
  leadsNeeded: number;
  nextBadgeThreshold: number;
} | null {
  const thresholds = getBadgeThresholds();

  const progression: { badge: ScoutBadge; threshold: number }[] = [
    { badge: "silver", threshold: thresholds.silver },
    { badge: "gold", threshold: thresholds.gold },
    { badge: "platinum", threshold: thresholds.platinum },
  ];

  for (const { badge, threshold } of progression) {
    if (leadsSold < threshold) {
      return {
        nextBadge: badge,
        leadsNeeded: threshold - leadsSold,
        nextBadgeThreshold: threshold,
      };
    }
  }

  // Already at highest badge
  return null;
}

/**
 * Get quality score display label for scouts
 *
 * @param score - Quality score (0-10)
 * @returns Label string
 *
 * @example
 * getScoutQualityLabel(9.0) // "Top Performer"
 * getScoutQualityLabel(7.5) // "High Quality"
 * getScoutQualityLabel(5.0) // "Developing"
 */
export function getScoutQualityLabel(score: number): string {
  if (score >= 9.0) return "Top Performer";
  if (score >= 8.0) return "Excellent";
  if (score >= 7.0) return "High Quality";
  if (score >= 6.0) return "Good";
  if (score >= 5.0) return "Developing";
  return "Needs Improvement";
}

/**
 * Calculate leaderboard ranking percentile
 * Shows scout where they rank compared to all scouts
 *
 * @param score - Scout's quality score
 * @param allScores - All scout quality scores (sorted desc)
 * @returns Percentile (0-100)
 *
 * @example
 * calculatePercentile(8.5, [9.0, 8.7, 8.5, 7.2, 6.0])
 * // Returns 60 (better than 60% of scouts)
 */
export function calculatePercentile(
  score: number,
  allScores: number[]
): number {
  if (allScores.length === 0) return 0;

  const betterThan = allScores.filter((s) => s < score).length;
  return Math.round((betterThan / allScores.length) * 100);
}
