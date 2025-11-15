/**
 * Seed Data for Development Environment
 *
 * Creates sample data for testing and development.
 * Run with: npx convex run seed:seedAll
 *
 * IMPORTANT: Only run in development! This will create test data.
 */

import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed all tables with sample data
 * Creates complete test ecosystem: users, scouts, companies, leads, etc.
 */
export const seedAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting database seed...");

    // Clear existing data (development only!)
    await clearAllTables(ctx);

    // Create users
    const { scoutUsers, companyUsers, adminUsers } = await seedUsers(ctx);

    // Create scout profiles
    const scouts = await seedScouts(ctx, scoutUsers);

    // Create company profiles
    const companies = await seedCompanies(ctx, companyUsers);

    // Create leads in various states
    const leads = await seedLeads(ctx, scouts);

    // Create purchases (some leads sold)
    const purchases = await seedPurchases(ctx, companies, leads);

    // Create payouts
    await seedPayouts(ctx, scouts);

    // Create notifications
    await seedNotifications(ctx, scoutUsers, companyUsers);

    // Create achievements
    await seedAchievements(ctx, scouts);

    console.log("Database seed complete!");

    return {
      users: scoutUsers.length + companyUsers.length + adminUsers.length,
      scouts: scouts.length,
      companies: companies.length,
      leads: leads.length,
      purchases: purchases.length,
    };
  },
});

/**
 * Clear all tables (DEVELOPMENT ONLY)
 */
async function clearAllTables(ctx: any) {
  const tables = [
    "users",
    "scouts",
    "companies",
    "leads",
    "purchases",
    "payouts",
    "notifications",
    "achievements",
    "creditTransactions",
    "moderationActions",
    "adminActions",
    "teamMembers",
  ];

  for (const table of tables) {
    const records = await ctx.db.query(table).collect();
    for (const record of records) {
      await ctx.db.delete(record._id);
    }
  }

  console.log("Cleared all tables");
}

/**
 * Seed users (scouts, companies, admins)
 */
async function seedUsers(ctx: any) {
  const now = Date.now();

  // Scout users
  const scoutData = [
    {
      clerkId: "clerk_scout_1",
      role: "scout" as const,
      email: "marc.dubois@example.com",
      name: "Marc Dubois",
      profile: {
        bio: "Sales professional with 10+ years in B2B",
        linkedin: "https://linkedin.com/in/marcdubois",
        industryExpertise: ["IT Services", "SaaS", "Consulting"],
      },
    },
    {
      clerkId: "clerk_scout_2",
      role: "scout" as const,
      email: "sophie.martin@example.com",
      name: "Sophie Martin",
      profile: {
        bio: "Business development consultant",
        industryExpertise: ["Marketing", "E-commerce"],
      },
    },
    {
      clerkId: "clerk_scout_3",
      role: "scout" as const,
      email: "jean.luc@example.com",
      name: "Jean-Luc Picard",
      profile: {
        bio: "Enterprise account manager",
        industryExpertise: ["Finance", "HR"],
      },
    },
  ];

  const scoutUsers = [];
  for (const scout of scoutData) {
    const id = await ctx.db.insert("users", {
      ...scout,
      createdAt: now,
      updatedAt: now,
    });
    scoutUsers.push(id);
  }

  // Company users
  const companyData = [
    {
      clerkId: "clerk_company_1",
      role: "company" as const,
      email: "thomas@acmecorp.com",
      name: "Thomas Weber",
      profile: {
        companyName: "Acme Corporation",
        website: "https://acmecorp.com",
        industry: "IT Services",
        teamSize: "50-100",
      },
    },
    {
      clerkId: "clerk_company_2",
      role: "company" as const,
      email: "sarah@growthco.com",
      name: "Sarah Johnson",
      profile: {
        companyName: "Growth Co",
        website: "https://growthco.com",
        industry: "Marketing",
        teamSize: "10-50",
      },
    },
  ];

  const companyUsers = [];
  for (const company of companyData) {
    const id = await ctx.db.insert("users", {
      ...company,
      createdAt: now,
      updatedAt: now,
    });
    companyUsers.push(id);
  }

  // Admin users
  const adminData = [
    {
      clerkId: "clerk_admin_1",
      role: "admin" as const,
      email: "admin@leadscout.com",
      name: "Admin User",
      profile: {},
    },
  ];

  const adminUsers = [];
  for (const admin of adminData) {
    const id = await ctx.db.insert("users", {
      ...admin,
      createdAt: now,
      updatedAt: now,
    });
    adminUsers.push(id);
  }

  console.log(`Created ${scoutUsers.length} scouts, ${companyUsers.length} companies, ${adminUsers.length} admins`);

  return { scoutUsers, companyUsers, adminUsers };
}

/**
 * Seed scout profiles
 */
