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
import Stripe from "stripe";

// Initialize Stripe SDK
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

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

    console.log("[Stripe] Creating checkout session:", {
      userId: args.userId,
      plan: args.planSlug,
      priceId,
    });

    try {
      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        customer_email: user.user.email,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        metadata: {
          userId: args.userId,
          planSlug: args.planSlug,
        },
        allow_promotion_codes: true,
        billing_address_collection: "required",
        tax_id_collection: {
          enabled: true,
        },
      });

      if (!session.url) {
        throw new Error("Failed to create checkout session URL");
      }

      return {
        sessionUrl: session.url,
        sessionId: session.id,
        priceId,
      };
    } catch (error) {
      console.error("[Stripe] Failed to create checkout session:", error);
      throw new Error(
        `Failed to create checkout session: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
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

    try {
      // 1. Create Connect account if not exists
      let accountId = scoutData.scout.stripeConnectAccountId;

      if (!accountId) {
        const account = await stripe.accounts.create({
          type: "express",
          country: "FR", // France - adjust based on scout location
          email: scoutData.user.email,
          capabilities: {
            transfers: { requested: true },
          },
          business_type: "individual",
          metadata: {
            scoutId: args.scoutId,
            userName: scoutData.user.name,
          },
        });

        accountId = account.id;

        // Update scout with account ID
        await ctx.runMutation(api.mutations.scouts.updateStripeConnect, {
          scoutId: args.scoutId,
          stripeConnectAccountId: accountId,
        });

        console.log("[Stripe Connect] Created account:", accountId);
      }

      // 2. Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/scout/onboarding/refresh`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/scout/onboarding/complete`,
        type: "account_onboarding",
      });

      return {
        onboardingUrl: accountLink.url,
        accountId,
      };
    } catch (error) {
      console.error("[Stripe Connect] Failed to onboard scout:", error);
      throw new Error(
        `Failed to create Connect account: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
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
      // Create Stripe transfer to Connected Account
      const transfer = await stripe.transfers.create({
        amount: Math.round(args.amount * 100), // Convert euros to cents
        currency: "eur",
        destination: scout.scout.stripeConnectAccountId,
        description: `LeadScout payout for ${scout.user.name}`,
        metadata: {
          scoutId: args.scoutId,
          userName: scout.user.name,
          userEmail: scout.user.email,
        },
      });

      console.log("[Stripe Payout] Transfer created:", transfer.id);

      // Complete payout
      await ctx.runMutation(api.mutations.payouts.completePayout, {
        scoutId: args.scoutId,
        amount: args.amount,
        stripeTransferId: transfer.id,
      });

      // Send email notification
      await ctx.runAction(api.actions.emails.sendPayoutNotification, {
        scoutId: args.scoutId,
        amount: args.amount,
      });

      return {
        success: true,
        transferId: transfer.id,
        amount: args.amount,
      };
    } catch (error) {
      console.error("[Stripe Payout] Failed:", error);

      // Record failure
      await ctx.runMutation(api.mutations.payouts.recordPayoutFailure, {
        scoutId: args.scoutId,
        amount: args.amount,
        failureReason: error instanceof Error ? error.message : "Unknown error",
      });

      throw new Error(
        `Payout failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
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

    try {
      // Create one-time payment checkout for credit top-up
      const session = await stripe.checkout.sessions.create({
        customer: company.company.stripeCustomerId,
        mode: "payment",
        line_items: [
          {
            price: creditPriceId,
            quantity: args.quantity,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?credit_purchase=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?credit_purchase=cancelled`,
        metadata: {
          companyId: args.companyId,
          creditQuantity: args.quantity.toString(),
          purchaseType: "credit_topup",
        },
      });

      if (!session.url) {
        throw new Error("Failed to create credit checkout session URL");
      }

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    } catch (error) {
      console.error("[Stripe] Failed to create credit checkout:", error);
      throw new Error(
        `Failed to create credit checkout: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
});
