# Stripe + Convex + WorkOS Integration Guide

Complete production-ready implementation for Stripe payment processing with Convex backend and WorkOS authentication.

## System Architecture

```
┌─────────────────┐
│   Next.js App   │
│   (Frontend)    │
└────────┬────────┘
         │
         ├─────────────────────────────────────────┐
         │                                         │
    ┌────▼──────────┐                    ┌────────▼────────┐
    │  API Routes   │                    │  Client Auth    │
    │  (Backend)    │                    │  (WorkOS)       │
    └────┬──────────┘                    └────────┬────────┘
         │                                        │
         ├─ /api/checkout          ┌──────────────┤
         ├─ /api/auth/sync-user    │              │
         ├─ /api/webhooks/stripe   │              │
         │                         │              │
    ┌────▼──────────┐         ┌───▼──────────┐
    │ConvexHttpClient          │ Convex DB    │
    │(TypeScript SDK)          │ (Backend)    │
    └────┬──────────┘         └──────────────┘
         │
    ┌────▼──────────────────────────────────┐
    │  Stripe                                │
    │  - Payment Processing                │
    │  - Webhooks                          │
    └────────────────────────────────────────┘
```

---

## Critical Pattern 1: Use ConvexHttpClient in Backend Routes

### ⚠️ The Problem

Using raw `fetch()` for Convex API calls fails silently:

```typescript
// ❌ WRONG - Raw HTTP without proper auth
const response = await fetch(
  `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/v1/mutation/payments:getOrCreateUser`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      args: { workosId, email },
    }),
  }
);
```

**Issues:**
- Missing proper Convex authentication headers
- No TypeScript type safety
- Difficult to debug
- HTTP API validation fails silently

### ✅ The Solution

```typescript
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

// ✅ CORRECT - Use typed ConvexHttpClient
export const convexClient = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || ''
);

// Call with full type safety
const user = await convexClient.mutation(
  api.payments.getOrCreateUser,
  {
    workosId,
    email,
  }
);
```

**Why it works:**
- Automatic Convex authentication
- Full TypeScript types from `_generated/api`
- Proper error propagation
- Built-in retry logic

### Implementation: `/lib/convex-server.ts`

```typescript
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

/**
 * Server-side Convex HTTP client for backend routes
 * Provides typed calls to Convex functions with automatic auth
 */
export const convexClient = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || ''
);

/**
 * Helper for safe mutation calls with error handling
 */
export async function callConvexMutation<T>(
  mutation: any,
  args: any
): Promise<T> {
  try {
    const result = await convexClient.mutation(mutation, args);
    return result as T;
  } catch (error) {
    console.error('Convex mutation error:', error);
    throw error;
  }
}

/**
 * Helper for safe query calls with error handling
 */
export async function callConvexQuery<T>(query: any, args: any): Promise<T> {
  try {
    const result = await convexClient.query(query, args);
    return result as T;
  } catch (error) {
    console.error('Convex query error:', error);
    throw error;
  }
}
```

---

## Critical Pattern 2: Handle null Stripe Customer IDs

### ⚠️ The Problem

One-time payments don't create Stripe customers. The `session.customer` field is `null`:

```typescript
// ❌ WRONG - Sending null for customerId
const response = await convexClient.mutation(
  api.stripeWebhook.handleCheckoutSessionCompleted,
  {
    sessionId: session.id,
    customerId: session.customer, // null for one-time payments!
    paymentIntentId: session.payment_intent,
    userId,
  }
);
```

**Convex Error:**
```
ArgumentValidationError: Value does not match validator.
Path: .customerId
Value: null
Validator: v.string()
```

### ✅ The Solution

Pass empty string `''` instead of `null`:

```typescript
// ✅ CORRECT - Empty string for one-time payments
const result = await convexClient.mutation(
  api.stripeWebhook.handleCheckoutSessionCompleted,
  {
    sessionId: session.id,
    customerId: session.customer || '', // Empty string as default
    paymentIntentId: session.payment_intent,
    userId,
  }
);
```

**In Convex Mutation:**

