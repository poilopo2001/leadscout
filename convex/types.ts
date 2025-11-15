/**
 * Exported TypeScript Types for Frontend Consumption
 *
 * Type-safe exports from Convex schema for use in Next.js and React Native apps.
 * Import these types in your frontend code for type safety.
 */

import { Doc, Id } from "./_generated/dataModel";

// ============================================
// USER TYPES
// ============================================

export type User = Doc<"users">;
export type UserRole = User["role"];
export type UserProfile = User["profile"];

export type Scout = Doc<"scouts">;
export type ScoutBadge = Scout["badge"];

export type Company = Doc<"companies">;
export type CompanyPlan = NonNullable<Company["plan"]>;
export type SubscriptionStatus = Company["subscriptionStatus"];
export type CompanyPreferences = Company["preferences"];

// ============================================
// LEAD TYPES
// ============================================

export type Lead = Doc<"leads">;
export type LeadStatus = Lead["status"];
export type ModerationStatus = Lead["moderationStatus"];
export type QualityFactors = Lead["qualityFactors"];

/**
 * Masked lead for marketplace display (before purchase)
 */
export type MaskedLead = Omit<Lead, "contactName" | "contactEmail" | "contactPhone"> & {
  contactName: "***";
  contactEmail: "***";
  contactPhone: "***";
  companyName: string; // Partially masked
  scoutQualityScore: number;
  scoutBadge: ScoutBadge;
};

/**
 * Full lead details (after purchase or for admin)
 */
export type FullLead = Lead & {
  scoutName: string;
  scoutQualityScore: number;
  scoutBadge: ScoutBadge;
  purchaseInfo?: {
    purchasedAt: number;
    purchasePrice: number;
    companyName: string;
  };
};

// ============================================
// TRANSACTION TYPES
// ============================================

export type Purchase = Doc<"purchases">;
export type PurchaseStatus = Purchase["status"];

export type CreditTransaction = Doc<"creditTransactions">;
export type TransactionType = CreditTransaction["type"];

export type Payout = Doc<"payouts">;
export type PayoutStatus = Payout["status"];

// ============================================
// NOTIFICATION TYPES
// ============================================

export type Notification = Doc<"notifications">;
export type NotificationType = Notification["type"];

// ============================================
// GAMIFICATION TYPES
// ============================================

export type Achievement = Doc<"achievements">;

// ============================================
// AUDIT TYPES
// ============================================

export type ModerationAction = Doc<"moderationActions">;
export type ModerationActionType = ModerationAction["action"];

export type AdminAction = Doc<"adminActions">;

// ============================================
// TEAM TYPES
// ============================================

export type TeamMember = Doc<"teamMembers">;

// ============================================
// ID TYPES
// ============================================

export type UserId = Id<"users">;
export type ScoutId = Id<"scouts">;
export type CompanyId = Id<"companies">;
export type LeadId = Id<"leads">;
export type PurchaseId = Id<"purchases">;
export type PayoutId = Id<"payouts">;
export type NotificationId = Id<"notifications">;
export type AchievementId = Id<"achievements">;

// ============================================
// DASHBOARD DATA TYPES
// ============================================

/**
 * Scout earnings dashboard data
 */
export interface ScoutEarningsDashboard {
  pendingEarnings: number;
  totalEarnings: number;
  totalLeadsSold: number;
  totalLeadsSubmitted: number;
  conversionRate: number;
  qualityScore: number;
  badge: ScoutBadge;
  thisWeekEarnings: number;
  nextPayoutDate: number;
  payoutHistory: Payout[];
  recentSales: Array<{
    leadTitle: string;
    leadCategory: string;
    earning: number;
    soldAt: number;
  }>;
}

/**
 * Company credits dashboard data
 */
export interface CompanyCreditsDashboard {
  creditsRemaining: number;
  creditsAllocated: number;
  creditsUsedThisMonth: number;
  utilizationRate: number;
  plan: CompanyPlan | null;
  subscriptionStatus: SubscriptionStatus;
  nextRenewalDate: number | undefined;
  daysUntilRenewal: number | null;
  recentTransactions: CreditTransaction[];
}

/**
 * Company analytics dashboard data
 */
export interface CompanyAnalyticsDashboard {
  summary: {
    totalLeadsPurchased: number;
    totalSpend: number;
    avgLeadCost: number;
    avgLeadQuality: number;
  };
  categoryPerformance: Array<{
    category: string;
    leadsCount: number;
    totalSpend: number;
    avgQuality: number;
    avgCost: number;
  }>;
  spendingTrend: Array<{
    month: string;
    spend: number;
  }>;
}

/**
 * Scout leaderboard entry
 */
export interface ScoutLeaderboardEntry {
  scoutId: ScoutId;
  name: string;
  qualityScore: number;
  badge: ScoutBadge;
  totalEarnings: number;
  totalLeadsSold: number;
  totalLeadsSubmitted: number;
  conversionRate: number;
}

