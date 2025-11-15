"use node";

/**
 * Stripe Actions
 *
 * External API calls to Stripe for subscriptions, Connect, and webhooks.
 * These actions handle payment processing and scout payouts.
 */

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { getPayoutThreshold } from "../lib/constants";

/**
 * Create subscription checkout session
 * Returns Stripe Checkout URL for company to complete payment
 */
export const createSubscription = action({
  args: {
    userId: v.id("users"),
    planSlug: v.union(v.literal("starter"), v.literal("growth"), v.literal("scale")),
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.runQuery(api.queries.companies.getCurrentUser);
    if (!user) {
      throw new Error("User not found");
    }

    // Map plan to Stripe price ID
    const priceMapping: Record<string, string> = {
      starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID ?? "",
      growth: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID ?? "",
      scale: process.env.NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID ?? "",
    };

    const priceId = priceMapping[args.planSlug];
    if (!priceId) {
      throw new Error(`Unknown plan: ${args.planSlug}`);
    }

    // Initialize Stripe (in real implementation)
    // This is a placeholder - actual Stripe integration would go here
    const checkoutUrl = `https://checkout.stripe.com/pay/${priceId}`;

    console.log("[Stripe] Creating checkout session:", {
      userId: args.userId,
      plan: args.planSlug,
      priceId,
    });

    // In production, this would call:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const session = await stripe.checkout.sessions.create({
    //   customer_email: user.user.email,
    //   mode: "subscription",
    //   line_items: [{ price: priceId, quantity: 1 }],
    //   success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    //   metadata: { userId: args.userId },
    // });
    // return { sessionUrl: session.url };

    return {
      sessionUrl: checkoutUrl,
      priceId,
    };
  },
});

/**
 * Onboard scout with Stripe Connect
 * Creates Express connected account and returns onboarding link
 */
export const onboardScout = action({
  args: {
    scoutId: v.id("scouts"),
  },
  handler: async (ctx, args) => {
    // Get scout
    const scoutData = await ctx.runQuery(api.queries.scouts.getCurrentUser);
    if (!scoutData) {
      throw new Error("Scout not found");
    }

    console.log("[Stripe Connect] Creating account for scout:", args.scoutId);

    // In production, this would call:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    //
    // 1. Create Connect account if not exists
    // let accountId = scoutData.scout.stripeConnectAccountId;
    // if (!accountId) {
    //   const account = await stripe.accounts.create({
    //     type: "express",
    //     country: "FR", // or user's country
    //     email: scoutData.user.email,
    //     capabilities: {
    //       transfers: { requested: true },
    //     },
    //   });
    //   accountId = account.id;
    //
    //   // Update scout with account ID
    //   await ctx.runMutation(api.mutations.scouts.updateStripeConnect, {
    //     scoutId: args.scoutId,
    //     stripeConnectAccountId: accountId,
    //   });
    // }
    //
    // 2. Create account link for onboarding
    // const accountLink = await stripe.accountLinks.create({
    //   account: accountId,
    //   refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/scout/onboarding/refresh`,
    //   return_url: `${process.env.NEXT_PUBLIC_APP_URL}/scout/onboarding/complete`,
    //   type: "account_onboarding",
    // });
    //
    // return { onboardingUrl: accountLink.url, accountId };

    const mockAccountId = "acct_" + Math.random().toString(36).substring(7);
    const onboardingUrl = `https://connect.stripe.com/express/oauth/authorize?client_id=${process.env.STRIPE_CONNECT_CLIENT_ID}`;

    return {
      onboardingUrl,
      accountId: mockAccountId,
    };
  },
});

/**
 * Handle Stripe webhook
 * Processes webhook events from Stripe
 */
