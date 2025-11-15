/**
 * Payout Mutations
 *
 * Write operations for processing scout payouts.
 * Called from Stripe Connect actions after transfer completion.
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { createNotification } from "../helpers";

/**
 * Complete payout
 * Updates scout earnings after successful Stripe transfer
 * Called from payout action after transfer is confirmed
 */
export const completePayout = mutation({
  args: {
    scoutId: v.id("scouts"),
    amount: v.number(),
    stripeTransferId: v.string(),
  },
  handler: async (ctx, args) => {
    const scout = await ctx.db.get(args.scoutId);
    if (!scout) {
      throw new Error("Scout not found");
    }

    // Verify amount matches pending earnings
    if (scout.pendingEarnings < args.amount) {
      throw new Error("Payout amount exceeds pending earnings");
    }

    // Move pending → total earnings
    const newPendingEarnings = scout.pendingEarnings - args.amount;
    const newTotalEarnings = scout.totalEarnings + args.amount;

    await ctx.db.patch(args.scoutId, {
      pendingEarnings: newPendingEarnings,
      totalEarnings: newTotalEarnings,
      lastPayoutDate: Date.now(),
    });

    // Create payout record
    const payoutId = await ctx.db.insert("payouts", {
      scoutId: args.scoutId,
      amount: args.amount,
      status: "completed",
      stripeTransferId: args.stripeTransferId,
      processedAt: Date.now(),
      completedAt: Date.now(),
      createdAt: Date.now(),
    });

    // Notify scout
    const scoutUser = await ctx.db.get(scout.userId);
    if (scoutUser) {
      await createNotification(
        ctx,
        scoutUser._id,
        "payout_processed",
        "Payout Sent!",
        `Your payout of ${args.amount}€ has been sent to your bank account. It should arrive in 2-5 business days.`,
        { amount: args.amount, payoutId }
      );
    }

    return {
      success: true,
      payoutId,
      newPendingEarnings,
      newTotalEarnings,
    };
  },
});

/**
 * Record payout failure
 * Called when Stripe transfer fails
 */
export const recordPayoutFailure = mutation({
  args: {
    scoutId: v.id("scouts"),
    amount: v.number(),
    failureReason: v.string(),
  },
  handler: async (ctx, args) => {
    const scout = await ctx.db.get(args.scoutId);
    if (!scout) {
      throw new Error("Scout not found");
    }

    // Create failed payout record
    const payoutId = await ctx.db.insert("payouts", {
      scoutId: args.scoutId,
      amount: args.amount,
      status: "failed",
      failureReason: args.failureReason,
      processedAt: Date.now(),
      createdAt: Date.now(),
    });

    // Notify scout
    const scoutUser = await ctx.db.get(scout.userId);
    if (scoutUser) {
      await createNotification(
        ctx,
        scoutUser._id,
        "payout_processed",
        "Payout Failed",
        `Your payout of ${args.amount}€ could not be processed. Reason: ${args.failureReason}. Please check your Stripe Connect account.`,
        { amount: args.amount, payoutId, failureReason: args.failureReason }
      );
    }

    return { success: true, payoutId };
  },
});

/**
 * Create pending payout
 * Called at start of payout process
 */
export const createPendingPayout = mutation({
  args: {
    scoutId: v.id("scouts"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const scout = await ctx.db.get(args.scoutId);
    if (!scout) {
      throw new Error("Scout not found");
    }

    // Verify scout has enough pending earnings
    if (scout.pendingEarnings < args.amount) {
      throw new Error("Insufficient pending earnings");
    }

    // Create pending payout record
    const payoutId = await ctx.db.insert("payouts", {
      scoutId: args.scoutId,
      amount: args.amount,
      status: "pending",
      createdAt: Date.now(),
    });

    return { success: true, payoutId };
  },
});

/**
 * Update payout status to processing
 * Called when Stripe transfer is initiated
 */
export const updatePayoutProcessing = mutation({
  args: {
    payoutId: v.id("payouts"),
    stripeTransferId: v.string(),
  },
  handler: async (ctx, args) => {
    const payout = await ctx.db.get(args.payoutId);
    if (!payout) {
      throw new Error("Payout not found");
    }

    await ctx.db.patch(args.payoutId, {
      status: "processing",
      stripeTransferId: args.stripeTransferId,
      processedAt: Date.now(),
    });

    return { success: true };
  },
});
