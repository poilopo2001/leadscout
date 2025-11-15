/**
 * Example Company Queries
 *
 * Reference implementations for company-related database queries
 * including credits, purchases, and analytics.
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Example 1: Get company's credit dashboard
 * Shows current balance, usage history, and renewal info
 */
export const getMyCredits = query({
  args: {},
  handler: async (ctx) => {
    // Get current user (must be company)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "company") {
      throw new Error("Unauthorized: Company access only");
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!company) throw new Error("Company profile not found");

    // Get recent credit transactions
    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_company_and_created", (q) => q.eq("companyId", company._id))
      .order("desc")
      .take(50);

    // Calculate credits used this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const thisMonthTransactions = transactions.filter(
      (t) => t.createdAt >= monthStart.getTime() && t.type === "usage"
    );

    const creditsUsedThisMonth = thisMonthTransactions.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );

    // Days until renewal
    const daysUntilRenewal = company.nextRenewalDate
      ? Math.ceil((company.nextRenewalDate - Date.now()) / (24 * 60 * 60 * 1000))
      : null;

    return {
      creditsRemaining: company.creditsRemaining,
      creditsAllocated: company.creditsAllocated,
      creditsUsedThisMonth,
      utilizationRate:
        company.creditsAllocated > 0
          ? (creditsUsedThisMonth / company.creditsAllocated) * 100
          : 0,
      plan: company.plan,
      subscriptionStatus: company.subscriptionStatus,
      nextRenewalDate: company.nextRenewalDate,
      daysUntilRenewal,
      recentTransactions: transactions,
    };
  },
});

/**
 * Example 2: Get company's purchase history
 * All leads purchased with details
 */
export const getMyPurchases = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current user (must be company)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "company") {
      throw new Error("Unauthorized: Company access only");
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!company) throw new Error("Company profile not found");

    // Query purchases
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_company_and_created", (q) => q.eq("companyId", company._id))
      .collect();

    // Fetch lead details for each purchase
    const purchasesWithLeads = await Promise.all(
      purchases.map(async (purchase) => {
        const lead = await ctx.db.get(purchase.leadId);

        // Get scout info
        let scoutInfo = null;
        if (lead) {
          const scout = await ctx.db.get(lead.scoutId);
          const scoutUser = scout ? await ctx.db.get(scout.userId) : null;

          scoutInfo = {
            name: scoutUser?.name ?? "Unknown",
            qualityScore: scout?.qualityScore ?? 0,
            badge: scout?.badge ?? "bronze",
          };
        }

        return {
          purchaseId: purchase._id,
          purchasedAt: purchase.createdAt,
          creditsUsed: purchase.creditsUsed,
          purchasePrice: purchase.purchasePrice,
          status: purchase.status,
          lead: lead
            ? {
                leadId: lead._id,
                title: lead.title,
                description: lead.description,
                category: lead.category,
                companyName: lead.companyName,
                contactName: lead.contactName,
                contactEmail: lead.contactEmail,
                contactPhone: lead.contactPhone,
                companyWebsite: lead.companyWebsite,
                estimatedBudget: lead.estimatedBudget,
                timeline: lead.timeline,
                qualityScore: lead.qualityScore,
              }
            : null,
          scout: scoutInfo,
        };
      })
    );

    // Filter by category if specified
    let filteredPurchases = purchasesWithLeads;
    if (args.category) {
      filteredPurchases = purchasesWithLeads.filter(
        (p) => p.lead?.category === args.category
      );
    }

    // Sort by most recent first
    filteredPurchases = filteredPurchases.sort((a, b) => b.purchasedAt - a.purchasedAt);

    // Apply limit
    const limit = args.limit ?? 50;
    return filteredPurchases.slice(0, limit);
  },
});

/**
 * Example 3: Get company analytics dashboard
 * ROI metrics, lead performance, conversion tracking
 */
