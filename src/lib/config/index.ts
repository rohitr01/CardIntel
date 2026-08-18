/**
 * CardIntel — Application Configuration
 *
 * Configurable branding, source authority, and system settings.
 * All values can be overridden via environment variables.
 */

// ---------------------------------------------------------------------------
// Brand Configuration (User req #26)
// ---------------------------------------------------------------------------

export const brandConfig = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || "CardIntel",
  shortName: process.env.NEXT_PUBLIC_BRAND_SHORT_NAME || "CardIntel",
  tagline:
    process.env.NEXT_PUBLIC_BRAND_TAGLINE ||
    "India's Credit Card Intelligence Platform",
  description:
    "Comprehensive, source-verified credit card database, comparison engine, and recommendation system for India.",
  domain: process.env.NEXT_PUBLIC_DOMAIN || "cardintel.in",
  primaryColor: "#0F172A", // Slate 900
  secondaryColor: "#0284C7", // Sky 600
  accentColor: "#059669", // Emerald 600
  currency: "INR" as const,
  currencySymbol: "₹",
  country: "India" as const,
  defaultLanguage: "en" as const,
  supportedLanguages: ["en"] as const, // Architected for hi, ta, te, bn, etc.
} as const;

// ---------------------------------------------------------------------------
// Source Authority Hierarchy (Addendum #13 — configurable, not hardcoded)
// ---------------------------------------------------------------------------

export interface SourceAuthorityConfig {
  sourceType: string;
  authorityScore: number;
  freshnessDecayDays: number; // after this many days, score starts decaying
  description: string;
}

export const sourceAuthorityHierarchy: SourceAuthorityConfig[] = [
  {
    sourceType: "OFFICIAL_MITC",
    authorityScore: 100,
    freshnessDecayDays: 180,
    description: "Official Most Important Terms & Conditions document",
  },
  {
    sourceType: "OFFICIAL_FEE_SCHEDULE",
    authorityScore: 98,
    freshnessDecayDays: 180,
    description: "Official fee schedule / charges document",
  },
  {
    sourceType: "OFFICIAL_BANK_PAGE",
    authorityScore: 95,
    freshnessDecayDays: 90,
    description: "Official bank product page",
  },
  {
    sourceType: "OFFICIAL_TERMS",
    authorityScore: 93,
    freshnessDecayDays: 180,
    description: "Official terms and conditions",
  },
  {
    sourceType: "OFFICIAL_APPLICATION_PAGE",
    authorityScore: 90,
    freshnessDecayDays: 60,
    description: "Official application/apply page",
  },
  {
    sourceType: "RBI",
    authorityScore: 90,
    freshnessDecayDays: 365,
    description: "Reserve Bank of India regulatory source",
  },
  {
    sourceType: "NPCI",
    authorityScore: 88,
    freshnessDecayDays: 365,
    description: "National Payments Corporation of India",
  },
  {
    sourceType: "ANNUAL_REPORT",
    authorityScore: 85,
    freshnessDecayDays: 365,
    description: "Bank annual report or investor presentation",
  },
  {
    sourceType: "INVESTOR_PRESENTATION",
    authorityScore: 83,
    freshnessDecayDays: 180,
    description: "Investor presentations and quarterly reports",
  },
  {
    sourceType: "REGULATORY_NOTICE",
    authorityScore: 80,
    freshnessDecayDays: 365,
    description: "Regulatory notices from RBI, NPCI, CCPA, etc.",
  },
  {
    sourceType: "SECONDARY_REPUTABLE_SOURCE",
    authorityScore: 60,
    freshnessDecayDays: 60,
    description: "Reputable third-party source (must be labeled)",
  },
  {
    sourceType: "EXTERNAL_DATABASE",
    authorityScore: 50,
    freshnessDecayDays: 30,
    description: "Third-party database import (not authoritative by default)",
  },
];

/**
 * Get the authority score for a source type, factoring in freshness.
 */
