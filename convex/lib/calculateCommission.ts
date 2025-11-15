/**
 * Commission Calculator
 *
 * Calculates earnings splits between scouts and platform.
 * Commission rate is configured via environment variable (default 50/50).
 */

import { getCommissionRate } from "./constants";

/**
 * Transaction breakdown
 */
export interface TransactionBreakdown {
  salePrice: number;           // Total lead price
  scoutEarning: number;        // Scout's share
  platformCommission: number;  // Platform's share
  commissionRate: number;      // Rate used (0-1)
}

/**
 * Calculate transaction breakdown
 * Splits sale price between scout and platform
 *
 * @param salePrice - Lead sale price in euros
 * @returns Breakdown of transaction
 *
 * @example
 * calculateCommission(30)
 * // {
 * //   salePrice: 30,
 * //   scoutEarning: 15,      // 50%
 * //   platformCommission: 15, // 50%
 * //   commissionRate: 0.5
 * // }
 */
export function calculateCommission(salePrice: number): TransactionBreakdown {
  const commissionRate = getCommissionRate();

  const scoutEarning = salePrice * commissionRate;
  const platformCommission = salePrice - scoutEarning;

  return {
    salePrice,
    scoutEarning: Math.round(scoutEarning * 100) / 100, // Round to 2 decimals
    platformCommission: Math.round(platformCommission * 100) / 100,
    commissionRate,
  };
}

/**
 * Calculate scout earnings for a batch of sales
 * Used for payout processing
 *
 * @param salePrices - Array of sale prices
 * @returns Total scout earnings
 *
 * @example
 * calculateBatchEarnings([30, 25, 30])
 * // Returns 42.5 (sum of individual scout earnings)
 */
export function calculateBatchEarnings(salePrices: number[]): number {
  const totalEarnings = salePrices.reduce((sum, price) => {
    const breakdown = calculateCommission(price);
    return sum + breakdown.scoutEarning;
  }, 0);

  return Math.round(totalEarnings * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate platform revenue for analytics
 *
 * @param salePrices - Array of sale prices
 * @returns Total platform commission
 *
 * @example
 * calculatePlatformRevenue([30, 25, 30])
 * // Returns 42.5 (sum of platform commissions)
 */
export function calculatePlatformRevenue(salePrices: number[]): number {
  const totalRevenue = salePrices.reduce((sum, price) => {
    const breakdown = calculateCommission(price);
    return sum + breakdown.platformCommission;
  }, 0);

  return Math.round(totalRevenue * 100) / 100;
}

/**
 * Format currency amount for display
 *
 * @param amount - Amount in euros
 * @param locale - Locale for formatting (default: "fr-LU" for Luxembourg)
 * @returns Formatted string
 *
 * @example
 * formatCurrency(1245.50)
 * // "1 245,50 €"
 */
export function formatCurrency(
  amount: number,
  locale: string = "fr-LU"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/**
 * Calculate potential earnings range for scout
 * Used for UI previews before submission
 *
 * @param category - Lead category
 * @returns { min: number, max: number }
 *
 * @example
 * calculateEarningsRange("IT Services")
 * // { min: 15, max: 15 } (currently fixed, could be variable)
 */
export function calculateEarningsRange(category: string): {
  min: number;
  max: number;
} {
  // Import here to avoid circular dependency
  const { calculateLeadPrice } = require("./calculateLeadPrice");
  const salePrice = calculateLeadPrice(category);
  const breakdown = calculateCommission(salePrice);

  // Future: Could add variable earnings based on quality
  return {
    min: breakdown.scoutEarning,
    max: breakdown.scoutEarning,
  };
}

/**
 * Validate payout amount meets minimum threshold
 *
 * @param amount - Payout amount in euros
 * @returns true if meets threshold
 *
 * @example
 * canProcessPayout(25)  // true (above 20 euro threshold)
 * canProcessPayout(15)  // false (below threshold)
 */
export function canProcessPayout(amount: number): boolean {
  const threshold = parseFloat(process.env.PAYOUT_MINIMUM_THRESHOLD ?? "20");
  return amount >= threshold;
}

/**
 * Calculate Stripe fees for transparency
 * Stripe charges ~2.9% + 0.30€ per transaction
 * Note: These fees are absorbed by platform, not deducted from scout earnings
 *
 * @param amount - Transaction amount
 * @returns Estimated Stripe fee
 *
 * @example
 * calculateStripeFee(30)
 * // Returns ~1.17 (2.9% + 0.30)
 */
export function calculateStripeFee(amount: number): number {
  const percentageFee = 0.029; // 2.9%
  const fixedFee = 0.3; // 0.30€

  const fee = amount * percentageFee + fixedFee;
  return Math.round(fee * 100) / 100;
}

/**
 * Calculate net platform revenue after Stripe fees
 *
 * @param salePrice - Lead sale price
 * @returns Net revenue breakdown
 *
 * @example
 * calculateNetRevenue(30)
 * // {
 * //   grossRevenue: 15,    // Platform's 50%
 * //   stripeFee: 0.87,     // Stripe fee on full amount
 * //   netRevenue: 14.13    // After Stripe fees
 * // }
 */
export function calculateNetRevenue(salePrice: number): {
  grossRevenue: number;
  stripeFee: number;
  netRevenue: number;
} {
  const breakdown = calculateCommission(salePrice);
  const stripeFee = calculateStripeFee(salePrice);

  return {
    grossRevenue: breakdown.platformCommission,
    stripeFee,
    netRevenue: breakdown.platformCommission - stripeFee,
  };
}
