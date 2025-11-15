# LeadScout Convex API Reference

Complete reference for all Convex backend functions.

## Table of Contents

1. [Lead Queries](#lead-queries)
2. [Scout Queries](#scout-queries)
3. [Company Queries](#company-queries)
4. [Notification Queries](#notification-queries)
5. [Lead Mutations](#lead-mutations)
6. [Scout Mutations](#scout-mutations)
7. [Company Mutations](#company-mutations)
8. [Payout Mutations](#payout-mutations)
9. [Stripe Actions](#stripe-actions)
10. [Email Actions](#email-actions)

---

## Lead Queries

### `queries/leads:listAvailable`

Browse marketplace leads with optional filtering.

**Arguments:**
```typescript
{
  category?: string,          // Filter by category
  budgetMin?: number,         // Minimum budget (euros)
  budgetMax?: number,         // Maximum budget (euros)
  page?: number,              // Page number (0-indexed)
  limit?: number              // Results per page (default: 20)
}
```

**Returns:**
```typescript
{
  leads: Array<{
    ...lead,
    contactName: "***",       // Masked until purchased
    contactEmail: "***",
    contactPhone: "***",
    companyName: "ABC***",    // Partially masked
    scout: {
      id: Id<"scouts">,
      qualityScore: number,
      badge: string,
      name: string
    }
  }>,
  total: number,
  page: number,
  limit: number,
  hasMore: boolean
}
```

**Usage:**
```tsx
const { leads, hasMore } = useQuery(api.queries.leads.listAvailable, {
  category: "IT Services",
  budgetMin: 1000,
  page: 0,
  limit: 20
});
```

---

### `queries/leads:getById`

Get single lead by ID. Contact info revealed if purchased by current user.

**Arguments:**
```typescript
{
  id: Id<"leads">
}
```

**Returns:**
```typescript
{
  ...lead,
  scout: { ... },
  isPurchased: boolean  // True if current user purchased
}
```

**Usage:**
```tsx
const lead = useQuery(api.queries.leads.getById, {
  id: leadId
});

if (lead?.isPurchased) {
  // Show full contact info
} else {
  // Show masked contact info
}
```

---

### `queries/leads:getByScout`

Get all leads submitted by a scout.

**Arguments:**
```typescript
{
  scoutId: Id<"scouts">,
  status?: "pending_review" | "approved" | "rejected" | "sold",
  page?: number,
  limit?: number
}
```

**Returns:**
```typescript
{
  leads: Array<{
    ...lead,
    purchase?: {
      purchasedAt: number,
      earnings: number,
      companyName: string
    }
  }>,
  total: number,
  page: number,
  limit: number,
  hasMore: boolean
}
```

---

### `queries/leads:getPendingModeration`

Admin-only: Get leads awaiting moderation (FIFO order).

**Arguments:** None

**Returns:**
```typescript
Array<{
  ...lead,
  scout: {
    id: Id<"scouts">,
    qualityScore: number,
    badge: string,
    name: string,
    email: string,
    totalSubmitted: number,
    totalSold: number
  }
}>
```

---

## Scout Queries

### `queries/scouts:getCurrentUser`

Get current logged-in scout profile.

**Arguments:** None

**Returns:**
```typescript
{
  user: User,
  scout: Scout
} | null
```

---

### `queries/scouts:getMyStats`

Get scout dashboard statistics.

**Arguments:** None

**Returns:**
```typescript
{
  // Earnings
  pendingEarnings: number,
  totalEarnings: number,
  recentEarnings: number,      // Last 30 days
  lastPayoutDate?: number,
  lastPayoutAmount: number,

  // Performance
  totalLeadsSubmitted: number,
  totalLeadsSold: number,
  conversionRate: number,      // Percentage
  qualityScore: number,        // 0-10

  // Badge & Milestones
  badge: "bronze" | "silver" | "gold" | "platinum",
  nextBadge?: string,
  leadsToNextBadge: number,

  // Recent Activity
  recentLeadsCount: number,
  recentSalesCount: number,

  // Stripe
  stripeConnectComplete: boolean
}
```

---

### `queries/scouts:getLeaderboard`

Get top scouts by quality score and sales.

**Arguments:**
```typescript
{
  period: "week" | "month" | "allTime",
  limit?: number  // Default: 10
}
```

**Returns:**
```typescript
Array<{
  scoutId: Id<"scouts">,
  name: string,
  badge: string,
  qualityScore: number,
  totalLeadsSold: number,
  totalEarnings: number,
  periodSales: number,
  periodEarnings: number
}>
```

---

## Company Queries

### `queries/companies:getCurrentUser`

Get current logged-in company profile.

**Arguments:** None

**Returns:**
```typescript
{
  user: User,
  company: Company
} | null
```

---

### `queries/companies:getMyPurchases`

Get company's purchase history.

**Arguments:**
```typescript
{
  status?: "completed" | "refunded",
  page?: number,
  limit?: number
}
```

**Returns:**
```typescript
{
  purchases: Array<{
    ...purchase,
    lead: {
      id: Id<"leads">,
      title: string,
      description: string,
      category: string,
      companyName: string,
      contactName: string,      // Full contact info revealed
      contactEmail: string,
      contactPhone: string,
      companyWebsite?: string,
      estimatedBudget: number,
      qualityScore: number,
      photos: string[]
    },
    scout: {
      name: string,
      qualityScore: number,
      badge: string
    }
  }>,
  total: number,
  page: number,
  limit: number,
  hasMore: boolean
}
```

---

### `queries/companies:getMyAnalytics`

Get company analytics and ROI metrics.

**Arguments:**
```typescript
{
  startDate: number,  // Unix timestamp
  endDate: number
}
```

**Returns:**
```typescript
{
  overview: {
    totalPurchases: number,
    totalSpent: number,
    creditsUsed: number,
    creditsAllocated: number,
    creditsRemaining: number,
    avgPricePerLead: number
  },
  categoryBreakdown: Array<{
    category: string,
    count: number,
    totalSpent: number,
    avgPrice: number
  }>,
  topScouts: Array<{
    scoutId: string,
    name: string,
    leadsProvided: number,
    avgQuality: number
  }>,
  currentPlan: "starter" | "growth" | "scale",
  subscriptionStatus: string
}
```

---

## Lead Mutations

### `mutations/leads:create`

Scout submits new lead.

**Arguments:**
```typescript
{
  title: string,            // Min 10 chars
  description: string,      // Min 50 chars
  category: string,
  companyName: string,
  contactName: string,
  contactEmail: string,     // Valid email
  contactPhone: string,     // 8-20 chars
  companyWebsite?: string,  // Valid URL
  estimatedBudget: number,  // Min 100 euros
  timeline?: string,        // e.g., "Q1 2025"
  photos: string[]          // Convex storage IDs
}
```

**Returns:**
```typescript
{
  leadId: Id<"leads">,
  estimatedEarnings: number,  // 50% of sale price
  qualityScore: number        // Initial calculated score
}
```

**Example:**
```tsx
const createLead = useMutation(api.mutations.leads.create);

const handleSubmit = async (data) => {
  const result = await createLead({
    title: "ERP Migration Project",
    description: "Large manufacturing company...",
    category: "IT Services",
    companyName: "ABC Manufacturing",
    contactName: "John Doe",
    contactEmail: "john@abc.com",
    contactPhone: "+33123456789",
    estimatedBudget: 50000,
    photos: ["storage_id_1", "storage_id_2"]
  });

  console.log(`Lead created! Est. earnings: ${result.estimatedEarnings}€`);
};
```

---

### `mutations/leads:purchase`

Company purchases lead (atomic transaction).

**Arguments:**
```typescript
{
  leadId: Id<"leads">
}
```

**Returns:**
```typescript
{
  purchaseId: Id<"purchases">,
  lead: Lead,               // Full details with contact info
  creditsRemaining: number,
  earnings: number          // Scout's earnings from this sale
}
```

**Transaction Steps:**
1. Deduct 1 credit from company
2. Mark lead as sold
3. Create purchase record
4. Credit scout's pending earnings
5. Update scout's sold count
6. Check and update scout badge
7. Send notifications (scout + company)
8. Check if company low on credits

**Errors:**
- "Lead not found"
- "Lead not available for purchase"
- "Insufficient credits"
- "Cannot purchase your own lead"

---

### `mutations/leads:approve`

Admin approves lead for marketplace.

**Arguments:**
```typescript
{
  leadId: Id<"leads">,
  notes?: string
}
```

**Returns:**
```typescript
{
  success: boolean
}
```

**Side Effects:**
- Updates lead status to "approved"
- Creates moderation action record
- Sends notification to scout

---

## Scout Mutations

### `mutations/scouts:updateProfile`

Update scout profile.

**Arguments:**
```typescript
{
  name?: string,
  bio?: string,               // Max 500 chars
  linkedin?: string,          // Valid LinkedIn URL
  industryExpertise?: string[] // Max 10 items
}
```

**Returns:**
```typescript
{
  success: boolean
}
```

---

### `mutations/scouts:updateQualityScore`

Recalculate scout quality score based on performance.

**Arguments:**
```typescript
{
  scoutId: Id<"scouts">
}
```

**Returns:**
```typescript
{
  success: boolean,
  qualityScore: number,
  soldRate: number,
  approvalRate: number
}
```

**Calculation:**
- Based on: leads submitted, leads sold, leads approved
- Weighted by lead quality scores
- Updates badge if thresholds reached

---

## Company Mutations

### `mutations/companies:updateSubscription`

Update company subscription (called from Stripe webhook).

**Arguments:**
```typescript
{
  stripeCustomerId: string,
  subscriptionId: string,
  status: "active" | "past_due" | "canceled" | "incomplete",
  priceId: string,
  nextRenewalDate: number
}
```

**Returns:**
```typescript
{
  success: boolean,
  plan: "starter" | "growth" | "scale",
  credits: number
}
```

**Side Effects:**
- Maps priceId to plan
- Updates subscription status
- Adds credits if new active subscription
- Sends notification

---

### `mutations/companies:updatePreferences`

Update company filtering and notification preferences.

**Arguments:**
```typescript
{
  categories?: string[],
  budgetMin?: number,
  budgetMax?: number,
  notifications?: {
    newLeads: boolean,
    lowCredits: boolean,
    renewalReminder: boolean
  }
}
```

**Returns:**
```typescript
{
  success: boolean,
  preferences: CompanyPreferences
}
```

---

## Stripe Actions

### `actions/stripe:createSubscription`

Create Stripe Checkout session for subscription.

**Arguments:**
```typescript
{
  userId: Id<"users">,
  planSlug: "starter" | "growth" | "scale"
}
```

**Returns:**
```typescript
{
  sessionUrl: string,  // Redirect user to this URL
  priceId: string
}
```

**Usage:**
```tsx
const createCheckout = useAction(api.actions.stripe.createSubscription);

const handleSubscribe = async (plan) => {
  const { sessionUrl } = await createCheckout({
    userId: currentUser._id,
    planSlug: plan
  });

  window.location.href = sessionUrl;
};
```

---

### `actions/stripe:onboardScout`

Create Stripe Connect account for scout payouts.

**Arguments:**
```typescript
{
  scoutId: Id<"scouts">
}
```

**Returns:**
```typescript
{
  onboardingUrl: string,  // Redirect scout to this URL
  accountId: string       // Stripe Connect account ID
}
```

**Usage:**
```tsx
const onboard = useAction(api.actions.stripe.onboardScout);

const handleConnectStripe = async () => {
  const { onboardingUrl } = await onboard({
    scoutId: currentScout._id
  });

  window.location.href = onboardingUrl;
};
```

---

### `actions/stripe:processPayout`

Process payout to scout (called from cron job).

**Arguments:**
```typescript
{
  scoutId: Id<"scouts">,
  amount: number  // Must be >= 20 euros
}
```

**Returns:**
```typescript
{
  success: boolean,
  transferId: string  // Stripe transfer ID
}
```

**Requirements:**
- Scout must have completed Stripe Connect onboarding
- Scout must have `pendingEarnings >= amount`
- Amount must be >= `PAYOUT_MINIMUM_THRESHOLD`

**Errors:**
- "Stripe Connect onboarding not complete"
- "Insufficient pending earnings"
- "Minimum payout is 20€"

---

## Email Actions

### `actions/emails:sendEmail`

Generic email sender via Resend.

**Arguments:**
```typescript
{
  to: string,      // Email address
  subject: string,
  template: string,  // Template name
  data: any         // Template variables
}
```

**Returns:**
```typescript
{
  success: boolean
}
```

---

### `actions/emails:sendLeadSoldNotification`

Send "Your lead sold!" email to scout.

**Arguments:**
```typescript
{
  scoutId: Id<"scouts">,
  leadId: Id<"leads">,
  earnings: number
}
```

**Template Variables:**
```typescript
{
  scoutName: string,
  leadTitle: string,
  earnings: number,
  pendingTotal: number
}
```

---

## Common Patterns

### Pagination

All list queries support pagination:

```tsx
const [page, setPage] = useState(0);
const limit = 20;

const { leads, hasMore } = useQuery(api.queries.leads.listAvailable, {
  page,
  limit
});

// Next page
if (hasMore) {
  setPage(page + 1);
}

// Previous page
if (page > 0) {
  setPage(page - 1);
}
```

### Error Handling

```tsx
const purchaseLead = useMutation(api.mutations.leads.purchase);

try {
  const result = await purchaseLead({ leadId });
  toast.success("Lead purchased!");
} catch (error) {
  // User-friendly error messages
  if (error.message.includes("Insufficient credits")) {
    toast.error("Not enough credits. Please upgrade your plan.");
  } else {
    toast.error(error.message);
  }
}
```

### Loading States

```tsx
const leads = useQuery(api.queries.leads.listAvailable, { limit: 20 });

if (leads === undefined) {
  return <Loading />;
}

if (leads.leads.length === 0) {
  return <EmptyState />;
}

return <LeadGrid leads={leads.leads} />;
```

### Real-Time Updates

Queries automatically re-run when data changes:

```tsx
// This will automatically update when new leads are added
const leads = useQuery(api.queries.leads.listAvailable, {});

// No polling needed! Convex handles real-time subscriptions.
```

---

## Environment Variables Reference

Set these in Convex Dashboard → Settings → Environment Variables:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID=price_...
STRIPE_CREDIT_PRICE_ID=price_...

# Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@leadscout.com

# Business Logic
PAYOUT_MINIMUM_THRESHOLD=20
PLATFORM_COMMISSION_RATE=0.5
LEAD_PRICE_IT=30
LEAD_PRICE_MARKETING=25
LEAD_PRICE_HR=20
LEAD_PRICE_SALES=25
LEAD_PRICE_DEFAULT=25
STARTER_PLAN_CREDITS=20
GROWTH_PLAN_CREDITS=60
SCALE_PLAN_CREDITS=150
BADGE_SILVER_THRESHOLD=20
BADGE_GOLD_THRESHOLD=50
BADGE_PLATINUM_THRESHOLD=100
LOW_CREDIT_THRESHOLD=5
```

---

## Rate Limits & Performance

### Convex Built-In Limits
- 100 requests/minute per user (automatically enforced)
- Real-time subscriptions auto-scale
- No query result size limit

### Best Practices
- Use pagination for large lists (limit: 20-50)
- Debounce search queries (300ms)
- Cache query results in component state if needed

---

## Support

For questions or issues:
- Check Convex Dashboard logs
- Review error messages (they're user-friendly)
- Contact: dev@leadscout.com
