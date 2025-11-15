/**
 * Example Scout Queries
 *
 * Reference implementations for scout-related database queries
 * including earnings, statistics, and leaderboards.
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Example 1: Get scout's earnings summary
 * Dashboard data for scout mobile app
 */
export const getMyEarnings = query({
  args: {},
  handler: async (ctx) => {
    // Get current user (must be scout)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "scout") {
      throw new Error("Unauthorized: Scout access only");
    }

    // Get scout profile
    const scout = await ctx.db
      .query("scouts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!scout) throw new Error("Scout profile not found");

    // Get payout history
    const payouts = await ctx.db
      .query("payouts")
      .withIndex("by_scout", (q) => q.eq("scoutId", scout._id))
      .collect();

    // Get recent purchases (leads sold)
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_scout", (q) => q.eq("scoutId", scout._id))
      .order("desc")
      .take(10);

    // Fetch lead details for recent purchases
    const recentSales = await Promise.all(
      purchases.map(async (purchase) => {
        const lead = await ctx.db.get(purchase.leadId);
        return {
          leadTitle: lead?.title ?? "Unknown",
          leadCategory: lead?.category ?? "Unknown",
          earning: purchase.scoutEarning,
          soldAt: purchase.createdAt,
        };
      })
    );

    // Calculate earnings this week
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thisWeekPurchases = await ctx.db
      .query("purchases")
      .withIndex("by_scout", (q) => q.eq("scoutId", scout._id))
      .collect();

    const thisWeekEarnings = thisWeekPurchases
      .filter((p) => p.createdAt >= oneWeekAgo)
      .reduce((sum, p) => sum + p.scoutEarning, 0);

    // Next payout date (Friday 9 AM)
    const now = new Date();
    const nextFriday = new Date(now);
    nextFriday.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7 || 7));
    nextFriday.setHours(9, 0, 0, 0);

    return {
      pendingEarnings: scout.pendingEarnings,
      totalEarnings: scout.totalEarnings,
      totalLeadsSold: scout.totalLeadsSold,
      totalLeadsSubmitted: scout.totalLeadsSubmitted,
      conversionRate:
        scout.totalLeadsSubmitted > 0
          ? (scout.totalLeadsSold / scout.totalLeadsSubmitted) * 100
          : 0,
      qualityScore: scout.qualityScore,
      badge: scout.badge,
      thisWeekEarnings,
      nextPayoutDate: nextFriday.getTime(),
      payoutHistory: payouts.sort((a, b) => b.createdAt - a.createdAt),
      recentSales,
    };
  },
});

/**
 * Example 2: Get scout's lead history
 * All leads submitted by scout with status
 */
export const getMyLeads = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending_review"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("sold")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get current user (must be scout)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "scout") {
      throw new Error("Unauthorized: Scout access only");
    }

    const scout = await ctx.db
      .query("scouts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!scout) throw new Error("Scout profile not found");

    // Query leads
    let leads = await ctx.db
      .query("leads")
      .withIndex("by_scout", (q) => q.eq("scoutId", scout._id))
      .collect();

    // Filter by status if specified
    if (args.status) {
      leads = leads.filter((lead) => lead.status === args.status);
    }

    // Sort by newest first
    leads = leads.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit
    const limit = args.limit ?? 50;
    leads = leads.slice(0, limit);

    // Add purchase info for sold leads
    const leadsWithPurchaseInfo = await Promise.all(
      leads.map(async (lead) => {
        let purchaseInfo = null;

        if (lead.status === "sold" && lead.purchasedBy) {
          const purchase = await ctx.db
            .query("purchases")
            .withIndex("by_lead", (q) => q.eq("leadId", lead._id))
            .unique();

          if (purchase) {
            purchaseInfo = {
              soldAt: purchase.createdAt,
              earning: purchase.scoutEarning,
            };
          }
        }

        return {
          ...lead,
          purchaseInfo,
        };
      })
    );

    return leadsWithPurchaseInfo;
  },
});

/**
 * Example 3: Get scout leaderboard
 * Top scouts by quality score or total earnings
 */
