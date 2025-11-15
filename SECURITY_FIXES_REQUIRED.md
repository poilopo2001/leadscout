# LeadScout - Security Fixes Required Before Production

This document lists the MANDATORY fixes before production deployment.

---

## BLOCKING ISSUES (MUST FIX)

### 1. Add Security Headers (15 minutes)

**File**: `leadscout-web/next.config.ts`

**Replace**:
```typescript
const nextConfig: NextConfig = {
  /* config options here */
};
```

**With**:
```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
        ],
      },
    ];
  },
};
```

---

### 2. Implement Stripe Webhook Signature Verification (30 minutes)

**File**: `convex/actions/stripe.actions.ts`

**Current Code** (line 134):
```typescript
export const handleWebhook = action({
  args: {
    eventType: v.string(),
    eventData: v.any(),
  },
  handler: async (ctx, args) => {
    console.log("[Stripe Webhook] Received event:", args.eventType);
    // NO SIGNATURE VERIFICATION - SECURITY RISK!
```

**Fix Required**:
```typescript
import Stripe from "stripe";

export const handleWebhook = action({
  args: {
    body: v.string(), // Raw webhook body
    signature: v.string(), // Stripe signature header
  },
  handler: async (ctx, args) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-11-20.acacia",
    });

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        args.body,
        args.signature,
        webhookSecret
      );
    } catch (err) {
      console.error("[Stripe Webhook] Signature verification failed:", err);
      throw new Error("Invalid webhook signature");
    }

    console.log("[Stripe Webhook] Verified event:", event.type);

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;
          const priceId = session.line_items?.data[0]?.price?.id;

          if (!userId || !customerId || !subscriptionId || !priceId) {
            throw new Error("Missing required session data");
          }

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
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
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
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;
          console.log("[Stripe Webhook] Payment succeeded:", { customerId });
          break;
        }

        case "transfer.created":
        case "transfer.paid": {
          const transfer = event.data.object as Stripe.Transfer;
          console.log("[Stripe Webhook] Transfer completed:", transfer.id);
          break;
        }

        default:
          console.log("[Stripe Webhook] Unhandled event type:", event.type);
      }

      return { success: true };
    } catch (error) {
      console.error("[Stripe Webhook] Error processing event:", error);
      throw error;
    }
  },
});
```

**Also Update Webhook Endpoint** (create if not exists):

**File**: `leadscout-web/app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  try {
    await convex.action(api.actions.stripe.handleWebhook, {
      body,
      signature,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
```

**Environment Variable Required**:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

Get this from Stripe Dashboard > Developers > Webhooks

---

### 3. Complete Stripe Integration (1-2 hours)

**Files to Update**:
- `convex/actions/stripe.actions.ts`

**Replace ALL placeholder implementations**:

Replace this:
```typescript
// In production, this would call:
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const checkoutUrl = `https://checkout.stripe.com/pay/${priceId}`;
```

With actual Stripe SDK calls:
```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const session = await stripe.checkout.sessions.create({
  customer_email: user.email,
  mode: "subscription",
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  metadata: { userId: args.userId },
});

return { sessionUrl: session.url };
```

**Similar updates needed in**:
- `createSubscription` (line 17)
- `onboardScout` (line 74)
- `processPayout` (line 222)
- `createCreditCheckout` (line 306)

**Install Stripe SDK**:
```bash
cd convex
npm install stripe
```

---

### 4. Production Environment Variables Checklist

**Digital Ocean App Platform**: Add these as encrypted variables

**Required Secrets**:
```bash
# Clerk Auth
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...

# Stripe Price IDs (create in Stripe Dashboard)
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID=price_...
STRIPE_CREDIT_PRICE_ID=price_...

# Convex
CONVEX_DEPLOYMENT=prod:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Resend Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Configuration Variables** (copy from `.env.example`):
- All `LEAD_PRICE_*` variables
- All `PAYOUT_*` variables
- All `CREDIT_*` variables
- All `QUALITY_*` variables
- All `BADGE_*` variables
- All plan credit allocations

---

