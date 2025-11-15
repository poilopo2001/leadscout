/**
 * Reminder Cron Jobs
 *
 * Scheduled functions for sending reminder notifications.
 * Runs daily at 10:00 AM UTC.
 */

import { internalMutation } from "../_generated/server";
import { api } from "../_generated/api";
import { getLowCreditThreshold } from "../lib/constants";

/**
 * Send low credits reminders
 * Runs daily at 10:00 AM UTC
 */
export const sendLowCreditsReminders = internalMutation({
  handler: async (ctx) => {
    console.log("[Cron] Starting low credits reminder check...");

    try {
      const threshold = getLowCreditThreshold();

      // Get all active companies
      const companies = await ctx.db
        .query("companies")
        .filter((q) => q.eq(q.field("subscriptionStatus"), "active"))
        .collect();

      let alertCount = 0;

      for (const company of companies) {
        try {
          // Check if notifications enabled
          if (!company.preferences.notifications.lowCredits) {
            continue;
          }

          // Check if credits are low (< 20% of allocation or < threshold)
          const percentageRemaining =
            company.creditsAllocated > 0
              ? (company.creditsRemaining / company.creditsAllocated) * 100
              : 0;

          const isLow =
            company.creditsRemaining < threshold || percentageRemaining < 20;

          if (!isLow) {
            continue;
          }

          // Check if we already sent an alert today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayTimestamp = today.getTime();

          const recentAlert = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", company.userId))
            .filter((q) =>
              q.and(
                q.eq(q.field("type"), "low_credits"),
                q.gte(q.field("createdAt"), todayTimestamp)
              )
            )
            .first();

          if (recentAlert) {
            console.log(
              `[Cron] Company ${company._id} - Already alerted today, skipping`
            );
            continue;
          }

          // Create notification
          await ctx.db.insert("notifications", {
            userId: company.userId,
            type: "low_credits",
            title: "Low Credits Alert",
            message: `You have ${company.creditsRemaining} credits remaining (${Math.round(percentageRemaining)}% of your monthly allocation). Consider upgrading your plan or purchasing more credits.`,
            metadata: {
              creditsRemaining: company.creditsRemaining,
              percentageRemaining,
            },
            read: false,
            createdAt: Date.now(),
          });

          // Note: Email sending would be handled by a separate action
          // This could be called here if needed

          alertCount++;
          console.log(
            `[Cron] Company ${company._id} - Low credits alert sent: ${company.creditsRemaining} credits`
          );
        } catch (error) {
          console.error(
            `[Cron] Company ${company._id} - Alert failed:`,
            error instanceof Error ? error.message : error
          );
        }
      }

      console.log(
        `[Cron] Low credits reminder check complete. Alerts sent: ${alertCount}`
      );

      return {
        success: true,
        alertsSent: alertCount,
      };
    } catch (error) {
      console.error("[Cron] Low credits reminder check failed:", error);
      throw error;
    }
  },
});

/**
 * Send renewal reminders
 * Runs daily at 10:00 AM UTC
 * Reminds companies 3 days before renewal
 */
export const sendRenewalReminders = internalMutation({
  handler: async (ctx) => {
    console.log("[Cron] Starting renewal reminder check...");

    try {
      // Get all active companies
      const companies = await ctx.db
        .query("companies")
        .filter((q) => q.eq(q.field("subscriptionStatus"), "active"))
        .collect();

      // Calculate 3 days from now
      const threeDaysFromNow = Date.now() + 3 * 24 * 60 * 60 * 1000;
      const fourDaysFromNow = Date.now() + 4 * 24 * 60 * 60 * 1000;

      let reminderCount = 0;

      for (const company of companies) {
        try {
          // Check if notifications enabled
          if (!company.preferences.notifications.renewalReminder) {
            continue;
          }

          // Check if renewal is in 3 days
          if (!company.nextRenewalDate) {
            continue;
          }

          const isWithinReminderWindow =
            company.nextRenewalDate >= threeDaysFromNow &&
            company.nextRenewalDate < fourDaysFromNow;

          if (!isWithinReminderWindow) {
            continue;
          }

          // Check if we already sent a reminder for this renewal
          const existingReminder = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", company.userId))
            .filter((q) =>
              q.and(
                q.eq(q.field("type"), "subscription_renewed"),
                q.gte(q.field("createdAt"), Date.now() - 7 * 24 * 60 * 60 * 1000)
              )
            )
            .first();

          if (existingReminder) {
            console.log(
              `[Cron] Company ${company._id} - Already reminded, skipping`
            );
            continue;
          }

          // Create notification
          const renewalDate = new Date(company.nextRenewalDate);
          await ctx.db.insert("notifications", {
            userId: company.userId,
            type: "subscription_renewed",
            title: "Subscription Renewal Reminder",
            message: `Your ${company.plan} plan will renew on ${renewalDate.toLocaleDateString()}. ${company.creditsAllocated} credits will be added to your account.`,
            metadata: {
              plan: company.plan,
              renewalDate: company.nextRenewalDate,
              creditsToBeAdded: company.creditsAllocated,
            },
            read: false,
            createdAt: Date.now(),
          });

          reminderCount++;
          console.log(
            `[Cron] Company ${company._id} - Renewal reminder sent for ${renewalDate.toLocaleDateString()}`
          );
        } catch (error) {
          console.error(
            `[Cron] Company ${company._id} - Reminder failed:`,
            error instanceof Error ? error.message : error
          );
        }
      }

      console.log(
        `[Cron] Renewal reminder check complete. Reminders sent: ${reminderCount}`
      );

      return {
        success: true,
        remindersSent: reminderCount,
      };
    } catch (error) {
      console.error("[Cron] Renewal reminder check failed:", error);
      throw error;
    }
  },
});
