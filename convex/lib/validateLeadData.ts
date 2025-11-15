/**
 * Lead Data Validation
 *
 * Input validation helpers for lead submissions and purchases.
 * Ensures data integrity and prevents invalid submissions.
 */

import { getMinDescriptionLength } from "./constants";

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Lead submission data (before database insert)
 */
export interface LeadSubmissionData {
  title: string;
  description: string;
  category: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyWebsite?: string;
  estimatedBudget: number;
  timeline?: string;
}

/**
 * Validate lead submission data
 * Returns array of validation errors (empty if valid)
 *
 * @param data - Lead submission data
 * @returns Array of validation errors
 *
 * @example
 * validateLeadSubmission({
 *   title: "ERP Migration",
 *   description: "Short desc",
 *   // ... more fields
 * })
 * // Returns: [{ field: "description", message: "Description must be at least 100 characters" }]
 */
export function validateLeadSubmission(
  data: LeadSubmissionData
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Title validation
  if (!data.title || data.title.trim().length < 10) {
    errors.push({
      field: "title",
      message: "Title must be at least 10 characters",
    });
  }
  if (data.title && data.title.length > 200) {
    errors.push({
      field: "title",
      message: "Title must not exceed 200 characters",
    });
  }

  // Description validation
  const minDescLength = getMinDescriptionLength();
  if (!data.description || data.description.trim().length < minDescLength) {
    errors.push({
      field: "description",
      message: `Description must be at least ${minDescLength} characters`,
    });
  }
  if (data.description && data.description.length > 2000) {
    errors.push({
      field: "description",
      message: "Description must not exceed 2000 characters",
    });
  }

  // Category validation
  const validCategories = [
    "IT Services",
    "IT",
    "Marketing",
    "HR",
    "Sales",
    "Consulting",
    "Finance",
    "E-commerce",
    "Other",
  ];
  if (!data.category || !validCategories.includes(data.category)) {
    errors.push({
      field: "category",
      message: "Please select a valid category",
    });
  }

  // Company name validation
  if (!data.companyName || data.companyName.trim().length < 2) {
    errors.push({
      field: "companyName",
      message: "Company name is required (min 2 characters)",
    });
  }

  // Contact name validation
  if (!data.contactName || data.contactName.trim().length < 2) {
    errors.push({
      field: "contactName",
      message: "Contact name is required (min 2 characters)",
    });
  }

  // Email validation
  const emailError = validateEmail(data.contactEmail);
  if (emailError) {
    errors.push({ field: "contactEmail", message: emailError });
  }

  // Phone validation
  const phoneError = validatePhone(data.contactPhone);
  if (phoneError) {
    errors.push({ field: "contactPhone", message: phoneError });
  }

  // Website validation (optional but must be valid if provided)
  if (data.companyWebsite) {
    const websiteError = validateWebsite(data.companyWebsite);
    if (websiteError) {
      errors.push({ field: "companyWebsite", message: websiteError });
    }
  }

  // Budget validation
  if (!data.estimatedBudget || data.estimatedBudget < 100) {
    errors.push({
      field: "estimatedBudget",
      message: "Budget must be at least 100 euros",
    });
  }
  if (data.estimatedBudget > 10000000) {
    errors.push({
      field: "estimatedBudget",
      message: "Budget seems unrealistic (max 10M euros)",
    });
  }

  return errors;
}

/**
 * Validate email format
 *
 * @param email - Email address
 * @returns Error message or null if valid
 *
 * @example
 * validateEmail("test@example.com")  // null (valid)
 * validateEmail("invalid-email")     // "Invalid email format"
 */
export function validateEmail(email: string): string | null {
  if (!email || email.trim().length === 0) {
    return "Email is required";
  }

  // Basic email regex (RFC 5322 simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "Invalid email format (e.g., user@example.com)";
  }

  // Check for common typos
  const commonDomains = ["gmail.com", "outlook.com", "yahoo.com", "hotmail.com"];
  const domain = email.split("@")[1];
  if (domain && domain.includes("..")) {
    return "Email contains invalid characters";
  }

  return null;
}

/**
 * Validate phone number
 * Supports international formats, with focus on Luxembourg (+352)
 *
 * @param phone - Phone number
 * @returns Error message or null if valid
 *
 * @example
 * validatePhone("+352 123 456 789")  // null (valid)
 * validatePhone("123")               // "Phone number is too short"
 */
