/**
 * Lead Queries
 *
 * Read-only reactive queries for browsing and retrieving lead data.
 * These queries power the marketplace and scout dashboards.
 */

import { query } from "../_generated/server";
import { v } from "convex/values";
import { maskLeadContactInfo } from "../helpers";

/**
 * List available leads in marketplace with filters
 * Companies use this to browse leads before purchase
 */
export const listAvailable = query({
  args: {
    category: v.optional(v.string()),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 0;
    const limit = args.limit ?? 20;
    const offset = page * limit;

    // Start with approved leads
    let query = ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", "approved"));

    let leads = await query.collect();

    // Filter by category if provided
    if (args.category) {
      leads = leads.filter((lead) => lead.category === args.category);
    }

    // Filter by budget range if provided
    if (args.budgetMin !== undefined) {
      leads = leads.filter((lead) => lead.estimatedBudget >= args.budgetMin!);
    }

    if (args.budgetMax !== undefined) {
      leads = leads.filter((lead) => lead.estimatedBudget <= args.budgetMax!);
    }

    // Sort by creation date (newest first)
    leads.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate
    const paginatedLeads = leads.slice(offset, offset + limit);

    // Enrich with scout data (for quality score display)
    const enrichedLeads = await Promise.all(
      paginatedLeads.map(async (lead) => {
        const scout = await ctx.db.get(lead.scoutId);
        const scoutUser = scout ? await ctx.db.get(scout.userId) : null;

        // Mask contact info (revealed after purchase)
        const maskedLead = maskLeadContactInfo(lead);

        return {
          ...maskedLead,
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

    return {
      leads: enrichedLeads,
      total: leads.length,
      page,
      limit,
      hasMore: offset + limit < leads.length,
    };
  },
});

/**
 * Get single lead by ID
 * Returns full details if purchased, masked if not
 */
export const getById = query({
  args: {
    id: v.id("leads"),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.id);
    if (!lead) {
      throw new Error("Lead not found");
    }

    // Get scout info
    const scout = await ctx.db.get(lead.scoutId);
    const scoutUser = scout ? await ctx.db.get(scout.userId) : null;

    // Check if current user purchased this lead
    const identity = await ctx.auth.getUserIdentity();
    let isPurchased = false;

    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (user && user.role === "company") {
        const company = await ctx.db
          .query("companies")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .unique();

        if (company && lead.purchasedBy === company._id) {
          isPurchased = true;
        }
      }
    }

    // If not purchased, mask contact info
    const leadData = isPurchased ? lead : maskLeadContactInfo(lead);

    return {
      ...leadData,
      scout: scout
        ? {
            id: scout._id,
            qualityScore: scout.qualityScore,
            badge: scout.badge,
            name: scoutUser?.name ?? "Anonymous Scout",
          }
        : null,
      isPurchased,
    };
  },
});

/**
 * Get leads submitted by scout
 * Scouts use this to track their submissions
 */
export const getByScout = query({
  args: {
    scoutId: v.id("scouts"),
    status: v.optional(v.union(
      v.literal("pending_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("sold")
    )),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 0;
    const limit = args.limit ?? 20;
    const offset = page * limit;

    // Get all leads from scout
    let leads = await ctx.db
      .query("leads")
      .withIndex("by_scout", (q) => q.eq("scoutId", args.scoutId))
      .collect();

    // Filter by status if provided
    if (args.status) {
      leads = leads.filter((lead) => lead.status === args.status);
    }

    // Sort by creation date (newest first)
    leads.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate
    const paginatedLeads = leads.slice(offset, offset + limit);

    // Enrich with purchase data
    const enrichedLeads = await Promise.all(
      paginatedLeads.map(async (lead) => {
        let purchaseInfo = null;

        if (lead.purchasedBy) {
          const purchase = await ctx.db
            .query("purchases")
            .withIndex("by_lead", (q) => q.eq("leadId", lead._id))
            .first();

          if (purchase) {
            const company = await ctx.db.get(purchase.companyId);
            const companyUser = company ? await ctx.db.get(company.userId) : null;

            purchaseInfo = {
              purchasedAt: lead.purchasedAt,
              earnings: purchase.scoutEarning,
              companyName: companyUser?.profile.companyName ?? "Anonymous Company",
            };
          }
        }

        return {
          ...lead,
          purchase: purchaseInfo,
        };
      })
    );

    return {
      leads: enrichedLeads,
      total: leads.length,
      page,
      limit,
      hasMore: offset + limit < leads.length,
    };
  },
});

/**
 * Get leads pending moderation
 * Admin use this for the moderation queue
 */
export const getPendingModeration = query({
  args: {},
  handler: async (ctx, args) => {
    // Require admin role
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access only");
    }

    // Get pending leads
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_moderation_status", (q) => q.eq("moderationStatus", "pending"))
      .collect();

    // Sort by creation date (oldest first for FIFO processing)
    leads.sort((a, b) => a.createdAt - b.createdAt);

    // Enrich with scout data
    const enrichedLeads = await Promise.all(
      leads.map(async (lead) => {
        const scout = await ctx.db.get(lead.scoutId);
        const scoutUser = scout ? await ctx.db.get(scout.userId) : null;

        return {
          ...lead,
          scout: scout
            ? {
                id: scout._id,
                qualityScore: scout.qualityScore,
                badge: scout.badge,
                name: scoutUser?.name ?? "Anonymous Scout",
                email: scoutUser?.email ?? "",
                totalSubmitted: scout.totalLeadsSubmitted,
                totalSold: scout.totalLeadsSold,
              }
            : null,
        };
      })
    );

    return enrichedLeads;
  },
});

/**
 * Get lead statistics by category
 * Used for analytics dashboard
 */
export const getStatsByCategory = query({
  args: {},
  handler: async (ctx, args) => {
    const leads = await ctx.db.query("leads").collect();

    // Group by category
    const categoryStats: Record<string, {
      total: number;
      approved: number;
      sold: number;
      avgQualityScore: number;
      avgBudget: number;
    }> = {};

    for (const lead of leads) {
      if (!categoryStats[lead.category]) {
        categoryStats[lead.category] = {
          total: 0,
          approved: 0,
          sold: 0,
          avgQualityScore: 0,
          avgBudget: 0,
        };
      }

      const stat = categoryStats[lead.category];
      stat.total += 1;
      if (lead.status === "approved") stat.approved += 1;
      if (lead.status === "sold") stat.sold += 1;
      stat.avgQualityScore += lead.qualityScore;
      stat.avgBudget += lead.estimatedBudget;
    }

    // Calculate averages
    for (const category in categoryStats) {
      const stat = categoryStats[category];
      stat.avgQualityScore = stat.avgQualityScore / stat.total;
      stat.avgBudget = stat.avgBudget / stat.total;
    }

    return categoryStats;
  },
});
