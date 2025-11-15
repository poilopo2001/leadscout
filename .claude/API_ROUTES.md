# API Routes Reference

Complete code examples for Stripe API routes in Next.js.

## 1. One-Time Payment Checkout (Modern Approach)

**File**: `app/api/checkout/route.ts`

```typescript
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // ✅ CRITICAL: Initialize Stripe INSIDE the function
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe API key not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const { priceId } = await req.json();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/payment-cancel`,
    });

    // ✅ Return the full URL, not just sessionId
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

**Key Changes**:
- Initialize Stripe inside the function (not at module level)
- Return `session.url` directly (not `sessionId`)
- Simplify by using priceId instead of price_data
- Check for missing API key with helpful error message

## 2. Subscription Checkout

**File**: `app/api/checkout-subscription/route.ts`

```typescript
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // ✅ Initialize Stripe inside the function
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe API key not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const { priceId, customerId } = await req.json();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/pricing`,
      customer: customerId, // Link to existing customer
    });

    // ✅ Return the full URL
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Subscription checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
```

## 3. List Subscription Plans

**File**: `app/api/subscriptions/list/route.ts`

```typescript
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // ✅ Initialize Stripe inside the function
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe API key not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    const plans = products.data
      .filter((product) => product.metadata.type === 'subscription')
      .map((product) => {
        const price = product.default_price as Stripe.Price;
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          priceId: price.id,
          amount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring?.interval,
        };
      });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}
```

## 4. Customer Portal

**File**: `app/api/customer-portal/route.ts`

```typescript
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // ✅ Initialize Stripe inside the function
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe API key not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const { customerId } = await req.json();

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.get('origin')}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
```

## 5. Webhook Handler

**File**: `app/api/webhooks/stripe/route.ts`

```typescript
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

// ✅ Disable body parsing to get raw request body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(request: NextRequest): Promise<Buffer> {
  const reader = request.body?.getReader();
  if (!reader) return Buffer.alloc(0);

  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
}

export async function POST(req: NextRequest) {
  try {
    // ✅ Initialize Stripe inside the function
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !webhookSecret) {
      return NextResponse.json(
        { error: 'Stripe configuration missing' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const rawBody = await getRawBody(req);
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Handle successful one-time payment
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        // Store subscription in database
        console.log('Subscription created:', subscription.id);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        // Update subscription in database
        console.log('Subscription updated:', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        // Revoke premium access
        console.log('Subscription deleted:', subscription.id);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // Extend subscription access
        console.log('Invoice paid:', invoice.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

## 6. Retrieve Session Details

**File**: `app/api/checkout/session/route.ts`

```typescript
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // ✅ Initialize Stripe inside the function
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe API key not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session ID' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error retrieving session:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
```

## Notes

- All amounts are in **cents** (e.g., $10.00 = 1000)
- Always validate and sanitize user input
- Log errors for debugging but don't expose sensitive data to clients
- Use TypeScript for type safety with Stripe objects
