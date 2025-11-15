/**
 * Application Constants
 * All configurable values should use environment variables
 */

// App Configuration
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "LeadScout";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Pricing Configuration (EUR per month)
export const PRICING = {
  starter: {
    name: "Starter",
    price: parseInt(process.env.NEXT_PUBLIC_STARTER_PLAN_PRICE || "99"),
    credits: parseInt(process.env.NEXT_PUBLIC_STARTER_PLAN_CREDITS || "20"),
    interval: "month" as const,
    features: [
      "20 lead credits per month",
      "Basic support",
      "Email notifications",
      "Dashboard analytics",
    ],
  },
  growth: {
    name: "Growth",
    price: parseInt(process.env.NEXT_PUBLIC_GROWTH_PLAN_PRICE || "249"),
    credits: parseInt(process.env.NEXT_PUBLIC_GROWTH_PLAN_CREDITS || "60"),
    interval: "month" as const,
    popular: true,
    features: [
      "60 lead credits per month",
      "Priority support",
      "Advanced analytics",
      "Category filtering",
      "Export data (CSV)",
    ],
  },
  scale: {
    name: "Scale",
    price: parseInt(process.env.NEXT_PUBLIC_SCALE_PLAN_PRICE || "499"),
    credits: parseInt(process.env.NEXT_PUBLIC_SCALE_PLAN_CREDITS || "150"),
    interval: "month" as const,
    features: [
      "150 lead credits per month",
      "API access",
      "Custom integration",
      "Dedicated account manager",
      "Custom contract terms",
      "Priority lead matching",
    ],
  },
} as const;

export type PlanType = keyof typeof PRICING;

// Lead Categories
export const LEAD_CATEGORIES = [
  "IT Services",
  "Marketing",
  "HR",
  "Sales",
  "Consulting",
  "Finance",
  "E-commerce",
  "Manufacturing",
  "Legal",
  "Real Estate",
] as const;

export type LeadCategory = (typeof LEAD_CATEGORIES)[number];

// Scout Badge Levels
export const BADGE_LEVELS = ["bronze", "silver", "gold", "platinum"] as const;
export type BadgeLevel = (typeof BADGE_LEVELS)[number];

// Navigation Items
export const DASHBOARD_NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "Home",
  },
  {
    href: "/dashboard/marketplace",
    label: "Marketplace",
    icon: "Search",
  },
  {
    href: "/dashboard/purchases",
    label: "My Purchases",
    icon: "ShoppingCart",
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: "BarChart3",
  },
  {
    href: "/dashboard/subscription",
    label: "Subscription",
    icon: "CreditCard",
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: "Settings",
  },
] as const;

// Date Range Options
export const DATE_RANGES = {
  last7days: { label: "Last 7 days", days: 7 },
  last30days: { label: "Last 30 days", days: 30 },
  last90days: { label: "Last 90 days", days: 90 },
  lastYear: { label: "Last year", days: 365 },
} as const;

// Status Colors
export const STATUS_COLORS = {
  // Lead status
  pending_review: "yellow",
  approved: "green",
  rejected: "red",
  sold: "blue",

  // Purchase status
  new: "blue",
  contacted: "yellow",
  closed: "green",

  // Payout status
  pending: "yellow",
  processing: "blue",
  completed: "green",
  failed: "red",
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MARKETPLACE_PAGE_SIZE = 12; // Grid layout
export const PURCHASES_PAGE_SIZE = 10; // Table layout

// Quality Score Thresholds
export const QUALITY_SCORE_THRESHOLDS = {
  excellent: 90,
  good: 70,
  fair: 50,
  poor: 0,
} as const;

// Credit Alert Thresholds
export const CREDIT_ALERT_THRESHOLDS = {
  critical: 0.2, // 20% remaining
  warning: 0.5, // 50% remaining
} as const;
