/**
 * Test fixture: Mock Payout data
 */

import { Id } from "../../convex/_generated/dataModel";

export const mockPayout = {
  _id: "payout_test_123" as Id<"payouts">,
  scoutId: "scout_test_123" as Id<"scouts">,
  amount: 125.50,
  status: "completed" as const,
  stripeTransferId: "tr_test_transfer_123",
  stripePayoutId: "po_test_payout_123",
  failureReason: undefined,
  processedAt: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
  completedAt: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago (2 days after processing)
  createdAt: Date.now() - (7 * 24 * 60 * 60 * 1000),
};

export const mockPendingPayout = {
  ...mockPayout,
  _id: "payout_test_pending" as Id<"payouts">,
  status: "pending" as const,
  stripeTransferId: undefined,
  stripePayoutId: undefined,
  processedAt: undefined,
  completedAt: undefined,
  createdAt: Date.now() - (1 * 60 * 60 * 1000), // 1 hour ago
};

export const mockFailedPayout = {
  ...mockPayout,
  _id: "payout_test_failed" as Id<"payouts">,
  status: "failed" as const,
  stripeTransferId: "tr_test_transfer_failed",
  failureReason: "Insufficient funds in Stripe Connect account",
  processedAt: Date.now() - (2 * 60 * 60 * 1000),
  completedAt: undefined,
};

export const mockProcessingPayout = {
  ...mockPayout,
  _id: "payout_test_processing" as Id<"payouts">,
  status: "processing" as const,
  stripeTransferId: "tr_test_transfer_processing",
  stripePayoutId: undefined,
  processedAt: Date.now() - (30 * 60 * 1000), // 30 minutes ago
  completedAt: undefined,
};
