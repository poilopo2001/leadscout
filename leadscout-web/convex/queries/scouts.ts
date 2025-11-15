/**
 * Scout Queries
 *
 * Read-only queries for scout profile, earnings, and statistics.
 * These power the scout mobile app dashboard.
 */

import { query } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentScout } from "../helpers";

/**
 * Get current logged-in scout profile
 * Returns full scout data including earnings
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

    if (!user || user.role !== "scout") return null;

    const scout = await ctx.db
      .query("scouts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!scout) return null;

    return {
      user,
      scout,
    };
  },
});

/**
 * Get scout dashboard statistics
 * Returns earnings, performance metrics, and milestones
 */
export const getMyStats = query({
  args: {},
  handler: async (ctx, args) => {
    const scout = await getCurrentScout(ctx);

    // Get recent leads (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentLeads = await ctx.db
      .query("leads")
      .withIndex("by_scout", (q) => q.eq("scoutId", scout._id))
      .filter((q) => q.gte(q.field("createdAt"), thirtyDaysAgo))
      .collect();

    // Get recent earnings (last 30 days)
    const recentPurchases = await ctx.db
      .query("purchases")
      .withIndex("by_scout", (q) => q.eq("scoutId", scout._id))
      .filter((q) => q.gte(q.field("createdAt"), thirtyDaysAgo))
      .collect();

    const recentEarnings = recentPurchases.reduce(
      (sum, p) => sum + p.scoutEarning,
      0
    );

    // Get last payout
    const lastPayout = await ctx.db
      .query("payouts")
      .withIndex("by_scout", (q) => q.eq("scoutId", scout._id))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .order("desc")
      .first();

    // Calculate conversion rate
    const conversionRate =
      scout.totalLeadsSubmitted > 0
        ? (scout.totalLeadsSold / scout.totalLeadsSubmitted) * 100
        : 0;

    // Get next badge threshold
    const badgeThresholds = {
      bronze: 0,
      silver: 20,
      gold: 50,
      platinum: 100,
    };

    let nextBadge: string | null = null;
    let leadsToNextBadge = 0;

    if (scout.badge === "bronze") {
      nextBadge = "silver";
      leadsToNextBadge = badgeThresholds.silver - scout.totalLeadsSold;
    } else if (scout.badge === "silver") {
      nextBadge = "gold";
      leadsToNextBadge = badgeThresholds.gold - scout.totalLeadsSold;
    } else if (scout.badge === "gold") {
      nextBadge = "platinum";
      leadsToNextBadge = badgeThresholds.platinum - scout.totalLeadsSold;
    }

    return {
      // Earnings
      pendingEarnings: scout.pendingEarnings,
      totalEarnings: scout.totalEarnings,
      recentEarnings, // Last 30 days
      lastPayoutDate: scout.lastPayoutDate,
      lastPayoutAmount: lastPayout?.amount ?? 0,

      // Performance
      totalLeadsSubmitted: scout.totalLeadsSubmitted,
      totalLeadsSold: scout.totalLeadsSold,
      conversionRate,
      qualityScore: scout.qualityScore,

      // Badge & Milestones
      badge: scout.badge,
      nextBadge,
      leadsToNextBadge,

      // Recent activity
      recentLeadsCount: recentLeads.length,
      recentSalesCount: recentLeads.filter((l) => l.status === "sold").length,

      // Stripe Connect status
      stripeConnectComplete: scout.onboardingComplete,
    };
  },
});

/**
 * Get scout leaderboard
 * Shows top scouts by quality score and sales
 */
