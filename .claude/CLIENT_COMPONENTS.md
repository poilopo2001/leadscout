# Client-Side Components Reference

React component examples for implementing Stripe checkout in Next.js.

## 1. Load Stripe (Singleton Pattern)

**File**: `lib/stripe.ts`

```typescript
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
  }
  return stripePromise;
};
```

**Why**: This ensures Stripe.js is loaded only once and only when needed, improving performance.

## 2. Checkout Button Component

**File**: `components/CheckoutButton.tsx`

```typescript
'use client';

import { useState } from 'react';
import { getStripe } from '@/lib/stripe';

interface CheckoutButtonProps {
  amount: number; // in cents
  productName: string;
  description?: string;
}

export function CheckoutButton({
  amount,
  productName,
  description,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          productName,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await getStripe();

      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        console.error('Checkout error:', error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Processing...' : `Buy ${productName}`}
    </button>
  );
}
```

## 3. Checkout Success Page

**File**: `app/success/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface Session {
  id: string;
  payment_status: string;
  customer_details?: {
    name: string;
    email: string;
  };
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const response = await fetch(
          `/api/checkout/session?sessionId=${sessionId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }

        const data = await response.json();
        setSession(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An error occurred'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!session) return <div className="p-8">No session found</div>;

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">✓ Payment Successful</h1>
      <p className="text-gray-600 mb-4">
        Thank you for your purchase!
      </p>
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p>
          <strong>Status:</strong> {session.payment_status}
        </p>
        {session.customer_details?.email && (
          <p>
            <strong>Email:</strong> {session.customer_details.email}
          </p>
        )}
      </div>
      <a
        href="/"
        className="block text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Return Home
      </a>
    </div>
  );
}
```

## 4. Subscription Plans Component

**File**: `components/SubscriptionPlans.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

interface Plan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  amount: number;
  currency: string;
  interval: string;
}

export function SubscriptionPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/subscriptions/list');

        if (!response.ok) {
          throw new Error('Failed to fetch plans');
        }

        const data = await response.json();
        setPlans(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load plans'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscribe = async (priceId: string) => {
    setCheckingOut(true);
    try {
      // You would typically get customerId from user session/auth
      const response = await fetch('/api/checkout-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          customerId: 'cus_xxxxx', // From your auth/session
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const { sessionId } = await response.json();
      // Redirect to checkout
      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to start subscription'
      );
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) return <div className="p-8">Loading plans...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="border rounded-lg p-6 hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
          <p className="text-gray-600 mb-4">{plan.description}</p>
          <div className="mb-4">
            <span className="text-3xl font-bold">
              ${(plan.amount / 100).toFixed(2)}
            </span>
            <span className="text-gray-600">/{plan.interval}</span>
          </div>
          <button
            onClick={() => handleSubscribe(plan.priceId)}
            disabled={checkingOut || selectedPlan === plan.id}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {checkingOut && selectedPlan === plan.id
              ? 'Processing...'
              : 'Subscribe'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 5. Customer Portal Button

**File**: `components/CustomerPortalButton.tsx`

```typescript
'use client';

import { useState } from 'react';

interface CustomerPortalButtonProps {
  customerId: string;
}

export function CustomerPortalButton({
  customerId,
}: CustomerPortalButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePortal = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to access portal');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      alert('Failed to open customer portal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePortal}
      disabled={loading}
      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
    >
      {loading ? 'Loading...' : 'Manage Subscription'}
    </button>
  );
}
```

## 6. Success Page with Order Details

**File**: `app/dashboard/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CustomerPortalButton } from '@/components/CustomerPortalButton';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const verifySession = async () => {
      try {
        const response = await fetch(
          `/api/checkout/session?sessionId=${sessionId}`
        );
        const session = await response.json();
        setCustomerId(session.customer);
      } catch (error) {
        console.error('Failed to verify session:', error);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [sessionId]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome to your subscription dashboard</p>
      {customerId && (
        <CustomerPortalButton customerId={customerId} />
      )}
    </div>
  );
}
```

## Key Implementation Notes

- **Client component**: Use `'use client'` directive at top of file
- **Stripe.js loading**: Always use the singleton pattern (load once)
- **Error handling**: Always catch and handle Stripe errors gracefully
- **Types**: Import types from `@stripe/stripe-js` for TypeScript
- **Sensitive data**: Never expose secret keys to client-side code
- **Amount formatting**: Display to users in dollars but send to API in cents
