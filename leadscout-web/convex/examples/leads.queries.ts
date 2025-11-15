/**
 * Example Lead Queries
 *
 * Reference implementations showing how to query leads table
 * with various filters, sorting, and data relationships.
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Example 1: Get all available leads for marketplace
 * With optional category and budget filters
 */
export const getAvailableLeads = query({
  args: {
    category: v.optional(v.string()),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    minQualityScore: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Start with approved leads
    let leadsQuery = ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", "approved"));

    // If category specified, use compound index
    if (args.category) {
      leadsQuery = ctx.db
        .query("leads")
        .withIndex("by_status_and_category", (q) =>
          q.eq("status", "approved").eq("category", args.category)
        );
    }

    let leads = await leadsQuery.collect();

    // Apply budget filters
    if (args.budgetMin !== undefined) {
      leads = leads.filter(lead => lead.estimatedBudget >= args.budgetMin!);
    }

    if (args.budgetMax !== undefined) {
      leads = leads.filter(lead => lead.estimatedBudget <= args.budgetMax!);
    }

    // Apply quality score filter
    if (args.minQualityScore !== undefined) {
      leads = leads.filter(lead => lead.qualityScore >= args.minQualityScore!);
    }

    // Sort by newest first
    leads = leads.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit
    const limit = args.limit ?? 50;
    leads = leads.slice(0, limit);

    // Fetch scout info for each lead
    const leadsWithScoutInfo = await Promise.all(
      leads.map(async (lead) => {
        const scout = await ctx.db.get(lead.scoutId);
        return {
          ...lead,
          // Mask contact info for marketplace preview
          contactName: "***",
          contactEmail: "***",
          contactPhone: "***",
          companyName: lead.companyName.substring(0, 3) + "***",
          // Add scout quality indicators
          scoutQualityScore: scout?.qualityScore ?? 0,
          scoutBadge: scout?.badge ?? "bronze",
          scoutTotalSold: scout?.totalLeadsSold ?? 0,
        };
      })
    );

    return leadsWithScoutInfo;
  },
});

/**
 * Example 2: Get leads pending moderation (Admin only)
 * Sorted by submission date (oldest first)
 */
export const getPendingModerationLeads = query({
  args: {},
  handler: async (ctx) => {
    // Get current user and verify admin role
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access only");
    }

    // Query pending leads
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_moderation_status", (q) => q.eq("moderationStatus", "pending"))
      .collect();

    // Fetch scout info for each lead
    const leadsWithScoutInfo = await Promise.all(
      leads.map(async (lead) => {
        const scout = await ctx.db.get(lead.scoutId);
        const scoutUser = scout ? await ctx.db.get(scout.userId) : null;

        return {
          ...lead,
          scoutName: scoutUser?.name ?? "Unknown",
          scoutEmail: scoutUser?.email ?? "Unknown",
          scoutQualityScore: scout?.qualityScore ?? 0,
          scoutTotalSubmitted: scout?.totalLeadsSubmitted ?? 0,
          scoutTotalSold: scout?.totalLeadsSold ?? 0,
        };
      })
    );

    // Sort by oldest first (FIFO moderation)
    return leadsWithScoutInfo.sort((a, b) => a.createdAt - b.createdAt);
  },
});

/**
 * Example 3: Get lead details by ID
 * Full information (for purchased leads or admin)
 */
export const getLeadById = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");

    // Fetch scout info
    const scout = await ctx.db.get(lead.scoutId);
    const scoutUser = scout ? await ctx.db.get(scout.userId) : null;

    // Fetch purchase info if sold
    let purchaseInfo = null;
    if (lead.purchasedBy) {
      const purchase = await ctx.db
        .query("purchases")
        .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
        .unique();

      if (purchase) {
        const company = await ctx.db.get(purchase.companyId);
        const companyUser = company ? await ctx.db.get(company.userId) : null;

        purchaseInfo = {
          purchasedAt: purchase.createdAt,
          purchasePrice: purchase.purchasePrice,
          companyName: companyUser?.profile.companyName ?? "Unknown",
        };
      }
    }

    return {
      ...lead,
      scoutName: scoutUser?.name ?? "Unknown",
      scoutQualityScore: scout?.qualityScore ?? 0,
      scoutBadge: scout?.badge ?? "bronze",
      purchaseInfo,
    };
  },
});

