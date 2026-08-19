/**
 * CardIntel — Zod Validators
 *
 * All input validation for API routes and forms.
 * Uses Decimal-safe parsing for monetary values.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Common
// ---------------------------------------------------------------------------

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const slugSchema = z.string().min(1).max(200).regex(/^[a-z0-9-]+$/);

/** Decimal-safe money input — accepts string or number, outputs string */
export const moneySchema = z
  .union([z.string(), z.number()])
  .transform((v) => String(v))
  .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, {
    message: "Must be a non-negative number",
  });

export const optionalMoneySchema = moneySchema.optional().nullable();

// ---------------------------------------------------------------------------
// Issuer
// ---------------------------------------------------------------------------

export const createIssuerSchema = z.object({
  name: z.string().min(1).max(500),
  shortName: z.string().max(200).optional(),
  slug: slugSchema,
  issuerType: z.enum([
    "BANK", "SMALL_FINANCE_BANK", "FOREIGN_BANK", "NBFC",
    "PAYMENT_BANK", "COOPERATIVE_BANK", "FINTECH", "MARKETPLACE",
    "APP", "PROGRAM_MANAGER", "OTHER",
  ]),
  websiteUrl: z.string().url().optional(),
  cardPageUrl: z.string().url().optional(),
  canIssueCreditCards: z.boolean().default(false),
  canIssueBusinessCards: z.boolean().default(false),
  canIssueCoBrandedCards: z.boolean().default(false),
  canIssueSecuredCards: z.boolean().default(false),
  rbiRegulatedEntity: z.boolean().default(false),
  rbiRegistrationReference: z.string().optional(),
  legalEntityName: z.string().optional(),
  cin: z.string().optional(),
  description: z.string().optional(),
  headquartersCity: z.string().optional(),
  foundedYear: z.number().int().min(1800).max(2030).optional(),
});

export const updateIssuerSchema = createIssuerSchema.partial();

// ---------------------------------------------------------------------------
// Card Product
// ---------------------------------------------------------------------------

export const createCardSchema = z.object({
  officialName: z.string().min(1).max(500),
  shortName: z.string().max(200).optional(),
  slug: slugSchema,
  issuerId: z.string().cuid(),
  brandId: z.string().cuid().optional(),
  platformId: z.string().cuid().optional(),
  coBrandPartnerId: z.string().cuid().optional(),
  networkId: z.string().cuid().optional(),
  consumerOrBusiness: z.enum(["CONSUMER", "BUSINESS", "CORPORATE", "BOTH"]).default("CONSUMER"),
  securedOrUnsecured: z.enum(["SECURED", "UNSECURED"]).default("UNSECURED"),
  physicalOrVirtual: z.enum(["PHYSICAL", "VIRTUAL", "BOTH"]).default("PHYSICAL"),
  status: z.enum([
    "DISCOVERED", "UNDER_RESEARCH", "VERIFIED", "ACTIVE",
    "INVITE_ONLY", "RELATIONSHIP_ONLY", "EXISTING_CUSTOMERS_ONLY",
    "TEMPORARILY_UNAVAILABLE", "LIMITED_AVAILABILITY",
    "DISCONTINUED", "RELAUNCHED", "LEGACY", "UNKNOWN",
  ]).default("DISCOVERED"),
  applicationUrl: z.string().url().optional(),
  officialProductUrl: z.string().url().optional(),
  officialFeeUrl: z.string().url().optional(),
  termsUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  launchDate: z.string().datetime().optional(),
  bestFor: z.array(z.string()).default([]),
  notIdealFor: z.array(z.string()).default([]),
  description: z.string().optional(),
  categoryIds: z.array(z.string().cuid()).default([]),
});

export const updateCardSchema = createCardSchema.partial();

// ---------------------------------------------------------------------------
// Fee
// ---------------------------------------------------------------------------

