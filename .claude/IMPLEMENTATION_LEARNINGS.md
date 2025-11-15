# Real-World Implementation Learnings

This document captures critical learnings from implementing Stripe in production Next.js projects with authentication frameworks like WorkOS.

## Critical Breaking Changes

### 1. Stripe.js API Deprecation - `redirectToCheckout()` No Longer Works

**⚠️ BREAKING CHANGE**: The `stripe.redirectToCheckout()` method is deprecated and no longer functions in modern versions of Stripe.js.

#### The Problem
Many guides still show the old pattern:
```typescript
const { error } = await stripe.redirectToCheckout({ sessionId });
```

This no longer works and will produce cryptic errors or do nothing.

#### The Solution
Use the checkout session URL directly from the Stripe API response:

```typescript
// ❌ OLD (DEPRECATED)
const session = await stripe.checkout.sessions.create({...});
const { error } = await stripe.redirectToCheckout({ sessionId: session.id });

// ✅ NEW (CORRECT)
const session = await stripe.checkout.sessions.create({...});
window.location.href = session.url; // Use the URL directly!
```

#### Backend Code
```typescript
export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/payment-cancel`,
  });

  return NextResponse.json({ url: session.url }); // Return full URL!
}
```

#### Frontend Code
```typescript
const response = await fetch('/api/checkout', { method: 'POST', ... });
const { url } = await response.json();
window.location.href = url; // Simple redirect
```

---

## Environment Variables: Runtime vs Build Time

### The Problem
Environment variables must be loaded **at runtime**, not at module initialization. Accessing them at module level causes them to load at build/startup time.

### Symptom
```
Error: API key is not set
Error: Stripe is not properly configured
```

### The Wrong Way
```typescript
// ❌ WRONG - Loads at module initialization
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeSecretKey!);

export async function POST(request: NextRequest) {
  // By the time this runs, stripe was already initialized without the key
  // ...
}
```

### The Correct Way
```typescript
// ✅ CORRECT - Loads inside function (at request time)
export async function POST(request: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: 'Stripe API key not configured' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  // ... rest of function
}
```

### Why This Matters
- **Build time**: Next.js compiles your code; env vars aren't available yet
- **Startup time**: Server starts; some env vars might not be injected
- **Request time**: Everything is loaded and ready

Always load credentials inside your request handlers.

---

## Authentication Middleware & CORS Issues

### The Problem
When using authentication frameworks like WorkOS, the auth middleware intercepts ALL requests by default, including API routes that should be public (like checkout and webhooks).

### Symptoms
- CORS errors when calling `/api/checkout` from frontend
- Webhook signature verification failures
- Unexpected 401/403 errors on payment routes

### Root Cause
The middleware is redirecting payment requests to login, which interferes with CORS and webhook delivery.

### The Solution
Explicitly whitelist payment routes in your middleware configuration:

```typescript
// middleware.ts
import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware({
  eagerAuth: true,
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: [
      '/',
      '/sign-in',
      '/sign-up',
      '/pricing',
      '/api/checkout',              // ← Add payment endpoint
      '/api/webhooks/stripe',       // ← Add webhook endpoint
      '/payment-success',
      '/payment-cancel',
    ],
  },
});
```

### Additional Pattern
If you have multiple webhook or checkout variants, add them all:

```typescript
unauthenticatedPaths: [
  // ... existing paths
  '/api/checkout',
  '/api/checkout-subscription',
  '/api/webhooks/stripe',
  '/api/webhooks/stripe/events',  // If using variants
];
```

---

## Webhook Handling & Signature Verification

### Critical: Disable Body Parsing

To verify webhook signatures, you need the **raw request body**. By default, Next.js parses the body, destroying the raw data needed for signature verification.

#### The Wrong Way
```typescript
// ❌ WRONG - Body is parsed, signature verification fails
export async function POST(request: NextRequest) {
  const body = await request.json(); // Body is now parsed!
  const signature = request.headers.get('stripe-signature');

  // This will ALWAYS fail - signature is computed from raw body
  const event = stripe.webhooks.constructEvent(body, signature, secret);
}
```

#### The Correct Way
```typescript
// ✅ CORRECT - Disable parsing and use raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(request: NextRequest): Promise<Buffer> {
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    chunks.push(value);
  }

  return Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')!;
  const rawBody = await getRawBody(request); // Get raw body

  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle payment
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }
}
```

---

## Stripe CLI for Local Testing

### Setup
```bash
# Install Stripe CLI (if not already installed)
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Start listening for webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Testing Webhook Events
```bash
# Test payment success
stripe trigger payment_intent.succeeded

# Test subscription creation
stripe trigger customer.subscription.created

# Test subscription deletion
stripe trigger customer.subscription.deleted

# View recent events
stripe events list
```

### Getting the Webhook Secret
When you run `stripe listen`, it outputs:
```
Your webhook signing secret is: whsec_test_xxxxxxxxxxxxx
```

Add this to `.env.local`:
```
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxx
```

---

## Common Issues & Solutions

### Issue: API Key "not set" Error

**Symptom**: `Error: "API key is not set" or Cannot create Stripe instance`

**Cause**: Environment variable loaded at module level instead of inside function

**Fix**:
```typescript
// Move this INSIDE your request handler
export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
}
```

---

### Issue: "Invalid Signature" on Webhooks

**Symptom**: All webhooks fail with "Invalid signature" error

**Causes**:
1. Using parsed JSON body instead of raw body
2. Wrong webhook secret in environment variables
3. Testing with production secret in test mode (or vice versa)

**Fix**:
```typescript
// Ensure body parser is disabled
export const config = { api: { bodyParser: false } };

// Use raw body
const rawBody = await getRawBody(request);

// Verify with correct secret
const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
```

---

### Issue: CORS Errors on Checkout API

**Symptom**: Frontend throws CORS error when calling `/api/checkout`

**Cause**: Auth middleware intercepting payment routes

**Fix**:
```typescript
// Add to middleware unauthenticatedPaths
'/api/checkout',
'/api/webhooks/stripe',
```

---

### Issue: Stripe.js Not Loading / "Stripe is not defined"

**Symptom**: Browser console error about Stripe not being defined

**Cause**: Not using `'use client'` directive or incorrect environment variable

**Fix**:
```typescript
'use client';

import { loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};
```

---

## Production Deployment Checklist

- [ ] Update webhook endpoint URL in Stripe Dashboard to production URL
- [ ] Switch to production API keys (`pk_live_...` and `sk_live_...`)
- [ ] Update all environment variables in hosting platform
- [ ] Ensure HTTPS is enabled (required for webhooks)
- [ ] Test webhook delivery in Stripe Dashboard → Webhooks → Recent Events
- [ ] Monitor first few hours for webhook delivery issues
- [ ] Set up alerts for failed webhooks
- [ ] Keep production secret key secure (never expose in frontend/logs)

---

## Testing with Stripe Test Cards

```
Success payment:     4242 4242 4242 4242
Card declined:       4000 0000 0000 0002
Requires auth:       4000 0025 0000 3155
Expired card:        4000 0000 0000 0069
Insufficient funds:  4000 0000 0000 9995
```

Use any future expiry date and any 3-digit CVC.

---

## Key Takeaways

1. **Use session.url directly** - Don't use deprecated `redirectToCheckout()`
2. **Load env vars inside functions** - Not at module level
3. **Whitelist payment routes** - In auth middleware config
4. **Preserve raw body** - For webhook signature verification
5. **Test with Stripe CLI** - Before going to production

These patterns will save you significant debugging time when implementing Stripe in Next.js!
