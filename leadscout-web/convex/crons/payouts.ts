/**
 * Payout Cron Jobs
 *
 * Scheduled function to process weekly scout payouts.
 * Runs every Friday at 9:00 AM UTC.
 */

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { api } from "../_generated/api";
import { getPayoutThreshold } from "../lib/constants";

/**
 * Process weekly payouts for all eligible scouts
 * Runs every Friday at 9:00 AM UTC
 */
export const processWeeklyPayouts = internalAction({
  handler: async (ctx): Promise<{ success: boolean; processed: number; succeeded: number; failed: number; results: any[] }> => {
    console.log("[Cron] Starting weekly payout processing...");

    try {
      // Get payout threshold from constants
      const threshold = getPayoutThreshold();

      // Get all scouts
      const scouts = await ctx.runQuery(internal.internal.payoutHelpers.getEligibleScouts, {
        threshold,
      });

      console.log(
        `[Cron] Found ${scouts.length} scouts with pending >= ${threshold}€`
      );

      let successCount = 0;
      let failureCount = 0;
      const results = [];

      // Process each scout
      for (const scout of scouts) {
        try {
          console.log(
            `[Cron] Processing payout for scout ${scout._id}: ${scout.pendingEarnings}€`
          );

          // Check Stripe Connect onboarding
          if (!scout.onboardingComplete || !scout.stripeConnectAccountId) {
            console.log(
              `[Cron] Scout ${scout._id} - Stripe Connect not complete, skipping`
            );
            results.push({
              scoutId: scout._id,
              success: false,
              reason: "Stripe Connect onboarding incomplete",
            });
            failureCount++;
            continue;
          }

          // Process payout via Stripe
          await ctx.runAction(api.actions.stripe.processPayout, {
            scoutId: scout._id,
            amount: scout.pendingEarnings,
          });

          successCount++;
          results.push({
            scoutId: scout._id,
            success: true,
            amount: scout.pendingEarnings,
          });

          console.log(
            `[Cron] Scout ${scout._id} - Payout successful: ${scout.pendingEarnings}€`
          );
        } catch (error) {
          failureCount++;
          results.push({
            scoutId: scout._id,
            success: false,
            reason: error instanceof Error ? error.message : "Unknown error",
          });

          console.error(
            `[Cron] Scout ${scout._id} - Payout failed:`,
            error instanceof Error ? error.message : error
          );
        }
      }

      // Send admin summary email
      if (scouts.length > 0) {
        await ctx.runAction(internal.internal.payoutHelpers.sendAdminSummary, {
          totalScouts: scouts.length,
          successCount,
          failureCount,
          results,
        });
      }

      console.log(
        `[Cron] Weekly payout processing complete. Success: ${successCount}, Failures: ${failureCount}`
      );

      return {
        success: true,
        processed: scouts.length,
        succeeded: successCount,
        failed: failureCount,
        results,
      };
    } catch (error) {
      console.error("[Cron] Weekly payout processing failed:", error);
      throw error;
    }
  },
});