/**
 * Example 4: Search leads by company name or keywords
 * Text search across title and description
 */
export const searchLeads = query({
  args: {
    searchQuery: v.string(),
    status: v.optional(v.union(
      v.literal("pending_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("sold")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Query leads (optionally filtered by status)
    let leads = args.status
      ? await ctx.db
          .query("leads")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .collect()
      : await ctx.db.query("leads").collect();

    // Filter by search query (case-insensitive)
    const query = args.searchQuery.toLowerCase();
    leads = leads.filter(
      (lead) =>
        lead.title.toLowerCase().includes(query) ||
        lead.description.toLowerCase().includes(query) ||
        lead.companyName.toLowerCase().includes(query) ||
        lead.category.toLowerCase().includes(query)
    );

    // Sort by relevance (title matches first, then description, then newest)
    leads = leads.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(query);
      const bTitle = b.title.toLowerCase().includes(query);
      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;
      return b.createdAt - a.createdAt;
    });

    // Apply limit
    const limit = args.limit ?? 20;
    return leads.slice(0, limit);
  },
});

/**
 * Example 5: Get leads by category with statistics
 * Useful for category-specific marketplace pages
 */
export const getLeadsByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Query leads by category and status
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_status_and_category", (q) =>
        q.eq("status", "approved").eq("category", args.category)
      )
      .collect();

    // Calculate category statistics
    const avgQualityScore =
      leads.reduce((sum, lead) => sum + lead.qualityScore, 0) / (leads.length || 1);

    const avgBudget =
      leads.reduce((sum, lead) => sum + lead.estimatedBudget, 0) / (leads.length || 1);

    // Sort by quality score descending
    const sortedLeads = leads
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, args.limit ?? 20);

    return {
      category: args.category,
      totalLeads: leads.length,
      avgQualityScore: Math.round(avgQualityScore * 10) / 10,
      avgBudget: Math.round(avgBudget),
      leads: sortedLeads,
    };
  },
});

/**
 * Example 6: Get recently sold leads (Analytics)
 * Shows marketplace activity
 */
export const getRecentlySoldLeads = query({
  args: {
    days: v.optional(v.number()), // Last N days
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days ?? 7;
    const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;

    const leads = await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", "sold"))
      .collect();

    // Filter by date
    const recentLeads = leads.filter(
      (lead) => lead.purchasedAt && lead.purchasedAt >= cutoffDate
    );

    // Sort by purchase date descending
    const sortedLeads = recentLeads.sort(
      (a, b) => (b.purchasedAt ?? 0) - (a.purchasedAt ?? 0)
    );

    // Apply limit
    const limit = args.limit ?? 20;
    return sortedLeads.slice(0, limit);
  },
});

/**
 * Example 7: Get lead conversion rate by category
 * Admin analytics: which categories sell best
 */
export const getLeadConversionByCategory = query({
  args: {},
  handler: async (ctx) => {
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

    // Get all leads
    const allLeads = await ctx.db.query("leads").collect();

    // Group by category
    const categoryStats: Record<string, { total: number; sold: number; approved: number }> = {};

    for (const lead of allLeads) {
      if (!categoryStats[lead.category]) {
        categoryStats[lead.category] = { total: 0, sold: 0, approved: 0 };
      }

      categoryStats[lead.category].total++;

      if (lead.status === "sold") {
        categoryStats[lead.category].sold++;
      } else if (lead.status === "approved") {
        categoryStats[lead.category].approved++;
      }
    }

    // Calculate conversion rates
    const results = Object.entries(categoryStats).map(([category, stats]) => {
      const conversionBase = stats.sold + stats.approved;
      const conversionRate =
        conversionBase > 0 ? (stats.sold / conversionBase) * 100 : 0;

      return {
        category,
        totalLeads: stats.total,
        soldLeads: stats.sold,
        approvedLeads: stats.approved,
        conversionRate: Math.round(conversionRate * 10) / 10,
      };
    });

    // Sort by conversion rate descending
    return results.sort((a, b) => b.conversionRate - a.conversionRate);
  },
});
