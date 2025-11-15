/**
 * Test fixture: Mock Purchase data
 */

import { Id } from "../../convex/_generated/dataModel";

export const mockPurchase = {
  _id: "purchase_test_123" as Id<"purchases">,
  companyId: "company_test_123" as Id<"companies">,
  leadId: "lead_test_sold" as Id<"leads">,
  scoutId: "scout_test_123" as Id<"scouts">,
  creditsUsed: 1,
  purchasePrice: 30,
  scoutEarning: 15, // 50% commission
  platformCommission: 15, // 50% commission
  status: "completed" as const,
  refundReason: undefined,
  createdAt: Date.now() - (12 * 60 * 60 * 1000), // 12 hours ago
};

export const mockRefundedPurchase = {
  ...mockPurchase,
  _id: "purchase_test_refunded" as Id<"purchases">,
  status: "refunded" as const,
  refundReason: "Duplicate lead - same company was already contacted",
};

export const mockRecentPurchases = [
  mockPurchase,
  {
    ...mockPurchase,
    _id: "purchase_test_124" as Id<"purchases">,
    leadId: "lead_test_124" as Id<"leads">,
    purchasePrice: 25,
    scoutEarning: 12.5,
    platformCommission: 12.5,
    createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000),
  },
  {
    ...mockPurchase,
    _id: "purchase_test_125" as Id<"purchases">,
    leadId: "lead_test_125" as Id<"leads">,
    purchasePrice: 20,
    scoutEarning: 10,
    platformCommission: 10,
    createdAt: Date.now() - (5 * 24 * 60 * 60 * 1000),
  },
];
