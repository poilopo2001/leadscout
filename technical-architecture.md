# Technical Architecture & Implementation Plan: LeadScout

## Document Information
- **Version**: 1.0
- **Last Updated**: 2025-11-15
- **Software Architect**: AI Architect Agent
- **Status**: Ready for Implementation

---

## 1. System Architecture Overview

### 1.1 Technology Stack (MANDATORY - DO NOT CHANGE)

**Frontend Web (Companies):**
- Framework: Next.js 14+ with App Router
- UI Library: Shadcn/UI + Radix UI primitives
- Styling: Tailwind CSS
- State: Convex React hooks (useQuery, useMutation, useAction)
- Charts: Recharts
- Forms: React Hook Form + Zod validation
- Deployment: Digital Ocean App Platform

**Frontend Mobile (Scouts):**
- Framework: React Native + Expo SDK 50+
- Navigation: Expo Router (file-based routing)
- UI: React Native Paper or custom components
- State: Convex React hooks
- Notifications: Expo Notifications
- Deployment: Expo EAS (Build + Submit)

**Backend & Database:**
- Platform: Convex (serverless backend, real-time database)
- Functions: Convex queries, mutations, actions, scheduled functions
- File Storage: Convex file storage
- Real-time: Built-in subscriptions (no WebSocket config needed)

**Authentication:**
- Provider: Clerk (web + mobile, integrates with Convex)
- Social: Google, Microsoft
- Strategy: JWT tokens with HTTP-only cookies (web), SecureStore (mobile)

**Payments:**
- Subscriptions: Stripe Checkout + Customer Portal
- Payouts: Stripe Connect (Express accounts)
- Webhooks: Stripe webhooks handled in Convex actions

**Email:**
- Provider: Resend
- Templates: React Email

**Hosting & Infrastructure:**
- Web: Digital Ocean App Platform
- Mobile: Expo EAS (build + submit)
- CDN: Digital Ocean Spaces or Vercel Edge Network
- Backend: Convex Cloud (auto-scaling)

### 1.2 Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                        │
├───────────────────────────┬──────────────────────────────────┤
│   WEB APP (Companies)     │   MOBILE APP (Scouts)            │
│   - Next.js 14 App Router │   - React Native + Expo          │
│   - Desktop-first UI      │   - Mobile-first UI              │
│   - Shadcn/UI + Tailwind  │   - React Native Paper           │
│   - Browse/Purchase Leads │   - Submit Leads                 │
└───────────────────────────┴──────────────────────────────────┘
                    │                       │
                    │   HTTPS / JWT Auth    │
                    ▼                       ▼
┌──────────────────────────────────────────────────────────────┐
│                  CLERK AUTHENTICATION                         │
│   - Multi-platform (Web + Mobile)                            │
│   - JWT token validation                                     │
│   - User metadata (role: scout/company/admin)                │
│   - Social auth (Google, Microsoft)                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ JWT Verification
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    CONVEX BACKEND                             │
├──────────────────────────────────────────────────────────────┤
│  QUERIES (Reactive, Read-Only)                               │
│  - leads.listAvailable       - companies.getCurrentUser      │
│  - scouts.getMyStats         - analytics.getCompanyMetrics   │
│                                                               │
│  MUTATIONS (Write Data, Transactional)                       │
│  - leads.create              - leads.purchase                │
│  - scouts.updateQualityScore - companies.updateSubscription  │
│                                                               │
│  ACTIONS (External API Calls)                                │
│  - stripe.createSubscription - stripe.onboardScout           │
│  - stripe.handleWebhook      - emails.sendNotification       │
│  - payouts.processWeekly     - leads.calculateQuality        │
│                                                               │
│  SCHEDULED FUNCTIONS (Cron Jobs)                             │
│  - payouts.processWeekly (Fridays 9:00 AM)                   │
│  - credits.renewMonthly (1st of month)                       │
│  - reminders.lowCredits (Daily check)                        │
│                                                               │
│  FILE STORAGE                                                 │
│  - Scout lead attachments (photos, documents)                │
│  - Company logos                                              │
└──────────────────────────────────────────────────────────────┘
                    │                       │
                    │ API Calls             │ Webhooks
                    ▼                       ▼
┌─────────────────────────────┬────────────────────────────────┐
│   STRIPE PAYMENTS           │   EXTERNAL SERVICES            │
├─────────────────────────────┼────────────────────────────────┤
│ - Subscriptions (Checkout)  │ - Resend (Email)               │
│ - Connect (Scout Payouts)   │ - Expo Push (Notifications)    │
│ - Customer Portal           │                                │
│ - Webhooks (Events)         │                                │
└─────────────────────────────┴────────────────────────────────┘
```

### 1.3 Data Flow Examples

#### Lead Submission → Approval → Purchase → Payout

```
1. SCOUT (Mobile App)
   ↓
   Submit Lead (photos, details)
   ↓
2. CONVEX Mutation: leads.create
   ↓
   Store in database (status: "pending_review")
   Upload photos to Convex storage
   ↓
3. ADMIN (Web Dashboard)
   ↓
   Review lead in moderation queue
   ↓
4. CONVEX Mutation: leads.moderate
   ↓
   Update status: "approved" → publish to marketplace
   ↓
5. COMPANY (Web App)
   ↓
   Browse marketplace, view lead preview
   ↓
6. CONVEX Mutation: leads.purchase
   ↓
   TRANSACTION:
   - Deduct 1 credit from company
   - Mark lead as "sold"
   - Credit scout pending earnings (50% of price)
   - Create purchase record
   - Send notifications (scout + company)
   ↓
7. SCHEDULED FUNCTION: payouts.processWeekly (Friday 9 AM)
   ↓
8. CONVEX Action: stripe.processPayouts
   ↓
   For each scout with pending ≥ 20€:
   - Create Stripe transfer to Connect account
   - Update scout balance (pending → total)
   - Send email notification via Resend
   ↓
9. SCOUT receives funds in bank account (2-5 days)
```

#### Subscription Creation → Credits Added

```
1. COMPANY (Web App)
   ↓
   Select plan (Starter/Growth/Scale)
   ↓
2. NEXT.JS API Route: /api/stripe/create-checkout
   ↓
3. CONVEX Action: stripe.createCheckoutSession
   ↓
   Call Stripe API to create session
   ↓
4. Redirect to Stripe Checkout (hosted page)
   ↓
5. Company completes payment
   ↓
6. STRIPE Webhook → /api/stripe/webhooks
   ↓
7. Verify webhook signature
   ↓
8. CONVEX Action: stripe.handleWebhook
   ↓
   Event: checkout.session.completed
   ↓
9. CONVEX Mutation: companies.createSubscription
   ↓
   TRANSACTION:
   - Create company record
   - Add credits (Starter: 20, Growth: 60, Scale: 150)
   - Set subscription status: "active"
   - Record transaction
   ↓
10. Send welcome email via Resend
    ↓
