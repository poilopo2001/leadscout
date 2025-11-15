/**
 * Scout Mutations
 *
 * Write operations for scout profile management and quality score updates.
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentScout, updateScoutBadge } from "../helpers";
import { calculateScoutQuality } from "../lib/calculateScoutQuality";

/**
 * Update scout profile
 * Updates user profile fields for scouts
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    industryExpertise: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const scout = await getCurrentScout(ctx);
    const user = await ctx.db.get(scout.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Build updates
    const profileUpdates: any = { ...user.profile };

    if (args.bio !== undefined) profileUpdates.bio = args.bio;
    if (args.linkedin !== undefined) profileUpdates.linkedin = args.linkedin;
    if (args.industryExpertise !== undefined)
      profileUpdates.industryExpertise = args.industryExpertise;

    // Update user
    await ctx.db.patch(user._id, {
      ...(args.name && { name: args.name }),
      profile: profileUpdates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update scout quality score
 * Recalculates quality score based on lead performance
 * Called after lead is sold or rejected
 */
export const updateQualityScore = mutation({
  args: {
    scoutId: v.id("scouts"),
  },
  handler: async (ctx, args) => {
    const scout = await ctx.db.get(args.scoutId);
    if (!scout) {
      throw new Error("Scout not found");
    }

    // Get scout's leads
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_scout", (q) => q.eq("scoutId", args.scoutId))
      .collect();

    // Calculate metrics
    const totalSubmitted = leads.length;
    const totalSold = leads.filter((l) => l.status === "sold").length;
    const totalApproved = leads.filter(
      (l) => l.status === "approved" || l.status === "sold"
    ).length;
    const totalRejected = leads.filter((l) => l.status === "rejected").length;

    // Calculate rates
    const soldRate = totalSubmitted > 0 ? totalSold / totalSubmitted : 0;
    const approvalRate = totalSubmitted > 0 ? totalApproved / totalSubmitted : 0;

    // Calculate average quality score of sold leads
    const soldLeads = leads.filter((l) => l.status === "sold");
    const avgLeadQuality =
      soldLeads.length > 0
        ? soldLeads.reduce((sum, l) => sum + l.qualityScore, 0) / soldLeads.length
        : 5; // Default 5 if no sold leads yet

    // Use quality calculation helper
    const newQualityScore = calculateScoutQuality({
      totalLeadsSubmitted: totalSubmitted,
      totalLeadsApproved: totalSubmitted, // Approximation
      totalLeadsSold: totalSold,
      totalLeadsRejected: 0,
      averageLeadQuality: avgLeadQuality,
    });

    // Update scout
    await ctx.db.patch(args.scoutId, {
      qualityScore: newQualityScore,
      totalLeadsSubmitted: totalSubmitted,
      totalLeadsSold: totalSold,
    });

    // Check badge upgrade
    await updateScoutBadge(ctx, args.scoutId);

    return {
      success: true,
      qualityScore: newQualityScore,
      soldRate,
      approvalRate,
    };
  },
});

/**
 * Update Stripe Connect account ID
 * Called after scout completes Stripe Connect onboarding
 */
export const updateStripeConnect = mutation({
  args: {
    scoutId: v.id("scouts"),
    stripeConnectAccountId: v.string(),
  },
  handler: async (ctx, args) => {
    const scout = await ctx.db.get(args.scoutId);
    if (!scout) {
      throw new Error("Scout not found");
    }

    await ctx.db.patch(args.scoutId, {
      stripeConnectAccountId: args.stripeConnectAccountId,
      onboardingComplete: true,
    });

    return { success: true };
  },
});

/**
 * Mark notification as read
 * Generic mutation for all user types
 */
export const markNotificationRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    // Verify ownership
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || notification.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.notificationId, {
      read: true,
    });

    return { success: true };
  },
});

/**
 * Mark all notifications as read
 * Convenience function for "mark all read" button
 */
export const markAllNotificationsRead = mutation({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();

    // Update all to read
    await Promise.all(
      unreadNotifications.map((notification) =>
        ctx.db.patch(notification._id, { read: true })
      )
    );

    return { success: true, count: unreadNotifications.length };
  },
});
