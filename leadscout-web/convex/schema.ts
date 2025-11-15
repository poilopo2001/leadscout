/**
 * LeadScout Database Schema
 *
 * Complete Convex schema defining all tables, field types, indexes, and relationships
 * for the LeadScout two-sided B2B marketplace.
 *
 * IMPORTANT: All business logic values (pricing, thresholds, rates) are read from
 * environment variables. NO hardcoded values in this schema.
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // USERS & AUTHENTICATION
  // ============================================

  /**
   * users - Core user table linked to Clerk authentication
   *
   * Supports three user roles:
   * - scout: Submits leads via mobile app
   * - company: Purchases leads via web app
   * - admin: Moderates leads and manages platform
   *
   * Example:
   * {
   *   clerkId: "user_abc123",
   *   role: "scout",
   *   email: "marc@example.com",
   *   name: "Marc Dubois",
   *   profile: { industryExpertise: ["SaaS", "Fintech"] }
   * }
   */
  users: defineTable({
    clerkId: v.string(), // Clerk user ID (unique identifier)
    role: v.union(
      v.literal("scout"),
      v.literal("company"),
      v.literal("admin")
    ),
    email: v.string(),
    name: v.string(),
    profile: v.object({
      avatar: v.optional(v.string()), // Convex storage ID or URL
      bio: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      // Scout-specific fields
      industryExpertise: v.optional(v.array(v.string())), // e.g., ["IT", "Marketing"]
      // Company-specific fields
      companyName: v.optional(v.string()),
      website: v.optional(v.string()),
      industry: v.optional(v.string()),
      teamSize: v.optional(v.string()), // e.g., "50-100"
    }),
    createdAt: v.number(), // Unix timestamp
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"]) // Fast auth lookup
    .index("by_email", ["email"]) // Email validation/search
    .index("by_role", ["role"]), // Filter by user type

  // ============================================
  // SCOUTS
  // ============================================

  /**
   * scouts - Scout-specific data and earnings tracking
   *
   * Tracks:
   * - Stripe Connect account for payouts
   * - Quality score and badge level
   * - Lead submission/sale statistics
   * - Pending and lifetime earnings
   *
   * Example:
   * {
   *   userId: Id<"users">,
   *   qualityScore: 8.2,
   *   badge: "silver",
   *   totalLeadsSold: 23,
   *   pendingEarnings: 125.50,
   *   totalEarnings: 1245.00
   * }
   */
  scouts: defineTable({
    userId: v.id("users"), // Reference to users table
    stripeConnectAccountId: v.optional(v.string()), // Stripe Connect account ID
    onboardingComplete: v.boolean(), // Has completed Stripe Connect onboarding
    qualityScore: v.number(), // 0-10 calculated score
    badge: v.union(
      v.literal("bronze"),   // 0-19 leads sold
      v.literal("silver"),   // 20-49 leads sold
      v.literal("gold"),     // 50-99 leads sold
      v.literal("platinum")  // 100+ leads sold
    ),
    totalLeadsSubmitted: v.number(), // All-time submission count
    totalLeadsSold: v.number(), // All-time sold count
    pendingEarnings: v.number(), // Euros awaiting payout
    totalEarnings: v.number(), // Lifetime earnings in euros
    lastPayoutDate: v.optional(v.number()), // Last payout timestamp
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]) // Find scout by user ID
    .index("by_stripe_connect", ["stripeConnectAccountId"]) // Stripe lookups
    .index("by_quality_score", ["qualityScore"]) // Leaderboard sorting
    .index("by_pending_earnings", ["pendingEarnings"]), // Payout eligibility

  // ============================================
  // COMPANIES
  // ============================================

  /**
   * companies - Company-specific data and subscription management
   *
   * Tracks:
   * - Stripe subscription and customer IDs
   * - Current plan and subscription status
   * - Credit balance and allocation
   * - Lead preferences for matching
   *
   * Example:
   * {
   *   userId: Id<"users">,
   *   plan: "growth",
   *   creditsRemaining: 45,
   *   creditsAllocated: 60,
   *   subscriptionStatus: "active"
   * }
   */
  companies: defineTable({
    userId: v.id("users"), // Reference to users table
    stripeCustomerId: v.optional(v.string()), // Stripe customer ID (optional during onboarding)
    subscriptionId: v.optional(v.string()), // Stripe subscription ID
    plan: v.optional(v.union(
      v.literal("starter"),  // Configured via env: STARTER_PLAN_CREDITS
      v.literal("growth"),   // Configured via env: GROWTH_PLAN_CREDITS
      v.literal("scale")     // Configured via env: SCALE_PLAN_CREDITS
    )),
    subscriptionStatus: v.union(
      v.literal("active"),     // Subscription is active
      v.literal("past_due"),   // Payment failed
      v.literal("canceled"),   // Subscription canceled
      v.literal("incomplete")  // Subscription not fully set up
    ),
    creditsRemaining: v.number(), // Current credit balance
    creditsAllocated: v.number(), // Monthly allocation based on plan
    nextRenewalDate: v.optional(v.number()), // Next billing cycle timestamp
    preferences: v.object({
      categories: v.array(v.string()), // Preferred lead categories
      budgetMin: v.optional(v.number()), // Minimum budget filter
      budgetMax: v.optional(v.number()), // Maximum budget filter
      notifications: v.object({
        newLeads: v.boolean(), // Email when matching leads arrive
        lowCredits: v.boolean(), // Alert when credits < 5
        renewalReminder: v.boolean(), // Reminder before renewal
      }),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]) // Find company by user ID
    .index("by_stripe_customer", ["stripeCustomerId"]) // Stripe webhooks
    .index("by_subscription", ["subscriptionId"]) // Subscription lookups
    .index("by_plan", ["plan"]) // Analytics by plan tier
    .index("by_credits", ["creditsRemaining"]), // Low credit alerts

  // ============================================
  // LEADS
  // ============================================

  /**
   * leads - Core lead data submitted by scouts
   *
   * Lifecycle: pending_review → approved → sold (or rejected)
   *
   * Contact information is masked in marketplace queries until purchased.
   * Sale price is determined dynamically from environment variables based on category.
   *
   * Example:
   * {
   *   scoutId: Id<"scouts">,
   *   title: "ERP Migration for Manufacturing",
   *   category: "IT Services",
   *   estimatedBudget: 50000,
   *   status: "approved",
   *   qualityScore: 8.5,
   *   salePrice: 30 // From env: LEAD_PRICE_IT
   * }
   */
  leads: defineTable({
    scoutId: v.id("scouts"), // Scout who submitted this lead

    // Lead information
    title: v.string(), // Brief title (min 10 chars)
    description: v.string(), // Detailed description (min 50 chars)
    category: v.string(), // Industry category (pricing varies by category)

    // Company details (revealed after purchase)
    companyName: v.string(),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.string(),
    companyWebsite: v.optional(v.string()),
    estimatedBudget: v.number(), // In euros
    timeline: v.optional(v.string()), // e.g., "Q1 2025"

    // Media attachments
    photos: v.array(v.string()), // Convex storage IDs

    // Status & moderation
    status: v.union(
      v.literal("pending_review"), // Awaiting admin approval
      v.literal("approved"),       // Live in marketplace
      v.literal("rejected"),       // Rejected by admin
      v.literal("sold")           // Purchased by company
    ),
    moderationStatus: v.union(
      v.literal("pending"),           // Not yet reviewed
      v.literal("approved"),          // Approved by admin
      v.literal("changes_requested"), // Scout needs to revise
      v.literal("rejected")          // Permanently rejected
    ),
    moderationNotes: v.optional(v.string()), // Admin feedback
    moderatedBy: v.optional(v.id("users")), // Admin who moderated
    moderatedAt: v.optional(v.number()), // Moderation timestamp

    // Quality scoring (0-10 scale)
    qualityScore: v.number(), // Overall calculated score
    qualityFactors: v.object({
      descriptionLength: v.number(),    // Score based on description detail
      contactCompleteness: v.number(),  // All contact fields provided
      budgetAccuracy: v.number(),       // Budget estimation quality
      photoCount: v.number(),           // Number of attachments
      scoutReputation: v.number(),      // Scout's quality score
    }),

    // Sales tracking
    purchasedBy: v.optional(v.id("companies")), // Company that purchased
    purchasedAt: v.optional(v.number()), // Purchase timestamp
    salePrice: v.number(), // Price in euros (from env vars by category)

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_scout", ["scoutId"]) // All leads from a scout
    .index("by_status", ["status"]) // Filter by lifecycle status
    .index("by_category", ["category"]) // Filter by industry
    .index("by_quality_score", ["qualityScore"]) // Sort by quality
    .index("by_created", ["createdAt"]) // Sort by submission date
    .index("by_purchased_by", ["purchasedBy"]) // Company's purchases
    // Compound indexes for efficient marketplace queries
    .index("by_status_and_category", ["status", "category"])
    .index("by_status_and_created", ["status", "createdAt"])
    .index("by_moderation_status", ["moderationStatus"]), // Admin queue

  // ============================================
  // PURCHASES
  // ============================================

  /**
   * purchases - Transaction records when companies buy leads
   *
   * Immutable record of each lead purchase with complete transaction details.
   * Used for accounting, analytics, and commission calculations.
   *
   * Example:
   * {
   *   companyId: Id<"companies">,
   *   leadId: Id<"leads">,
   *   scoutId: Id<"scouts">,
   *   creditsUsed: 1,
   *   purchasePrice: 30,
   *   scoutEarning: 15, // 50% commission
   *   platformCommission: 15
   * }
   */
  purchases: defineTable({
    companyId: v.id("companies"), // Purchasing company
    leadId: v.id("leads"), // Lead purchased
    scoutId: v.id("scouts"), // Scout who submitted lead
    creditsUsed: v.number(), // Typically 1 credit per lead
    purchasePrice: v.number(), // Price in euros at time of purchase
    scoutEarning: v.number(), // Scout's 50% share (from env)
    platformCommission: v.number(), // Platform's 50% share (from env)
    status: v.union(
      v.literal("completed"), // Normal purchase
      v.literal("refunded")   // Refunded (duplicate/invalid lead)
    ),
    refundReason: v.optional(v.string()), // Reason if refunded
    createdAt: v.number(),
  })
    .index("by_company", ["companyId"]) // Company's purchase history
    .index("by_lead", ["leadId"]) // Lead's purchase record
    .index("by_scout", ["scoutId"]) // Scout's sales history
    .index("by_created", ["createdAt"]) // Time-based analytics
    .index("by_company_and_created", ["companyId", "createdAt"]), // Sorted history

  // ============================================
  // TRANSACTIONS (Credit Tracking)
  // ============================================

  /**
   * creditTransactions - Ledger of all credit movements
   *
   * Tracks:
   * - allocation: Monthly subscription renewal
   * - purchase: One-time credit top-up
   * - usage: Lead purchased with credits
   * - refund: Credits returned for invalid lead
   *
   * Example:
   * {
   *   companyId: Id<"companies">,
   *   type: "allocation",
   *   amount: 60, // Growth plan monthly credits
   *   balanceAfter: 60,
   *   description: "Monthly subscription renewal"
   * }
   */
  creditTransactions: defineTable({
    companyId: v.id("companies"),
    type: v.union(
      v.literal("allocation"), // Monthly renewal credits
      v.literal("purchase"),   // One-time credit purchase
      v.literal("usage"),      // Lead purchased
      v.literal("refund")      // Credits refunded
    ),
    amount: v.number(), // Positive for add, negative for usage
    balanceAfter: v.number(), // Credit balance after transaction
    relatedPurchaseId: v.optional(v.id("purchases")), // Link to purchase if usage
    stripePaymentId: v.optional(v.string()), // Stripe payment intent ID
    description: v.string(), // Human-readable description
    createdAt: v.number(),
  })
    .index("by_company", ["companyId"]) // Company's transaction history
    .index("by_type", ["type"]) // Analytics by transaction type
    .index("by_created", ["createdAt"]) // Time-based queries
    .index("by_company_and_created", ["companyId", "createdAt"]), // Sorted ledger

  // ============================================
  // PAYOUTS
  // ============================================

  /**
   * payouts - Scout payout records via Stripe Connect
   *
   * Automated weekly payouts process scouts with pending >= threshold (from env).
   * Tracks full payout lifecycle: pending → processing → completed (or failed).
   *
   * Minimum payout threshold configured via: PAYOUT_MINIMUM_THRESHOLD
   *
   * Example:
   * {
   *   scoutId: Id<"scouts">,
   *   amount: 125.50,
   *   status: "completed",
   *   stripeTransferId: "tr_abc123",
   *   processedAt: 1700000000000
   * }
   */
  payouts: defineTable({
    scoutId: v.id("scouts"), // Scout receiving payout
    amount: v.number(), // Payout amount in euros
    status: v.union(
      v.literal("pending"),     // Queued for processing
      v.literal("processing"),  // Stripe transfer initiated
      v.literal("completed"),   // Successfully paid
      v.literal("failed")       // Transfer failed
    ),
    stripeTransferId: v.optional(v.string()), // Stripe Transfer ID
    stripePayoutId: v.optional(v.string()), // Stripe Payout ID
    failureReason: v.optional(v.string()), // Error message if failed
    processedAt: v.optional(v.number()), // When transfer was initiated
    completedAt: v.optional(v.number()), // When transfer completed
    createdAt: v.number(),
  })
    .index("by_scout", ["scoutId"]) // Scout's payout history
    .index("by_status", ["status"]) // Process pending payouts
    .index("by_created", ["createdAt"]) // Time-based queries
    .index("by_stripe_transfer", ["stripeTransferId"]), // Stripe webhook lookups

  // ============================================
  // NOTIFICATIONS
  // ============================================

  /**
   * notifications - In-app and push notification records
   *
   * Supports:
   * - Scout notifications: lead_approved, lead_sold, payout_processed
   * - Company notifications: new_matching_lead, low_credits, subscription_renewed
   *
   * Example:
   * {
   *   userId: Id<"users">,
   *   type: "lead_sold",
   *   title: "Lead Sold!",
   *   message: "Your lead 'ERP Migration' was purchased for 25 euros",
   *   metadata: { leadId: "...", amount: 25 },
   *   read: false
   * }
   */
  notifications: defineTable({
    userId: v.id("users"), // Notification recipient
    type: v.union(
      v.literal("lead_approved"),       // Scout: lead approved by admin
      v.literal("lead_sold"),           // Scout: lead purchased
      v.literal("payout_processed"),    // Scout: payout sent
      v.literal("new_matching_lead"),   // Company: new lead matches preferences
      v.literal("low_credits"),         // Company: credits < 5
      v.literal("subscription_renewed") // Company: monthly renewal
    ),
    title: v.string(), // Notification title
    message: v.string(), // Notification body
    metadata: v.optional(v.any()), // Additional data (leadId, amount, etc.)
    read: v.boolean(), // Has user read this notification
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]) // User's notifications
    .index("by_user_and_read", ["userId", "read"]) // Unread notifications
    .index("by_created", ["createdAt"]), // Sort by recency

  // ============================================
  // ACHIEVEMENTS
  // ============================================

  /**
   * achievements - Gamification: scout achievements and milestones
   *
   * Tracks milestone achievements like:
   * - First lead sold
   * - 10 leads sold (Silver Scout)
   * - 50 leads sold (Gold Scout)
   * - 100 leads sold (Platinum Scout)
   *
   * Example:
   * {
   *   scoutId: Id<"scouts">,
   *   type: "silver_scout",
   *   title: "Silver Scout",
   *   description: "Sold 20 leads",
   *   unlockedAt: 1700000000000
   * }
   */
  achievements: defineTable({
    scoutId: v.id("scouts"),
    type: v.string(), // Achievement identifier (e.g., "first_sale", "silver_scout")
    title: v.string(), // Display name
    description: v.string(), // Achievement description
    icon: v.optional(v.string()), // Icon/emoji
    unlockedAt: v.number(), // When achievement was unlocked
  })
    .index("by_scout", ["scoutId"]) // Scout's achievements
    .index("by_type", ["type"]) // Achievement lookup
    .index("by_unlocked", ["unlockedAt"]), // Recent achievements

  // ============================================
  // MODERATION ACTIONS (Audit Log)
  // ============================================

  /**
   * moderationActions - Audit trail of admin moderation decisions
   *
   * Immutable log of all moderation actions for compliance and analytics.
   *
   * Example:
   * {
   *   adminId: Id<"users">,
   *   leadId: Id<"leads">,
   *   action: "approved",
   *   reason: "High quality lead with complete information"
   * }
   */
  moderationActions: defineTable({
    adminId: v.id("users"), // Admin who performed action
    leadId: v.id("leads"), // Lead being moderated
    action: v.union(
      v.literal("approved"),         // Lead approved for marketplace
      v.literal("rejected"),         // Lead rejected
      v.literal("changes_requested"), // Scout needs to revise
      v.literal("flagged")          // Flagged for review
    ),
    reason: v.optional(v.string()), // Explanation for action
    createdAt: v.number(),
  })
    .index("by_admin", ["adminId"]) // Admin's moderation history
    .index("by_lead", ["leadId"]) // Lead's moderation history
    .index("by_created", ["createdAt"]), // Time-based audit

  // ============================================
  // ADMIN ACTIONS (Platform Management)
  // ============================================

  /**
   * adminActions - General admin action audit log
   *
   * Tracks non-moderation admin actions like:
   * - User bans/suspensions
   * - Manual credit adjustments
   * - Subscription overrides
   * - Platform configuration changes
   *
   * Example:
   * {
   *   adminId: Id<"users">,
   *   action: "ban_user",
   *   targetUserId: Id<"users">,
   *   reason: "Spam submissions",
   *   metadata: { suspensionDays: 30 }
   * }
   */
  adminActions: defineTable({
    adminId: v.id("users"), // Admin performing action
    action: v.string(), // Action type (e.g., "ban_user", "adjust_credits")
    targetUserId: v.optional(v.id("users")), // User affected (if applicable)
    targetCompanyId: v.optional(v.id("companies")), // Company affected
    targetScoutId: v.optional(v.id("scouts")), // Scout affected
    reason: v.string(), // Explanation
    metadata: v.optional(v.any()), // Additional context
    createdAt: v.number(),
  })
    .index("by_admin", ["adminId"]) // Admin's action history
    .index("by_target_user", ["targetUserId"]) // Actions on specific user
    .index("by_created", ["createdAt"]), // Time-based audit

  // ============================================
  // TEAM MEMBERS (Company Team Access)
  // ============================================

  /**
   * teamMembers - Multi-user access for company accounts
   *
   * Allows companies on Growth/Scale plans to invite team members.
   * Permissions control what team members can do:
   * - "view": Read-only access
   * - "purchase": Can purchase leads
   * - "admin": Full account access
   *
   * Example:
   * {
   *   companyId: Id<"companies">,
   *   userId: Id<"users">,
   *   permissions: ["view", "purchase"],
   *   invitedBy: Id<"users">
   * }
   */
  teamMembers: defineTable({
    companyId: v.id("companies"), // Company account
    userId: v.id("users"), // Team member user
    permissions: v.array(v.string()), // ["view", "purchase", "admin"]
    invitedBy: v.id("users"), // Who invited this member
    invitedAt: v.number(), // Invitation timestamp
    acceptedAt: v.optional(v.number()), // When invitation accepted
  })
    .index("by_company", ["companyId"]) // Company's team members
    .index("by_user", ["userId"]), // User's company memberships
});

/**
 * ENVIRONMENT VARIABLES USED IN BUSINESS LOGIC (not schema):
 *
 * Lead Pricing (by category):
 * - LEAD_PRICE_IT
 * - LEAD_PRICE_MARKETING
 * - LEAD_PRICE_HR
 * - LEAD_PRICE_SALES
 * - LEAD_PRICE_DEFAULT
 *
 * Business Logic:
 * - PLATFORM_COMMISSION_RATE (default: 0.5 for 50%)
 * - PAYOUT_MINIMUM_THRESHOLD (default: 20 euros)
 * - QUALITY_SCORE_SOLD_WEIGHT
 * - QUALITY_SCORE_APPROVAL_WEIGHT
 * - QUALITY_SCORE_FEEDBACK_WEIGHT
 *
 * Subscription Plans:
 * - STARTER_PLAN_CREDITS
 * - GROWTH_PLAN_CREDITS
 * - SCALE_PLAN_CREDITS
 *
 * Badge Thresholds:
 * - BADGE_SILVER_THRESHOLD (default: 20)
 * - BADGE_GOLD_THRESHOLD (default: 50)
 * - BADGE_PLATINUM_THRESHOLD (default: 100)
 */