11. Company dashboard shows credits available
```

---

## 2. Database Architecture (Convex)

### 2.1 Schema Design

Complete Convex schema with validators, indexes, and relationships.

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  // ============================================
  // USERS & AUTHENTICATION
  // ============================================
  users: defineTable({
    clerkId: v.string(),
    role: v.union(v.literal("scout"), v.literal("company"), v.literal("admin")),
    email: v.string(),
    name: v.string(),
    profile: v.object({
      avatar: v.optional(v.string()),
      bio: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      // Scout-specific fields
      industryExpertise: v.optional(v.array(v.string())),
      // Company-specific fields
      companyName: v.optional(v.string()),
      website: v.optional(v.string()),
      industry: v.optional(v.string()),
      teamSize: v.optional(v.string()),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // ============================================
  // SCOUTS
  // ============================================
  scouts: defineTable({
    userId: v.id("users"),
    stripeConnectAccountId: v.optional(v.string()),
    onboardingComplete: v.boolean(),
    qualityScore: v.number(), // 0-10
    badge: v.union(
      v.literal("bronze"),
      v.literal("silver"),
      v.literal("gold"),
      v.literal("platinum")
    ),
    totalLeadsSubmitted: v.number(),
    totalLeadsSold: v.number(),
    pendingEarnings: v.number(), // euros
    totalEarnings: v.number(), // lifetime
    lastPayoutDate: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_connect", ["stripeConnectAccountId"])
    .index("by_quality_score", ["qualityScore"])
    .index("by_pending_earnings", ["pendingEarnings"]),

  // ============================================
  // COMPANIES
  // ============================================
  companies: defineTable({
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    subscriptionId: v.optional(v.string()),
    plan: v.optional(v.union(
      v.literal("starter"),
      v.literal("growth"),
      v.literal("scale")
    )),
    subscriptionStatus: v.union(
      v.literal("active"),
      v.literal("past_due"),
      v.literal("canceled"),
      v.literal("incomplete")
    ),
    creditsRemaining: v.number(),
    creditsAllocated: v.number(), // monthly allocation
    nextRenewalDate: v.optional(v.number()),
    preferences: v.object({
      categories: v.array(v.string()),
      budgetMin: v.optional(v.number()),
      budgetMax: v.optional(v.number()),
      notifications: v.object({
        newLeads: v.boolean(),
        lowCredits: v.boolean(),
        renewalReminder: v.boolean(),
      }),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_subscription", ["subscriptionId"])
    .index("by_plan", ["plan"])
    .index("by_credits", ["creditsRemaining"]),

  // ============================================
  // LEADS
  // ============================================
  leads: defineTable({
    scoutId: v.id("scouts"),

    // Lead information
    title: v.string(),
    description: v.string(), // min 100 chars
    category: v.string(),

    // Company details (revealed after purchase)
    companyName: v.string(),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.string(),
    companyWebsite: v.optional(v.string()),
    estimatedBudget: v.number(), // euros
    timeline: v.optional(v.string()), // e.g., "Q1 2025"

    // Media
    photos: v.array(v.string()), // Convex storage IDs

    // Status & moderation
    status: v.union(
      v.literal("pending_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("sold")
    ),
    moderationStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("changes_requested"),
      v.literal("rejected")
    ),
    moderationNotes: v.optional(v.string()),
    moderatedBy: v.optional(v.id("users")),
    moderatedAt: v.optional(v.number()),

    // Quality scoring
    qualityScore: v.number(), // 0-10
    qualityFactors: v.object({
      descriptionLength: v.number(),
      contactCompleteness: v.number(),
      budgetAccuracy: v.number(),
      photoCount: v.number(),
      scoutReputation: v.number(),
    }),

    // Sales tracking
    purchasedBy: v.optional(v.id("companies")),
    purchasedAt: v.optional(v.number()),
    salePrice: v.number(), // actual price at time of sale

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_scout", ["scoutId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_quality_score", ["qualityScore"])
    .index("by_created", ["createdAt"])
    .index("by_purchased_by", ["purchasedBy"])
    // Compound indexes for filtering
    .index("by_status_and_category", ["status", "category"])
    .index("by_status_and_created", ["status", "createdAt"])
    .index("by_moderation_status", ["moderationStatus"]),

  // ============================================
  // PURCHASES
  // ============================================
  purchases: defineTable({
    companyId: v.id("companies"),
    leadId: v.id("leads"),
    scoutId: v.id("scouts"),
    creditsUsed: v.number(), // typically 1
    purchasePrice: v.number(), // for accounting
    scoutEarning: v.number(), // 50% of purchase price
    platformCommission: v.number(), // 50% of purchase price
    status: v.union(v.literal("completed"), v.literal("refunded")),
    refundReason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_lead", ["leadId"])
    .index("by_scout", ["scoutId"])
    .index("by_created", ["createdAt"])
    .index("by_company_and_created", ["companyId", "createdAt"]),

  // ============================================
  // PAYOUTS
  // ============================================
  payouts: defineTable({
    scoutId: v.id("scouts"),
    amount: v.number(), // euros
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    stripeTransferId: v.optional(v.string()),
    stripePayoutId: v.optional(v.string()),
    failureReason: v.optional(v.string()),
    processedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_scout", ["scoutId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .index("by_stripe_transfer", ["stripeTransferId"]),

  // ============================================
  // NOTIFICATIONS
  // ============================================
  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("lead_approved"),
      v.literal("lead_sold"),
      v.literal("payout_processed"),
      v.literal("new_matching_lead"),
      v.literal("low_credits"),
      v.literal("subscription_renewed")
    ),
    title: v.string(),
    message: v.string(),
    metadata: v.optional(v.any()), // flexible JSON data
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "read"])
    .index("by_created", ["createdAt"]),

  // ============================================
  // CREDIT TRANSACTIONS
  // ============================================
  creditTransactions: defineTable({
    companyId: v.id("companies"),
    type: v.union(
      v.literal("allocation"),
      v.literal("purchase"),
      v.literal("usage"),
      v.literal("refund")
    ),
    amount: v.number(), // positive for add, negative for usage
    balanceAfter: v.number(),
    relatedPurchaseId: v.optional(v.id("purchases")),
    stripePaymentId: v.optional(v.string()),
    description: v.string(),
    createdAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_type", ["type"])
    .index("by_created", ["createdAt"])
    .index("by_company_and_created", ["companyId", "createdAt"]),

  // ============================================
  // MODERATION ACTIONS (Audit Log)
  // ============================================
  moderationActions: defineTable({
    adminId: v.id("users"),
    leadId: v.id("leads"),
    action: v.union(
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("changes_requested"),
      v.literal("flagged")
    ),
    reason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_admin", ["adminId"])
    .index("by_lead", ["leadId"])
    .index("by_created", ["createdAt"]),

  // ============================================
  // TEAM MEMBERS (Company Teams)
  // ============================================
  teamMembers: defineTable({
    companyId: v.id("companies"),
    userId: v.id("users"),
    permissions: v.array(v.string()), // ["view", "purchase", "admin"]
    invitedBy: v.id("users"),
    invitedAt: v.number(),
    acceptedAt: v.optional(v.number()),
  })
    .index("by_company", ["companyId"])
    .index("by_user", ["userId"]),
});

export default schema;
```

### 2.2 Index Strategy

**Primary Indexes (Single Field):**
- `by_clerk_id`: Fast user lookup by Clerk ID (authentication)
- `by_email`: User search/validation
- `by_stripe_customer`: Company lookup via Stripe customer ID
- `by_scout`: All leads from a scout
- `by_status`: Filter leads by status (pending, approved, sold)
- `by_category`: Filter leads by industry category

**Compound Indexes (Multi-Field):**
- `by_status_and_category`: Marketplace filtering (approved + IT)
- `by_status_and_created`: Marketplace sorting (approved + newest first)
- `by_company_and_created`: Purchase history sorted by date
- `by_user_and_read`: Unread notifications for a user

**Performance Considerations:**
- All indexes support `.withIndex()` queries (O(log n) lookup)
- Avoid `.filter()` on large result sets (full scan)
- Use pagination for lists >100 items (`ctx.db.query().paginate()`)

---

## 3. API Architecture (Convex Functions)

### 3.1 Queries (Read Operations, Reactive)

Queries are read-only, reactive functions that automatically re-run when data changes.

