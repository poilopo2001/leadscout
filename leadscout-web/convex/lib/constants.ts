/**
 * Environment Variable Accessors
 *
 * Centralized access to environment variables with type safety and defaults.
 * All business logic values MUST be read from environment variables.
 */

/**
 * Lead pricing by category (in euros)
 * Determines how much companies pay per lead and scout earnings
 */
export function getLeadPriceByCategory(category: string): number {
  const pricing: Record<string, number> = {
    "IT Services": parseFloat(process.env.LEAD_PRICE_IT ?? "30"),
    "IT": parseFloat(process.env.LEAD_PRICE_IT ?? "30"),
    "Marketing": parseFloat(process.env.LEAD_PRICE_MARKETING ?? "25"),
    "HR": parseFloat(process.env.LEAD_PRICE_HR ?? "20"),
    "Sales": parseFloat(process.env.LEAD_PRICE_SALES ?? "25"),
    "Consulting": parseFloat(process.env.LEAD_PRICE_CONSULTING ?? "25"),
    "Finance": parseFloat(process.env.LEAD_PRICE_FINANCE ?? "25"),
  };

  return pricing[category] ?? parseFloat(process.env.LEAD_PRICE_DEFAULT ?? "25");
}

/**
 * Platform commission rate (0-1)
 * Default: 0.5 (50% to scout, 50% to platform)
 */
export function getCommissionRate(): number {
  return parseFloat(process.env.PLATFORM_COMMISSION_RATE ?? "0.5");
}

/**
 * Minimum payout threshold (in euros)
 * Scouts must have this amount pending to receive payout
 * Default: 20 euros
 */
export function getPayoutThreshold(): number {
  return parseFloat(process.env.PAYOUT_MINIMUM_THRESHOLD ?? "20");
}

/**
 * Quality score calculation weights
 */
export function getQualityScoreWeights(): {
  sold: number;
  approval: number;
  feedback: number;
} {
  return {
    sold: parseFloat(process.env.QUALITY_SCORE_SOLD_WEIGHT ?? "0.4"),
    approval: parseFloat(process.env.QUALITY_SCORE_APPROVAL_WEIGHT ?? "0.3"),
    feedback: parseFloat(process.env.QUALITY_SCORE_FEEDBACK_WEIGHT ?? "0.3"),
  };
}

/**
 * Subscription plan credit allocations
 */
export function getPlanCredits(plan: "starter" | "growth" | "scale"): number {
  const credits: Record<string, number> = {
    starter: parseInt(process.env.STARTER_PLAN_CREDITS ?? "20", 10),
    growth: parseInt(process.env.GROWTH_PLAN_CREDITS ?? "60", 10),
    scale: parseInt(process.env.SCALE_PLAN_CREDITS ?? "150", 10),
  };
  return credits[plan] ?? 20;
}

/**
 * Badge thresholds (number of leads sold)
 */
export function getBadgeThresholds(): {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
} {
  return {
    bronze: 0,
    silver: parseInt(process.env.BADGE_SILVER_THRESHOLD ?? "20", 10),
    gold: parseInt(process.env.BADGE_GOLD_THRESHOLD ?? "50", 10),
    platinum: parseInt(process.env.BADGE_PLATINUM_THRESHOLD ?? "100", 10),
  };
}

/**
 * Credit top-up price per credit
 * Used for one-time credit purchases
 */
export function getCreditTopUpPrice(): number {
  return parseFloat(process.env.CREDIT_TOP_UP_PRICE ?? "5");
}

/**
 * Credit expiration in months
 * How long unused credits remain valid
 */
export function getCreditExpirationMonths(): number {
  return parseInt(process.env.CREDIT_EXPIRATION_MONTHS ?? "3", 10);
}

/**
 * Minimum description length for lead quality
 */
export function getMinDescriptionLength(): number {
  return parseInt(process.env.QUALITY_MIN_DESCRIPTION_LENGTH ?? "100", 10);
}

/**
 * Low credit alert threshold
 * Notify company when credits drop below this number
 */
export function getLowCreditThreshold(): number {
  return parseInt(process.env.LOW_CREDIT_THRESHOLD ?? "5", 10);
}

/**
 * Payout schedule configuration
 * Day of week (0=Sunday, 5=Friday) and hour (UTC)
 */
export function getPayoutSchedule(): { day: number; hour: number } {
  return {
    day: parseInt(process.env.PAYOUT_SCHEDULE_DAY ?? "5", 10), // Friday
    hour: parseInt(process.env.PAYOUT_SCHEDULE_HOUR ?? "9", 10), // 9 AM UTC
  };
}

/**
 * Feature flags
 */
export function isFeatureEnabled(feature: string): boolean {
  const flags: Record<string, boolean> = {
    analytics: process.env.FEATURE_ANALYTICS_ENABLED !== "false",
    apiAccess: process.env.FEATURE_API_ACCESS_ENABLED !== "false",
    referralProgram: process.env.FEATURE_REFERRAL_PROGRAM_ENABLED === "true",
  };
  return flags[feature] ?? false;
}