/**
 * Platform statistics (admin)
 */
export interface PlatformStats {
  totalScouts: number;
  totalCompanies: number;
  activeSubscriptions: number;
  pendingLeads: number;
  approvedLeads: number;
  soldLeads: number;
  totalGMV: number;
  platformRevenue: number;
  conversionRate: number;
}

// ============================================
// FORM INPUT TYPES
// ============================================

/**
 * Lead submission form data
 */
export interface LeadSubmissionInput {
  title: string;
  description: string;
  category: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyWebsite?: string;
  estimatedBudget: number;
  timeline?: string;
  photos?: File[]; // For file upload
}

/**
 * Scout profile update input
 */
export interface ScoutProfileInput {
  bio?: string;
  linkedin?: string;
  industryExpertise?: string[];
}

/**
 * Company profile update input
 */
export interface CompanyProfileInput {
  companyName?: string;
  website?: string;
  industry?: string;
  teamSize?: string;
  bio?: string;
  linkedin?: string;
}

/**
 * Company preferences input
 */
export interface CompanyPreferencesInput {
  categories: string[];
  budgetMin?: number;
  budgetMax?: number;
  notifications: {
    newLeads: boolean;
    lowCredits: boolean;
    renewalReminder: boolean;
  };
}

/**
 * Lead moderation input
 */
export interface LeadModerationInput {
  action: "approved" | "rejected" | "changes_requested" | "flagged";
  notes?: string;
  qualityScoreOverride?: number;
}

// ============================================
// FILTER/QUERY TYPES
// ============================================

/**
 * Lead marketplace filters
 */
export interface LeadFilters {
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  minQualityScore?: number;
  limit?: number;
}

/**
 * Date range filter
 */
export interface DateRange {
  startDate: number;
  endDate: number;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit: number;
  offset: number;
}

// ============================================
// BUSINESS LOGIC TYPES
// ============================================

/**
 * Lead pricing configuration
 */
export interface LeadPricingConfig {
  IT: number;
  Marketing: number;
  HR: number;
  Sales: number;
  Consulting: number;
  Finance: number;
  default: number;
}

/**
 * Badge thresholds
 */
export interface BadgeThresholds {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
}

/**
 * Subscription plan credits
 */
export interface PlanCredits {
  starter: number;
  growth: number;
  scale: number;
}

/**
 * Payout configuration
 */
export interface PayoutConfig {
  minimumThreshold: number;
  commissionRate: number;
  scheduleDay: number;
  scheduleHour: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Standard API response
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Purchase validation result
 */
export interface PurchaseValidation {
  canPurchase: boolean;
  reason?: string;
}

/**
 * Upgrade recommendation
 */
export interface UpgradeRecommendation {
  currentPlan: CompanyPlan | null;
  creditsRemaining: number;
  creditsAllocated: number;
  lastMonthUsage: number;
  topUpsPast3Months: number;
  shouldUpgrade: boolean;
  reason: string | null;
  suggestedPlan: "growth" | "scale" | null;
}

// ============================================
// CHART DATA TYPES
// ============================================

/**
 * Weekly earnings chart data
 */
export interface WeeklyEarningsData {
  week: string;
  earnings: number;
}

/**
 * Category performance chart data
 */
export interface CategoryPerformanceData {
  category: string;
  leadsSubmitted: number;
  leadsSold: number;
  conversionRate: number;
  totalEarnings: number;
  avgQualityScore: number;
}

/**
 * Lead conversion chart data
 */
export interface LeadConversionData {
  category: string;
  totalLeads: number;
  soldLeads: number;
  approvedLeads: number;
  conversionRate: number;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Make all fields optional (for partial updates)
 */
export type PartialUpdate<T> = Partial<T>;

/**
 * Make specific fields required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Omit database metadata fields
 */
export type WithoutMetadata<T> = Omit<T, "_id" | "_creationTime" | "createdAt" | "updatedAt">;

// ============================================
// CONSTANTS
// ============================================

/**
 * Available lead categories
 */
export const LEAD_CATEGORIES = [
  "IT Services",
  "Marketing",
  "HR",
  "Sales",
  "Consulting",
  "Finance",
  "E-commerce",
  "Manufacturing",
  "Legal",
  "Real Estate",
] as const;

export type LeadCategory = (typeof LEAD_CATEGORIES)[number];

/**
 * Available badge levels
 */
export const BADGE_LEVELS = ["bronze", "silver", "gold", "platinum"] as const;

/**
 * Available subscription plans
 */
export const SUBSCRIPTION_PLANS = ["starter", "growth", "scale"] as const;

/**
 * Available user roles
 */
export const USER_ROLES = ["scout", "company", "admin"] as const;
