/**
 * Credit Cron Jobs
 *
 * Scheduled functions for monthly credit renewals and allocation.
 * Runs on the 1st of each month at 00:00 UTC.
 */

import { internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { api } from "../_generated/api";
import { getPlanCredits } from "../lib/constants";

/**
 * Renew monthly credits for active subscriptions
 * Runs on the 1st of each month at 00:00 UTC
 */
export const renewMonthlyCredits = internalMutation({
  handler: async (ctx) => {
    console.log("[Cron] Starting monthly credit renewal...");

    try {
      // Get all active companies
      const companies = await ctx.db
        .query("companies")
        .filter((q) => q.eq(q.field("subscriptionStatus"), "active"))
        .collect();

      console.log(`[Cron] Found ${companies.length} active subscriptions`);

      let successCount = 0;
      let failureCount = 0;

      for (const company of companies) {
        try {
          // Get plan credits
          const planCredits = company.plan
            ? getPlanCredits(company.plan)
            : 0;

          if (planCredits === 0) {
            console.log(
              `[Cron] Company ${company._id} - No plan configured, skipping`
            );
            continue;
          }

          // Add monthly credits
          const newBalance = company.creditsRemaining + planCredits;

          await ctx.db.patch(company._id, {
            creditsRemaining: newBalance,
            updatedAt: Date.now(),
          });

          // Record transaction
          await ctx.db.insert("creditTransactions", {
            companyId: company._id,
            type: "allocation",
            amount: planCredits,
            balanceAfter: newBalance,
            description: `Monthly ${company.plan} plan renewal`,
            createdAt: Date.now(),
          });

          // Create notification
          const user = await ctx.db.get(company.userId);
          if (user) {
            await ctx.db.insert("notifications", {
              userId: user._id,
              type: "subscription_renewed",
              title: "Monthly Credits Renewed",
              message: `Your ${company.plan} plan has been renewed! ${planCredits} credits have been added to your account.`,
              metadata: { plan: company.plan, credits: planCredits },
              read: false,
              createdAt: Date.now(),
            });
          }

          successCount++;
          console.log(
            `[Cron] Company ${company._id} - Renewed ${planCredits} credits. New balance: ${newBalance}`
          );
        } catch (error) {
          failureCount++;
          console.error(
            `[Cron] Company ${company._id} - Renewal failed:`,
            error instanceof Error ? error.message : error
          );
        }
      }

      console.log(
        `[Cron] Monthly credit renewal complete. Success: ${successCount}, Failures: ${failureCount}`
      );

      return {
        success: true,
        processed: companies.length,
        succeeded: successCount,
        failed: failureCount,
      };
    } catch (error) {
      console.error("[Cron] Monthly credit renewal failed:", error);
      throw error;
    }
  },
});
