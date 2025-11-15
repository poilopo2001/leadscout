"use node";

/**
 * Email Actions
 *
 * Send transactional emails via Resend API.
 * Handles notifications for leads, payouts, and subscriptions.
 */

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

/**
 * Send email via Resend
 * Generic email sending function
 */
export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    template: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@leadscout.com";

    if (!apiKey) {
      console.error("[Email] Resend API key not configured");
      throw new Error("Email service not configured");
    }

    console.log("[Email] Sending:", {
      to: args.to,
      subject: args.subject,
      template: args.template,
    });

    // In production, this would call Resend API:
    // const response = await fetch("https://api.resend.com/emails", {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${apiKey}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     from: fromEmail,
    //     to: args.to,
    //     subject: args.subject,
    //     html: renderTemplate(args.template, args.data),
    //   }),
    // });
    //
    // if (!response.ok) {
    //   throw new Error("Failed to send email");
    // }

    return { success: true };
  },
});

/**
 * Send lead sold notification to scout
 * Congratulates scout on sale and shows earnings
 */
export const sendLeadSoldNotification = action({
  args: {
    scoutId: v.id("scouts"),
    leadId: v.id("leads"),
    earnings: v.number(),
  },
  handler: async (ctx, args) => {
    // Get scout and lead data
    const scout = await ctx.runQuery(api.queries.scouts.getCurrentUser);
    if (!scout) {
      throw new Error("Scout not found");
    }

    const lead = await ctx.runQuery(api.queries.leads.getById, {
      id: args.leadId,
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    await ctx.runAction(api.actions.emails.sendEmail, {
      to: scout.user.email,
      subject: "Lead Sold! 🎉",
      template: "lead-sold",
      data: {
        scoutName: scout.user.name,
        leadTitle: lead.title,
        earnings: args.earnings,
        pendingTotal: scout.scout.pendingEarnings + args.earnings,
      },
    });

    return { success: true };
  },
});

/**
 * Send lead purchased notification to company
 * Confirms purchase and provides contact details
 */
export const sendLeadPurchasedNotification = action({
  args: {
    companyId: v.id("companies"),
    leadId: v.id("leads"),
  },
  handler: async (ctx, args) => {
    const company = await ctx.runQuery(api.queries.companies.getCurrentUser);
    if (!company) {
      throw new Error("Company not found");
    }

    const lead = await ctx.runQuery(api.queries.leads.getById, {
      id: args.leadId,
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    await ctx.runAction(api.actions.emails.sendEmail, {
      to: company.user.email,
      subject: "Lead Purchase Confirmation",
      template: "lead-purchased",
      data: {
        companyName: company.user.profile.companyName,
        leadTitle: lead.title,
        contactName: lead.contactName,
        contactEmail: lead.contactEmail,
        contactPhone: lead.contactPhone,
        creditsRemaining: company.company.creditsRemaining,
      },
    });

    return { success: true };
  },
});

/**
 * Send payout notification to scout
 * Confirms payout has been sent to bank account
 */
export const sendPayoutNotification = action({
  args: {
    scoutId: v.id("scouts"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const scout = await ctx.runQuery(api.queries.scouts.getCurrentUser);
    if (!scout) {
      throw new Error("Scout not found");
    }

    await ctx.runAction(api.actions.emails.sendEmail, {
      to: scout.user.email,
      subject: "Payout Sent! 💰",
      template: "payout-processed",
      data: {
        scoutName: scout.user.name,
        amount: args.amount,
        pendingEarnings: scout.scout.pendingEarnings,
        totalEarnings: scout.scout.totalEarnings,
      },
    });

    return { success: true };
  },
});

/**
 * Send welcome email to new user
 * Different templates for scouts vs companies
 */
export const sendWelcomeEmail = action({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("scout"), v.literal("company")),
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.runQuery(api.queries.scouts.getCurrentUser);
    if (!user) {
      throw new Error("User not found");
    }

    const template = args.role === "scout" ? "welcome-scout" : "welcome-company";
    const subject =
      args.role === "scout"
        ? "Welcome to LeadScout! Start earning today"
        : "Welcome to LeadScout! Access qualified leads";

    await ctx.runAction(api.actions.emails.sendEmail, {
      to: user.user.email,
      subject,
      template,
      data: {
        name: user.user.name,
        role: args.role,
      },
    });

    return { success: true };
  },
});

/**
 * Send subscription renewal reminder
 * Reminds company of upcoming renewal and credits to be added
 */
export const sendRenewalReminder = action({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const company = await ctx.runQuery(api.queries.companies.getCurrentUser);
    if (!company) {
      throw new Error("Company not found");
    }

    // Only send if notifications enabled
    if (!company.company.preferences.notifications.renewalReminder) {
      return { success: false, reason: "Notifications disabled" };
    }

    const renewalDate = company.company.nextRenewalDate
      ? new Date(company.company.nextRenewalDate)
      : null;

    await ctx.runAction(api.actions.emails.sendEmail, {
      to: company.user.email,
      subject: "Subscription Renewal Reminder",
      template: "renewal-reminder",
      data: {
        companyName: company.user.profile.companyName,
        plan: company.company.plan,
        creditsAllocated: company.company.creditsAllocated,
        renewalDate: renewalDate?.toLocaleDateString(),
      },
    });

    return { success: true };
  },
});

/**
 * Send low credits alert
 * Warns company they're running low on credits
 */
export const sendLowCreditsAlert = action({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const company = await ctx.runQuery(api.queries.companies.getCurrentUser);
    if (!company) {
      throw new Error("Company not found");
    }

    // Only send if notifications enabled
    if (!company.company.preferences.notifications.lowCredits) {
      return { success: false, reason: "Notifications disabled" };
    }

    await ctx.runAction(api.actions.emails.sendEmail, {
      to: company.user.email,
      subject: "Low Credits Alert",
      template: "low-credits",
      data: {
        companyName: company.user.profile.companyName,
        creditsRemaining: company.company.creditsRemaining,
        plan: company.company.plan,
      },
    });

    return { success: true };
  },
});

/**
 * Send lead approval notification to scout
 * Notifies scout their lead was approved and is now live
 */
export const sendLeadApprovedNotification = action({
  args: {
    scoutId: v.id("scouts"),
    leadId: v.id("leads"),
  },
  handler: async (ctx, args) => {
    const scout = await ctx.runQuery(api.queries.scouts.getCurrentUser);
    if (!scout) {
      throw new Error("Scout not found");
    }

    const lead = await ctx.runQuery(api.queries.leads.getById, {
      id: args.leadId,
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    await ctx.runAction(api.actions.emails.sendEmail, {
      to: scout.user.email,
      subject: "Lead Approved! ✅",
      template: "lead-approved",
      data: {
        scoutName: scout.user.name,
        leadTitle: lead.title,
        estimatedEarnings: lead.salePrice * 0.5,
      },
    });

    return { success: true };
  },
});

/**
 * Send lead rejected notification to scout
 * Explains why lead was rejected with improvement tips
 */
export const sendLeadRejectedNotification = action({
  args: {
    scoutId: v.id("scouts"),
    leadId: v.id("leads"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const scout = await ctx.runQuery(api.queries.scouts.getCurrentUser);
    if (!scout) {
      throw new Error("Scout not found");
    }

    const lead = await ctx.runQuery(api.queries.leads.getById, {
      id: args.leadId,
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    await ctx.runAction(api.actions.emails.sendEmail, {
      to: scout.user.email,
      subject: "Lead Feedback",
      template: "lead-rejected",
      data: {
        scoutName: scout.user.name,
        leadTitle: lead.title,
        reason: args.reason,
      },
    });

    return { success: true };
  },
});