export function validatePhone(phone: string): string | null {
  if (!phone || phone.trim().length === 0) {
    return "Phone number is required";
  }

  // Remove spaces, dashes, parentheses for validation
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

  // Must start with + (international) or be 8-15 digits
  if (!cleanPhone.startsWith("+") && !/^\d{8,15}$/.test(cleanPhone)) {
    return "Invalid phone format (use international format: +352...)";
  }

  if (cleanPhone.startsWith("+") && !/^\+\d{10,15}$/.test(cleanPhone)) {
    return "Invalid international phone format";
  }

  // Luxembourg specific validation
  if (cleanPhone.startsWith("+352") && cleanPhone.length !== 12) {
    return "Luxembourg phone numbers should be +352 followed by 9 digits";
  }

  return null;
}

/**
 * Validate website URL
 *
 * @param url - Website URL
 * @returns Error message or null if valid
 *
 * @example
 * validateWebsite("https://example.com")  // null (valid)
 * validateWebsite("example.com")          // null (valid, will add https://)
 * validateWebsite("not a url")            // "Invalid website URL"
 */
export function validateWebsite(url: string): string | null {
  if (!url || url.trim().length === 0) {
    return null; // Optional field
  }

  // Add protocol if missing
  let testUrl = url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    testUrl = "https://" + url;
  }

  try {
    const parsed = new URL(testUrl);
    if (!parsed.hostname.includes(".")) {
      return "Website must include a domain (e.g., example.com)";
    }
    return null;
  } catch {
    return "Invalid website URL format";
  }
}

/**
 * Sanitize user input to prevent XSS
 * Removes potentially dangerous HTML/script tags
 *
 * @param input - User input string
 * @returns Sanitized string
 *
 * @example
 * sanitizeInput("<script>alert('xss')</script>Hello")
 * // Returns: "Hello"
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, "");

  // Remove potential script content
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/on\w+=/gi, "");

  // Trim whitespace
  return sanitized.trim();
}

/**
 * Validate budget range is realistic
 *
 * @param budget - Estimated budget
 * @param category - Lead category
 * @returns Error message or null if valid
 *
 * @example
 * validateBudgetRange(50000, "IT Services")  // null (valid)
 * validateBudgetRange(100, "IT Services")    // "Budget seems low for IT Services"
 */
export function validateBudgetRange(
  budget: number,
  category: string
): string | null {
  // Category-specific minimum budgets (can be configured via env)
  const minimums: Record<string, number> = {
    "IT Services": 5000,
    IT: 5000,
    Marketing: 1000,
    HR: 2000,
    Sales: 1000,
    Consulting: 3000,
    Finance: 5000,
  };

  const minimum = minimums[category] ?? 500;

  if (budget < minimum) {
    return `Budget seems low for ${category} (typical minimum: ${minimum}€)`;
  }

  return null;
}

/**
 * Check for duplicate lead submission
 * Validates that scout isn't submitting same company twice
 *
 * @param companyName - Company name
 * @param existingLeads - Scout's existing lead company names
 * @returns Error message or null if valid
 *
 * @example
 * checkDuplicate("Acme Corp", ["Acme Corp", "Other Co"])
 * // Returns: "You've already submitted a lead for Acme Corp"
 */
export function checkDuplicate(
  companyName: string,
  existingLeads: string[]
): string | null {
  const normalized = companyName.toLowerCase().trim();

  const isDuplicate = existingLeads.some(
    (existing) => existing.toLowerCase().trim() === normalized
  );

  if (isDuplicate) {
    return `You've already submitted a lead for ${companyName}`;
  }

  return null;
}

/**
 * Validate photo/file upload
 *
 * @param fileSize - File size in bytes
 * @param fileType - MIME type
 * @returns Error message or null if valid
 *
 * @example
 * validateFileUpload(3000000, "image/jpeg")  // null (valid)
 * validateFileUpload(8000000, "image/jpeg")  // "File too large"
 */
export function validateFileUpload(
  fileSize: number,
  fileType: string
): string | null {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (fileSize > maxSize) {
    return "File too large (max 5MB)";
  }

  if (!allowedTypes.includes(fileType.toLowerCase())) {
    return "Invalid file type (allowed: JPEG, PNG, WebP)";
  }

  return null;
}

/**
 * Get all validation error messages as a single string
 *
 * @param errors - Array of validation errors
 * @returns Combined error message
 *
 * @example
 * formatValidationErrors([
 *   { field: "title", message: "Title too short" },
 *   { field: "email", message: "Invalid email" }
 * ])
 * // Returns: "Title too short; Invalid email"
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map((e) => e.message).join("; ");
}
