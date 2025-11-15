## LeadScout Convex Database Documentation

Complete documentation for the LeadScout Convex database schema, setup, and usage.

---

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Schema Architecture](#schema-architecture)
4. [Environment Variables](#environment-variables)
5. [Helper Functions](#helper-functions)
6. [Example Queries](#example-queries)
7. [Data Seeding](#data-seeding)
8. [Best Practices](#best-practices)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)

---

## Overview

LeadScout uses Convex as its backend platform, providing:
- **Real-time database** with reactive queries
- **Serverless functions** (queries, mutations, actions)
- **Scheduled jobs** for automated payouts
- **File storage** for lead attachments
- **Type-safe** TypeScript integration

### Key Features

- 11 database tables covering all platform operations
- Comprehensive indexing for <100ms query performance
- NO hardcoded business logic values (all from env vars)
- Full audit trail for compliance (moderation, transactions, payouts)
- Real-time updates for marketplace and dashboards

---

## Setup

### 1. Install Dependencies

```bash
npm install convex
```

### 2. Initialize Convex

```bash
npx convex dev
```

This will:
- Create a Convex project (if first time)
- Deploy your schema and functions
- Start the development server with hot reload

### 3. Configure Environment Variables

Create `.env.local` in your project root:

```bash
# Convex Connection
CONVEX_DEPLOYMENT=your-deployment-url
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Copy all environment variables from the Environment Variables section below
```

### 4. Push Schema

```bash
npx convex dev
```

The schema will be automatically deployed when you save changes to `convex/schema.ts`.

### 5. Seed Development Data (Optional)

```bash
npx convex run seed:seedAll
```

This creates sample scouts, companies, leads, and transactions for testing.

---

## Schema Architecture

### Database Tables

| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| **users** | Authentication and user profiles | `by_clerk_id`, `by_email`, `by_role` |
| **scouts** | Scout-specific data and earnings | `by_user`, `by_stripe_connect`, `by_quality_score`, `by_pending_earnings` |
| **companies** | Company subscriptions and credits | `by_user`, `by_stripe_customer`, `by_plan`, `by_credits` |
| **leads** | Lead marketplace inventory | `by_scout`, `by_status`, `by_category`, `by_status_and_category` |
| **purchases** | Lead transaction records | `by_company`, `by_lead`, `by_scout`, `by_company_and_created` |
| **payouts** | Scout payout history | `by_scout`, `by_status`, `by_stripe_transfer` |
| **notifications** | In-app and push notifications | `by_user`, `by_user_and_read` |
| **creditTransactions** | Company credit ledger | `by_company`, `by_type`, `by_company_and_created` |
| **achievements** | Scout gamification milestones | `by_scout`, `by_type` |
| **moderationActions** | Lead moderation audit log | `by_admin`, `by_lead` |
| **adminActions** | Platform management audit log | `by_admin`, `by_target_user` |
| **teamMembers** | Multi-user company access | `by_company`, `by_user` |

### Relationships

```
users (1) ─┬─> scouts (1)      ─> leads (many)      ─> purchases (many)
           │
           └─> companies (1)   ─> purchases (many)
                               ─> creditTransactions (many)

scouts ─> payouts (many)
      ─> achievements (many)

leads ─> moderationActions (many)

purchases ─> creditTransactions (via relatedPurchaseId)
```

---

## Environment Variables

### Required Configuration

All business logic values MUST be configured via environment variables. NO hardcoded values in schema or functions.

#### Lead Pricing (in euros)

```bash
# Category-specific pricing
LEAD_PRICE_IT=30
LEAD_PRICE_MARKETING=25
LEAD_PRICE_HR=20
LEAD_PRICE_SALES=25
LEAD_PRICE_CONSULTING=25
LEAD_PRICE_FINANCE=25
LEAD_PRICE_DEFAULT=25
```

#### Business Logic

```bash
# Payout Configuration
PAYOUT_MINIMUM_THRESHOLD=20          # Minimum euros for payout
PLATFORM_COMMISSION_RATE=0.5         # 50% platform, 50% scout
PAYOUT_SCHEDULE_DAY=5                # Friday (0=Sunday, 6=Saturday)
PAYOUT_SCHEDULE_HOUR=9               # 9 AM UTC

# Credit Configuration
CREDIT_TOP_UP_PRICE=5                # Price per credit (euros)
CREDIT_EXPIRATION_MONTHS=3           # How long credits remain valid
LOW_CREDIT_THRESHOLD=5               # Notify when credits drop below this

# Quality Scoring
QUALITY_MIN_DESCRIPTION_LENGTH=100   # Minimum description length
QUALITY_SCORE_SOLD_WEIGHT=0.4        # Weight for sold ratio
QUALITY_SCORE_APPROVAL_WEIGHT=0.3    # Weight for approval rate
QUALITY_SCORE_FEEDBACK_WEIGHT=0.3    # Weight for admin feedback

# Subscription Plans (monthly credits)
STARTER_PLAN_CREDITS=20
GROWTH_PLAN_CREDITS=60
SCALE_PLAN_CREDITS=150

# Badge Thresholds (leads sold)
BADGE_SILVER_THRESHOLD=20
BADGE_GOLD_THRESHOLD=50
BADGE_PLATINUM_THRESHOLD=100

# Feature Flags
FEATURE_ANALYTICS_ENABLED=true
FEATURE_API_ACCESS_ENABLED=true
FEATURE_REFERRAL_PROGRAM_ENABLED=false
```

#### External Services

```bash
# Stripe (payments and payouts)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...

# Clerk (authentication)
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Resend (email)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@leadscout.com
```

### Accessing Environment Variables

Use the helper functions in `convex/lib/constants.ts`:

```typescript
import { getLeadPriceByCategory, getCommissionRate } from "./lib/constants";

const price = getLeadPriceByCategory("IT Services");  // Returns 30
const commission = getCommissionRate();               // Returns 0.5
```

---

## Helper Functions

### Authentication Helpers

Located in `convex/helpers.ts`:

```typescript
import { getCurrentUser, requireRole, getCurrentScout } from "./helpers";

// Get current authenticated user
const user = await getCurrentUser(ctx);

// Require specific role (throws if unauthorized)
const user = await requireRole(ctx, ["company"]);

// Get scout profile for current user
const scout = await getCurrentScout(ctx);
```

### Credit Management

```typescript
import { checkCreditBalance, deductCredits, addCredits } from "./helpers";

// Check if company has enough credits
const hasCredits = await checkCreditBalance(ctx, companyId, 1);

// Deduct credits (throws if insufficient)
await deductCredits(ctx, companyId, 1, "Lead purchase", purchaseId);

// Add credits (renewal, purchase, refund)
await addCredits(ctx, companyId, 20, "allocation", "Monthly renewal");
```

### Scout Earnings

```typescript
import { creditScoutEarnings, updateScoutBadge } from "./helpers";

// Credit earnings to scout after lead sale
await creditScoutEarnings(ctx, scoutId, 15);

// Update badge if threshold reached
const badgeUpgraded = await updateScoutBadge(ctx, scoutId);
```

### Notifications

```typescript
import { createNotification } from "./helpers";

await createNotification(
  ctx,
  userId,
  "lead_sold",
  "Lead Sold!",
  "Your lead was purchased for 30 euros",
  { leadId: "...", amount: 30 }
);
```

---

## Example Queries

### Leads Queries

See `convex/examples/leads.queries.ts` for complete implementations:

```typescript
// Get marketplace leads with filters
const leads = await ctx.runQuery(api.examples.leads.getAvailableLeads, {
  category: "IT Services",
  budgetMin: 10000,
  minQualityScore: 7.5,
  limit: 20,
});

// Get pending moderation leads (admin)
const pendingLeads = await ctx.runQuery(api.examples.leads.getPendingModerationLeads, {});

// Search leads by keywords
const results = await ctx.runQuery(api.examples.leads.searchLeads, {
  searchQuery: "CRM migration",
  status: "approved",
});
```

### Scout Queries

See `convex/examples/scouts.queries.ts`:

```typescript
// Get scout earnings dashboard
const earnings = await ctx.runQuery(api.examples.scouts.getMyEarnings, {});

// Get scout's lead history
const myLeads = await ctx.runQuery(api.examples.scouts.getMyLeads, {
  status: "sold",
  limit: 50,
});

// Get leaderboard
const leaderboard = await ctx.runQuery(api.examples.scouts.getScoutLeaderboard, {
  sortBy: "quality",
  limit: 10,
});
```

### Company Queries

See `convex/examples/companies.queries.ts`:

```typescript
// Get credit dashboard
const credits = await ctx.runQuery(api.examples.companies.getMyCredits, {});

// Get purchase history
const purchases = await ctx.runQuery(api.examples.companies.getMyPurchases, {
  category: "IT Services",
  limit: 20,
});

// Get analytics (Growth/Scale plans)
const analytics = await ctx.runQuery(api.examples.companies.getMyAnalytics, {
  dateRange: { startDate: ..., endDate: ... },
});
```

---

## Data Seeding

### Full Seed (Development)

Creates complete test ecosystem:

```bash
npx convex run seed:seedAll
```

This creates:
- 3 scout users with profiles
- 2 company users with subscriptions
- 1 admin user
- 5 leads in various states (pending, approved, rejected, sold)
- Sample purchases and payouts
- Notifications and achievements

### Quick Seed (Testing)

Minimal data for rapid testing:

```bash
npx convex run seed:seedQuick
```

Creates:
- 1 scout
- 1 company
- 3 leads

### Clear Data

The seed functions automatically clear existing data. **Only run in development!**

---

## Best Practices

### 1. Always Use Indexes

```typescript
// Good: Uses index for O(log n) lookup
const leads = await ctx.db
  .query("leads")
  .withIndex("by_status_and_category", (q) =>
    q.eq("status", "approved").eq("category", "IT")
  )
  .collect();

// Bad: Full table scan O(n)
const leads = await ctx.db
  .query("leads")
  .collect()
  .filter(lead => lead.status === "approved" && lead.category === "IT");
```

### 2. Limit Results

```typescript
// Good: Limits query results
const leads = await ctx.db
  .query("leads")
  .withIndex("by_status", (q) => q.eq("status", "approved"))
  .order("desc")
  .take(20);

// Bad: Fetches all records
const allLeads = await ctx.db
  .query("leads")
  .collect();
```

### 3. Use Pagination for Large Lists

```typescript
const paginatedLeads = await ctx.db
  .query("leads")
  .withIndex("by_status", (q) => q.eq("status", "approved"))
  .paginate(args.paginationOpts);
```

### 4. Validate Input Data

```typescript
import { validateLeadSubmission } from "./validators";

// Throws detailed validation errors
const validatedData = validateLeadSubmission(args);
```

### 5. Handle Errors Gracefully

```typescript
try {
  const lead = await ctx.db.get(leadId);
  if (!lead) {
    throw new Error("Lead not found");
  }
  // Process lead...
} catch (error) {
  console.error("Lead processing failed:", error);
  throw new Error(`Failed to process lead: ${error.message}`);
}
```

---

## Performance Optimization

### Query Performance Targets

| Query Type | Target | Optimization |
|------------|--------|--------------|
| Marketplace leads | <100ms | Indexed by `status` and `category` |
| Scout dashboard | <100ms | Indexed by `userId` |
| Company dashboard | <100ms | Indexed by `userId` |
| Credit balance | <50ms | Direct `db.get()` lookup |
| Payout eligibility | <500ms | Indexed by `pendingEarnings` |

### Index Strategy

#### Single-Field Indexes

Used for filtering by one field:

```typescript
.index("by_status", ["status"])
.index("by_category", ["category"])
```

#### Compound Indexes

Used for filtering by multiple fields:

```typescript
.index("by_status_and_category", ["status", "category"])
.index("by_company_and_created", ["companyId", "createdAt"])
```

#### When to Use Which

- **Single-field**: Filter by one field (e.g., all approved leads)
- **Compound**: Filter by multiple fields (e.g., approved IT leads)
- **Always index foreign keys**: userId, scoutId, companyId, leadId

### Caching Strategy

Convex automatically caches query results. To optimize:

1. **Reuse queries**: Same query args = cached result
2. **Avoid dynamic queries**: Use consistent filter patterns
3. **Batch operations**: Group related updates in single mutation

---

## Troubleshooting

### Common Issues

#### Schema Validation Errors

**Problem**: Schema won't deploy due to validation error.

**Solution**: Check that all field types match the schema:

```typescript
// Correct
createdAt: v.number(),  // Unix timestamp

// Incorrect
createdAt: v.string(),  // Will fail
```

#### Index Not Working

**Problem**: Query is slow despite having an index.

**Solution**: Ensure you're using `.withIndex()`:

```typescript
// Correct: Uses index
.withIndex("by_status", (q) => q.eq("status", "approved"))

// Incorrect: Full scan
.collect().filter(...)
```

#### Environment Variables Not Found

**Problem**: `process.env.VARIABLE_NAME` returns undefined.

**Solution**:
1. Check `.env.local` file exists
2. Restart Convex dev server
3. Verify variable name matches exactly (case-sensitive)

#### Real-time Updates Not Working

**Problem**: UI doesn't update when data changes.

**Solution**: Use `useQuery` hook (reactive):

```typescript
// Correct: Reactive
const leads = useQuery(api.leads.getAvailableLeads, { category: "IT" });

// Incorrect: Static
const leads = await ctx.runQuery(...);
```

### Performance Issues

#### Slow Queries

1. **Check indexes**: Use Convex dashboard to see query plans
2. **Add indexes**: Create compound indexes for common filter combinations
3. **Limit results**: Use `.take()` or `.paginate()`
4. **Avoid `.collect()` then filter**: Use indexes instead

#### Memory Issues

1. **Limit query results**: Don't fetch all records
2. **Use pagination**: For large lists
3. **Optimize file storage**: Compress images before upload

### Data Integrity Issues

#### Duplicate Leads

**Prevention**: Check before creating:

```typescript
const existing = await ctx.db
  .query("leads")
  .withIndex("by_scout", (q) => q.eq("scoutId", scoutId))
  .filter((q) =>
    q.eq(q.field("companyName"), args.companyName) &&
    q.eq(q.field("contactEmail"), args.contactEmail)
  )
  .first();

if (existing) {
  throw new Error("Duplicate lead detected");
}
```

#### Negative Credits

**Prevention**: Use transaction-safe deduction:

```typescript
if (company.creditsRemaining < amount) {
  throw new Error("Insufficient credits");
}
await ctx.db.patch(companyId, {
  creditsRemaining: company.creditsRemaining - amount,
});
```

---

## Advanced Topics

### Scheduled Functions

Weekly payout processing:

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";

const crons = cronJobs();

crons.weekly(
  "process weekly payouts",
  { dayOfWeek: "friday", hourUTC: 9, minuteUTC: 0 },
  internal.payouts.processWeeklyPayouts
);

export default crons;
```

### File Storage

Upload lead photos:

```typescript
// Store file
const storageId = await ctx.storage.store(file);

// Reference in database
await ctx.db.insert("leads", {
  ...leadData,
  photos: [storageId],
});

// Retrieve file URL
const url = await ctx.storage.getUrl(storageId);
```

### Audit Logging

Track all moderation actions:

```typescript
await ctx.db.insert("moderationActions", {
  adminId: user._id,
  leadId: args.leadId,
  action: "approved",
  reason: "High quality lead with complete information",
  createdAt: Date.now(),
});
```

---

## Support & Resources

### Documentation

- [Convex Docs](https://docs.convex.dev/)
- [Schema Reference](https://docs.convex.dev/database/schemas)
- [Indexes Guide](https://docs.convex.dev/database/indexes)

### LeadScout Specific

- **Schema**: `convex/schema.ts`
- **Helpers**: `convex/helpers.ts`
- **Validators**: `convex/validators.ts`
- **Examples**: `convex/examples/`
- **Constants**: `convex/lib/constants.ts`

### Getting Help

1. Check this README first
2. Review example queries in `convex/examples/`
3. Check Convex dashboard for query performance
4. Review error messages carefully (Convex errors are detailed)

---

**Database Implementation Status**: ✅ Production-Ready

All tables, indexes, helpers, and documentation are complete and ready for use by backend and frontend developers.