```typescript
// convex/leads.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const listAvailable = query({
  args: {
    category: v.optional(v.string()),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify user is authenticated and is a company
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "company") {
      throw new Error("Unauthorized: Company access only");
    }

    // Query leads with filters
    let leadsQuery = ctx.db
      .query("leads")
      .withIndex("by_status_and_created", (q) =>
        q.eq("status", "approved")
      );

    // Apply category filter if provided
    if (args.category) {
      leadsQuery = ctx.db
        .query("leads")
        .withIndex("by_status_and_category", (q) =>
          q.eq("status", "approved").eq("category", args.category)
        );
    }

    // Collect and filter by budget
    let leads = await leadsQuery.collect();

    if (args.budgetMin !== undefined) {
      leads = leads.filter(lead => lead.estimatedBudget >= args.budgetMin!);
    }

    if (args.budgetMax !== undefined) {
      leads = leads.filter(lead => lead.estimatedBudget <= args.budgetMax!);
    }

    // Limit results
    const limit = args.limit ?? 50;
    leads = leads.slice(0, limit);

    // Fetch scout info for each lead (quality score)
    const leadsWithScouts = await Promise.all(
      leads.map(async (lead) => {
        const scout = await ctx.db.get(lead.scoutId);
        return {
          ...lead,
          // Hide contact info until purchased
          contactName: "***",
          contactEmail: "***",
          contactPhone: "***",
          companyName: lead.companyName.substring(0, 3) + "***",
          scoutQualityScore: scout?.qualityScore ?? 0,
          scoutBadge: scout?.badge ?? "bronze",
        };
      })
    );

    return leadsWithScouts;
  },
});

export const getMyLeads = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "scout") {
      throw new Error("Unauthorized: Scout access only");
    }

    const scout = await ctx.db
      .query("scouts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!scout) throw new Error("Scout profile not found");

    const leads = await ctx.db
      .query("leads")
      .withIndex("by_scout", (q) => q.eq("scoutId", scout._id))
      .collect();

    return leads.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getMyPurchases = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "company") {
      throw new Error("Unauthorized: Company access only");
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!company) throw new Error("Company profile not found");

    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_company_and_created", (q) =>
        q.eq("companyId", company._id)
      )
      .collect();

    // Fetch lead details for each purchase
    const purchasesWithLeads = await Promise.all(
      purchases.map(async (purchase) => {
        const lead = await ctx.db.get(purchase.leadId);
        return {
          ...purchase,
          lead,
        };
      })
    );

    return purchasesWithLeads.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getMyEarnings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "scout") {
      throw new Error("Unauthorized: Scout access only");
    }

    const scout = await ctx.db
      .query("scouts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!scout) throw new Error("Scout profile not found");

    const payouts = await ctx.db
      .query("payouts")
      .withIndex("by_scout", (q) => q.eq("scoutId", scout._id))
      .collect();

    const recentPurchases = await ctx.db
      .query("purchases")
      .withIndex("by_scout", (q) => q.eq("scoutId", scout._id))
      .order("desc")
      .take(10);

    return {
      pendingEarnings: scout.pendingEarnings,
      totalEarnings: scout.totalEarnings,
      totalLeadsSold: scout.totalLeadsSold,
      qualityScore: scout.qualityScore,
      badge: scout.badge,
      payouts: payouts.sort((a, b) => b.createdAt - a.createdAt),
      recentPurchases,
    };
  },
});

export const getMyCredits = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "company") {
      throw new Error("Unauthorized: Company access only");
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!company) throw new Error("Company profile not found");

    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_company_and_created", (q) =>
        q.eq("companyId", company._id)
      )
      .order("desc")
      .take(50);

    return {
      creditsRemaining: company.creditsRemaining,
      creditsAllocated: company.creditsAllocated,
      nextRenewalDate: company.nextRenewalDate,
      plan: company.plan,
      transactions,
    };
  },
});

export const getPendingModerationLeads = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access only");
    }

    const leads = await ctx.db
      .query("leads")
      .withIndex("by_moderation_status", (q) =>
        q.eq("moderationStatus", "pending")
      )
      .collect();

    // Fetch scout info for each lead
    const leadsWithScouts = await Promise.all(
      leads.map(async (lead) => {
        const scout = await ctx.db.get(lead.scoutId);
        const scoutUser = scout
          ? await ctx.db.get(scout.userId)
          : null;
        return {
          ...lead,
          scoutName: scoutUser?.name ?? "Unknown",
          scoutEmail: scoutUser?.email ?? "",
          scoutQualityScore: scout?.qualityScore ?? 0,
        };
      })
    );

    return leadsWithScouts.sort((a, b) => a.createdAt - b.createdAt);
  },
});
```

### 3.2 Mutations (Write Operations, Transactional)

Mutations modify database state and are transactional (all-or-nothing).

```typescript
// convex/leads.ts (continued)
import { mutation } from "./_generated/server";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    companyName: v.string(),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.string(),
    companyWebsite: v.optional(v.string()),
    estimatedBudget: v.number(),
    timeline: v.optional(v.string()),
    photos: v.array(v.string()), // storage IDs
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "scout") {
      throw new Error("Unauthorized: Scout access only");
    }

    const scout = await ctx.db
      .query("scouts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!scout) throw new Error("Scout profile not found");

    // Validate inputs
    if (args.title.length < 10) {
      throw new Error("Title must be at least 10 characters");
    }
    if (args.description.length < 50) {
      throw new Error("Description must be at least 50 characters");
    }

    // Calculate quality score
    const qualityScore = calculateQualityScore({
      descriptionLength: args.description.length,
      hasWebsite: !!args.companyWebsite,
      photoCount: args.photos.length,
      scoutReputation: scout.qualityScore,
    });

    // Determine sale price based on category (from ENV)
    const categoryPricing = JSON.parse(
      process.env.CATEGORY_PRICING ?? '{"default": 25}'
    );
    const salePrice = categoryPricing[args.category] ?? categoryPricing.default;

    // Create lead
    const leadId = await ctx.db.insert("leads", {
      scoutId: scout._id,
      title: args.title,
      description: args.description,
      category: args.category,
      companyName: args.companyName,
      contactName: args.contactName,
      contactEmail: args.contactEmail,
      contactPhone: args.contactPhone,
      companyWebsite: args.companyWebsite,
      estimatedBudget: args.estimatedBudget,
      timeline: args.timeline,
      photos: args.photos,
      status: "pending_review",
      moderationStatus: "pending",
      qualityScore,
      qualityFactors: {
        descriptionLength: args.description.length,
        contactCompleteness: 100, // all fields provided
        budgetAccuracy: 50, // default, updated later
        photoCount: args.photos.length,
        scoutReputation: scout.qualityScore,
      },
      salePrice,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update scout stats
    await ctx.db.patch(scout._id, {
      totalLeadsSubmitted: scout.totalLeadsSubmitted + 1,
    });

    return leadId;
  },
});

export const purchase = mutation({
  args: {
    leadId: v.id("leads"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "company") {
      throw new Error("Unauthorized: Company access only");
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!company) throw new Error("Company profile not found");

    // Check credits
    if (company.creditsRemaining < 1) {
      throw new Error("Insufficient credits");
    }

    // Get lead
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");

    if (lead.status !== "approved") {
      throw new Error("Lead not available for purchase");
    }

    if (lead.purchasedBy) {
      throw new Error("Lead already sold");
    }

    // Get scout
    const scout = await ctx.db.get(lead.scoutId);
    if (!scout) throw new Error("Scout not found");

    // TRANSACTION: All updates must succeed or all fail
    const now = Date.now();
    const purchasePrice = lead.salePrice;
    const commissionRate = parseFloat(
      process.env.PAYOUT_COMMISSION_RATE ?? "0.5"
    );
    const scoutEarning = purchasePrice * commissionRate;
    const platformCommission = purchasePrice - scoutEarning;

    // 1. Deduct credit from company
    await ctx.db.patch(company._id, {
      creditsRemaining: company.creditsRemaining - 1,
      updatedAt: now,
    });

    // 2. Record credit transaction
    await ctx.db.insert("creditTransactions", {
      companyId: company._id,
      type: "usage",
      amount: -1,
      balanceAfter: company.creditsRemaining - 1,
      relatedPurchaseId: undefined, // will update after purchase created
      description: `Purchased lead: ${lead.title}`,
      createdAt: now,
    });

    // 3. Mark lead as sold
    await ctx.db.patch(lead._id, {
      status: "sold",
      purchasedBy: company._id,
      purchasedAt: now,
      updatedAt: now,
    });

    // 4. Create purchase record
    const purchaseId = await ctx.db.insert("purchases", {
      companyId: company._id,
      leadId: lead._id,
      scoutId: scout._id,
      creditsUsed: 1,
      purchasePrice,
      scoutEarning,
      platformCommission,
      status: "completed",
      createdAt: now,
    });

    // 5. Credit scout pending earnings
    await ctx.db.patch(scout._id, {
      pendingEarnings: scout.pendingEarnings + scoutEarning,
      totalLeadsSold: scout.totalLeadsSold + 1,
    });

    // 6. Update scout quality score
    const newQualityScore = calculateScoutQualityScore({
      totalSubmitted: scout.totalLeadsSubmitted,
      totalSold: scout.totalLeadsSold + 1,
      currentScore: scout.qualityScore,
    });

    await ctx.db.patch(scout._id, {
      qualityScore: newQualityScore,
    });

    // 7. Create notifications
    await ctx.db.insert("notifications", {
      userId: scout.userId,
      type: "lead_sold",
      title: "Lead Sold!",
      message: `Your lead "${lead.title}" was purchased. You earned ${scoutEarning}€.`,
      metadata: { leadId: lead._id, amount: scoutEarning },
      read: false,
      createdAt: now,
    });

    await ctx.db.insert("notifications", {
      userId: company.userId,
      type: "new_matching_lead",
      title: "Lead Purchased",
      message: `You purchased "${lead.title}". Contact info is now available.`,
      metadata: { leadId: lead._id },
      read: false,
      createdAt: now,
    });

    return { purchaseId, lead };
  },
});

export const moderate = mutation({
  args: {
    leadId: v.id("leads"),
    action: v.union(
      v.literal("approve"),
      v.literal("reject"),
      v.literal("request_changes")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access only");
    }

    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");

    const now = Date.now();

    if (args.action === "approve") {
      await ctx.db.patch(lead._id, {
        status: "approved",
        moderationStatus: "approved",
        moderatedBy: user._id,
        moderatedAt: now,
        moderationNotes: args.notes,
        updatedAt: now,
      });

      // Notify scout
      const scout = await ctx.db.get(lead.scoutId);
      if (scout) {
        await ctx.db.insert("notifications", {
          userId: scout.userId,
          type: "lead_approved",
          title: "Lead Approved",
          message: `Your lead "${lead.title}" is now live in the marketplace!`,
          metadata: { leadId: lead._id },
          read: false,
          createdAt: now,
        });
      }
    } else if (args.action === "reject") {
      await ctx.db.patch(lead._id, {
        status: "rejected",
        moderationStatus: "rejected",
        moderatedBy: user._id,
        moderatedAt: now,
        moderationNotes: args.notes,
        updatedAt: now,
      });

      // Notify scout with feedback
      const scout = await ctx.db.get(lead.scoutId);
      if (scout) {
        await ctx.db.insert("notifications", {
          userId: scout.userId,
          type: "lead_approved", // same type, different message
          title: "Lead Rejected",
          message: `Your lead "${lead.title}" was rejected. Reason: ${args.notes}`,
          metadata: { leadId: lead._id, reason: args.notes },
          read: false,
          createdAt: now,
        });
      }
    } else {
      await ctx.db.patch(lead._id, {
        moderationStatus: "changes_requested",
        moderatedBy: user._id,
        moderatedAt: now,
        moderationNotes: args.notes,
        updatedAt: now,
      });
    }

    // Record moderation action (audit log)
    await ctx.db.insert("moderationActions", {
      adminId: user._id,
      leadId: lead._id,
      action: args.action === "approve" ? "approved" :
              args.action === "reject" ? "rejected" : "changes_requested",
      reason: args.notes,
      createdAt: now,
    });

    return { success: true };
  },
});

// Helper function (not exported, internal use)
function calculateQualityScore(factors: {
  descriptionLength: number;
  hasWebsite: boolean;
  photoCount: number;
  scoutReputation: number;
}): number {
  let score = 0;

  // Description quality (max 3 points)
  score += Math.min(factors.descriptionLength / 100, 3);

  // Website provided (1 point)
  if (factors.hasWebsite) score += 1;

  // Photos (max 2 points)
  score += Math.min(factors.photoCount * 0.5, 2);

  // Scout reputation (max 4 points)
  score += (factors.scoutReputation / 10) * 4;

  return Math.round(score * 10) / 10; // round to 1 decimal
}

function calculateScoutQualityScore(factors: {
  totalSubmitted: number;
  totalSold: number;
  currentScore: number;
}): number {
  if (factors.totalSubmitted === 0) return 0;

  const conversionRate = factors.totalSold / factors.totalSubmitted;
  const conversionScore = conversionRate * 10; // max 10 points

  // Weighted average: 70% conversion, 30% current score
  const newScore = (conversionScore * 0.7) + (factors.currentScore * 0.3);

  return Math.round(newScore * 10) / 10;
}
```

