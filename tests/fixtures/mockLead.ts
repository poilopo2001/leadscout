/**
 * Test fixture: Mock Lead data
 */

import { Id } from "../../convex/_generated/dataModel";

export const mockLead = {
  _id: "lead_test_123" as Id<"leads">,
  scoutId: "scout_test_123" as Id<"scouts">,

  // Lead information
  title: "ERP Migration for Manufacturing Company",
  description: "Mid-size manufacturing company (200 employees) needs to migrate from legacy ERP system to modern cloud solution. Current pain points: inventory management inefficiencies, lack of real-time reporting, disconnected systems. Decision maker identified, budget allocated, timeline: Q1 2025. Company has already evaluated 2 vendors but not satisfied. Looking for specialized implementation partner with manufacturing expertise.",
  category: "IT Services",

  // Company details (masked until purchased)
  companyName: "TechManu Industries",
  contactName: "Jean-Pierre Rousseau",
  contactEmail: "jp.rousseau@techmanu.fr",
  contactPhone: "+33 6 12 34 56 78",
  companyWebsite: "https://techmanu.fr",
  estimatedBudget: 75000,
  timeline: "Q1 2025",

  // Media
  photos: ["storage_id_1", "storage_id_2"],

  // Status
  status: "approved" as const,
  moderationStatus: "approved" as const,
  moderationNotes: "High quality lead with complete information",
  moderatedBy: "user_admin_123" as Id<"users">,
  moderatedAt: Date.now() - (24 * 60 * 60 * 1000), // 1 day ago

  // Quality scoring
  qualityScore: 8.5,
  qualityFactors: {
    descriptionLength: 9.0,
    contactCompleteness: 10.0,
    budgetAccuracy: 8.0,
    photoCount: 8.0,
    scoutReputation: 8.2,
  },

  // Sales tracking
  purchasedBy: undefined,
  purchasedAt: undefined,
  salePrice: 30, // From env: LEAD_PRICE_IT

  createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
  updatedAt: Date.now() - (1 * 24 * 60 * 60 * 1000),
};

export const mockPendingLead = {
  ...mockLead,
  _id: "lead_test_pending" as Id<"leads">,
  status: "pending_review" as const,
  moderationStatus: "pending" as const,
  moderationNotes: undefined,
  moderatedBy: undefined,
  moderatedAt: undefined,
  qualityScore: 7.0,
};

export const mockSoldLead = {
  ...mockLead,
  _id: "lead_test_sold" as Id<"leads">,
  status: "sold" as const,
  purchasedBy: "company_test_123" as Id<"companies">,
  purchasedAt: Date.now() - (12 * 60 * 60 * 1000), // 12 hours ago
};

export const mockRejectedLead = {
  ...mockLead,
  _id: "lead_test_rejected" as Id<"leads">,
  status: "rejected" as const,
  moderationStatus: "rejected" as const,
  moderationNotes: "Insufficient information about decision maker",
  moderatedBy: "user_admin_123" as Id<"users">,
  moderatedAt: Date.now() - (6 * 60 * 60 * 1000), // 6 hours ago
};

export const mockMarketingLead = {
  ...mockLead,
  _id: "lead_test_marketing" as Id<"leads">,
  title: "Rebranding Project for SaaS Startup",
  category: "Marketing",
  description: "Fast-growing SaaS startup (Series A, 30 employees) needs complete rebranding: new logo, website redesign, brand guidelines. CEO committed to project, budget approved, timeline: 2-3 months. Looking for agency with tech industry experience.",
  estimatedBudget: 45000,
  salePrice: 25, // From env: LEAD_PRICE_MARKETING
};

export const mockHRLead = {
  ...mockLead,
  _id: "lead_test_hr" as Id<"leads">,
  title: "Executive Search for CFO Position",
  category: "HR Services",
  description: "Growing fintech company needs CFO with fundraising experience. Series B stage, 80 employees, budget: 150-200k salary + equity. Urgent need, CEO wants to start interviews within 2 weeks.",
  estimatedBudget: 30000,
  salePrice: 20, // From env: LEAD_PRICE_HR
};

export const mockLowQualityLead = {
  ...mockPendingLead,
  _id: "lead_test_low_quality" as Id<"leads">,
  description: "Company needs IT services.",
  qualityScore: 3.5,
  qualityFactors: {
    descriptionLength: 2.0,
    contactCompleteness: 5.0,
    budgetAccuracy: 3.0,
    photoCount: 0.0,
    scoutReputation: 8.2,
  },
};
