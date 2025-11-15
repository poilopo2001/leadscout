/**
 * Convex Configuration
 *
 * Configures scheduled functions (cron jobs) for automated tasks.
 */

import { defineApp } from "convex/server";

const app = defineApp();

// NOTE: Cron jobs are temporarily disabled for initial deployment
// They will be re-enabled after verifying basic deployment works
// See: https://docs.convex.dev/scheduling/cron-jobs for configuration

/**
 * Weekly Payout Processing
 * Runs every Friday at 9:00 AM UTC
 * Processes scout payouts for those with >= threshold pending earnings
 */
// app.cron(
//   "processWeeklyPayouts",
//   {
//     hourUTC: 9,
//     minuteUTC: 0,
//     dayOfWeek: 5, // Friday (0 = Sunday, 6 = Saturday)
//   },
//   "crons/payouts:processWeeklyPayouts"
// );

/**
 * Monthly Credit Renewal
 * Runs on the 1st of each month at 00:00 UTC
 * Adds monthly credits to active subscription companies
 */
// app.cron(
//   "renewMonthlyCredits",
//   {
//     hourUTC: 0,
//     minuteUTC: 0,
//     dayOfMonth: 1, // First day of month
//   },
//   "crons/credits:renewMonthlyCredits"
// );

/**
 * Low Credits Reminder
 * Runs daily at 10:00 AM UTC
 * Alerts companies with low credit balances
 */
// app.cron(
//   "sendLowCreditsReminders",
//   {
//     hourUTC: 10,
//     minuteUTC: 0,
//   },
//   "crons/reminders:sendLowCreditsReminders"
// );

/**
 * Renewal Reminder
 * Runs daily at 10:00 AM UTC
 * Reminds companies 3 days before subscription renewal
 */
// app.cron(
//   "sendRenewalReminders",
//   {
//     hourUTC: 10,
//     minuteUTC: 0,
//   },
//   "crons/reminders:sendRenewalReminders"
// );

export default app;