### 3.3 Actions (External API Calls)

Actions call external services (Stripe, Resend, etc.) and are not transactional.

```typescript
// convex/stripe.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const createCheckoutSession = action({
  args: {
    plan: v.union(
      v.literal("starter"),
      v.literal("growth"),
      v.literal("scale")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get price ID from environment variables
    const priceIds = {
      starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID!,
      growth: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID!,
      scale: process.env.NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID!,
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceIds[args.plan],
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      client_reference_id: identity.subject, // Clerk user ID
      metadata: {
        clerkUserId: identity.subject,
        plan: args.plan,
      },
    });

    return { url: session.url };
  },
});

export const createConnectAccountLink = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(internal.users.getByClerkId, {
      clerkId: identity.subject,
    });

    if (!user || user.role !== "scout") {
      throw new Error("Unauthorized: Scout access only");
    }

    const scout = await ctx.runQuery(internal.scouts.getByUserId, {
      userId: user._id,
    });

    if (!scout) throw new Error("Scout profile not found");

    let accountId = scout.stripeConnectAccountId;

    // Create Connect account if doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "LU", // Luxembourg
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
        metadata: {
          scoutId: scout._id,
          userId: user._id,
        },
      });

      accountId = account.id;

      // Update scout with Connect account ID
      await ctx.runMutation(internal.scouts.updateStripeConnect, {
        scoutId: scout._id,
        stripeConnectAccountId: accountId,
      });
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/scout/connect-refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/scout/connect-complete`,
      type: "account_onboarding",
    });

    return { url: accountLink.url };
  },
});

