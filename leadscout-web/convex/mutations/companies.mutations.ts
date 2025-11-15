/**
 * Company Mutations
 *
 * Write operations for company subscription, credits, and preferences.
 * These mutations handle Stripe webhook events and credit management.
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentCompany, addCredits, createNotification } from "../helpers";
import { getPlanCredits } from "../lib/constants";

/**
 * Update company subscription
 * Called from Stripe webhook when subscription is created/updated
 */
export const updateSubscription = mutation({
  args: {
    stripeCustomerId: v.string(),
    subscriptionId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("past_due"),
      v.literal("canceled"),
      v.literal("incomplete")
    ),
    priceId: v.string(),
    nextRenewalDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Find company by Stripe customer ID
    const company = await ctx.db
      .query("companies")
      .withIndex("by_stripe_customer", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .unique();

    if (!company) {
      throw new Error("Company not found");
    }

    // Map price ID to plan
    const planMapping: Record<string, "starter" | "growth" | "scale"> = {
      [process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID ?? ""]: "starter",
      [process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID ?? ""]: "growth",
      [process.env.NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID ?? ""]: "scale",
    };

    const plan = planMapping[args.priceId];
    if (!plan) {
      throw new Error(`Unknown price ID: ${args.priceId}`);
    }

    // Get plan credits
    const planCredits = getPlanCredits(plan);

    // Update subscription
    await ctx.db.patch(company._id, {
      subscriptionId: args.subscriptionId,
      plan,
      subscriptionStatus: args.status,
      creditsAllocated: planCredits,
      nextRenewalDate: args.nextRenewalDate,
      updatedAt: Date.now(),
    });

    // If new active subscription, add credits
    if (args.status === "active" && company.subscriptionStatus !== "active") {
      await addCredits(
        ctx,
        company._id,
        planCredits,
        "allocation",
        `Monthly subscription renewal: ${plan} plan`,
        args.subscriptionId
      );

      // Notify company
      const user = await ctx.db.get(company.userId);
      if (user) {
        await createNotification(
          ctx,
          user._id,
          "subscription_renewed",
          "Subscription Active",
          `Your ${plan} plan is now active! ${planCredits} credits have been added to your account.`,
          { plan, credits: planCredits }
        );
      }
    }

    return { success: true, plan, credits: planCredits };
  },
});

/**
 * Add credits to company account
 * Can be called from Stripe webhook (top-up) or manually by admin
 */
export const addCreditsPurchase = mutation({
  args: {
    companyId: v.id("companies"),
    amount: v.number(),
    reason: v.string(),
    stripePaymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new Error("Company not found");
    }

    const newBalance = await addCredits(
      ctx,
      args.companyId,
      args.amount,
      "purchase",
      args.reason,
      args.stripePaymentId
    );

    // Notify company
    const user = await ctx.db.get(company.userId);
    if (user) {
      await createNotification(
        ctx,
        user._id,
        "subscription_renewed",
        "Credits Added",
        `${args.amount} credits have been added to your account. New balance: ${newBalance}`,
        { creditsAdded: args.amount, newBalance }
      );
    }

    return { success: true, newBalance };
  },
});

/**
 * Update company preferences
 * Updates filtering and notification settings
 */
export const updatePreferences = mutation({
  args: {
    categories: v.optional(v.array(v.string())),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    notifications: v.optional(
      v.object({
        newLeads: v.boolean(),
        lowCredits: v.boolean(),
        renewalReminder: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const company = await getCurrentCompany(ctx);

    const newPreferences = {
      ...company.preferences,
      ...(args.categories !== undefined && { categories: args.categories }),
      ...(args.budgetMin !== undefined && { budgetMin: args.budgetMin }),
      ...(args.budgetMax !== undefined && { budgetMax: args.budgetMax }),
      ...(args.notifications && { notifications: args.notifications }),
    };

    await ctx.db.patch(company._id, {
      preferences: newPreferences,
      updatedAt: Date.now(),
    });

    return { success: true, preferences: newPreferences };
  },
});

/**
 * Update company profile
 * Updates user profile fields for companies
 */
export const updateProfile = mutation({
  args: {
    companyName: v.optional(v.string()),
    website: v.optional(v.string()),
    industry: v.optional(v.string()),
    teamSize: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const company = await getCurrentCompany(ctx);
    const user = await ctx.db.get(company.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Build profile updates
    const profileUpdates: any = { ...user.profile };

    if (args.companyName !== undefined)
      profileUpdates.companyName = args.companyName;
    if (args.website !== undefined) profileUpdates.website = args.website;
    if (args.industry !== undefined) profileUpdates.industry = args.industry;
    if (args.teamSize !== undefined) profileUpdates.teamSize = args.teamSize;
    if (args.bio !== undefined) profileUpdates.bio = args.bio;

    // Update user
    await ctx.db.patch(user._id, {
      profile: profileUpdates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Create company from Stripe checkout
 * Called when new company signs up via Stripe
 */
export const createFromCheckout = mutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    subscriptionId: v.string(),
    priceId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if company already exists
    const existing = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      throw new Error("Company already exists for this user");
    }

    // Map price ID to plan
    const planMapping: Record<string, "starter" | "growth" | "scale"> = {
      [process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID ?? ""]: "starter",
      [process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID ?? ""]: "growth",
      [process.env.NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID ?? ""]: "scale",
    };

    const plan = planMapping[args.priceId];
    if (!plan) {
      throw new Error(`Unknown price ID: ${args.priceId}`);
    }

    // Get plan credits
    const planCredits = getPlanCredits(plan);

    // Create company
    const companyId = await ctx.db.insert("companies", {
      userId: args.userId,
      stripeCustomerId: args.stripeCustomerId,
      subscriptionId: args.subscriptionId,
      plan,
      subscriptionStatus: "active",
      creditsRemaining: planCredits,
      creditsAllocated: planCredits,
      preferences: {
        categories: [],
        notifications: {
          newLeads: true,
          lowCredits: true,
          renewalReminder: true,
        },
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Record initial credit allocation
    await ctx.db.insert("creditTransactions", {
      companyId,
      type: "allocation",
      amount: planCredits,
      balanceAfter: planCredits,
      stripePaymentId: args.subscriptionId,
      description: `Initial ${plan} plan subscription`,
      createdAt: Date.now(),
    });

    return { success: true, companyId, plan, credits: planCredits };
  },
});