export const createFeeSchema = z.object({
  cardProductId: z.string().cuid(),
  feeType: z.enum([
    "JOINING", "ANNUAL", "RENEWAL", "ADDITIONAL_CARD",
    "CASH_ADVANCE", "CASH_PROCESSING", "FOREIGN_CURRENCY_MARKUP",
    "DYNAMIC_CURRENCY_CONVERSION", "RENT_TRANSACTION",
    "EDUCATION_TRANSACTION", "WALLET_LOAD", "FUEL_SURCHARGE",
    "BALANCE_TRANSFER", "EMI_PROCESSING", "LATE_PAYMENT",
    "OVERLIMIT", "CASH_WITHDRAWAL", "REWARD_REVERSAL",
    "INTERNATIONAL_TRANSACTION", "GST", "STATEMENT",
    "CARD_REPLACEMENT", "CHEQUE_BOUNCE", "OTHER",
  ]),
  amount: optionalMoneySchema,
  percentage: z
    .union([z.string(), z.number()])
    .transform((v) => String(v))
    .optional(),
  minimumAmount: optionalMoneySchema,
  maximumAmount: optionalMoneySchema,
  gstApplicable: z.boolean().default(false),
  fieldState: z.enum([
    "KNOWN", "NOT_DISCLOSED", "NOT_APPLICABLE",
    "CONDITIONAL", "CONFLICTING", "PENDING_VERIFICATION", "UNKNOWN",
  ]).default("UNKNOWN"),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
  sourceId: z.string().cuid().optional(),
  description: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Source
// ---------------------------------------------------------------------------

export const createSourceSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  sourceType: z.enum([
    "OFFICIAL_BANK_PAGE", "OFFICIAL_FEE_SCHEDULE", "OFFICIAL_TERMS",
    "OFFICIAL_MITC", "OFFICIAL_APPLICATION_PAGE", "RBI", "NPCI",
    "ANNUAL_REPORT", "INVESTOR_PRESENTATION",
    "SECONDARY_REPUTABLE_SOURCE", "REGULATORY_NOTICE", "EXTERNAL_DATABASE",
  ]),
  publisher: z.string().optional(),
  publishedDate: z.string().datetime().optional(),
  effectiveDate: z.string().datetime().optional(),
  issuerId: z.string().cuid().optional(),
});

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export const searchSchema = z.object({
  q: z.string().min(1).max(500),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

export const compareSchema = z.object({
  slugs: z.array(slugSchema).min(2).max(5),
});

// ---------------------------------------------------------------------------
// Recommendation
// ---------------------------------------------------------------------------

export const recommendSchema = z.object({
  monthlyIncome: moneySchema.optional(),
  monthlySpend: moneySchema.optional(),
  onlineShopping: moneySchema.optional(),
  offline: moneySchema.optional(),
  grocery: moneySchema.optional(),
  fuel: moneySchema.optional(),
  dining: moneySchema.optional(),
  foodDelivery: moneySchema.optional(),
  travel: moneySchema.optional(),
  upi: moneySchema.optional(),
  utilities: moneySchema.optional(),
  international: moneySchema.optional(),
  rent: moneySchema.optional(),
  entertainment: moneySchema.optional(),
  employmentType: z.enum([
    "SALARIED", "SELF_EMPLOYED", "BUSINESS", "PROFESSIONAL",
    "STUDENT", "RETIRED", "HOMEMAKER", "DEFENCE", "GOVERNMENT", "NRI", "ANY",
  ]).optional(),
  age: z.number().int().min(18).max(100).optional(),
  city: z.string().optional(),
  existingBank: z.string().optional(),
  cibilRange: z.string().optional(),
  fdAvailable: moneySchema.optional(),
});

// ---------------------------------------------------------------------------
// Calculator
// ---------------------------------------------------------------------------

export const calculatorSchema = z.object({
  cardSlugs: z.array(slugSchema).min(1).max(5),
  monthlySpend: z.record(z.string(), moneySchema),
  assumptions: z.object({
    rewardPointValue: z.string().optional(),
    feeWaiverAssumed: z.boolean().default(true),
    evenMonthlyDistribution: z.boolean().default(true),
  }).optional(),
});

// ---------------------------------------------------------------------------
// Multi-Faceted Card Discovery Filters
// ---------------------------------------------------------------------------

export const cardFilterSchema = z.object({
  // Search query
  q: z.string().optional(),

  // Identity
  issuerSlug: z.string().optional(),
  issuers: z.array(z.string()).optional(),
  legalIssuers: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
  coBrands: z.array(z.string()).optional(),
  networkType: z.enum(["RUPAY", "VISA", "MASTERCARD", "AMEX", "DINERS", "OTHER"]).optional(),
  networkTypes: z.array(z.enum(["RUPAY", "VISA", "MASTERCARD", "AMEX", "DINERS", "OTHER"])).optional(),
  categories: z.array(z.string()).optional(),

  // Eligibility
  minMonthlyIncome: moneySchema.optional(),
  maxMonthlyIncome: moneySchema.optional(),
  minAnnualIncome: moneySchema.optional(),
  minCibilScore: z.coerce.number().int().min(300).max(900).optional(),
  includeUndisclosedCibil: z.boolean().optional(),
  includeUndisclosedIncome: z.boolean().optional(),
  employmentTypes: z.array(z.string()).optional(),
  age: z.coerce.number().int().optional(),
  minAge: z.coerce.number().int().optional(),
  maxAge: z.coerce.number().int().optional(),
  minFdAmount: moneySchema.optional(),
  maxFdAmount: moneySchema.optional(),
  existingCustomerOnly: z.boolean().optional(),

  // Cost & Fees
  maxAnnualFee: moneySchema.optional(),
  minAnnualFee: moneySchema.optional(),
  maxJoiningFee: moneySchema.optional(),
  minJoiningFee: moneySchema.optional(),
  annualFeeRanges: z.array(z.string()).optional(),
  isLifetimeFree: z.boolean().optional(),
  hasFeeWaiver: z.boolean().optional(),
  maxForexMarkup: z.coerce.number().optional(),
  isZeroForex: z.boolean().optional(),

  // Rewards & Perks
  rewardTypes: z.array(z.enum(["CASHBACK", "REWARD_POINTS", "MILES"])).optional(),
  minCashbackPercent: z.coerce.number().optional(),

  // Use Cases
  hasUPI: z.boolean().optional(),
  hasLounge: z.boolean().optional(),
  hasDomesticLounge: z.boolean().optional(),
  hasIntlLounge: z.boolean().optional(),
  hasPriorityPass: z.boolean().optional(),
  hasForex: z.boolean().optional(),
  hasFuelBenefit: z.boolean().optional(),
  hasRailwayBenefit: z.boolean().optional(),
  hasTravelBenefit: z.boolean().optional(),
  hasHotelBenefit: z.boolean().optional(),
  hasDiningBenefit: z.boolean().optional(),
  hasShoppingBenefit: z.boolean().optional(),
  hasCoBrand: z.boolean().optional(),

  // Product Types
  consumerOrBusiness: z.enum(["CONSUMER", "BUSINESS", "CORPORATE", "BOTH"]).optional(),
  securedOrUnsecured: z.enum(["SECURED", "UNSECURED"]).optional(),
  isFDBacked: z.boolean().optional(),
  isMetal: z.boolean().optional(),
  isBusiness: z.boolean().optional(),

  // Status Lifecycle
  status: z.enum([
    "ACTIVE", "INVITE_ONLY", "RELATIONSHIP_ONLY",
    "EXISTING_CUSTOMERS_ONLY", "TEMPORARILY_UNAVAILABLE", "DISCONTINUED", "LEGACY",
  ]).optional(),
  statuses: z.array(z.enum([
    "ACTIVE", "INVITE_ONLY", "RELATIONSHIP_ONLY",
    "EXISTING_CUSTOMERS_ONLY", "TEMPORARILY_UNAVAILABLE", "DISCONTINUED", "LEGACY",
  ])).optional(),

  // Preference Constraints
  mustHave: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
  potentiallyEligibleOnly: z.boolean().optional(),

  // Sorting
  sort: z.enum(["relevance", "fee_low", "fee_high", "reward_high", "newest", "name"]).default("relevance"),
  ...paginationSchema.shape,
});

export type CardFilters = z.infer<typeof cardFilterSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type CreateIssuerInput = z.infer<typeof createIssuerSchema>;
export type RecommendInput = z.infer<typeof recommendSchema>;
export type CalculatorInput = z.infer<typeof calculatorSchema>;