async function seedScouts(ctx: any, scoutUserIds: any[]) {
  const scouts = [];

  for (let i = 0; i < scoutUserIds.length; i++) {
    const scoutId = await ctx.db.insert("scouts", {
      userId: scoutUserIds[i],
      stripeConnectAccountId: `acct_test_scout_${i + 1}`,
      onboardingComplete: true,
      qualityScore: 7.0 + i * 0.5, // Varying quality scores
      badge: i === 0 ? "silver" : i === 1 ? "gold" : "bronze",
      totalLeadsSubmitted: 20 + i * 10,
      totalLeadsSold: 10 + i * 5,
      pendingEarnings: 50 + i * 25,
      totalEarnings: 500 + i * 200,
      lastPayoutDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 1 week ago
      createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
    });
    scouts.push(scoutId);
  }

  console.log(`Created ${scouts.length} scout profiles`);
  return scouts;
}

/**
 * Seed company profiles
 */
async function seedCompanies(ctx: any, companyUserIds: any[]) {
  const companies = [];

  const plans = ["growth", "starter"] as const;

  for (let i = 0; i < companyUserIds.length; i++) {
    const plan = plans[i % plans.length];
    const credits = plan === "growth" ? 60 : 20;

    const companyId = await ctx.db.insert("companies", {
      userId: companyUserIds[i],
      stripeCustomerId: `cus_test_${i + 1}`,
      subscriptionId: `sub_test_${i + 1}`,
      plan,
      subscriptionStatus: "active",
      creditsRemaining: credits - (i + 1) * 5, // Some credits used
      creditsAllocated: credits,
      nextRenewalDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      preferences: {
        categories: ["IT Services", "Marketing"],
        budgetMin: 5000,
        budgetMax: 100000,
        notifications: {
          newLeads: true,
          lowCredits: true,
          renewalReminder: true,
        },
      },
      createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
      updatedAt: Date.now(),
    });
    companies.push(companyId);
  }

  console.log(`Created ${companies.length} company profiles`);
  return companies;
}

/**
 * Seed leads in various states
 */
async function seedLeads(ctx: any, scoutIds: any[]) {
  const leads = [];
  const now = Date.now();

  const leadTemplates = [
    {
      title: "ERP Migration for Manufacturing Company",
      description:
        "Mid-sized manufacturing company (250+ employees) seeking to modernize their inventory and production management systems. They currently use legacy software and are looking for a cloud-based ERP solution. Decision timeline is Q1 2025. Key stakeholders include Operations Director and IT Manager. Budget approved, ready to move forward with right solution.",
      category: "IT Services",
      companyName: "TechManufacture SA",
      contactName: "Pierre Rousseau",
      contactEmail: "pierre.rousseau@techmanuf.lu",
      contactPhone: "+352 123 456 789",
      companyWebsite: "https://techmanuf.lu",
      estimatedBudget: 75000,
      timeline: "Q1 2025",
      status: "approved" as const,
    },
    {
      title: "Website Redesign for Retail Chain",
      description:
        "Retail company with 15 physical locations looking to completely redesign their e-commerce platform. Current site is outdated and not mobile-optimized. They need modern design, better UX, and integration with their POS system. Annual revenue ~5M euros. Ready to invest in proper digital presence.",
      category: "Marketing",
      companyName: "RetailPlus",
      contactName: "Marie Schneider",
      contactEmail: "marie@retailplus.lu",
      contactPhone: "+352 234 567 890",
      estimatedBudget: 25000,
      timeline: "Q2 2025",
      status: "approved" as const,
    },
    {
      title: "HR Software Implementation",
      description:
        "Growing consulting firm (100 employees) needs comprehensive HR management system. Current process is manual with spreadsheets. Looking for solution covering recruitment, onboarding, time tracking, performance reviews, and payroll integration. Budget allocated for 2025.",
      category: "HR",
      companyName: "Consult Group",
      contactName: "Thomas Klein",
      contactEmail: "tk@consultgroup.lu",
      contactPhone: "+352 345 678 901",
      estimatedBudget: 35000,
      timeline: "Q1 2025",
      status: "pending_review" as const,
    },
    {
      title: "Sales CRM Migration",
      description:
        "B2B services company transitioning from Salesforce to HubSpot. Need implementation partner for data migration, custom workflows, and team training. 50+ sales reps need to be onboarded. Timeline: 3-4 months.",
      category: "Sales",
      companyName: "B2B Solutions",
      contactName: "Sophie Laurent",
      contactEmail: "sophie@b2bsolutions.lu",
      contactPhone: "+352 456 789 012",
      estimatedBudget: 40000,
      timeline: "Q2 2025",
      status: "sold" as const,
    },
    {
      title: "Financial Planning Software",
      description:
        "Financial services firm looking for advanced financial planning and analysis software. Need forecasting tools, scenario modeling, and integration with existing accounting systems. Team of 20 finance professionals.",
      category: "Finance",
      companyName: "FinAdvisors",
      contactName: "Jacques Muller",
      contactEmail: "j.muller@finadvisors.lu",
      contactPhone: "+352 567 890 123",
      estimatedBudget: 50000,
      status: "rejected" as const,
    },
  ];

  for (let i = 0; i < leadTemplates.length; i++) {
    const template = leadTemplates[i];
    const scoutId = scoutIds[i % scoutIds.length];

    // Calculate quality score
    const qualityScore = 6.5 + Math.random() * 2.5; // 6.5-9.0

    const leadId = await ctx.db.insert("leads", {
      scoutId,
      ...template,
      photos: [], // No photos in seed data
      moderationStatus:
        template.status === "pending_review" ? "pending" : "approved",
      moderationNotes:
        template.status === "rejected" ? "Duplicate lead" : undefined,
      qualityScore,
      qualityFactors: {
        descriptionLength: template.description.length,
        contactCompleteness: 100,
        budgetAccuracy: 80,
        photoCount: 0,
        scoutReputation: 75,
      },
      salePrice: 30, // Default price (would come from env in production)
      createdAt: now - i * 24 * 60 * 60 * 1000, // Staggered dates
      updatedAt: now - i * 24 * 60 * 60 * 1000,
    });

    leads.push(leadId);
  }

  console.log(`Created ${leads.length} leads in various states`);
  return leads;
}