```typescript
export const handleCheckoutSessionCompleted = mutation({
  args: {
    sessionId: v.string(),
    customerId: v.string(), // Can be empty for one-time payments
    paymentIntentId: v.string(),
    userId: v.string(),
  },
  async handler(ctx, args) {
    // ... find user ...

    const updateData: any = {
      paymentStatus: 'paid',
      paymentIntentId: args.paymentIntentId,
      checkoutSessionId: args.sessionId,
      paidAt: Date.now(),
    };

    // Only update if customer ID provided (not empty string)
    if (args.customerId) {
      updateData.stripeCustomerId = args.customerId;
    }

    await ctx.db.patch(user._id, updateData);
  },
});
```

---

## Critical Pattern 3: Metadata Must Be in Session Creation

### ⚠️ The Problem

Metadata in `payment_intent` event is NOT populated from the checkout session:

```typescript
// ❌ WRONG - Metadata lost when payment_intent event fires
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{ price: priceId, quantity: 1 }],
  // Missing metadata!
});

// Later in webhook...
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const userId = paymentIntent.metadata?.userId; // undefined!
  // Can't track which user paid
}
```

### ✅ The Solution

Always include metadata in checkout session creation:

```typescript
// ✅ CORRECT - Include metadata for tracking
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  payment_method_types: ['card'],
  customer_email: userEmail,
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: successUrl,
  cancel_url: cancelUrl,
  metadata: { userId }, // ← Track user ID through payment
});
```

**Critical Rule:**
| Event | Has Metadata | Use For |
|-------|-------------|---------|
| `checkout.session.completed` | ✅ Yes | **PRIMARY - Use this** |
| `payment_intent.succeeded` | ❌ No | Fallback only |

**In Webhook:**

```typescript
// ✅ CORRECT - Handle checkout.session.completed for metadata
async function handleCheckoutSessionCompleted(session: any) {
  const userId = session.metadata?.userId; // ✅ Present!

  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Update user payment status
  const result = await convexClient.mutation(
    api.stripeWebhook.handleCheckoutSessionCompleted,
    {
      sessionId: session.id,
      customerId: session.customer || '',
      paymentIntentId: session.payment_intent,
      userId, // ✅ From metadata
    }
  );
}
```

---

## Critical Pattern 4: Middleware Must Whitelist Payment Routes

### ⚠️ The Problem

WorkOS auth middleware blocks all unauthenticated requests by default:

```typescript
// ❌ WRONG - Blocks webhook and payment routes
export default authkitMiddleware({
  eagerAuth: true,
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: ['/'],
  },
});
```

**Result:** Webhook returns 401, Stripe retries, eventually gives up.

### ✅ The Solution

Whitelist payment-related routes:

```typescript
// ✅ CORRECT - Allow payment flows
export default authkitMiddleware({
  eagerAuth: true,
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: [
      '/',
      '/sign-in',
      '/sign-up',
      '/callback',
      '/api/checkout',           // ← Payment session creation
      '/api/auth/sync-user',     // ← User sync on login
      '/api/webhooks/stripe',    // ← Stripe webhook
      '/payment-success',        // ← Post-payment page
      '/payment-cancel',         // ← Cancelled page
    ],
  },
});
```

---

## Critical Pattern 5: Post-Login Paywall (Not Pre-Login)

### ⚠️ The Problem

Showing paywall before login means no user ID to track payment:

```typescript
// ❌ WRONG - User pays before authentication
export default function Home() {
  return (
    <>
      <Paywall /> {/* Show to everyone */}
      <SignInForm /> {/* Then ask to sign in */}
    </>
  );
}
```

**Issues:**
- No user ID for payment tracking
- User might sign in with different email
- Can't associate payment with account

### ✅ The Solution

Show paywall only after authentication:

```typescript
// ✅ CORRECT - Paywall after login
'use client';

import { useAuth } from '@workos-inc/authkit-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Paywall from '@/components/Paywall';
import Dashboard from '@/components/Dashboard';
import SignInForm from '@/components/SignInForm';

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      {user ? (
        <AuthenticatedContent user={user} />
      ) : (
        <SignInForm />
      )}
    </>
  );
}

function AuthenticatedContent({ user }: { user: any }) {
  const paymentStatus = useQuery(
    api.payments.getUserPaymentStatus,
    user?.id ? { workosId: user.id } : 'skip'
  );

  if (paymentStatus?.status === 'paid') {
    return <Dashboard />;
  }

  return (
    <Paywall userId={user.id} userEmail={user.email} />
  );
}
```

