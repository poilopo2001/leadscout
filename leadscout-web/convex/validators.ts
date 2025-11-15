/**
 * Validation Schemas using Zod
 *
 * Reusable validation schemas for data validation across the application.
 * These schemas ensure data integrity before database operations.
 */

import { z } from "zod";

/**
 * Lead submission validation
 * Validates all required fields for new lead creation
 */
export const leadSubmissionSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(200, "Title must not exceed 200 characters"),

  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description must not exceed 2000 characters"),

  category: z
    .string()
    .min(1, "Category is required"),

  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(200, "Company name must not exceed 200 characters"),

  contactName: z
    .string()
    .min(2, "Contact name must be at least 2 characters")
    .max(100, "Contact name must not exceed 100 characters"),

  contactEmail: z
    .string()
    .email("Invalid email address"),

  contactPhone: z
    .string()
    .min(8, "Phone number must be at least 8 characters")
    .max(20, "Phone number must not exceed 20 characters")
    .regex(/^[+\d\s()-]+$/, "Invalid phone number format"),

  companyWebsite: z
    .string()
    .url("Invalid website URL")
    .optional()
    .or(z.literal("")),

  estimatedBudget: z
    .number()
    .positive("Budget must be positive")
    .min(100, "Budget must be at least 100 euros")
    .max(10000000, "Budget seems unrealistic"),

  timeline: z
    .string()
    .max(100, "Timeline must not exceed 100 characters")
    .optional(),
});

export type LeadSubmissionInput = z.infer<typeof leadSubmissionSchema>;

/**
 * Company profile update validation
 */
export const companyProfileSchema = z.object({
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(200, "Company name must not exceed 200 characters")
    .optional(),

  website: z
    .string()
    .url("Invalid website URL")
    .optional()
    .or(z.literal("")),

  industry: z
    .string()
    .min(2, "Industry must be at least 2 characters")
    .max(100, "Industry must not exceed 100 characters")
    .optional(),

  teamSize: z
    .string()
    .max(50, "Team size must not exceed 50 characters")
    .optional(),

  bio: z
    .string()
    .max(500, "Bio must not exceed 500 characters")
    .optional(),

  linkedin: z
    .string()
    .url("Invalid LinkedIn URL")
    .regex(/linkedin\.com/, "Must be a LinkedIn URL")
    .optional()
    .or(z.literal("")),
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;

/**
 * Scout profile update validation
 */
export const scoutProfileSchema = z.object({
  bio: z
    .string()
    .max(500, "Bio must not exceed 500 characters")
    .optional(),

  linkedin: z
    .string()
    .url("Invalid LinkedIn URL")
    .regex(/linkedin\.com/, "Must be a LinkedIn URL")
    .optional()
    .or(z.literal("")),

  industryExpertise: z
    .array(z.string())
    .max(10, "Maximum 10 expertise areas allowed")
    .optional(),
});

export type ScoutProfileInput = z.infer<typeof scoutProfileSchema>;

/**
 * Credit purchase validation
 */
export const creditPurchaseSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be positive")
    .min(1, "Minimum 1 credit")
    .max(500, "Maximum 500 credits per purchase"),
});

export type CreditPurchaseInput = z.infer<typeof creditPurchaseSchema>;

/**
 * Lead moderation validation
 */
export const leadModerationSchema = z.object({
  action: z.enum(["approved", "rejected", "changes_requested", "flagged"]),

  notes: z
    .string()
    .max(1000, "Notes must not exceed 1000 characters")
    .optional(),

  qualityScoreOverride: z
    .number()
    .min(0, "Quality score must be at least 0")
    .max(10, "Quality score must not exceed 10")
    .optional(),
});

export type LeadModerationInput = z.infer<typeof leadModerationSchema>;

/**
 * Company preferences validation
 */
export const companyPreferencesSchema = z.object({
  categories: z
    .array(z.string())
    .max(20, "Maximum 20 categories allowed"),

  budgetMin: z
    .number()
    .nonnegative("Budget minimum must be non-negative")
    .optional(),

  budgetMax: z
    .number()
    .positive("Budget maximum must be positive")
    .optional(),

  notifications: z.object({
    newLeads: z.boolean(),
    lowCredits: z.boolean(),
    renewalReminder: z.boolean(),
  }),
}).refine(
  (data) => {
    if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
      return data.budgetMax >= data.budgetMin;
    }
    return true;
  },
  {
    message: "Budget maximum must be greater than or equal to minimum",
    path: ["budgetMax"],
  }
);