/**
 * Seed purchases (some leads sold)
 */
async function seedPurchases(ctx: any, companyIds: any[], leadIds: any[]) {
  const purchases = [];

  // Mark first 2 leads as sold
  for (let i = 0; i < Math.min(2, leadIds.length); i++) {
    const lead = await ctx.db.get(leadIds[i]);
    if (!lead || lead.status !== "approved") continue;

    const companyId = companyIds[i % companyIds.length];
    const scoutId = lead.scoutId;

    const purchaseId = await ctx.db.insert("purchases", {
      companyId,
      leadId: leadIds[i],
      scoutId,
      creditsUsed: 1,
      purchasePrice: 30,
      scoutEarning: 15,
      platformCommission: 15,
      status: "completed",
      createdAt: Date.now() - (i + 1) * 24 * 60 * 60 * 1000,
    });

    // Update lead status
    await ctx.db.patch(leadIds[i], {
      status: "sold",
      purchasedBy: companyId,
      purchasedAt: Date.now() - (i + 1) * 24 * 60 * 60 * 1000,
    });

    purchases.push(purchaseId);
  }

  console.log(`Created ${purchases.length} purchases`);
  return purchases;
}

/**
 * Seed payouts
 */
async function seedPayouts(ctx: any, scoutIds: any[]) {
  for (const scoutId of scoutIds) {
    await ctx.db.insert("payouts", {
      scoutId,
      amount: 100,
      status: "completed",
      stripeTransferId: `tr_test_${scoutId}`,
      processedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      completedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    });
  }

  console.log(`Created payouts for ${scoutIds.length} scouts`);
}

/**
 * Seed notifications
 */
async function seedNotifications(
  ctx: any,
  scoutUserIds: any[],
  companyUserIds: any[]
) {
  // Scout notifications
  for (const userId of scoutUserIds) {
    await ctx.db.insert("notifications", {
      userId,
      type: "lead_sold",
      title: "Lead Sold!",
      message: "Your lead 'ERP Migration' was purchased for 30 euros",
      metadata: { leadId: "sample", amount: 30 },
      read: false,
      createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    });
  }

  // Company notifications
  for (const userId of companyUserIds) {
    await ctx.db.insert("notifications", {
      userId,
      type: "new_matching_lead",
      title: "New Lead Available",
      message: "A new IT Services lead matching your preferences is available",
      read: false,
      createdAt: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
    });
  }

  console.log("Created sample notifications");
}

/**
 * Seed achievements
 */
async function seedAchievements(ctx: any, scoutIds: any[]) {
  for (const scoutId of scoutIds) {
    await ctx.db.insert("achievements", {
      scoutId,
      type: "silver_scout",
      title: "Silver Scout",
      description: "Sold 20 leads",
      icon: "🥈",
      unlockedAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    });
  }

  console.log(`Created achievements for ${scoutIds.length} scouts`);
}

/**
 * Quick seed for testing (fewer records)
 */
export const seedQuick = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("Quick seed - creating minimal test data...");

    // Create 1 scout, 1 company, 3 leads
    const scoutUser = await ctx.db.insert("users", {
      clerkId: "clerk_test_scout",
      role: "scout",
      email: "scout@test.com",
      name: "Test Scout",
      profile: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const scout = await ctx.db.insert("scouts", {
      userId: scoutUser,
      onboardingComplete: true,
      qualityScore: 7.5,
      badge: "silver",
      totalLeadsSubmitted: 10,
      totalLeadsSold: 5,
      pendingEarnings: 75,
      totalEarnings: 500,
      createdAt: Date.now(),
    });

    const companyUser = await ctx.db.insert("users", {
      clerkId: "clerk_test_company",
      role: "company",
      email: "company@test.com",
      name: "Test Company",
      profile: {
        companyName: "Test Corp",
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("companies", {
      userId: companyUser,
      stripeCustomerId: "cus_test",
      plan: "growth",
      subscriptionStatus: "active",
      creditsRemaining: 60,
      creditsAllocated: 60,
      preferences: {
        categories: [],
        notifications: {
          newLeads: true,
          lowCredits: true,
          renewalReminder: true,
        },
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log("Quick seed complete!");
  },
});