---

## Complete Implementation Files

### `/app/api/auth/sync-user/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { convexClient } from '@/lib/convex-server';
import { api } from '@/convex/_generated/api';

/**
 * Sync user from WorkOS to Convex on login
 *
 * Flow:
 * 1. User logs in with WorkOS
 * 2. useEffect calls this endpoint
 * 3. User created in Convex database
 * 4. Payment status initialized
 */
export async function POST(request: NextRequest) {
  try {
    const { workosId, email } = await request.json();

    if (!workosId || !email) {
      return NextResponse.json(
        { error: 'Missing workosId or email' },
        { status: 400 }
      );
    }

    // Use typed ConvexHttpClient
    const user = await convexClient.mutation(
      api.payments.getOrCreateUser,
      { workosId, email }
    );

    console.log('User synced:', {
      workosId,
      email,
      userId: user._id,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Sync user error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
```

### `/app/api/checkout/route.ts`

```typescript
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Create Stripe checkout session with user metadata
 *
 * Critical: Include metadata with userId so webhook can track payment
 */
export async function POST(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const { priceId, userId, userEmail } = await request.json();

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: 'Missing priceId or userId' },
        { status: 400 }
      );
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-cancel`,
      metadata: {
        userId, // ✅ CRITICAL - Track user through webhook
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

### `/app/api/webhooks/stripe/route.ts`

```typescript
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { convexClient } from '@/lib/convex-server';
import { api } from '@/convex/_generated/api';

export const config = {
  api: {
    bodyParser: false, // Required for signature verification
  },
};

async function getRawBody(request: NextRequest): Promise<Buffer> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('No body');

  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
}

/**
 * Handle checkout.session.completed event
 * This is where metadata with userId is available
 *
 * ⚠️ CRITICAL: Always use session.customer || ''
 * One-time payments have session.customer = null
 * Passing null to Convex causes validation errors!
 */
async function handleCheckoutSessionCompleted(session: any) {
  console.log('Checkout session completed:', session.id);

  // ✅ Get userId from metadata
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('No userId in session metadata for:', session.id);
    return;
  }

  try {
    // Use typed ConvexHttpClient
    const result = await convexClient.mutation(
      api.stripeWebhook.handleCheckoutSessionCompleted,
      {
        sessionId: session.id,
        customerId: session.customer || '', // ✅ CRITICAL null check for one-time payments
        paymentIntentId: session.payment_intent,
        userId,
      }
    );

    console.log('Payment confirmed for user:', userId, result);
  } catch (error) {
    console.error('Error handling checkout session:', error);
  }
}

/**
 * Handle payment_intent.succeeded event
 * Fallback - metadata not available here
 *
 * ⚠️ CRITICAL: Always use paymentIntent.customer || ''
 * One-time payments have paymentIntent.customer = null
 * If you pass null to Convex, validation fails silently!
 */
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('Payment intent succeeded:', paymentIntent.id);

  const userId = paymentIntent.metadata?.userId;
  if (!userId) {
    console.log(
      'No userId in payment_intent - will be handled by checkout.session.completed'
    );
    return;
  }

  try {
    await convexClient.mutation(
      api.stripeWebhook.handleCheckoutSessionCompleted,
      {
        sessionId: paymentIntent.id,
        customerId: paymentIntent.customer || '', // ✅ CRITICAL null check
        paymentIntentId: paymentIntent.id,
        userId,
      }
    );
  } catch (error) {
    console.error('Error handling payment intent:', error);
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  try {
    // ✅ Initialize Stripe inside function
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-05-28.basil',
    });

    const rawBody = await getRawBody(request);
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );

    console.log('Webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
```

### `/convex/stripeWebhook.ts`

```typescript
import { mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Handle checkout.session.completed webhook
 * Mark user as paid in Convex database
 */
export const handleCheckoutSessionCompleted = mutation({
  args: {
    sessionId: v.string(),
    customerId: v.string(), // Empty string for one-time
    paymentIntentId: v.string(),
    userId: v.string(), // WorkOS user ID from metadata
  },
  async handler(ctx, args) {
    // Find user by WorkOS ID
    const user = await ctx.db
      .query('users')
      .withIndex('by_workosId', (q) => q.eq('workosId', args.userId))
      .first();

    if (!user) {
      throw new Error(`User not found: ${args.userId}`);
    }

    // Prepare update
    const updateData: any = {
      paymentStatus: 'paid',
      paymentIntentId: args.paymentIntentId,
      checkoutSessionId: args.sessionId,
      paidAt: Date.now(),
    };

    // Only set customerId if provided (not empty string)
    if (args.customerId) {
      updateData.stripeCustomerId = args.customerId;
    }

    // Update user
    await ctx.db.patch(user._id, updateData);

    console.log(`Payment confirmed for user ${args.userId}`);
    return { success: true, userId: user._id };
  },
});

/**
 * Handle payment failures
 */
export const handlePaymentFailed = mutation({
  args: {
    paymentIntentId: v.string(),
    userId: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query('users')
      .withIndex('by_workosId', (q) => q.eq('workosId', args.userId))
      .first();

    if (!user) {
      throw new Error(`User not found: ${args.userId}`);
    }

    await ctx.db.patch(user._id, {
      paymentStatus: 'failed',
      paymentIntentId: args.paymentIntentId,
    });

    return { success: true };
  },
});
```

### `/convex/payments.ts`

```typescript
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Get or create user synced from WorkOS
 */
export const getOrCreateUser = mutation({
  args: {
    workosId: v.string(),
    email: v.string(),
  },
  async handler(ctx, args) {
    // Check if user exists
    const existing = await ctx.db
      .query('users')
      .withIndex('by_workosId', (q) => q.eq('workosId', args.workosId))
      .first();

    if (existing) {
      return existing;
    }

    // Create new user
    const userId = await ctx.db.insert('users', {
      workosId: args.workosId,
      email: args.email,
      paymentStatus: 'pending',
      createdAt: Date.now(),
    });

    const user = await ctx.db.get(userId);
    return user!;
  },
});

/**
 * Get user's payment status
 */
export const getUserPaymentStatus = query({
  args: {
    workosId: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query('users')
      .withIndex('by_workosId', (q) => q.eq('workosId', args.workosId))
      .first();

    if (!user) {
      return null;
    }

    return {
      status: user.paymentStatus,
      paidAt: user.paidAt,
      stripeCustomerId: user.stripeCustomerId,
    };
  },
});
```

---

## Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    workosId: v.string(),
    email: v.string(),
    paymentStatus: v.string(), // 'pending' | 'paid' | 'failed'
    paymentIntentId: v.optional(v.string()),
    checkoutSessionId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_workosId', ['workosId'])
    .index('by_email', ['email']),
});
```

---

## Production Deployment Checklist

- [ ] Environment variables set in Vercel/hosting platform
- [ ] Convex deployment linked
- [ ] Stripe webhook endpoint updated to production URL (HTTPS required)
- [ ] Using live Stripe API keys
- [ ] Webhook secret matches production
- [ ] Middleware includes payment route whitelists
- [ ] ConvexHttpClient uses NEXT_PUBLIC_CONVEX_URL
- [ ] Tested full payment flow end-to-end
- [ ] Stripe webhook test event succeeds
- [ ] User payment status updates in Convex DB

---

## Troubleshooting

**Issue:** "ConvexHttpClient is not authenticated"
- Check `NEXT_PUBLIC_CONVEX_URL` is set correctly
- Verify it uses HTTPS in production
- Check Convex deployment is active

**Issue:** "customerId validation error"
- Passing `null` instead of empty string `''`
- Use `session.customer || ''` always

**Issue:** Webhook not received
- Check `/api/webhooks/stripe` in middleware whitelist
- Verify HTTPS in production
- Check webhook endpoint URL in Stripe dashboard

**Issue:** User not found in webhook handler
- Verify user was synced via `/api/auth/sync-user`
- Check WorkOS ID matches in metadata
- Check Convex database has user record

**Issue:** Metadata not in webhook
- Using `payment_intent.metadata` instead of `checkout.session.completed` event
- Always handle `checkout.session.completed` for metadata