export const handleWebhook = action({
  args: {
    eventType: v.string(),
    eventData: v.any(),
  },
  handler: async (ctx, args) => {
    console.log("[Stripe Webhook] Received event:", args.eventType);

    try {
      switch (args.eventType) {
        case "checkout.session.completed": {
          const session = args.eventData;
          const userId = session.metadata?.userId;
          const customerId = session.customer;
          const subscriptionId = session.subscription;
          const priceId = session.line_items?.data[0]?.price?.id;

          if (!userId || !customerId || !subscriptionId || !priceId) {
            throw new Error("Missing required session data");
          }

          // Create company record
          await ctx.runMutation(api.mutations.companies.createFromCheckout, {
            userId,
            stripeCustomerId: customerId,
            subscriptionId,
            priceId,
          });

          console.log("[Stripe Webhook] Created company:", { userId, customerId });
          break;
        }

        case "customer.subscription.updated":
        case "customer.subscription.created": {
          const subscription = args.eventData;
          const customerId = subscription.customer;
          const priceId = subscription.items?.data[0]?.price?.id;

          if (!customerId || !priceId) {
            throw new Error("Missing subscription data");
          }

          await ctx.runMutation(api.mutations.companies.updateSubscription, {
            stripeCustomerId: customerId,
            subscriptionId: subscription.id,
            status: subscription.status as any,
            priceId,
            nextRenewalDate: subscription.current_period_end * 1000,
          });

          console.log("[Stripe Webhook] Updated subscription:", { customerId });
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = args.eventData;
          const customerId = invoice.customer;

          // Monthly renewal - credits already added in subscription.updated
          console.log("[Stripe Webhook] Payment succeeded:", { customerId });
          break;
        }

        case "transfer.created":
        case "transfer.paid": {
          const transfer = args.eventData;
          // Payout to scout completed
          console.log("[Stripe Webhook] Transfer completed:", transfer.id);
          break;
        }

        default:
          console.log("[Stripe Webhook] Unhandled event type:", args.eventType);
      }

      return { success: true };
    } catch (error) {
      console.error("[Stripe Webhook] Error processing event:", error);
      throw error;
    }
  },
});

/**
 * Process payout to scout
 * Creates Stripe transfer to Connect account
 */
export const processPayout = action({
  args: {
    scoutId: v.id("scouts"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    // Get scout
    const scout = await ctx.runQuery(api.queries.scouts.getCurrentUser);
    if (!scout || scout.scout._id !== args.scoutId) {
      throw new Error("Scout not found");
    }

    // Verify Stripe Connect onboarding complete
    if (!scout.scout.onboardingComplete || !scout.scout.stripeConnectAccountId) {
      throw new Error("Stripe Connect onboarding not complete");
    }

    // Verify minimum threshold
    const threshold = getPayoutThreshold();
    if (args.amount < threshold) {
      throw new Error(`Minimum payout is ${threshold}€`);
    }

    // Verify scout has enough pending earnings
    if (scout.scout.pendingEarnings < args.amount) {
      throw new Error("Insufficient pending earnings");
    }

    console.log("[Stripe Payout] Processing:", {
      scoutId: args.scoutId,
      amount: args.amount,
      accountId: scout.scout.stripeConnectAccountId,
    });

    try {
      // In production, this would call:
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      // const transfer = await stripe.transfers.create({
      //   amount: Math.round(args.amount * 100), // Convert to cents
      //   currency: "eur",
      //   destination: scout.scout.stripeConnectAccountId,
      //   description: `LeadScout payout for ${scout.user.name}`,
      //   metadata: {
      //     scoutId: args.scoutId,
      //   },
      // });
      //
      // const transferId = transfer.id;

      const transferId = "tr_" + Math.random().toString(36).substring(7);

      // Complete payout
      await ctx.runMutation(api.mutations.payouts.completePayout, {
        scoutId: args.scoutId,
        amount: args.amount,
        stripeTransferId: transferId,
      });

      // Send email notification
      await ctx.runAction(api.actions.emails.sendPayoutNotification, {
        scoutId: args.scoutId,
        amount: args.amount,
      });

      return { success: true, transferId };
    } catch (error) {
      console.error("[Stripe Payout] Failed:", error);

      // Record failure
      await ctx.runMutation(api.mutations.payouts.recordPayoutFailure, {
        scoutId: args.scoutId,
        amount: args.amount,
        failureReason: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    }
  },
});

/**
 * Create credit top-up checkout
 * For companies purchasing additional credits
 */
export const createCreditCheckout = action({
  args: {
    companyId: v.id("companies"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    // Get company
    const company = await ctx.runQuery(api.queries.companies.getCurrentUser);
    if (!company) {
      throw new Error("Company not found");
    }

    const creditPriceId = process.env.STRIPE_CREDIT_PRICE_ID;
    if (!creditPriceId) {
      throw new Error("Credit price not configured");
    }

    console.log("[Stripe] Creating credit checkout:", {
      companyId: args.companyId,
      quantity: args.quantity,
    });

    // In production, this would call Stripe Checkout for one-time payment
    const checkoutUrl = `https://checkout.stripe.com/pay/${creditPriceId}?quantity=${args.quantity}`;

    return { checkoutUrl };
  },
});
