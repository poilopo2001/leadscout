# Complete Setup Guide

Step-by-step instructions for integrating Stripe into your Next.js project.

## Prerequisites

- Node.js 18+ installed
- A Next.js project (or create one with `npx create-next-app@latest`)
- A Stripe account (free to create at stripe.com)

## Step 1: Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click on **Developers** → **API Keys**
3. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
4. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
5. For webhooks, go to **Developers** → **Webhooks** and note the signing secret

## Step 2: Install Dependencies

```bash
npm install stripe @stripe/stripe-js
# or
yarn add stripe @stripe/stripe-js
```

## Step 3: Configure Environment Variables

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_test_your_secret_here
```

Add `.env.local` to `.gitignore` to prevent committing secrets:

```bash
echo ".env.local" >> .gitignore
```

## Step 4: Create API Routes

### Create checkout endpoint

**File**: `app/api/checkout/route.ts`

See `API_ROUTES.md` for the complete code.

### Create webhook endpoint

**File**: `app/api/webhooks/stripe/route.ts`

See `API_ROUTES.md` for the complete code.

**Important**: The webhook endpoint must disable body parsing to verify signatures correctly.

## Step 5: Create Client Components

### Load Stripe utility

**File**: `lib/stripe.ts`

See `CLIENT_COMPONENTS.md` for the complete code.

### Checkout button

**File**: `components/CheckoutButton.tsx`

See `CLIENT_COMPONENTS.md` for the complete code.

## Step 6: Test Locally

### Test checkout flow (without webhooks)

1. Run your Next.js app:
   ```bash
   npm run dev
   ```

2. Add the `CheckoutButton` to a page:
   ```typescript
   import { CheckoutButton } from '@/components/CheckoutButton';

   export default function Page() {
     return (
       <CheckoutButton
         amount={9999} // $99.99
         productName="Premium Plan"
         description="1 year of premium access"
       />
     );
   }
   ```

3. Click the button and use Stripe test card: `4242 4242 4242 4242`
4. Use any future expiry date and any 3-digit CVC

### Test webhooks locally with Stripe CLI

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Authenticate:
   ```bash
   stripe login
   ```

3. Forward webhook events to your local app:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Run this command to test events:
   ```bash
   stripe trigger payment_intent.succeeded
   stripe trigger customer.subscription.created
   ```

5. Check your app logs to verify webhook handling

## Step 7: Database Integration (Optional)

Store customer and subscription data:

```typescript
// Example: Store customer in database after webhook
case 'customer.subscription.created': {
  const subscription = event.data.object as Stripe.Subscription;

  await db.subscription.create({
    data: {
      stripeSubscriptionId: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status,
      userId: getUserIdFromCustomer(subscription.customer as string),
    },
  });
  break;
}
```

## Step 8: Deploy to Production

### Environment variables

1. Deploy to Vercel, Netlify, etc.
2. Set environment variables in your hosting dashboard:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (with live key)
   - `STRIPE_SECRET_KEY` (with live key)
   - `STRIPE_WEBHOOK_SECRET` (with live webhook secret)

### Update webhook endpoint

1. Get your production webhook endpoint URL
2. Go to Stripe Dashboard → **Developers** → **Webhooks**
3. Create a new webhook endpoint pointing to your production URL
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`

### Switch to live keys

In Stripe Dashboard, toggle from "Test mode" to "Live mode" and update your environment variables with live keys.

## Troubleshooting

### Webhook signature verification fails

**Problem**: "Invalid signature" error in webhook handler

**Solution**:
- Ensure you're using the correct webhook secret
- Make sure body parsing is disabled: `export const config = { api: { bodyParser: false } }`
- Verify the raw request body is being passed to `constructEvent()`

### Checkout redirect doesn't work

**Problem**: Button click does nothing or shows error

**Solution**:
- Check browser console for errors
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set correctly
- Ensure Stripe.js loaded successfully
- Check that `sessionId` is returned from API route

### Stripe.js not loading

**Problem**: "Stripe is not defined" or similar error

**Solution**:
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is in `.env.local`
- Ensure it starts with `pk_test_` or `pk_live_`
- Check that the page is using `'use client'` directive
- Use the singleton pattern in `lib/stripe.ts`

### Webhooks not being received

**Problem**: No webhook events appearing in Stripe Dashboard

**Solution**:
- Verify webhook URL is correct in Stripe Dashboard
- Use HTTPS (required for production)
- Check that endpoint returns 200 status
- Review Stripe Dashboard → Webhooks → Event Deliveries to see failures
- Use Stripe CLI locally for testing

### Customer not found

**Problem**: "No such customer" error when managing portal

**Solution**:
- Store customer ID in database when subscription created
- Pass the correct customer ID to portal API route
- Verify customer exists in Stripe Dashboard

## Common Issues

### NEXT_PUBLIC_ not visible in browser

**Cause**: Environment variables only injected at build time

**Solution**: Rebuild your app after changing `.env.local`:
```bash
npm run build
npm run dev
```

### TypeScript errors with Stripe types

**Solution**: Ensure proper imports:
```typescript
import Stripe from 'stripe';
import { Stripe as StripeClient } from '@stripe/stripe-js';
```

### CORS errors with webhook

**Solution**: Webhooks don't require CORS—they're server-to-server. If you see CORS errors, you may have exposed your webhook endpoint incorrectly.

## Next Steps

1. ✅ Complete initial setup
2. ✅ Test checkout flow with test cards
3. ✅ Implement webhook handling
4. ✅ Set up database integration
5. ✅ Configure customer portal (if using subscriptions)
6. ✅ Deploy to production
7. ✅ Migrate to live keys
8. ✅ Monitor webhooks in production

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Test Cards](https://stripe.com/docs/testing)