export type CompanyPreferencesInput = z.infer<typeof companyPreferencesSchema>;

/**
 * Payment amount validation
 */
export const paymentAmountSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .multipleOf(0.01, "Amount must be a valid currency value"),

  currency: z
    .string()
    .length(3, "Currency must be 3-letter code")
    .regex(/^[A-Z]{3}$/, "Currency must be uppercase 3-letter code")
    .default("EUR"),
});

export type PaymentAmountInput = z.infer<typeof paymentAmountSchema>;

/**
 * Payout validation
 */
export const payoutSchema = z.object({
  amount: z
    .number()
    .positive("Payout amount must be positive")
    .min(20, "Minimum payout is 20 euros"), // From env: PAYOUT_MINIMUM_THRESHOLD

  stripeConnectAccountId: z
    .string()
    .min(1, "Stripe Connect account required")
    .startsWith("acct_", "Invalid Stripe account ID"),
});

export type PayoutInput = z.infer<typeof payoutSchema>;

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(255, "Email must not exceed 255 characters");

/**
 * Phone validation (international format)
 */
export const phoneSchema = z
  .string()
  .min(8, "Phone number must be at least 8 characters")
  .max(20, "Phone number must not exceed 20 characters")
  .regex(/^[+\d\s()-]+$/, "Invalid phone number format");

/**
 * URL validation
 */
export const urlSchema = z
  .string()
  .url("Invalid URL")
  .max(500, "URL must not exceed 500 characters");

/**
 * Currency amount validation (euros)
 */
export const euroAmountSchema = z
  .number()
  .nonnegative("Amount must be non-negative")
  .multipleOf(0.01, "Amount must be a valid euro value");

/**
 * Percentage validation (0-100)
 */
export const percentageSchema = z
  .number()
  .min(0, "Percentage must be at least 0")
  .max(100, "Percentage must not exceed 100");

/**
 * Date range validation
 */
export const dateRangeSchema = z
  .object({
    startDate: z.number().positive("Start date must be valid timestamp"),
    endDate: z.number().positive("End date must be valid timestamp"),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export type DateRangeInput = z.infer<typeof dateRangeSchema>;

/**
 * Pagination validation
 */
export const paginationSchema = z.object({
  limit: z
    .number()
    .int("Limit must be an integer")
    .positive("Limit must be positive")
    .max(100, "Maximum limit is 100")
    .default(20),

  offset: z
    .number()
    .int("Offset must be an integer")
    .nonnegative("Offset must be non-negative")
    .default(0),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Search query validation
 */
export const searchQuerySchema = z
  .string()
  .min(2, "Search query must be at least 2 characters")
  .max(200, "Search query must not exceed 200 characters");

/**
 * ID validation (Convex ID format)
 */
export const convexIdSchema = z
  .string()
  .regex(/^[a-z0-9]+$/, "Invalid ID format");

/**
 * Validate lead submission data
 * Throws detailed validation errors
 */
export function validateLeadSubmission(data: unknown): LeadSubmissionInput {
  return leadSubmissionSchema.parse(data);
}

/**
 * Validate company profile update
 */
export function validateCompanyProfile(data: unknown): CompanyProfileInput {
  return companyProfileSchema.parse(data);
}

/**
 * Validate scout profile update
 */
export function validateScoutProfile(data: unknown): ScoutProfileInput {
  return scoutProfileSchema.parse(data);
}

/**
 * Validate credit purchase
 */
export function validateCreditPurchase(data: unknown): CreditPurchaseInput {
  return creditPurchaseSchema.parse(data);
}

/**
 * Validate lead moderation action
 */
export function validateLeadModeration(data: unknown): LeadModerationInput {
  return leadModerationSchema.parse(data);
}

/**
 * Validate company preferences
 */
export function validateCompanyPreferences(data: unknown): CompanyPreferencesInput {
  return companyPreferencesSchema.parse(data);
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(data: unknown): PaymentAmountInput {
  return paymentAmountSchema.parse(data);
}

/**
 * Validate payout data
 */
export function validatePayout(data: unknown): PayoutInput {
  return payoutSchema.parse(data);
}

/**
 * Safe validation that returns result object instead of throwing
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map((err: any) => `${err.path.join(".")}: ${err.message}`);
  return { success: false, errors };
}
