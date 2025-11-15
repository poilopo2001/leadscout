/**
 * Lead Price Calculator
 *
 * Calculates the sale price of a lead based on its category.
 * Prices are configured via environment variables, not hardcoded.
 */

import { getLeadPriceByCategory } from "./constants";

/**
 * Calculate the sale price for a lead based on category
 *
 * @param category - Lead category (e.g., "IT Services", "Marketing")
 * @returns Price in euros
 *
 * @example
 * calculateLeadPrice("IT Services") // 30 (from env: LEAD_PRICE_IT)
 * calculateLeadPrice("Marketing")   // 25 (from env: LEAD_PRICE_MARKETING)
 * calculateLeadPrice("Custom")      // 25 (from env: LEAD_PRICE_DEFAULT)
 */
export function calculateLeadPrice(category: string): number {
  return getLeadPriceByCategory(category);
}

/**
 * Calculate price range for display (min/max if variable pricing)
 * Currently all leads are fixed price by category, but this allows
 * future variable pricing based on lead quality or negotiation.
 *
 * @param category - Lead category
 * @returns { min: number, max: number }
 *
 * @example
 * calculatePriceRange("IT Services") // { min: 30, max: 30 }
 */
export function calculatePriceRange(category: string): {
  min: number;
  max: number;
} {
  const basePrice = getLeadPriceByCategory(category);

  // Future: Could add variable pricing based on quality score
  // const qualityMultiplier = 1 + (qualityScore - 5) * 0.1; // ±50% based on quality
  // const adjustedPrice = basePrice * qualityMultiplier;

  return {
    min: basePrice,
    max: basePrice,
  };
}

/**
 * Calculate estimated earnings for scout preview
 * Shows scout how much they'll earn if lead sells
 *
 * @param category - Lead category
 * @returns Estimated earnings in euros (50% of sale price)
 *
 * @example
 * calculateEstimatedEarnings("IT Services") // 15 (50% of 30 euros)
 */
export function calculateEstimatedEarnings(category: string): number {
  const salePrice = getLeadPriceByCategory(category);
  const commissionRate = parseFloat(process.env.PLATFORM_COMMISSION_RATE ?? "0.5");
  return salePrice * commissionRate;
}

/**
 * Get all category pricing for display
 * Used in pricing tables, onboarding, etc.
 *
 * @returns Record of category names to prices
 *
 * @example
 * getAllCategoryPricing()
 * // {
 * //   "IT Services": 30,
 * //   "Marketing": 25,
 * //   "HR": 20,
 * //   ...
 * // }
 */
export function getAllCategoryPricing(): Record<string, number> {
  const categories = [
    "IT Services",
    "IT",
    "Marketing",
    "HR",
    "Sales",
    "Consulting",
    "Finance",
  ];

  return categories.reduce((acc, category) => {
    acc[category] = getLeadPriceByCategory(category);
    return acc;
  }, {} as Record<string, number>);
}