export const handleWebhook = action({
  args: {
    body: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        args.body,
        args.signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err}`);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        await ctx.runMutation(internal.companies.createFromCheckout, {
          clerkUserId: session.client_reference_id!,
          stripeCustomerId: session.customer as string,
          subscriptionId: session.subscription as string,
          plan: session.metadata?.plan as "starter" | "growth" | "scale",
        });

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        await ctx.runMutation(internal.companies.updateSubscription, {
          subscriptionId: subscription.id,
          status: subscription.status as any,
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await ctx.runMutation(internal.companies.cancelSubscription, {
          subscriptionId: subscription.id,
        });

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.billing_reason === "subscription_cycle") {
          // Renew monthly credits
          await ctx.runMutation(internal.companies.renewCredits, {
            subscriptionId: invoice.subscription as string,
          });
        }

        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }

    return { received: true };
  },
});

// Scheduled function: Process weekly payouts
export const processWeeklyPayouts = action({
  args: {},
  handler: async (ctx) => {
    const minThreshold = parseFloat(
      process.env.PAYOUT_MINIMUM_THRESHOLD ?? "20"
    );

    // Get scouts with pending earnings >= threshold
    const scouts = await ctx.runQuery(internal.scouts.getPendingPayouts, {
      minAmount: minThreshold,
    });

    console.log(`Processing payouts for ${scouts.length} scouts`);

    for (const scout of scouts) {
      if (!scout.stripeConnectAccountId || !scout.onboardingComplete) {
        console.log(`Skipping scout ${scout._id}: Connect not configured`);
        continue;
      }

      try {
        // Create Stripe transfer
        const transfer = await stripe.transfers.create({
          amount: Math.round(scout.pendingEarnings * 100), // convert to cents
          currency: "eur",
          destination: scout.stripeConnectAccountId,
          description: `Weekly payout - ${scout.totalLeadsSold} leads sold`,
          metadata: {
            scoutId: scout._id,
            userId: scout.userId,
          },
        });

        // Record payout
        await ctx.runMutation(internal.payouts.create, {
          scoutId: scout._id,
          amount: scout.pendingEarnings,
          stripeTransferId: transfer.id,
          status: "processing",
        });

        // Update scout balance
        await ctx.runMutation(internal.scouts.completePayout, {
          scoutId: scout._id,
          amount: scout.pendingEarnings,
        });

        // Send email notification
        await ctx.runAction(internal.emails.sendPayoutNotification, {
          scoutId: scout._id,
          amount: scout.pendingEarnings,
        });

        console.log(`Payout successful for scout ${scout._id}: ${scout.pendingEarnings}€`);
      } catch (error) {
        console.error(`Payout failed for scout ${scout._id}:`, error);

        // Record failed payout
        await ctx.runMutation(internal.payouts.create, {
          scoutId: scout._id,
          amount: scout.pendingEarnings,
          status: "failed",
          failureReason: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return { processed: scouts.length };
  },
});
```

```typescript
// convex/emails.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendPayoutNotification = action({
  args: {
    scoutId: v.id("scouts"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const scout = await ctx.runQuery(internal.scouts.getById, {
      scoutId: args.scoutId,
    });

    if (!scout) throw new Error("Scout not found");

    const user = await ctx.runQuery(internal.users.getById, {
      userId: scout.userId,
    });

    if (!user) throw new Error("User not found");

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: user.email,
      subject: `Payout Processed: ${args.amount}€`,
      html: `
        <h1>Your payout is on the way!</h1>
        <p>Hi ${user.name},</p>
        <p>We've processed your weekly payout of <strong>${args.amount}€</strong>.</p>
        <p>Funds will arrive in your bank account within 2-5 business days.</p>
        <p>Total earnings this month: ${scout.totalEarnings}€</p>
        <p>Keep up the great work!</p>
        <p>- The LeadScout Team</p>
      `,
    });
  },
});

export const sendWelcomeEmail = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getById, {
      userId: args.userId,
    });

    if (!user) throw new Error("User not found");

    const isScout = user.role === "scout";

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: user.email,
      subject: `Welcome to LeadScout!`,
      html: isScout
        ? `
          <h1>Welcome to LeadScout, ${user.name}!</h1>
          <p>You're all set to start earning from your network.</p>
          <h2>Next steps:</h2>
          <ol>
            <li>Submit your first lead via the mobile app</li>
            <li>Connect your bank account for payouts</li>
            <li>Track your earnings in real-time</li>
          </ol>
          <p>Questions? Reply to this email anytime.</p>
        `
        : `
          <h1>Welcome to LeadScout, ${user.name}!</h1>
          <p>Your subscription is active. Let's find you some great leads!</p>
          <h2>Getting started:</h2>
          <ol>
            <li>Browse the marketplace</li>
            <li>Purchase leads with your credits</li>
            <li>Contact prospects immediately</li>
          </ol>
          <p>You have <strong>${(await ctx.runQuery(internal.companies.getByUserId, { userId: args.userId }))?.creditsRemaining ?? 0} credits</strong> to use this month.</p>
        `,
    });
  },
});
```

### 3.4 Scheduled Functions (Cron Jobs)

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Weekly payouts: Every Friday at 9:00 AM UTC
crons.weekly(
  "process weekly payouts",
  { dayOfWeek: 5, hourUTC: 9, minuteUTC: 0 },
  internal.stripe.processWeeklyPayouts
);

// Monthly credit renewal: First day of month at 00:00 UTC
crons.monthly(
  "renew monthly credits",
  { day: 1, hourUTC: 0, minuteUTC: 0 },
  internal.companies.renewAllCredits
);

// Daily low credit reminders: Every day at 10:00 AM UTC
crons.daily(
  "send low credit reminders",
  { hourUTC: 10, minuteUTC: 0 },
  internal.companies.sendLowCreditReminders
);

export default crons;
```

---

## 4. Authentication & Authorization

### 4.1 Clerk Integration

**Web (Next.js):**

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        >
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            {children}
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

**Mobile (React Native + Expo):**

```typescript
// app/_layout.tsx
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import * as SecureStore from "expo-secure-store";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <Stack />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

**Convex Auth Configuration:**

```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CLERK_DOMAIN!,
      applicationID: "convex",
    },
  ],
};
```

### 4.2 Authorization Matrix

| Resource                | Scout | Company | Admin |
|-------------------------|-------|---------|-------|
| Submit lead             | ✅    | ❌      | ✅    |
| Purchase lead           | ❌    | ✅      | ✅    |
| View own earnings       | ✅    | ❌      | ✅    |
| View company credits    | ❌    | ✅      | ✅    |
| Moderate leads          | ❌    | ❌      | ✅    |
| View all users          | ❌    | ❌      | ✅    |
| View platform analytics | ❌    | ❌      | ✅    |

**Implementation in Convex Functions:**

```typescript
async function requireRole(ctx: any, allowedRoles: string[]) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user || !allowedRoles.includes(user.role)) {
    throw new Error("Unauthorized");
  }

  return user;
}

// Usage:
export const someProtectedQuery = query({
  handler: async (ctx) => {
    const user = await requireRole(ctx, ["admin"]);
    // ... admin-only logic
  },
});
```

---

## 5. Payment Integration (Stripe)

### 5.1 Subscription Flow

```
1. Company clicks "Start Free Trial" (Starter plan)
   ↓
2. Next.js calls: POST /api/stripe/create-checkout
   ↓
3. Convex action: stripe.createCheckoutSession
   ↓
4. Stripe Checkout session created with:
   - mode: "subscription"
   - price: NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID
   - metadata: { clerkUserId, plan: "starter" }
   ↓
5. Redirect to Stripe Checkout (hosted page)
   ↓
6. Company enters payment info, completes checkout
   ↓
7. Stripe sends webhook: checkout.session.completed
   ↓
8. Next.js webhook handler: POST /api/stripe/webhooks
   ↓
9. Verify signature using STRIPE_WEBHOOK_SECRET
   ↓
10. Convex action: stripe.handleWebhook
    ↓
11. Convex mutation: companies.createFromCheckout
    - Create company record
    - Add credits (Starter: 20)
    - Set status: "active"
    ↓
12. Send welcome email via Resend
    ↓
13. Redirect to /dashboard with credits available
```

### 5.2 Payout Flow (Stripe Connect)

```
1. Scout completes Stripe Connect onboarding
   - Create Express account
   - Verify identity (Stripe handles)
   - Connect bank account
   ↓
2. Scout submits leads, leads get sold
   - Pending earnings accumulate
   ↓
3. Friday 9:00 AM: Scheduled function runs
   ↓
4. For each scout with pending ≥ 20€:
   - Call Stripe API: transfers.create({
       amount: pendingEarnings * 100,
       currency: "eur",
       destination: stripeConnectAccountId
     })
   ↓
5. Stripe transfers funds to scout's bank account
   ↓
6. Update scout record:
   - pendingEarnings = 0
   - totalEarnings += amount
   ↓
7. Create payout record (status: "processing")
   ↓
8. Send email notification
   ↓
9. Funds arrive in scout's bank (2-5 days)
   ↓
10. Stripe webhook: transfer.paid
    ↓
11. Update payout status to "completed"
```

### 5.3 Environment Variables (Stripe)

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...              # Server-side API key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Client-side key
STRIPE_WEBHOOK_SECRET=whsec_...            # Webhook signature verification
STRIPE_CONNECT_CLIENT_ID=ca_...            # Connect app client ID

# Subscription Price IDs (from Stripe Dashboard)
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_... # Starter: 99€/month
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_...  # Growth: 249€/month
NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID=price_...   # Scale: 499€/month

# Credit Top-Up Price ID
STRIPE_CREDIT_PRICE_ID=price_...           # One-time purchase (5€ per credit)
```

**Next.js API Routes:**

```typescript
// app/api/stripe/create-checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { fetchAction } from "convex/nextjs";

export async function POST(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await request.json();

  const result = await fetchAction(api.stripe.createCheckoutSession, { plan });

  return NextResponse.json({ url: result.url });
}
```

```typescript
// app/api/stripe/webhooks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchAction } from "convex/nextjs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  try {
    await fetchAction(api.stripe.handleWebhook, { body, signature });
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
```

---

## 6. Real-time Features (Convex Subscriptions)

### 6.1 Use Cases

**1. New Lead Submitted → Companies Get Instant Notification**

```typescript
// Web app (Company dashboard)
const leads = useQuery(api.leads.listAvailable, {
  category: selectedCategory,
  budgetMin: filters.budgetMin,
  budgetMax: filters.budgetMax,
});

// Convex automatically re-runs query when new lead with status="approved" is inserted
// UI updates immediately without polling or WebSocket config
```

**2. Lead Purchased → Scout Gets Instant Notification**

```typescript
// Mobile app (Scout earnings screen)
const earnings = useQuery(api.leads.getMyEarnings);

// When a lead is sold:
// - Purchase mutation updates lead status to "sold"
// - Mutation credits scout pending earnings
// - useQuery hook detects change, re-runs automatically
// - UI shows new pending balance immediately
```

**3. Credits Updated → Sidebar Counter Updates**

```typescript
// Web app (Company sidebar)
const credits = useQuery(api.leads.getMyCredits);

// When company purchases a lead:
// - Purchase mutation deducts 1 credit
// - useQuery re-runs
// - Sidebar shows updated count
```

### 6.2 Implementation Pattern

```typescript
// React component
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function LeadMarketplace() {
  const leads = useQuery(api.leads.listAvailable, { category: "IT" });
  const purchaseLead = useMutation(api.leads.purchase);

  if (leads === undefined) return <LoadingSpinner />;
  if (leads === null) return <ErrorState />;

  return (
    <div>
      {leads.map(lead => (
        <LeadCard
          key={lead._id}
          lead={lead}
          onPurchase={() => purchaseLead({ leadId: lead._id })}
        />
      ))}
    </div>
  );
}
```

**Key Points:**
- `useQuery` returns `undefined` while loading (first time)
- Returns data on success
- Re-runs automatically when data changes (no manual polling)
- `useMutation` triggers update, query re-runs, UI updates

---

## 7. File Storage (Convex)

### 7.1 Use Cases
- Scout uploads lead attachments (photos, documents)
- Company uploads logo

### 7.2 Implementation

```typescript
// Upload from mobile app
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function LeadPhotoUpload() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveStorageId = useMutation(api.leads.savePhoto);

  async function handleUpload(file: File) {
    // 1. Generate upload URL
    const uploadUrl = await generateUploadUrl();

    // 2. Upload file
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();

    // 3. Save storage ID to database
    await saveStorageId({ storageId });
  }

  return <input type="file" onChange={e => handleUpload(e.target.files![0])} />;
}
```

```typescript
// convex/files.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
```

**File Size Limits:**
- Max 5MB per image
- Validation: Check file type (JPEG, PNG only)

---

## 8. Environment Variables Strategy

### 8.1 Complete .env.example

```bash
# ============================================
# APPLICATION CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_NAME=LeadScout
NEXT_PUBLIC_APP_URL=https://leadscout.com
NEXT_PUBLIC_WEB_URL=https://leadscout.com
NEXT_PUBLIC_MOBILE_SCHEME=leadscout://

# ============================================
# AUTHENTICATION (Clerk)
# ============================================
# Web
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Mobile
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# ============================================
# DATABASE & BACKEND (Convex)
# ============================================
CONVEX_DEPLOYMENT=prod:...
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
EXPO_PUBLIC_CONVEX_URL=https://...convex.cloud

# ============================================
# PAYMENTS (Stripe)
# ============================================
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...

# Subscription Plan Price IDs (from Stripe Dashboard)
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID=price_...
STRIPE_CREDIT_PRICE_ID=price_...

# ============================================
# EMAIL (Resend)
# ============================================
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@leadscout.com

# ============================================
# MOBILE NOTIFICATIONS (Expo)
# ============================================
EXPO_PUSH_TOKEN_SECRET=...

# ============================================
# BUSINESS LOGIC CONFIGURATION
# ============================================
# Payout Settings
PAYOUT_MINIMUM_THRESHOLD=20
PAYOUT_COMMISSION_RATE=0.5
PAYOUT_SCHEDULE_DAY=5
PAYOUT_SCHEDULE_HOUR=9

# Subscription Credits Allocation
STARTER_PLAN_CREDITS=20
GROWTH_PLAN_CREDITS=60
SCALE_PLAN_CREDITS=150

# Credit Settings
CREDIT_TOP_UP_PRICE=5
CREDIT_EXPIRATION_MONTHS=3

# Quality Scoring
QUALITY_MIN_DESCRIPTION_LENGTH=100
QUALITY_BADGE_THRESHOLDS={"bronze":0,"silver":20,"gold":50,"platinum":100}

# Category Pricing (JSON)
CATEGORY_PRICING={"IT":25,"Marketing":20,"HR":22,"Sales":23,"default":25}

# Feature Flags
FEATURE_API_ACCESS_ENABLED=true
FEATURE_ANALYTICS_ENABLED=true
FEATURE_REFERRAL_PROGRAM_ENABLED=false

# ============================================
# ADMIN CONFIGURATION
# ============================================
ADMIN_EMAIL_WHITELIST=admin@leadscout.com,support@leadscout.com

# ============================================
# MONITORING & ANALYTICS (Future)
# ============================================
# SENTRY_DSN=
# GOOGLE_ANALYTICS_ID=
# MIXPANEL_TOKEN=

# ============================================
# CRITICAL: NO HARDCODED VALUES!
# All configuration must use environment variables
# Never commit .env.local to git
# Use .env.example for documentation only
# ============================================
```

### 8.2 Digital Ocean App Platform Configuration

**App-Wide Environment Variables:**

Navigate to: Digital Ocean App Platform → LeadScout App → Settings → App-Level Environment Variables

Add all variables from `.env.example` with production values.

**Sensitive Variables:**
- Mark as "Secret" in DO dashboard (encrypted at rest)
- Examples: `STRIPE_SECRET_KEY`, `CLERK_SECRET_KEY`, `RESEND_API_KEY`

**Public Variables (NEXT_PUBLIC_*):**
- Can be exposed to client-side code
- Automatically replaced at build time

---

## 9. Error Handling & Monitoring

### 9.1 Error Boundaries (Web)

```typescript
// components/error-boundary.tsx
'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service (Sentry)
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-8">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Try again
      </button>
    </div>
  );
}
```

### 9.2 Convex Error Handling

```typescript
// Best practice: Throw descriptive errors
export const someMutation = mutation({
  handler: async (ctx, args) => {
    try {
      // ... logic
    } catch (error) {
      if (error instanceof ConvexError) {
        throw error; // Re-throw Convex errors
      }

      // Log error details
      console.error("Mutation failed:", error);

      // Throw user-friendly error
      throw new ConvexError({
        message: "Failed to complete operation. Please try again.",
        code: "OPERATION_FAILED",
      });
    }
  },
});
```

### 9.3 Monitoring

**Convex Dashboard:**
- Function execution logs
- Query performance metrics
- Database size and index usage
- Real-time function invocations

**Digital Ocean Monitoring:**
- CPU/memory usage
- Request latency (p50, p95, p99)
- Error rates
- Uptime status

**Future: Sentry Integration**
```typescript
// lib/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