export const getMyAnalytics = query({
  args: {
    dateRange: v.optional(
      v.object({
        startDate: v.number(),
        endDate: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Get current user (must be company)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "company") {
      throw new Error("Unauthorized: Company access only");
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!company) throw new Error("Company profile not found");

    // Check if company has analytics access (Growth/Scale plans)
    if (company.plan !== "growth" && company.plan !== "scale") {
      throw new Error("Analytics requires Growth or Scale plan");
    }

    // Get all purchases
    let purchases = await ctx.db
      .query("purchases")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .collect();

    // Filter by date range if specified
    if (args.dateRange) {
      purchases = purchases.filter(
        (p) =>
          p.createdAt >= args.dateRange!.startDate &&
          p.createdAt <= args.dateRange!.endDate
      );
    }

    // Total spend
    const totalSpend = purchases.reduce((sum, p) => sum + p.purchasePrice, 0);

    // Get lead details for analysis
    const leads = await Promise.all(purchases.map((p) => ctx.db.get(p.leadId)));

    // Performance by category
    const categoryPerformance: Record<
      string,
      { count: number; spend: number; avgQuality: number }
    > = {};

    for (let i = 0; i < purchases.length; i++) {
      const lead = leads[i];
      if (!lead) continue;

      if (!categoryPerformance[lead.category]) {
        categoryPerformance[lead.category] = { count: 0, spend: 0, avgQuality: 0 };
      }

      categoryPerformance[lead.category].count++;
      categoryPerformance[lead.category].spend += purchases[i].purchasePrice;
      categoryPerformance[lead.category].avgQuality += lead.qualityScore;
    }

    // Calculate averages
    const categoryStats = Object.entries(categoryPerformance).map(([category, stats]) => ({
      category,
      leadsCount: stats.count,
      totalSpend: Math.round(stats.spend * 100) / 100,
      avgQuality: Math.round((stats.avgQuality / stats.count) * 10) / 10,
      avgCost: Math.round((stats.spend / stats.count) * 100) / 100,
    }));

    // Sort by spend descending
    categoryStats.sort((a, b) => b.totalSpend - a.totalSpend);

    // Average quality score of purchased leads
    const avgQuality =
      leads.length > 0
        ? leads.reduce((sum, lead) => sum + (lead?.qualityScore ?? 0), 0) / leads.length
        : 0;

    // Monthly spending trend
    const monthlySpend: Record<string, number> = {};
    for (const purchase of purchases) {
      const date = new Date(purchase.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlySpend[monthKey]) {
        monthlySpend[monthKey] = 0;
      }

      monthlySpend[monthKey] += purchase.purchasePrice;
    }

    const spendingTrend = Object.entries(monthlySpend)
      .map(([month, spend]) => ({
        month,
        spend: Math.round(spend * 100) / 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      summary: {
        totalLeadsPurchased: purchases.length,
        totalSpend: Math.round(totalSpend * 100) / 100,
        avgLeadCost:
          purchases.length > 0
            ? Math.round((totalSpend / purchases.length) * 100) / 100
            : 0,
        avgLeadQuality: Math.round(avgQuality * 10) / 10,
      },
      categoryPerformance: categoryStats,
      spendingTrend,
    };
  },
});

/**
 * Example 4: Get matching leads based on preferences
 * Personalized lead recommendations
 */
export const getMatchingLeads = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get current user (must be company)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "company") {
      throw new Error("Unauthorized: Company access only");
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!company) throw new Error("Company profile not found");

    // Get all approved leads
    const allLeads = await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();

    // Filter based on company preferences
    let matchingLeads = allLeads;

    // Filter by categories
    if (company.preferences.categories.length > 0) {
      matchingLeads = matchingLeads.filter((lead) =>
        company.preferences.categories.includes(lead.category)
      );
    }

    // Filter by budget range
    if (company.preferences.budgetMin !== undefined) {
      matchingLeads = matchingLeads.filter(
        (lead) => lead.estimatedBudget >= company.preferences.budgetMin!
      );
    }

    if (company.preferences.budgetMax !== undefined) {
      matchingLeads = matchingLeads.filter(
        (lead) => lead.estimatedBudget <= company.preferences.budgetMax!
      );
    }

    // Sort by quality score descending
    matchingLeads = matchingLeads.sort((a, b) => b.qualityScore - a.qualityScore);

    // Apply limit
    const limit = args.limit ?? 20;
    const limitedLeads = matchingLeads.slice(0, limit);

    // Fetch scout info
    const leadsWithScoutInfo = await Promise.all(
      limitedLeads.map(async (lead) => {
        const scout = await ctx.db.get(lead.scoutId);
        return {
          ...lead,
          // Mask contact info
          contactName: "***",
          contactEmail: "***",
          contactPhone: "***",
          companyName: lead.companyName.substring(0, 3) + "***",
          // Add scout quality indicators
          scoutQualityScore: scout?.qualityScore ?? 0,
          scoutBadge: scout?.badge ?? "bronze",
        };
      })
    );

    return {
      totalMatching: matchingLeads.length,
      leads: leadsWithScoutInfo,
    };
  },
});