export function getSourceAuthorityScore(
  sourceType: string,
  daysSinceVerified: number,
): number {
  const config = sourceAuthorityHierarchy.find(
    (s) => s.sourceType === sourceType,
  );
  if (!config) return 0;

  if (daysSinceVerified <= config.freshnessDecayDays) {
    return config.authorityScore;
  }

  // Linear decay after threshold, minimum 10% of base score
  const daysOverdue = daysSinceVerified - config.freshnessDecayDays;
  const decayRate = 0.5; // lose 0.5 points per day overdue
  const decayed = Math.max(
    config.authorityScore * 0.1,
    config.authorityScore - daysOverdue * decayRate,
  );
  return Math.round(decayed);
}

// ---------------------------------------------------------------------------
// Data Freshness Thresholds (Addendum #37)
// ---------------------------------------------------------------------------

export const freshnessThresholds = {
  FRESH: 30, // days
  RECENT: 60,
  STALE: 90,
  VERY_STALE: Infinity, // > 90 days
} as const;

// ---------------------------------------------------------------------------
// Verification Priority (Addendum #38)
// ---------------------------------------------------------------------------

export const verificationPriority = {
  HIGH: [
    "annual_fee",
    "joining_fee",
    "cashback_rate",
    "reward_rate",
    "lounge_visits",
    "forex_markup",
    "eligibility",
    "status",
    "fee_waiver",
  ],
  MEDIUM: [
    "insurance_benefits",
    "redemption_options",
    "transfer_partners",
    "milestone_benefits",
    "welcome_benefit",
  ],
  LOW: [
    "marketing_copy",
    "card_image",
    "seo_description",
  ],
} as const;

// ---------------------------------------------------------------------------
// Confidence Thresholds (Addendum #73)
// ---------------------------------------------------------------------------

export const confidenceThresholds = {
  HIGH: 95,
  MEDIUM: 80,
  LOW: 60,
  REVIEW: 0,
} as const;

// ---------------------------------------------------------------------------
// Human Approval Requirements (Addendum #72)
// ---------------------------------------------------------------------------

export const humanApprovalRequired = [
  "fee_change",
  "status_change",
  "eligibility_change",
  "major_reward_change",
  "card_launch",
  "card_discontinuation",
  "legal_issuer_change",
] as const;

// ---------------------------------------------------------------------------
// Tax Configuration (Addendum #29, #76)
// ---------------------------------------------------------------------------

export const taxConfig = {
  GST_RATE: 18, // Percentage — configurable, not hardcoded permanently
  GST_EFFECTIVE_FROM: "2017-07-01",
} as const;

// ---------------------------------------------------------------------------
// Comparison Limits
// ---------------------------------------------------------------------------

export const comparisonConfig = {
  MIN_CARDS: 2,
  MAX_CARDS: 5,
} as const;

// ---------------------------------------------------------------------------
// Pagination Defaults
// ---------------------------------------------------------------------------

export const paginationConfig = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ---------------------------------------------------------------------------
// Coverage Claim Protection (Addendum #59)
// ---------------------------------------------------------------------------

export const coverageClaimConfig = {
  minIssuerCoveragePercent: 90,
  minProductCoveragePercent: 85,
  maxDaysSinceFullAudit: 90,
  defaultClaimText: "Comprehensive India Credit Card Database",
  fullClaimText: "Every Credit Card in India",
} as const;

// ---------------------------------------------------------------------------
// Legal Disclaimers (Req #64)
// ---------------------------------------------------------------------------

export const legalDisclaimer =
  "Information is for comparison and informational purposes and may change. " +
  "Verify final fees, eligibility, rewards and terms with the issuer before applying. " +
  "CardIntel is not a bank, lender, or financial institution. " +
  "Eligibility and approval are determined by the issuer. " +
  "Fees, benefits and rewards can change without notice.";

export const affiliateDisclosure =
  "Some links on this page may be affiliate links. " +
  "CardIntel may receive a commission if you apply for a credit card through these links. " +
  "This does not affect our recommendations, which are based on verified data and transparent methodology.";