---

## 10. Security Considerations

### 10.1 Input Validation

**Zod Schemas (Frontend):**

```typescript
// lib/validations.ts
import { z } from "zod";

export const leadSubmissionSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters").max(500),
  category: z.string(),
  companyName: z.string().min(2),
  contactName: z.string().min(2),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  estimatedBudget: z.number().min(1000).max(1000000),
});

// Usage in form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

function LeadForm() {
  const form = useForm({
    resolver: zodResolver(leadSubmissionSchema),
  });

  // ...
}
```

**Convex Validators (Backend):**

```typescript
// All mutation args are validated automatically
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    // ... other fields
  },
  handler: async (ctx, args) => {
    // Additional validation
    if (args.title.length < 10) {
      throw new Error("Title too short");
    }
    // ...
  },
});
```

### 10.2 Authentication Security

**Clerk JWT Validation:**
- All Convex functions use `ctx.auth.getUserIdentity()` to verify JWT
- Tokens expire after 24 hours (configurable)
- Refresh tokens handled automatically by Clerk

**Role-Based Access Control:**
```typescript
// Always check role in protected functions
const user = await requireRole(ctx, ["admin", "company"]);
```

### 10.3 Payment Security

**Stripe PCI Compliance:**
- No card data ever touches our servers
- Stripe Checkout handles all payment info
- Stripe Connect handles scout bank details