## RECOMMENDED FIXES (Should Fix)

### 5. Add Rate Limiting to Lead Submissions (30 minutes)

**File**: `convex/mutations/leads.mutations.ts`

**Add before lead creation** (line 43):
```typescript
export const create = mutation({
  handler: async (ctx, args) => {
    const scout = await getCurrentScout(ctx);

    // Rate limiting: Max 10 leads per hour
    const oneHourAgo = Date.now() - 3600000;
    const recentSubmissions = await ctx.db
      .query("leads")
      .withIndex("by_scout", (q) => q.eq("scoutId", scout._id))
      .filter((q) => q.gte(q.field("createdAt"), oneHourAgo))
      .collect();

    if (recentSubmissions.length >= 10) {
      throw new Error("Rate limit exceeded. Maximum 10 lead submissions per hour.");
    }

    // Continue with existing code...
```

---

### 6. Add Defensive Credit Check (15 minutes)

**File**: `convex/mutations/leads.mutations.ts`

**Add after deductCredits** (line 152):
```typescript
// 1. Deduct credit from company
const newBalance = await deductCredits(
  ctx,
  company._id,
  1,
  `Purchase lead: ${lead.title}`,
  undefined
);

// DEFENSIVE CHECK: Verify balance is still valid
const verifiedCompany = await ctx.db.get(company._id);
if (!verifiedCompany || verifiedCompany.creditsRemaining < 0) {
  // This should never happen due to Convex ACID guarantees,
  // but adding as defense-in-depth
  throw new Error("Credit verification failed. Transaction aborted.");
}

// Continue with existing code...
```

---

## TESTING CHECKLIST

Before deploying to production:

### Security Testing
- [ ] Test webhook signature verification with Stripe CLI
- [ ] Verify security headers with securityheaders.com
- [ ] Test authentication on all protected routes
- [ ] Attempt IDOR attacks on lead/company IDs
- [ ] Test rate limiting (if implemented)
- [ ] Verify no secrets in client-side code (Network tab)

### Stripe Integration Testing
- [ ] Complete subscription purchase flow
- [ ] Test webhook delivery and processing
- [ ] Verify credits allocated after subscription
- [ ] Test Stripe Connect onboarding
- [ ] Test payout processing
- [ ] Verify all Stripe error handling

### Environment Variables
- [ ] All required env vars set in production
- [ ] Verify using live keys (not test keys)
- [ ] Test webhook endpoints with live keys
- [ ] Verify email sending works

---

## DEPLOYMENT ORDER

1. **Fix security headers** (15 min)
2. **Implement webhook verification** (30 min)
3. **Complete Stripe integration** (1-2 hours)
4. **Set production env vars** (30 min)
5. **Test in staging environment** (1 hour)
6. **Deploy to production** (15 min)
7. **Monitor for 24 hours**

**Total estimated time**: 4-5 hours

---

## VERIFICATION

After deployment, verify:

```bash
# 1. Check security headers
curl -I https://yourdomain.com | grep -i "x-frame\|strict-transport\|x-content"

# 2. Test webhook
stripe listen --forward-to https://yourdomain.com/api/webhooks/stripe

# 3. Check environment
# Visit /api/health and verify no secrets exposed

# 4. Test authentication
# Try accessing /dashboard without login (should redirect)
```

---

## ROLLBACK PLAN

If issues arise:

1. Revert to previous deployment in Digital Ocean
2. Disable webhook endpoints in Stripe Dashboard
3. Put maintenance page up
4. Fix issues in development
5. Re-deploy when fixed

---

## SUPPORT

If you encounter issues:

1. Check Convex logs: `npx convex logs`
2. Check Stripe webhooks: Stripe Dashboard > Developers > Webhooks > Events
3. Check Digital Ocean logs: App > Runtime Logs
4. Review error tracking (if Sentry configured)

---

**Security Approved With Fixes**: Yes, pending above changes

**Estimated Completion**: 4-5 hours
**Blocking Issues**: 3 (headers, webhooks, Stripe)
**Risk Level**: MEDIUM (becomes LOW after fixes)
