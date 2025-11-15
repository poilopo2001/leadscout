/**
 * Database Helper Functions
 *
 * Reusable utility functions for common database operations.
 * These helpers are used across queries, mutations, and actions.
 */

import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getLeadPriceByCategory, getCommissionRate, getBadgeThresholds } from "./lib/constants";
import { calculateScoutQuality } from "./lib/calculateScoutQuality";

/**
 * Get current authenticated user from context
 * Returns user document or null if not authenticated
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  return user;
}

/**
 * Get user role (scout, company, admin)
 * Returns role or null if user not found
 */
export async function getUserRole(ctx: QueryCtx | MutationCtx): Promise<"scout" | "company" | "admin" | null> {
  const user = await getCurrentUser(ctx);
  return user?.role ?? null;
}

/**
 * Check if user is authenticated and has required role
 * Throws error if not authenticated or wrong role
 */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: Array<"scout" | "company" | "admin">
) {
  const user = await getCurrentUser(ctx);

  if (!user) {
    throw new Error("Authentication required");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Unauthorized: ${allowedRoles.join(" or ")} access only`);
  }

  return user;
}

/**
 * Get scout profile for current user
 * Returns scout document or throws if not found
 */
export async function getCurrentScout(ctx: QueryCtx | MutationCtx) {
  const user = await requireRole(ctx, ["scout"]);

  const scout = await ctx.db
    .query("scouts")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .unique();

  if (!scout) {
    throw new Error("Scout profile not found");
  }

  return scout;
}

/**
 * Get company profile for current user
 * Returns company document or throws if not found
 */
export async function getCurrentCompany(ctx: QueryCtx | MutationCtx) {
  const user = await requireRole(ctx, ["company"]);

  const company = await ctx.db
    .query("companies")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .unique();

  if (!company) {
    throw new Error("Company profile not found");
  }

  return company;
}

/**
 * Generate lead price based on category and budget
 * Uses environment variable pricing configuration
 */
export function generateLeadPrice(category: string, estimatedBudget?: number): number {
  const basePrice = getLeadPriceByCategory(category);

  // Future: Could adjust price based on budget size
  // For now, return category-based pricing
  return basePrice;
}

/**
 * Calculate scout's quality score
 * Based on lead sold ratio, approval rate, and feedback
 */
export async function calculateScoutQuality(
  ctx: QueryCtx | MutationCtx,
  scoutId: Id<"scouts">
): Promise<number> {
  const scout = await ctx.db.get(scoutId);
  if (!scout) return 0;

  return calculateScoutQuality({
    totalLeadsSubmitted: scout.totalLeadsSubmitted,
    totalLeadsApproved: scout.totalLeadsApproved || scout.totalLeadsSubmitted,
    totalLeadsSold: scout.totalLeadsSold,
    totalLeadsRejected: scout.totalLeadsRejected || 0,
    averageLeadQuality: scout.qualityScore,
  });
}

/**
 * Check if company has enough credits
 * Returns true if credits >= required amount
 */
export async function checkCreditBalance(
  ctx: QueryCtx | MutationCtx,
  companyId: Id<"companies">,
  requiredCredits: number = 1
): Promise<boolean> {
  const company = await ctx.db.get(companyId);
  if (!company) return false;

  return company.creditsRemaining >= requiredCredits;
}

/**
 * Deduct credits from company account
 * Creates transaction record and updates balance
 * Throws error if insufficient credits
 */
export async function deductCredits(
  ctx: MutationCtx,
  companyId: Id<"companies">,
  amount: number,
  description: string,
  relatedPurchaseId?: Id<"purchases">
) {
  const company = await ctx.db.get(companyId);
  if (!company) {
    throw new Error("Company not found");
  }

  if (company.creditsRemaining < amount) {
    throw new Error("Insufficient credits");
  }

  const newBalance = company.creditsRemaining - amount;

  // Update company balance
  await ctx.db.patch(companyId, {
    creditsRemaining: newBalance,
    updatedAt: Date.now(),
  });

  // Record transaction
  await ctx.db.insert("creditTransactions", {
    companyId,
    type: "usage",
    amount: -amount,
    balanceAfter: newBalance,
    relatedPurchaseId,
    description,
    createdAt: Date.now(),
  });

  return newBalance;
}

/**
 * Add credits to company account
 * Creates transaction record and updates balance
 */
export async function addCredits(
  ctx: MutationCtx,
  companyId: Id<"companies">,
  amount: number,
  type: "allocation" | "purchase" | "refund",
  description: string,
  stripePaymentId?: string
) {
  const company = await ctx.db.get(companyId);
  if (!company) {
    throw new Error("Company not found");
  }

  const newBalance = company.creditsRemaining + amount;

  // Update company balance
  await ctx.db.patch(companyId, {
    creditsRemaining: newBalance,
    updatedAt: Date.now(),
  });

  // Record transaction
  await ctx.db.insert("creditTransactions", {
    companyId,
    type,
    amount,
    balanceAfter: newBalance,
    stripePaymentId,
    description,
    createdAt: Date.now(),
  });

  return newBalance;
}

/**
 * Calculate scout earnings from lead sale
 * Returns scout's commission (50% by default from env)
 */
export function calculateScoutEarning(salePrice: number): number {
  const commissionRate = getCommissionRate();
  return salePrice * commissionRate;
}

/**
 * Calculate platform commission from lead sale
 * Returns platform's share (50% by default from env)
 */
export function calculatePlatformCommission(salePrice: number): number {
  const commissionRate = getCommissionRate();
  return salePrice * (1 - commissionRate);
}

/**
 * Update scout earnings after lead purchase
 * Adds to pending earnings and updates sold count
 */
export async function creditScoutEarnings(
  ctx: MutationCtx,
  scoutId: Id<"scouts">,
  amount: number
) {
  const scout = await ctx.db.get(scoutId);
  if (!scout) {
    throw new Error("Scout not found");
  }

  await ctx.db.patch(scoutId, {
    pendingEarnings: scout.pendingEarnings + amount,
    totalLeadsSold: scout.totalLeadsSold + 1,
  });
}

/**
 * Determine scout badge based on leads sold
 * Returns badge tier: bronze, silver, gold, platinum
 */
export function determineBadge(totalLeadsSold: number): "bronze" | "silver" | "gold" | "platinum" {
  const thresholds = getBadgeThresholds();

  if (totalLeadsSold >= thresholds.platinum) return "platinum";
  if (totalLeadsSold >= thresholds.gold) return "gold";
  if (totalLeadsSold >= thresholds.silver) return "silver";
  return "bronze";
}

/**
 * Update scout badge if threshold reached
 * Returns true if badge was upgraded
 */
export async function updateScoutBadge(
  ctx: MutationCtx,
  scoutId: Id<"scouts">
): Promise<boolean> {
  const scout = await ctx.db.get(scoutId);
  if (!scout) return false;

  const newBadge = determineBadge(scout.totalLeadsSold);

  if (newBadge !== scout.badge) {
    await ctx.db.patch(scoutId, { badge: newBadge });
    return true;
  }

  return false;
}

/**
 * Create notification for user
 * Used for lead events, payouts, credits, etc.
 */
export async function createNotification(
  ctx: MutationCtx,
  userId: Id<"users">,
  type: "lead_approved" | "lead_sold" | "payout_processed" | "new_matching_lead" | "low_credits" | "subscription_renewed",
  title: string,
  message: string,
  metadata?: any
) {
  await ctx.db.insert("notifications", {
    userId,
    type,
    title,
    message,
    metadata,
    read: false,
    createdAt: Date.now(),
  });
}

/**
 * Mask lead contact information
 * Used for marketplace display before purchase
 */
export function maskLeadContactInfo(lead: any) {
  return {
    ...lead,
    contactName: "***",
    contactEmail: "***",
    contactPhone: "***",
    companyName: lead.companyName.substring(0, 3) + "***",
  };
}

/**
 * Check if lead can be purchased by company
 * Validates: not already sold, company has credits, not own lead
 */
export async function canPurchaseLead(
  ctx: QueryCtx | MutationCtx,
  leadId: Id<"leads">,
  companyId: Id<"companies">
): Promise<{ canPurchase: boolean; reason?: string }> {
  const lead = await ctx.db.get(leadId);
  if (!lead) {
    return { canPurchase: false, reason: "Lead not found" };
  }

  if (lead.status !== "approved") {
    return { canPurchase: false, reason: "Lead not available for purchase" };
  }

  if (lead.purchasedBy) {
    return { canPurchase: false, reason: "Lead already sold" };
  }

  const company = await ctx.db.get(companyId);
  if (!company) {
    return { canPurchase: false, reason: "Company not found" };
  }

  if (company.creditsRemaining < 1) {
    return { canPurchase: false, reason: "Insufficient credits" };
  }

  // Check if scout is from same company (prevent self-purchase)
  const scout = await ctx.db.get(lead.scoutId);
  if (scout) {
    const scoutUser = await ctx.db.get(scout.userId);
    const companyUser = await ctx.db.get(company.userId);
    if (scoutUser && companyUser && scoutUser.email === companyUser.email) {
      return { canPurchase: false, reason: "Cannot purchase your own lead" };
    }
  }

  return { canPurchase: true };
}

/**
 * Record moderation action
 * Creates audit log entry for admin actions
 */
export async function recordModerationAction(
  ctx: MutationCtx,
  adminId: Id<"users">,
  leadId: Id<"leads">,
  action: "approved" | "rejected" | "changes_requested" | "flagged",
  reason?: string
) {
  await ctx.db.insert("moderationActions", {
    adminId,
    leadId,
    action,
    reason,
    createdAt: Date.now(),
  });
}

/**
 * Check if company subscription is active
 * Returns true if subscription status is "active"
 */
export async function hasActiveSubscription(
  ctx: QueryCtx | MutationCtx,
  companyId: Id<"companies">
): Promise<boolean> {
  const company = await ctx.db.get(companyId);
  if (!company) return false;

  return company.subscriptionStatus === "active";
}

/**
 * Get platform analytics summary
 * Admin-only function for dashboard
 */
export async function getPlatformStats(ctx: QueryCtx | MutationCtx) {
  // Count users by role
  const scouts = await ctx.db.query("scouts").collect();
  const companies = await ctx.db.query("companies").collect();

  // Count leads by status
  const pendingLeads = await ctx.db
    .query("leads")
    .withIndex("by_status", (q) => q.eq("status", "pending_review"))
    .collect();

  const approvedLeads = await ctx.db
    .query("leads")
    .withIndex("by_status", (q) => q.eq("status", "approved"))
    .collect();

  const soldLeads = await ctx.db
    .query("leads")
    .withIndex("by_status", (q) => q.eq("status", "sold"))
    .collect();

  // Calculate total GMV (Gross Merchandise Value)
  const purchases = await ctx.db.query("purchases").collect();
  const totalGMV = purchases.reduce((sum, p) => sum + p.purchasePrice, 0);
  const platformRevenue = purchases.reduce((sum, p) => sum + p.platformCommission, 0);

  // Calculate active subscriptions
  const activeCompanies = companies.filter(c => c.subscriptionStatus === "active");

  return {
    totalScouts: scouts.length,
    totalCompanies: companies.length,
    activeSubscriptions: activeCompanies.length,
    pendingLeads: pendingLeads.length,
    approvedLeads: approvedLeads.length,
    soldLeads: soldLeads.length,
    totalGMV,
    platformRevenue,
    conversionRate: approvedLeads.length > 0
      ? (soldLeads.length / (soldLeads.length + approvedLeads.length)) * 100
      : 0,
  };
}