**Webhook Signature Verification:**
```typescript
// CRITICAL: Always verify webhook signatures
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

### 10.4 Data Privacy (GDPR)

**User Data Export:**
```typescript
// convex/users.ts
export const exportMyData = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    // Collect all user data
    const leads = await ctx.db.query("leads")...;
    const purchases = await ctx.db.query("purchases")...;

    return {
      user,
      leads,
      purchases,
      // ... all user data
    };
  },
});
```

**Right to Deletion:**
```typescript
export const deleteMyAccount = mutation({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    // Anonymize or delete all related data
    // - Delete user record
    // - Anonymize leads (remove contact info)
    // - Delete notifications
    // ... etc
  },
});
```

---

## 11. Performance Optimization

### 11.1 Database Indexes

**Query Performance:**
```typescript
// SLOW: Full table scan
const leads = await ctx.db.query("leads").filter(q => q.eq(q.field("status"), "approved")).collect();

// FAST: Index-optimized
const leads = await ctx.db.query("leads").withIndex("by_status", q => q.eq("status", "approved")).collect();
```

**Index Coverage:**
- All foreign keys have indexes (`by_user`, `by_company`, `by_scout`, `by_lead`)
- All filter fields have indexes (`by_status`, `by_category`)
- Compound indexes for common filter combinations

### 11.2 Pagination

```typescript
// convex/leads.ts
export const listAvailablePaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("leads")
      .withIndex("by_status_and_created", q => q.eq("status", "approved"))
      .order("desc")
      .paginate(args.paginationOpts);

    return results;
  },
});

// Usage in React
const { results, status, loadMore } = usePaginatedQuery(
  api.leads.listAvailablePaginated,
  { category: "IT" },
  { initialNumItems: 20 }
);
```

### 11.3 Web Performance

**Next.js Optimizations:**
- App Router (automatic code splitting)
- Image optimization (`next/image`)
- Font optimization (`next/font`)
- Route prefetching

**Tailwind CSS:**
- Production build purges unused styles
- Only used classes included in final bundle

---

## 12. Deployment Strategy

### 12.1 Convex Deployment

```bash
# Development
npx convex dev

# Production deployment
npx convex deploy --prod

# Environment variable management
npx convex env set STRIPE_SECRET_KEY sk_live_...
```

### 12.2 Next.js (Digital Ocean App Platform)

**GitHub Integration:**
1. Connect Digital Ocean to GitHub repo
2. Auto-deploy on push to `main` branch
3. Environment variables configured in DO dashboard

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm run start
```

**Environment:**
- Node.js 18+
- Port: 3000 (auto-detected)

### 12.3 Mobile (Expo EAS)

**Build Configuration:**

```json
// eas.json
{
  "build": {
    "production": {
      "ios": {
        "simulator": false,
        "bundleIdentifier": "com.leadscout.app"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "developer@leadscout.com",
        "ascAppId": "..."
      },
      "android": {
        "serviceAccountKeyPath": "./service-account.json"
      }
    }
  }
}
```

**Deployment Commands:**

```bash
# Build
eas build --platform all --profile production

# Submit to app stores
eas submit --platform all --profile production

# Over-the-air updates (JS-only changes)
eas update --branch production --message "Bug fixes"
```

---

## 13. Testing Strategy

### 13.1 Unit Tests (Convex Functions)

```typescript
// convex/leads.test.ts
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";

describe("leads.create", () => {
  it("creates lead with valid data", async () => {
    const t = convexTest(schema);

    // Create test user and scout
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        clerkId: "test_123",
        role: "scout",
        email: "test@example.com",
        name: "Test Scout",
        profile: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });

    const scoutId = await t.run(async (ctx) => {
      return await ctx.db.insert("scouts", {
        userId,
        onboardingComplete: true,
        qualityScore: 8,
        badge: "silver",
        totalLeadsSubmitted: 0,
        totalLeadsSold: 0,
        pendingEarnings: 0,
        totalEarnings: 0,
        createdAt: Date.now(),
      });
    });

    // Call mutation
    const leadId = await t.mutation(api.leads.create, {
      title: "Test Lead Title",
      description: "This is a test lead description with sufficient length",
      category: "IT",
      companyName: "Test Company",
      contactName: "John Doe",
      contactEmail: "john@example.com",
      contactPhone: "+3521234567",
      estimatedBudget: 50000,
      photos: [],
    });

    // Verify lead created
    const lead = await t.run(async (ctx) => {
      return await ctx.db.get(leadId);
    });

    expect(lead).toBeDefined();
    expect(lead?.status).toBe("pending_review");
    expect(lead?.scoutId).toBe(scoutId);
  });

  it("throws error for short title", async () => {
    const t = convexTest(schema);

    await expect(
      t.mutation(api.leads.create, {
        title: "Short",
        // ... other fields
      })
    ).rejects.toThrow("Title must be at least 10 characters");
  });
});
```

### 13.2 Integration Tests

```typescript
// tests/integration/purchase-flow.test.ts
describe("Lead Purchase Flow", () => {
  it("completes purchase transaction correctly", async () => {
    // 1. Create company with credits
    // 2. Create approved lead
    // 3. Purchase lead
    // 4. Verify:
    //    - Credit deducted
    //    - Lead marked as sold
    //    - Scout pending earnings credited
    //    - Notifications created
  });
});
```

### 13.3 E2E Tests (Playwright)

```typescript
// tests/e2e/company-purchase.spec.ts
import { test, expect } from '@playwright/test';

test('company can purchase lead', async ({ page }) => {
  // Login
  await page.goto('/sign-in');
  await page.fill('input[name="email"]', 'company@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Navigate to marketplace
  await page.goto('/dashboard/marketplace');

  // Click first lead
  await page.click('[data-testid="lead-card"]:first-child');

  // Purchase
  await page.click('button:has-text("Purchase")');
  await page.click('button:has-text("Confirm Purchase")');

  // Verify success
  await expect(page.locator('[role="alert"]')).toContainText('Lead purchased');
  await expect(page.locator('[data-testid="credits-remaining"]')).toContainText('19');
});
```

---

## 14. Development Workflow

### 14.1 Monorepo Structure

```
leadscout/
├── apps/
│   ├── web/                    # Next.js web app
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── public/
│   │   ├── .env.local
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   ├── mobile/                 # Expo mobile app
│   │   ├── app/
│   │   ├── components/
│   │   ├── assets/
│   │   ├── .env
│   │   ├── app.json
│   │   ├── eas.json
│   │   └── package.json
│   │
│   └── admin/                  # Admin panel (optional separate app)
│       └── ...
│
├── packages/
│   └── convex/                 # Shared Convex backend
│       ├── schema.ts
│       ├── users.ts
│       ├── scouts.ts
│       ├── companies.ts
│       ├── leads.ts
│       ├── purchases.ts
│       ├── payouts.ts
│       ├── stripe.ts
│       ├── emails.ts
│       ├── crons.ts
│       ├── convex.json
│       └── package.json
│
├── .env.example                # Template for all env vars
├── .gitignore
├── README.md
├── package.json                # Root package.json
└── turbo.json                  # Turborepo config (optional)
```

### 14.2 Package Manager

**Recommended: pnpm (faster, more efficient)**

```bash
# Install dependencies
pnpm install

# Run web dev server
pnpm --filter web dev

# Run mobile dev server
pnpm --filter mobile start

# Run Convex dev server
pnpm --filter convex dev

# Build all
pnpm build
```

### 14.3 Git Workflow

**Branch Strategy:**
- `main` - production-ready code
- `develop` - integration branch
- `feature/*` - feature branches
- `hotfix/*` - urgent fixes

**Commit Convention:**
```
feat: add lead submission form
fix: correct credit deduction logic
docs: update architecture documentation
chore: upgrade dependencies
```

---

## 15. Scalability Considerations

### 15.1 Current Scale (MVP)
- 500 scouts
- 100 companies
- 10,000 concurrent connections
- ~400 leads/month

### 15.2 Future Scale (Year 1)
- 5,000 scouts
- 500 companies
- 50,000 concurrent connections
- ~4,000 leads/month

### 15.3 Convex Auto-Scaling

**Built-in Scaling:**
- Convex automatically scales function execution
- Database indexes ensure query performance
- No infrastructure management needed

**Rate Limiting:**

