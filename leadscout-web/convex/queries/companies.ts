/**
 * Company Queries
 *
 * Read-only queries for company profile, purchases, and analytics.
 * These power the company web dashboard.
 */

import { query } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentCompany, getCurrentUser } from "../helpers";

/**
 * Get current logged-in company profile
 * Returns full company data including subscription and credits
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "company") return null;

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!company) return null;

    return {
      user,
      company,
    };
  },
});

/**
 * Get company's purchase history
 * Returns all leads purchased with optional status filter
 */
export const getMyPurchases = query({
  args: {
    status: v.optional(v.union(v.literal("completed"), v.literal("refunded"))),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const company = await getCurrentCompany(ctx);

    const page = args.page ?? 0;
    const limit = args.limit ?? 20;
    const offset = page * limit;

    // Get purchases
    let purchases = await ctx.db
      .query("purchases")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .collect();

    // Filter by status if provided
    if (args.status) {
      purchases = purchases.filter((p) => p.status === args.status);
    }

    // Sort by creation date (newest first)
    purchases.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate
    const paginatedPurchases = purchases.slice(offset, offset + limit);

    // Enrich with lead data
    const enrichedPurchases = await Promise.all(
      paginatedPurchases.map(async (purchase) => {
        const lead = await ctx.db.get(purchase.leadId);
        const scout = lead ? await ctx.db.get(lead.scoutId) : null;
        const scoutUser = scout ? await ctx.db.get(scout.userId) : null;

        return {
          ...purchase,
          lead: lead ? {
            id: lead._id,
            title: lead.title,
            description: lead.description,
            category: lead.category,
            companyName: lead.companyName,
            contactName: lead.contactName,
            contactEmail: lead.contactEmail,
            contactPhone: lead.contactPhone,
            companyWebsite: lead.companyWebsite,
            estimatedBudget: lead.estimatedBudget,
            qualityScore: lead.qualityScore,
            photos: lead.photos,
          } : null,
          scout: scout ? {
            name: scoutUser?.name ?? "Anonymous Scout",
            qualityScore: scout.qualityScore,
            badge: scout.badge,
          } : null,
        };
      })
    );

    return {
      purchases: enrichedPurchases,
      total: purchases.length,
      page,
      limit,
      hasMore: offset + limit < purchases.length,
    };
  },
});

/**
 * Get company analytics
 * Returns metrics, ROI, and performance data
 */
export const getMyAnalytics = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const company = await getCurrentCompany(ctx);

    // Get purchases in date range
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), args.startDate),
          q.lte(q.field("createdAt"), args.endDate)
        )
      )
      .collect();

    // Get credit transactions in date range
    const creditTransactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), args.startDate),
          q.lte(q.field("createdAt"), args.endDate)
        )
      )
      .collect();

    // Calculate metrics
    const totalPurchases = purchases.length;
    const totalSpent = purchases.reduce((sum, p) => sum + p.purchasePrice, 0);
    const creditsUsed = purchases.reduce((sum, p) => sum + p.creditsUsed, 0);
    const creditsAllocated = creditTransactions
      .filter((t) => t.type === "allocation")
      .reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown
    const categoryStats: Record<string, {
      count: number;
      totalSpent: number;
      avgPrice: number;
    }> = {};

    for (const purchase of purchases) {
      const lead = await ctx.db.get(purchase.leadId);
      if (!lead) continue;

      if (!categoryStats[lead.category]) {
        categoryStats[lead.category] = {
          count: 0,
          totalSpent: 0,
          avgPrice: 0,
        };
      }

      categoryStats[lead.category].count += 1;
      categoryStats[lead.category].totalSpent += purchase.purchasePrice;
    }

    // Calculate averages
    for (const category in categoryStats) {
      const stat = categoryStats[category];
      stat.avgPrice = stat.totalSpent / stat.count;
    }

    // Convert to array
    const categoryBreakdown = Object.entries(categoryStats).map(
      ([category, data]) => ({
        category,
        ...data,
      })
    );

    // Sort by count (desc)
    categoryBreakdown.sort((a, b) => b.count - a.count);

    // Top scouts (who provided purchased leads)
    const scoutStats: Record<string, {
      scoutId: string;
      name: string;
      leadsProvided: number;
      avgQuality: number;
    }> = {};

    for (const purchase of purchases) {
      const scout = await ctx.db.get(purchase.scoutId);
      if (!scout) continue;

      const scoutUser = await ctx.db.get(scout.userId);
      const scoutKey = scout._id;

      if (!scoutStats[scoutKey]) {
        scoutStats[scoutKey] = {
          scoutId: scout._id,
          name: scoutUser?.name ?? "Anonymous Scout",
          leadsProvided: 0,
          avgQuality: 0,
        };
      }

      scoutStats[scoutKey].leadsProvided += 1;
      scoutStats[scoutKey].avgQuality += scout.qualityScore;
    }

    // Calculate averages
    for (const scoutKey in scoutStats) {
      const stat = scoutStats[scoutKey];
      stat.avgQuality = stat.avgQuality / stat.leadsProvided;
    }

    // Convert to array and sort
    const topScouts = Object.values(scoutStats);
    topScouts.sort((a, b) => b.leadsProvided - a.leadsProvided);

    return {
      overview: {
        totalPurchases,
        totalSpent,
        creditsUsed,
        creditsAllocated,
        creditsRemaining: company.creditsRemaining,
        avgPricePerLead: totalPurchases > 0 ? totalSpent / totalPurchases : 0,
      },
      categoryBreakdown,
      topScouts: topScouts.slice(0, 5),
      currentPlan: company.plan,
      subscriptionStatus: company.subscriptionStatus,
    };
  },
});

