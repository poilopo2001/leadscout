/**
 * Notification Queries
 *
 * Read-only queries for user notifications.
 * Support both read and unread filtering.
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get user's notifications
 * Supports filtering by read status and pagination
 */
export const getMyNotifications = query({
  args: {
    unreadOnly: v.optional(v.boolean()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
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

    const page = args.page ?? 0;
    const limit = args.limit ?? 20;
    const offset = page * limit;

    // Build query
    let query;
    if (args.unreadOnly) {
      query = ctx.db
        .query("notifications")
        .withIndex("by_user_and_read", (q) =>
          q.eq("userId", user._id).eq("read", false)
        );
    } else {
      query = ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", user._id));
    }

    const allNotifications = await query.collect();

    // Sort by creation date (newest first)
    allNotifications.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate
    const notifications = allNotifications.slice(offset, offset + limit);

    return {
      notifications,
      total: allNotifications.length,
      page,
      limit,
      hasMore: offset + limit < allNotifications.length,
    };
  },
});

/**
 * Get unread notification count
 * For badge display in UI
 */
export const getUnreadCount = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return 0;

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();

    return unreadNotifications.length;
  },
});

/**
 * Get recent notifications (last 7 days)
 * For activity feed display
 */
export const getRecentNotifications = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("createdAt"), sevenDaysAgo))
      .collect();

    // Sort by creation date (newest first)
    notifications.sort((a, b) => b.createdAt - a.createdAt);

    return notifications;
  },
});
