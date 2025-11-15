/**
 * Stripe Webhook Handler
 *
 * Handles incoming webhook events from Stripe with proper signature verification.
 * This endpoint processes subscription events, payment confirmations, and Connect transfers.
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

// Initialize Convex client for server-side calls
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("[Stripe Webhook] Missing signature");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    // CRITICAL SECURITY: Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[Stripe Webhook] Signature verification failed:", errorMessage);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${errorMessage}` },
      { status: 400 }
    );
  }

  console.log("[Stripe Webhook] Received event:", event.type);

  try {
    // Process the webhook event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("[Stripe Webhook] Checkout session completed:", {
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
        });

        // Call Convex action to handle the event
        await convex.action(api.actions.stripe.handleWebhook, {
          eventType: event.type,
          eventData: session,
        });

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        console.log("[Stripe Webhook] Subscription updated:", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
        });

        await convex.action(api.actions.stripe.handleWebhook, {
          eventType: event.type,
          eventData: subscription,
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        console.log("[Stripe Webhook] Subscription deleted:", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        });

        await convex.action(api.actions.stripe.handleWebhook, {
          eventType: event.type,
          eventData: subscription,
        });

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        console.log("[Stripe Webhook] Invoice payment succeeded:", {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          subscriptionId: invoice.subscription,
        });

        await convex.action(api.actions.stripe.handleWebhook, {
          eventType: event.type,
          eventData: invoice,
        });

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        console.log("[Stripe Webhook] Invoice payment failed:", {
          invoiceId: invoice.id,
          customerId: invoice.customer,
        });

        await convex.action(api.actions.stripe.handleWebhook, {
          eventType: event.type,
          eventData: invoice,
        });

        break;
      }

      case "account.updated": {
        // Stripe Connect account updated (scout onboarding)
        const account = event.data.object as Stripe.Account;

        console.log("[Stripe Webhook] Connect account updated:", {
          accountId: account.id,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
        });

        await convex.action(api.actions.stripe.handleWebhook, {
          eventType: event.type,
          eventData: account,
        });

        break;
      }

      case "transfer.created":
      case "transfer.paid": {
        // Payout to scout completed
        const transfer = event.data.object as Stripe.Transfer;

        console.log("[Stripe Webhook] Transfer completed:", {
          transferId: transfer.id,
          destination: transfer.destination,
          amount: transfer.amount,
        });

        await convex.action(api.actions.stripe.handleWebhook, {
          eventType: event.type,
          eventData: transfer,
        });

        break;
      }

      default:
        console.log("[Stripe Webhook] Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Stripe Webhook] Error processing event:", errorMessage);

    // Return 500 to trigger Stripe retry
    return NextResponse.json(
      { error: `Webhook processing failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Disable body parsing - Stripe needs raw body for signature verification
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