export const getLeaderboard = query({
  args: {
    period: v.union(v.literal("week"), v.literal("month"), v.literal("allTime")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    // Calculate date range
    let startDate = 0;
    if (args.period === "week") {
      startDate = Date.now() - 7 * 24 * 60 * 60 * 1000;
    } else if (args.period === "month") {
      startDate = Date.now() - 30 * 24 * 60 * 60 * 1000;
    }

    // Get all scouts
    const scouts = await ctx.db.query("scouts").collect();

    // Enrich with user data and calculate period stats
    const scoutsWithStats = await Promise.all(
      scouts.map(async (scout) => {
        const user = await ctx.db.get(scout.userId);

        // Get period-specific sales
        const purchases = await ctx.db
          .query("purchases")
          .withIndex("by_scout", (q) => q.eq("scoutId", scout._id))
          .filter((q) => q.gte(q.field("createdAt"), startDate))
          .collect();

        const periodSales = purchases.length;
        const periodEarnings = purchases.reduce(
          (sum, p) => sum + p.scoutEarning,
          0
        );

        return {
          scoutId: scout._id,
          name: user?.name ?? "Anonymous Scout",
          badge: scout.badge,
          qualityScore: scout.qualityScore,
          totalLeadsSold: scout.totalLeadsSold,
          totalEarnings: scout.totalEarnings,
          periodSales,
          periodEarnings,
        };
      })
    );

    // Sort by period sales (desc), then quality score (desc)
    scoutsWithStats.sort((a, b) => {
      if (b.periodSales !== a.periodSales) {
        return b.periodSales - a.periodSales;
      }
      return b.qualityScore - a.qualityScore;
    });

    // Take top N scouts
    return scoutsWithStats.slice(0, limit);
  },
});

/**
 * Get scout's recent activity
 * Returns last 10 lead status changes, sales, etc.
 */
export const getRecentActivity = query({
  args: {},
  handler: async (ctx, args) => {
    const scout = await getCurrentScout(ctx);

    // Get recent leads
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_scout", (q) => q.eq("scoutId", scout._id))
      .order("desc")
      .take(10);

    // Get recent payouts
    const payouts = await ctx.db
      .query("payouts")
      .withIndex("by_scout", (q) => q.eq("scoutId", scout._id))
      .order("desc")
      .take(5);

    // Combine and format activity feed
    const activities: Array<{
      type: "lead_submitted" | "lead_approved" | "lead_rejected" | "lead_sold" | "payout";
      timestamp: number;
      data: any;
    }> = [];

    for (const lead of leads) {
      if (lead.status === "pending_review") {
        activities.push({
          type: "lead_submitted",
          timestamp: lead.createdAt,
          data: {
            leadId: lead._id,
            title: lead.title,
            category: lead.category,
          },
        });
      } else if (lead.status === "approved") {
        activities.push({
          type: "lead_approved",
          timestamp: lead.moderatedAt ?? lead.createdAt,
          data: {
            leadId: lead._id,
            title: lead.title,
            category: lead.category,
            salePrice: lead.salePrice,
          },
        });
      } else if (lead.status === "rejected") {
        activities.push({
          type: "lead_rejected",
          timestamp: lead.moderatedAt ?? lead.createdAt,
          data: {
            leadId: lead._id,
            title: lead.title,
            reason: lead.moderationNotes,
          },
        });
      } else if (lead.status === "sold") {
        activities.push({
          type: "lead_sold",
          timestamp: lead.purchasedAt ?? lead.createdAt,
          data: {
            leadId: lead._id,
            title: lead.title,
            category: lead.category,
            earnings: lead.salePrice * 0.5, // Scout gets 50%
          },
        });
      }
    }

    for (const payout of payouts) {
      activities.push({
        type: "payout",
        timestamp: payout.completedAt ?? payout.createdAt,
        data: {
          amount: payout.amount,
          status: payout.status,
        },
      });
    }

    // Sort by timestamp (newest first)
    activities.sort((a, b) => b.timestamp - a.timestamp);

    return activities.slice(0, 10);
  },
});

/**
 * Get earnings breakdown by category
 * Shows which categories generate most income
 */
export const getEarningsByCategory = query({
  args: {},
  handler: async (ctx, args) => {
    const scout = await getCurrentScout(ctx);

    // Get all sold leads
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_scout", (q) => q.eq("scoutId", scout._id))
      .filter((q) => q.eq(q.field("status"), "sold"))
      .collect();

    // Group by category
    const categoryEarnings: Record<string, {
      count: number;
      totalEarnings: number;
      avgEarnings: number;
    }> = {};

    for (const lead of leads) {
      if (!categoryEarnings[lead.category]) {
        categoryEarnings[lead.category] = {
          count: 0,
          totalEarnings: 0,
          avgEarnings: 0,
        };
      }

      const earnings = lead.salePrice * 0.5; // Scout gets 50%
      categoryEarnings[lead.category].count += 1;
      categoryEarnings[lead.category].totalEarnings += earnings;
    }

    // Calculate averages
    for (const category in categoryEarnings) {
      const data = categoryEarnings[category];
      data.avgEarnings = data.totalEarnings / data.count;
    }

    // Convert to array and sort by total earnings
    const result = Object.entries(categoryEarnings).map(([category, data]) => ({
      category,
      ...data,
    }));

    result.sort((a, b) => b.totalEarnings - a.totalEarnings);

    return result;
  },
});

/**
 * Get weekly earnings trend
 * Returns earnings for last 12 weeks for chart
 */
export const getWeeklyEarningsTrend = query({
  args: {},
  handler: async (ctx, args) => {
    const scout = await getCurrentScout(ctx);

    // Get purchases from last 12 weeks
    const twelveWeeksAgo = Date.now() - 12 * 7 * 24 * 60 * 60 * 1000;
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_scout", (q) => q.eq("scoutId", scout._id))
      .filter((q) => q.gte(q.field("createdAt"), twelveWeeksAgo))
      .collect();

    // Group by week
    const weeklyData: Array<{ week: string; earnings: number }> = [];

    for (let i = 11; i >= 0; i--) {
      const weekStart = Date.now() - i * 7 * 24 * 60 * 60 * 1000;
      const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;

      const weekPurchases = purchases.filter(
        (p) => p.createdAt >= weekStart && p.createdAt < weekEnd
      );

      const earnings = weekPurchases.reduce(
        (sum, p) => sum + p.scoutEarning,
        0
      );

      // Format week label
      const date = new Date(weekStart);
      const weekLabel = `${date.getMonth() + 1}/${date.getDate()}`;

      weeklyData.push({ week: weekLabel, earnings });
    }

    return weeklyData;
  },
});
