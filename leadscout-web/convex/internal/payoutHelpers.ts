/**
 * Internal Payout Helpers
 *
 * Internal functions to support payout cron jobs.
 * These are only callable from within Convex (not from clients).
 */

import { internalQuery, internalAction } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get scouts eligible for payout
 * Returns scouts with pending earnings >= threshold
 */
export const getEligibleScouts = internalQuery({
  args: {
    threshold: v.number(),
  },
  handler: async (ctx, args) => {
    const scouts = await ctx.db
      .query("scouts")
      .withIndex("by_pending_earnings")
      .filter((q) => q.gte(q.field("pendingEarnings"), args.threshold))
      .collect();

    return scouts;
  },
});

/**
 * Send admin summary email after payout processing
 * Provides overview of payout batch results
 */
export const sendAdminSummary = internalAction({
  args: {
    totalScouts: v.number(),
    successCount: v.number(),
    failureCount: v.number(),
    results: v.array(
      v.object({
        scoutId: v.id("scouts"),
        success: v.boolean(),
        amount: v.optional(v.number()),
        reason: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // In production, this would send email to admin
    console.log("[Admin Summary] Weekly Payout Processing Results:");
    console.log(`Total scouts processed: ${args.totalScouts}`);
    console.log(`Successful payouts: ${args.successCount}`);
    console.log(`Failed payouts: ${args.failureCount}`);

    const totalPaid = args.results
      .filter((r) => r.success && r.amount)
      .reduce((sum, r) => sum + (r.amount ?? 0), 0);

    console.log(`Total amount paid: ${totalPaid}€`);

    // Log failures
    if (args.failureCount > 0) {
      console.log("\nFailures:");
      args.results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`- Scout ${r.scoutId}: ${r.reason}`);
        });
    }

    return { success: true };
  },
});
