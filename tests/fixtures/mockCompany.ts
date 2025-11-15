/**
 * Test fixture: Mock Company data
 */

import { Id } from "../../convex/_generated/dataModel";

export const mockCompany = {
  _id: "company_test_123" as Id<"companies">,
  userId: "user_company_123" as Id<"users">,
  stripeCustomerId: "cus_test_company_123",
  subscriptionId: "sub_test_company_123",
  plan: "growth" as const,
  subscriptionStatus: "active" as const,
  creditsRemaining: 45,
  creditsAllocated: 60,
  nextRenewalDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
  preferences: {
    categories: ["IT Services", "Marketing"],
    budgetMin: 10000,
    budgetMax: 100000,
    notifications: {
      newLeads: true,
      lowCredits: true,
      renewalReminder: true,
    },
  },
  createdAt: Date.now() - (60 * 24 * 60 * 60 * 1000), // 60 days ago
  updatedAt: Date.now(),
};

export const mockCompanyUser = {
  _id: "user_company_123" as Id<"users">,
  clerkId: "clerk_user_company_123",
  role: "company" as const,
  email: "sales@acmecorp.com",
  name: "Sophie Martin",
  profile: {
    avatar: "https://example.com/company-avatar.jpg",
    bio: "Sales Director at Acme Corp",
    companyName: "Acme Corp",
    website: "https://acmecorp.com",
    industry: "IT Services",
    teamSize: "50-100",
  },
  createdAt: Date.now() - (60 * 24 * 60 * 60 * 1000),
  updatedAt: Date.now(),
};

export const mockStarterCompany = {
  ...mockCompany,
  _id: "company_test_starter" as Id<"companies">,
  userId: "user_company_starter" as Id<"users">,
  plan: "starter" as const,
  creditsRemaining: 15,
  creditsAllocated: 20,
};

export const mockScaleCompany = {
  ...mockCompany,
  _id: "company_test_scale" as Id<"companies">,
  userId: "user_company_scale" as Id<"users">,
  plan: "scale" as const,
  creditsRemaining: 120,
  creditsAllocated: 150,
};

export const mockLowCreditCompany = {
  ...mockCompany,
  _id: "company_test_low_credits" as Id<"companies">,
  userId: "user_company_low_credits" as Id<"users">,
  creditsRemaining: 2,
  creditsAllocated: 20,
};

export const mockExpiredCompany = {
  ...mockCompany,
  _id: "company_test_expired" as Id<"companies">,
  userId: "user_company_expired" as Id<"users">,
  subscriptionStatus: "canceled" as const,
  creditsRemaining: 0,
  nextRenewalDate: undefined,
};