export const getScoutLeaderboard = query({
  args: {
    sortBy: v.optional(v.union(v.literal("quality"), v.literal("earnings"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sortBy = args.sortBy ?? "quality";
    const limit = args.limit ?? 10;

    // Get all scouts
    const scouts = await ctx.db.query("scouts").collect();

    // Fetch user info for each scout
    const scoutsWithUserInfo = await Promise.all(
      scouts.map(async (scout) => {
        const user = await ctx.db.get(scout.userId);
        return {
          scoutId: scout._id,
          name: user?.name ?? "Unknown",
          qualityScore: scout.qualityScore,
          badge: scout.badge,
          totalEarnings: scout.totalEarnings,
          totalLeadsSold: scout.totalLeadsSold,
          totalLeadsSubmitted: scout.totalLeadsSubmitted,
          conversionRate:
            scout.totalLeadsSubmitted > 0
              ? (scout.totalLeadsSold / scout.totalLeadsSubmitted) * 100
              : 0,
        };
      })
    );

    // Sort based on criteria
    const sorted = scoutsWithUserInfo.sort((a, b) => {
      if (sortBy === "quality") {
        return b.qualityScore - a.qualityScore;
      } else {
        return b.totalEarnings - a.totalEarnings;
      }
    });

    return sorted.slice(0, limit);
  },
});

/**
 * Example 4: Get scout statistics by category
 * Which categories this scout performs best in
 */
export const getMyPerformanceByCategory = query({
  args: {},
  handler: async (ctx) => {
    // Get current user (must be scout)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "scout") {
      throw new Error("Unauthorized: Scout access only");
    }

    const scout = await ctx.db
      .query("scouts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!scout) throw new Error("Scout profile not found");

    // Get all leads from this scout
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_scout", (q) => q.eq("scoutId", scout._id))
      .collect();

    // Group by category
    const categoryStats: Record<
      string,
      { submitted: number; sold: number; totalEarnings: number; avgQuality: number }
    > = {};

    for (const lead of leads) {
      if (!categoryStats[lead.category]) {
        categoryStats[lead.category] = {
          submitted: 0,
          sold: 0,
          totalEarnings: 0,
          avgQuality: 0,
        };
      }

      categoryStats[lead.category].submitted++;
      categoryStats[lead.category].avgQuality += lead.qualityScore;

      if (lead.status === "sold") {
        categoryStats[lead.category].sold++;

        // Get earnings for this lead
        const purchase = await ctx.db
          .query("purchases")
          .withIndex("by_lead", (q) => q.eq("leadId", lead._id))
          .unique();

        if (purchase) {
          categoryStats[lead.category].totalEarnings += purchase.scoutEarning;
        }
      }
    }

    // Calculate averages and conversion rates
    const results = Object.entries(categoryStats).map(([category, stats]) => {
      const conversionRate = stats.submitted > 0 ? (stats.sold / stats.submitted) * 100 : 0;
      const avgQuality = stats.submitted > 0 ? stats.avgQuality / stats.submitted : 0;

      return {
        category,
        leadsSubmitted: stats.submitted,
        leadsSold: stats.sold,
        conversionRate: Math.round(conversionRate * 10) / 10,
        totalEarnings: Math.round(stats.totalEarnings * 100) / 100,
        avgQualityScore: Math.round(avgQuality * 10) / 10,
      };
    });

    // Sort by earnings descending
    return results.sort((a, b) => b.totalEarnings - a.totalEarnings);
  },
});

/**
 * Example 5: Get scouts pending payout
 * Admin query to see which scouts will be paid in next cycle
 */
export const getScoutsPendingPayout = query({
  args: {
    minAmount: v.optional(v.number()), // Minimum threshold (default from env)
  },
  handler: async (ctx, args) => {
    // Verify admin access
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access only");
    }

    const minAmount = args.minAmount ?? 20; // Default from PAYOUT_MINIMUM_THRESHOLD

    // Get all scouts
    const scouts = await ctx.db.query("scouts").collect();

    // Filter scouts with pending earnings >= threshold
    const eligibleScouts = scouts.filter(
      (scout) => scout.pendingEarnings >= minAmount && scout.onboardingComplete
    );

    // Fetch user info and calculate totals
    const scoutsWithUserInfo = await Promise.all(
      eligibleScouts.map(async (scout) => {
        const user = await ctx.db.get(scout.userId);
        return {
          scoutId: scout._id,
          userId: scout.userId,
          name: user?.name ?? "Unknown",
          email: user?.email ?? "Unknown",
          pendingEarnings: scout.pendingEarnings,
          stripeConnectAccountId: scout.stripeConnectAccountId,
          totalEarnings: scout.totalEarnings,
        };
      })
    );

    // Calculate total payout amount
    const totalPayoutAmount = scoutsWithUserInfo.reduce(
      (sum, scout) => sum + scout.pendingEarnings,
      0
    );

    return {
      eligibleScouts: scoutsWithUserInfo.length,
      totalPayoutAmount: Math.round(totalPayoutAmount * 100) / 100,
      scouts: scoutsWithUserInfo.sort((a, b) => b.pendingEarnings - a.pendingEarnings),
    };
  },
});

/**
 * Example 6: Get scout public profile
 * Visible to companies viewing leads
 */
export const getScoutPublicProfile = query({
  args: { scoutId: v.id("scouts") },
  handler: async (ctx, args) => {
    const scout = await ctx.db.get(args.scoutId);
    if (!scout) throw new Error("Scout not found");

    const user = await ctx.db.get(scout.userId);
    if (!user) throw new Error("User not found");

    // Get recent sold leads for reputation
    const recentPurchases = await ctx.db
      .query("purchases")
      .withIndex("by_scout", (q) => q.eq("scoutId", args.scoutId))
      .order("desc")
      .take(5);

    const recentLeads = await Promise.all(
      recentPurchases.map(async (purchase) => {
        const lead = await ctx.db.get(purchase.leadId);
        return {
          category: lead?.category ?? "Unknown",
          qualityScore: lead?.qualityScore ?? 0,
          soldAt: purchase.createdAt,
        };
      })
    );

    // Calculate average quality of recent leads
    const avgRecentQuality =
      recentLeads.length > 0
        ? recentLeads.reduce((sum, lead) => sum + lead.qualityScore, 0) / recentLeads.length
        : 0;

    return {
      name: user.name,
      bio: user.profile.bio,
      linkedin: user.profile.linkedin,
      industryExpertise: user.profile.industryExpertise ?? [],
      qualityScore: scout.qualityScore,
      badge: scout.badge,
      totalLeadsSold: scout.totalLeadsSold,
      conversionRate:
        scout.totalLeadsSubmitted > 0
          ? Math.round((scout.totalLeadsSold / scout.totalLeadsSubmitted) * 100 * 10) / 10
          : 0,
      recentLeads,
      avgRecentQuality: Math.round(avgRecentQuality * 10) / 10,
    };
  },
});

/**
 * Example 7: Get scout earnings trends
 * Weekly earnings for last 12 weeks
 */
export const getMyEarningsTrends = query({
  args: {
    weeks: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get current user (must be scout)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "scout") {
      throw new Error("Unauthorized: Scout access only");
    }

    const scout = await ctx.db
      .query("scouts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!scout) throw new Error("Scout profile not found");

    const weeks = args.weeks ?? 12;
    const now = Date.now();

    // Get all purchases
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_scout", (q) => q.eq("scoutId", scout._id))
      .collect();

    // Group by week
    const weeklyEarnings: Record<string, number> = {};

    for (let i = 0; i < weeks; i++) {
      const weekStart = now - (i + 1) * 7 * 24 * 60 * 60 * 1000;
      const weekEnd = now - i * 7 * 24 * 60 * 60 * 1000;
      const weekLabel = `Week ${weeks - i}`;

      const weekPurchases = purchases.filter(
        (p) => p.createdAt >= weekStart && p.createdAt < weekEnd
      );

      weeklyEarnings[weekLabel] = weekPurchases.reduce(
        (sum, p) => sum + p.scoutEarning,
        0
      );
    }

    return Object.entries(weeklyEarnings)
      .map(([week, earnings]) => ({
        week,
        earnings: Math.round(earnings * 100) / 100,
      }))
      .reverse();
  },
});
