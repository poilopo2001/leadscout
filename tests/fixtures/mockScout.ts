/**
 * Test fixture: Mock Scout data
 */

import { Id } from "../../convex/_generated/dataModel";

export const mockScout = {
  _id: "scout_test_123" as Id<"scouts">,
  userId: "user_scout_123" as Id<"users">,
  stripeConnectAccountId: "acct_test_scout_123",
  onboardingComplete: true,
  qualityScore: 8.2,
  badge: "silver" as const,
  totalLeadsSubmitted: 35,
  totalLeadsSold: 23,
  pendingEarnings: 125.50,
  totalEarnings: 1245.00,
  lastPayoutDate: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
  createdAt: Date.now() - (90 * 24 * 60 * 60 * 1000), // 90 days ago
};

export const mockScoutUser = {
  _id: "user_scout_123" as Id<"users">,
  clerkId: "clerk_user_scout_123",
  role: "scout" as const,
  email: "marc.dubois@example.com",
  name: "Marc Dubois",
  profile: {
    avatar: "https://example.com/avatar.jpg",
    bio: "Experienced sales professional with 10+ years in B2B SaaS",
    linkedin: "https://linkedin.com/in/marcdubois",
    industryExpertise: ["IT Services", "SaaS", "Marketing"],
  },
  createdAt: Date.now() - (90 * 24 * 60 * 60 * 1000),
  updatedAt: Date.now(),
};

export const mockHighQualityScout = {
  ...mockScout,
  _id: "scout_test_premium" as Id<"scouts">,
  userId: "user_scout_premium" as Id<"users">,
  qualityScore: 9.5,
  badge: "platinum" as const,
  totalLeadsSold: 150,
  totalEarnings: 7500.00,
};

export const mockNewScout = {
  ...mockScout,
  _id: "scout_test_new" as Id<"scouts">,
  userId: "user_scout_new" as Id<"users">,
  qualityScore: 5.0,
  badge: "bronze" as const,
  totalLeadsSubmitted: 2,
  totalLeadsSold: 0,
  pendingEarnings: 0,
  totalEarnings: 0,
  lastPayoutDate: undefined,
  createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
};