```typescript
// Implement in Convex functions
const RATE_LIMIT = 100; // requests per minute per user

export const rateLimitedMutation = mutation({
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Check rate limit (store in database or use Convex's built-in rate limiting)
    const recentCalls = await ctx.db
      .query("rateLimitLog")
      .withIndex("by_user_and_time", q =>
        q.eq("userId", user._id).gt("timestamp", Date.now() - 60000)
      )
      .collect();

    if (recentCalls.length >= RATE_LIMIT) {
      throw new Error("Rate limit exceeded. Try again in a minute.");
    }

    // Log this call
    await ctx.db.insert("rateLimitLog", {
      userId: user._id,
      timestamp: Date.now(),
    });

    // ... actual logic
  },
});
```

---

## 16. Analytics & Metrics

### 16.1 Product Analytics

**Future: PostHog or Mixpanel Integration**

Track events:
- Scout: `lead_submitted`, `lead_sold`, `payout_received`
- Company: `lead_purchased`, `subscription_created`, `credit_low`

```typescript
// lib/analytics.ts
import { PostHog } from 'posthog-node';

const client = new PostHog(process.env.POSTHOG_API_KEY!);

export function trackEvent(userId: string, event: string, properties?: any) {
  client.capture({
    distinctId: userId,
    event,
    properties,
  });
}

// Usage
trackEvent(user._id, "lead_purchased", {
  leadId,
  category: lead.category,
  price: lead.salePrice,
});
```

### 16.2 Business Metrics (Dashboard)

```typescript
// convex/analytics.ts
export const getPlatformMetrics = query({
  handler: async (ctx) => {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    // GMV
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_created", q => q.gt("createdAt", thirtyDaysAgo))
      .collect();

    const gmv = purchases.reduce((sum, p) => sum + p.purchasePrice, 0);

    // Active users
    const activeScouts = await ctx.db
      .query("scouts")
      .withIndex("by_created", q => q.gt("createdAt", thirtyDaysAgo))
      .collect();

    const activeCompanies = await ctx.db
      .query("companies")
      .withIndex("by_plan", q => q.eq("subscriptionStatus", "active"))
      .collect();

    // Lead conversion rate
    const approvedLeads = await ctx.db
      .query("leads")
      .withIndex("by_status_and_created", q =>
        q.eq("status", "approved").gt("createdAt", thirtyDaysAgo)
      )
      .collect();

    const soldLeads = approvedLeads.filter(l => l.purchasedBy);
    const conversionRate = soldLeads.length / approvedLeads.length;

    return {
      gmv,
      activeScouts: activeScouts.length,
      activeCompanies: activeCompanies.length,
      conversionRate,
      totalPurchases: purchases.length,
    };
  },
});
```

---

## 17. Implementation Timeline (Detailed)

### Week 1-2: Foundation & Setup

**DBA Tasks:**
1. Initialize Convex project (`npx convex init`)
2. Implement complete schema (all tables, indexes)
3. Create seed data for development
4. Document database relationships

**Backend Developer Tasks:**
1. Set up Convex auth config (Clerk integration)
2. Create helper functions (`requireRole`, `getCurrentUser`)
3. Implement basic queries (user lookup, role checks)

**Frontend Developer Tasks:**
1. Initialize Next.js web app (`npx create-next-app`)
2. Initialize Expo mobile app (`npx create-expo-app`)
3. Configure Tailwind CSS + design tokens
4. Install Shadcn/UI components
5. Set up Clerk providers
6. Create basic layout components (header, sidebar, navigation)

**DevOps Tasks:**
1. Create Digital Ocean app
2. Configure environment variables (development)
3. Set up GitHub Actions for CI

### Week 3-4: Core Features

**Backend Developer:**
1. Implement `leads.create` mutation
2. Implement `leads.listAvailable` query with filters
3. Implement `leads.purchase` mutation (full transaction)
4. Implement `leads.moderate` mutation
5. Implement company queries (`getMyCredits`, `getMyPurchases`)
6. Implement scout queries (`getMyLeads`, `getMyEarnings`)

**Frontend Developer (Web):**
1. Build lead marketplace page (grid, filters, search)
2. Build lead detail modal
3. Build purchase flow (confirmation, success toast)
4. Build "My Purchases" table
5. Build credits dashboard

**Frontend Developer (Mobile):**
1. Build bottom tab navigation
2. Build lead submission form (4-step flow)
3. Build dashboard (earnings overview)
4. Build "My Leads" list
5. Implement photo upload

**Admin:**
1. Build moderation queue
2. Implement approve/reject actions

### Week 5: Payments

**Backend Developer:**
1. Implement `stripe.createCheckoutSession` action
2. Implement `stripe.handleWebhook` action
3. Implement `stripe.createConnectAccountLink` action
4. Implement `companies.createFromCheckout` mutation
5. Implement `companies.updateSubscription` mutation
6. Test webhook handling (Stripe CLI)

**Frontend Developer:**
1. Build pricing page
2. Integrate Stripe Checkout
3. Build Stripe Connect onboarding flow (mobile)
4. Build subscription management page

**DevOps:**
1. Configure Stripe webhooks in production
2. Set up Stripe environment variables

### Week 6: Payouts & Polish

**Backend Developer:**
1. Implement `stripe.processWeeklyPayouts` scheduled action
2. Implement `emails.sendPayoutNotification` action
3. Implement `emails.sendWelcomeEmail` action
4. Configure Convex cron jobs
5. Test payout flow (Stripe test mode)

**Frontend Developer:**
1. Implement notification system (push + email)
2. Add loading states (skeletons)
3. Add empty states
4. Add error boundaries
5. Polish animations and transitions

**QA Engineer:**
1. Manual testing of all flows
2. Write E2E tests (Playwright)
3. Payment flow verification
4. Cross-browser testing

**DevOps:**
1. Deploy to Digital Ocean staging
2. Configure production environment variables
3. Set up monitoring (uptime, error tracking)

---

## 18. Success Criteria

Your architecture is successful when:

✅ Complete system architecture documented with diagrams
✅ Database schema fully specified with indexes and relationships
✅ All API endpoints defined with request/response contracts
✅ Environment variables documented and strategy defined
✅ Authentication and authorization patterns implemented
✅ Payment flows (subscriptions + payouts) fully specified
✅ Real-time features (Convex subscriptions) documented
✅ Security considerations addressed (input validation, GDPR, PCI)
✅ Performance optimizations identified (indexes, pagination)
✅ Error handling and monitoring strategies defined
✅ Deployment strategy for all platforms (web, mobile, backend)
✅ Testing strategy outlined (unit, integration, E2E)
✅ Development workflow and timeline documented
✅ NO hardcoded values - all configuration via environment variables
✅ Ready for development team to start building

---

## 19. Next Steps

This Technical Architecture is now ready for:

1. **DBA Agent**: Implement Convex schema from Section 2
2. **Backend Developer Agent**: Implement Convex functions from Section 3
3. **Frontend Developer Agent**: Implement UIs from ui-designs.md using this architecture
4. **DevOps Agent**: Configure deployment from Section 12
5. **QA Engineer Agent**: Create test plans from Section 13
6. **Security Engineer Agent**: Review security from Section 10

**All agents should:**
- Reference this document for technical decisions
- Use environment variables for all configuration
- Follow Convex best practices (indexes, pagination, validation)
- Implement error handling as specified
- Test integrations thoroughly before deployment

---

**Document Status**: Ready for Implementation
**Next Review Date**: After MVP Launch
**Questions/Feedback**: Contact Software Architect Agent

---

## Appendix A: Key Files Reference

**Convex Schema:**
- `convex/schema.ts` - All table definitions

**Convex Functions:**
- `convex/leads.ts` - Lead queries and mutations
- `convex/scouts.ts` - Scout queries and mutations
- `convex/companies.ts` - Company queries and mutations
- `convex/stripe.ts` - Stripe actions (checkout, payouts, webhooks)
- `convex/emails.ts` - Email actions (Resend integration)
- `convex/crons.ts` - Scheduled functions

**Next.js API Routes:**
- `app/api/stripe/create-checkout/route.ts`
- `app/api/stripe/webhooks/route.ts`

**Environment Files:**
- `.env.example` - Template with all variables
- `.env.local` - Development (web)
- `.env` - Development (mobile)
- Digital Ocean: App-level environment variables (production)

---

**This architecture provides a complete, production-ready technical blueprint for LeadScout. All development must follow these specifications to ensure consistency, security, and scalability.**