/**
 * Get credit balance and history
 * Returns current credits and recent transactions
 */
export const getMyCredits = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const company = await getCurrentCompany(ctx);
    const limit = args.limit ?? 20;

    // Get recent transactions
    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .order("desc")
      .take(limit);

    // Enrich with purchase details if applicable
    const enrichedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        let purchaseDetails = null;

        if (transaction.relatedPurchaseId) {
          const purchase = await ctx.db.get(transaction.relatedPurchaseId);
          if (purchase) {
            const lead = await ctx.db.get(purchase.leadId);
            purchaseDetails = {
              leadTitle: lead?.title ?? "Unknown Lead",
              leadCategory: lead?.category ?? "Unknown",
            };
          }
        }

        return {
          ...transaction,
          purchaseDetails,
        };
      })
    );

    // Calculate credits expiring soon (if applicable)
    // For now, credits don't expire, but this could be added

    return {
      current: company.creditsRemaining,
      allocated: company.creditsAllocated,
      plan: company.plan,
      nextRenewalDate: company.nextRenewalDate,
      transactions: enrichedTransactions,
    };
  },
});

/**
 * Get company's notification preferences
 * Returns current notification settings
 */
export const getMyPreferences = query({
  args: {},
  handler: async (ctx, args) => {
    const company = await getCurrentCompany(ctx);
    return company.preferences;
  },
});

/**
 * Get recommended leads based on preferences
 * Returns leads matching company's category preferences
 */
export const getRecommendedLeads = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const company = await getCurrentCompany(ctx);
    const limit = args.limit ?? 10;

    // Get approved leads matching preferences
    let leads = await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();

    // Filter by category preferences
    if (company.preferences.categories.length > 0) {
      leads = leads.filter((lead) =>
        company.preferences.categories.includes(lead.category)
      );
    }

    // Filter by budget range
    if (company.preferences.budgetMin !== undefined) {
      leads = leads.filter(
        (lead) => lead.estimatedBudget >= company.preferences.budgetMin!
      );
    }

    if (company.preferences.budgetMax !== undefined) {
      leads = leads.filter(
        (lead) => lead.estimatedBudget <= company.preferences.budgetMax!
      );
    }

    // Sort by quality score (desc)
    leads.sort((a, b) => b.qualityScore - a.qualityScore);

    // Take top N
    const recommendedLeads = leads.slice(0, limit);

    // Enrich with scout data
    const enrichedLeads = await Promise.all(
      recommendedLeads.map(async (lead) => {
        const scout = await ctx.db.get(lead.scoutId);
        const scoutUser = scout ? await ctx.db.get(scout.userId) : null;

        // Mask contact info
        return {
          ...lead,
          contactName: "***",
          contactEmail: "***",
          contactPhone: "***",
          companyName: lead.companyName.substring(0, 3) + "***",
          scout: scout
            ? {
                id: scout._id,
                qualityScore: scout.qualityScore,
                badge: scout.badge,
                name: scoutUser?.name ?? "Anonymous Scout",
              }
            : null,
        };
      })
    );

    return enrichedLeads;
  },
});

/**
 * Check if company is low on credits
 * Returns warning if credits < threshold
 */
export const getLowCreditAlert = query({
  args: {},
  handler: async (ctx, args) => {
    const company = await getCurrentCompany(ctx);

    const lowCreditThreshold = 5; // From env or constants
    const isLow = company.creditsRemaining < lowCreditThreshold;

    return {
      isLow,
      remaining: company.creditsRemaining,
      threshold: lowCreditThreshold,
      percentageRemaining:
        company.creditsAllocated > 0
          ? (company.creditsRemaining / company.creditsAllocated) * 100
          : 0,
    };
  },
});