/**
 * Example 5: Check if company needs to upgrade
 * Suggest plan upgrade based on usage patterns
 */
export const getUpgradeRecommendation = query({
  args: {},
  handler: async (ctx) => {
    // Get current user (must be company)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "company") {
      throw new Error("Unauthorized: Company access only");
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!company) throw new Error("Company profile not found");

    // Get recent credit purchases (top-ups)
    const recentPurchases = await ctx.db
      .query("creditTransactions")
      .withIndex("by_company_and_created", (q) => q.eq("companyId", company._id))
      .filter((q) => q.eq(q.field("type"), "purchase"))
      .collect();

    const last3Months = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const recentTopUps = recentPurchases.filter((p) => p.createdAt >= last3Months);

    // Calculate average monthly usage
    const monthlyTransactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_company_and_created", (q) => q.eq("companyId", company._id))
      .filter((q) => q.eq(q.field("type"), "usage"))
      .collect();

    const last30Days = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const lastMonthUsage = monthlyTransactions
      .filter((t) => t.createdAt >= last30Days)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Recommendation logic
    let shouldUpgrade = false;
    let reason = "";
    let suggestedPlan: "growth" | "scale" | null = null;

    if (company.plan === "starter") {
      if (recentTopUps.length >= 2) {
        shouldUpgrade = true;
        reason = "You've purchased credit top-ups multiple times. Upgrade to Growth for better value.";
        suggestedPlan = "growth";
      } else if (lastMonthUsage > 20) {
        shouldUpgrade = true;
        reason = "Your monthly usage exceeds your plan allocation. Consider upgrading to Growth.";
        suggestedPlan = "growth";
      }
    } else if (company.plan === "growth") {
      if (recentTopUps.length >= 3) {
        shouldUpgrade = true;
        reason = "Frequent credit purchases detected. Scale plan offers more credits and API access.";
        suggestedPlan = "scale";
      } else if (lastMonthUsage > 60) {
        shouldUpgrade = true;
        reason = "Your usage is consistently high. Scale plan provides 150 credits/month.";
        suggestedPlan = "scale";
      }
    }

    return {
      currentPlan: company.plan,
      creditsRemaining: company.creditsRemaining,
      creditsAllocated: company.creditsAllocated,
      lastMonthUsage,
      topUpsPast3Months: recentTopUps.length,
      shouldUpgrade,
      reason: shouldUpgrade ? reason : null,
      suggestedPlan,
    };
  },
});

/**
 * Example 6: Get company subscription details
 * Stripe subscription info and billing history
 */
export const getMySubscription = query({
  args: {},
  handler: async (ctx) => {
    // Get current user (must be company)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "company") {
      throw new Error("Unauthorized: Company access only");
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!company) throw new Error("Company profile not found");

    // Get allocation transactions (monthly renewals)
    const allocations = await ctx.db
      .query("creditTransactions")
      .withIndex("by_company_and_created", (q) => q.eq("companyId", company._id))
      .filter((q) => q.eq(q.field("type"), "allocation"))
      .collect();

    const billingHistory = allocations
      .map((a) => ({
        date: a.createdAt,
        creditsAdded: a.amount,
        description: a.description,
      }))
      .sort((a, b) => b.date - a.date)
      .slice(0, 12); // Last 12 billing cycles

    return {
      plan: company.plan,
      subscriptionStatus: company.subscriptionStatus,
      stripeCustomerId: company.stripeCustomerId,
      subscriptionId: company.subscriptionId,
      creditsAllocated: company.creditsAllocated,
      nextRenewalDate: company.nextRenewalDate,
      billingHistory,
    };
  },
});
