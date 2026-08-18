/**
 * CardIntel — Controlled Vocabularies & Enums
 *
 * Every enum here corresponds to a Prisma enum in the database schema.
 * Keep in sync with prisma/schema/*.prisma files.
 */

// ---------------------------------------------------------------------------
// Card Lifecycle State Machine (Req #4, Addendum #23)
// ---------------------------------------------------------------------------
// DISCOVERED → UNDER_RESEARCH → VERIFIED → ACTIVE
// ACTIVE → TEMPORARILY_UNAVAILABLE → ACTIVE (reactivation)
// ACTIVE → EXISTING_CUSTOMERS_ONLY → DISCONTINUED → LEGACY
// ACTIVE → INVITE_ONLY → ACTIVE (reopened)
// DISCONTINUED → RELAUNCHED → ACTIVE
// ---------------------------------------------------------------------------

export enum CardStatus {
  DISCOVERED = "DISCOVERED",
  UNDER_RESEARCH = "UNDER_RESEARCH",
  VERIFIED = "VERIFIED",
  ACTIVE = "ACTIVE",
  INVITE_ONLY = "INVITE_ONLY",
  RELATIONSHIP_ONLY = "RELATIONSHIP_ONLY",
  EXISTING_CUSTOMERS_ONLY = "EXISTING_CUSTOMERS_ONLY",
  TEMPORARILY_UNAVAILABLE = "TEMPORARILY_UNAVAILABLE",
  LIMITED_AVAILABILITY = "LIMITED_AVAILABILITY",
  DISCONTINUED = "DISCONTINUED",
  RELAUNCHED = "RELAUNCHED",
  LEGACY = "LEGACY",
  UNKNOWN = "UNKNOWN",
}

/** Valid status transitions */
export const CARD_STATUS_TRANSITIONS: Record<CardStatus, CardStatus[]> = {
  [CardStatus.DISCOVERED]: [CardStatus.UNDER_RESEARCH],
  [CardStatus.UNDER_RESEARCH]: [CardStatus.VERIFIED, CardStatus.UNKNOWN],
  [CardStatus.VERIFIED]: [CardStatus.ACTIVE, CardStatus.UNDER_RESEARCH],
  [CardStatus.ACTIVE]: [
    CardStatus.TEMPORARILY_UNAVAILABLE,
    CardStatus.EXISTING_CUSTOMERS_ONLY,
    CardStatus.INVITE_ONLY,
    CardStatus.RELATIONSHIP_ONLY,
    CardStatus.LIMITED_AVAILABILITY,
    CardStatus.DISCONTINUED,
  ],
  [CardStatus.INVITE_ONLY]: [CardStatus.ACTIVE, CardStatus.DISCONTINUED],
  [CardStatus.RELATIONSHIP_ONLY]: [CardStatus.ACTIVE, CardStatus.DISCONTINUED],
  [CardStatus.EXISTING_CUSTOMERS_ONLY]: [
    CardStatus.ACTIVE,
    CardStatus.DISCONTINUED,
  ],
  [CardStatus.TEMPORARILY_UNAVAILABLE]: [
    CardStatus.ACTIVE,
    CardStatus.DISCONTINUED,
  ],
  [CardStatus.LIMITED_AVAILABILITY]: [
    CardStatus.ACTIVE,
    CardStatus.DISCONTINUED,
  ],
  [CardStatus.DISCONTINUED]: [CardStatus.RELAUNCHED, CardStatus.LEGACY],
  [CardStatus.RELAUNCHED]: [CardStatus.ACTIVE],
  [CardStatus.LEGACY]: [],
  [CardStatus.UNKNOWN]: [CardStatus.UNDER_RESEARCH],
};

/** Only these statuses are counted as "current active products" */
export const ACTIVE_STATUSES: CardStatus[] = [CardStatus.ACTIVE];

/** Statuses shown in "current cards" (includes limited availability) */
export const CURRENT_STATUSES: CardStatus[] = [
  CardStatus.ACTIVE,
  CardStatus.INVITE_ONLY,
  CardStatus.RELATIONSHIP_ONLY,
  CardStatus.EXISTING_CUSTOMERS_ONLY,
  CardStatus.LIMITED_AVAILABILITY,
];

// ---------------------------------------------------------------------------
// Issuer & Entity Types (Addendum #1)
// ---------------------------------------------------------------------------

export enum IssuerType {
  BANK = "BANK",
  SMALL_FINANCE_BANK = "SMALL_FINANCE_BANK",
  FOREIGN_BANK = "FOREIGN_BANK",
  NBFC = "NBFC",
  PAYMENT_BANK = "PAYMENT_BANK",
  COOPERATIVE_BANK = "COOPERATIVE_BANK",
  FINTECH = "FINTECH",
  MARKETPLACE = "MARKETPLACE",
  APP = "APP",
  PROGRAM_MANAGER = "PROGRAM_MANAGER",
  OTHER = "OTHER",
}

export enum RegulatoryStatus {
  RBI_REGULATED = "RBI_REGULATED",
  RBI_REGISTERED = "RBI_REGISTERED",
  NOT_REGULATED = "NOT_REGULATED",
  UNKNOWN = "UNKNOWN",
}

export enum EntityRelationshipType {
  LEGAL_ISSUER = "LEGAL_ISSUER",
  BRAND = "BRAND",
  PLATFORM = "PLATFORM",
  CO_BRAND_PARTNER = "CO_BRAND_PARTNER",
  LENDING_PARTNER = "LENDING_PARTNER",
  PROGRAM_MANAGER = "PROGRAM_MANAGER",
  UPI_APP = "UPI_APP",
}

// ---------------------------------------------------------------------------
// Card Product Types (Req #9) — allow multiple per card
// ---------------------------------------------------------------------------

export enum CardProductType {
  STANDARD = "STANDARD",
  CASHBACK = "CASHBACK",
  REWARDS = "REWARDS",
  TRAVEL = "TRAVEL",
  AIRLINE = "AIRLINE",
  HOTEL = "HOTEL",
  FUEL = "FUEL",
  SHOPPING = "SHOPPING",
  DINING = "DINING",
  RAILWAY = "RAILWAY",
  FOREX = "FOREX",
  PREMIUM = "PREMIUM",
  SUPER_PREMIUM = "SUPER_PREMIUM",
  METAL = "METAL",
  UPI = "UPI",
  SECURED = "SECURED",
  FD_BACKED = "FD_BACKED",
  BUSINESS = "BUSINESS",
  CORPORATE = "CORPORATE",
  SALARY = "SALARY",
  DEFENCE = "DEFENCE",
  STUDENT = "STUDENT",
  ENTRY_LEVEL = "ENTRY_LEVEL",
  LIFESTYLE = "LIFESTYLE",
  ENTERTAINMENT = "ENTERTAINMENT",
  CO_BRANDED = "CO_BRANDED",
  FINTECH = "FINTECH",
  VIRTUAL = "VIRTUAL",
  OTHER = "OTHER",
}

// ---------------------------------------------------------------------------
// Card Segment
// ---------------------------------------------------------------------------

export enum ConsumerOrBusiness {
  CONSUMER = "CONSUMER",
  BUSINESS = "BUSINESS",
  CORPORATE = "CORPORATE",
  BOTH = "BOTH",
}

export enum SecuredOrUnsecured {
  SECURED = "SECURED",
  UNSECURED = "UNSECURED",
}

export enum PhysicalOrVirtual {
  PHYSICAL = "PHYSICAL",
  VIRTUAL = "VIRTUAL",
  BOTH = "BOTH",
}

// ---------------------------------------------------------------------------
// Network (Addendum #4)
// ---------------------------------------------------------------------------

export enum NetworkType {
  RUPAY = "RUPAY",
  VISA = "VISA",
  MASTERCARD = "MASTERCARD",
  AMEX = "AMEX",
  DINERS = "DINERS",
  OTHER = "OTHER",
}

// ---------------------------------------------------------------------------
// Fee Types (Req #10)
// ---------------------------------------------------------------------------

export enum FeeType {
  JOINING = "JOINING",
  ANNUAL = "ANNUAL",
  RENEWAL = "RENEWAL",
  ADDITIONAL_CARD = "ADDITIONAL_CARD",
  CASH_ADVANCE = "CASH_ADVANCE",
  CASH_PROCESSING = "CASH_PROCESSING",
  FOREIGN_CURRENCY_MARKUP = "FOREIGN_CURRENCY_MARKUP",
  DYNAMIC_CURRENCY_CONVERSION = "DYNAMIC_CURRENCY_CONVERSION",
  RENT_TRANSACTION = "RENT_TRANSACTION",
  EDUCATION_TRANSACTION = "EDUCATION_TRANSACTION",
  WALLET_LOAD = "WALLET_LOAD",
  FUEL_SURCHARGE = "FUEL_SURCHARGE",
  BALANCE_TRANSFER = "BALANCE_TRANSFER",
  EMI_PROCESSING = "EMI_PROCESSING",
  LATE_PAYMENT = "LATE_PAYMENT",
  OVERLIMIT = "OVERLIMIT",
  CASH_WITHDRAWAL = "CASH_WITHDRAWAL",
  REWARD_REVERSAL = "REWARD_REVERSAL",
  INTERNATIONAL_TRANSACTION = "INTERNATIONAL_TRANSACTION",
  GST = "GST",
  STATEMENT = "STATEMENT",
  CARD_REPLACEMENT = "CARD_REPLACEMENT",
  CHEQUE_BOUNCE = "CHEQUE_BOUNCE",
  OTHER = "OTHER",
}

export enum FeeWaiverType {
  SPEND_BASED = "SPEND_BASED",
  RELATIONSHIP_BASED = "RELATIONSHIP_BASED",
  PROMOTIONAL = "PROMOTIONAL",
  LIFETIME_FREE = "LIFETIME_FREE",
  CONDITIONAL = "CONDITIONAL",
  NONE = "NONE",
}

// ---------------------------------------------------------------------------
// Reward & Cashback (Req #12, #13)
// ---------------------------------------------------------------------------

export enum RewardCurrencyType {
  REWARD_POINTS = "REWARD_POINTS",
  CASHBACK = "CASHBACK",
  MILES = "MILES",
  AIRLINE_MILES = "AIRLINE_MILES",
  HOTEL_POINTS = "HOTEL_POINTS",
  COINS = "COINS",
  VOUCHERS = "VOUCHERS",
  STATEMENT_CREDIT = "STATEMENT_CREDIT",
  UPI_REWARDS = "UPI_REWARDS",
  MERCHANT_SPECIFIC = "MERCHANT_SPECIFIC",
}

export enum RedemptionType {
  VOUCHER = "VOUCHER",
  STATEMENT_CREDIT = "STATEMENT_CREDIT",
  TRAVEL = "TRAVEL",
  AIRLINE_TRANSFER = "AIRLINE_TRANSFER",
  HOTEL_TRANSFER = "HOTEL_TRANSFER",
  MERCHANDISE = "MERCHANDISE",
  CASHBACK = "CASHBACK",
  UPI_CASHBACK = "UPI_CASHBACK",
  GIFT_CARD = "GIFT_CARD",
  OTHER = "OTHER",
}

export enum SpendCategory {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  GROCERY = "GROCERY",
  FUEL = "FUEL",
  DINING = "DINING",
  FOOD_DELIVERY = "FOOD_DELIVERY",
  TRAVEL = "TRAVEL",
  FLIGHTS = "FLIGHTS",
  HOTELS = "HOTELS",
  RAILWAY = "RAILWAY",
  ENTERTAINMENT = "ENTERTAINMENT",
  SUBSCRIPTIONS = "SUBSCRIPTIONS",
  SHOPPING = "SHOPPING",
  FASHION = "FASHION",
  ELECTRONICS = "ELECTRONICS",
  UTILITIES = "UTILITIES",
  INSURANCE = "INSURANCE",
  EDUCATION = "EDUCATION",
  RENT = "RENT",
  WALLET = "WALLET",
  UPI = "UPI",
  EMI = "EMI",
  INTERNATIONAL = "INTERNATIONAL",
  AMAZON = "AMAZON",
  FLIPKART = "FLIPKART",
  MYNTRA = "MYNTRA",
  SWIGGY = "SWIGGY",
  ZOMATO = "ZOMATO",
  PHARMACY = "PHARMACY",
  GOVERNMENT = "GOVERNMENT",
  TELECOM = "TELECOM",
  ALL = "ALL",
  OTHER = "OTHER",
}

// ---------------------------------------------------------------------------
// Source & Verification (Req #29, Addendum #7-9)
// ---------------------------------------------------------------------------

export enum SourceType {
  OFFICIAL_BANK_PAGE = "OFFICIAL_BANK_PAGE",
  OFFICIAL_FEE_SCHEDULE = "OFFICIAL_FEE_SCHEDULE",
  OFFICIAL_TERMS = "OFFICIAL_TERMS",
  OFFICIAL_MITC = "OFFICIAL_MITC",
  OFFICIAL_APPLICATION_PAGE = "OFFICIAL_APPLICATION_PAGE",
  RBI = "RBI",
  NPCI = "NPCI",
  ANNUAL_REPORT = "ANNUAL_REPORT",
  INVESTOR_PRESENTATION = "INVESTOR_PRESENTATION",
  SECONDARY_REPUTABLE_SOURCE = "SECONDARY_REPUTABLE_SOURCE",
  REGULATORY_NOTICE = "REGULATORY_NOTICE",
  EXTERNAL_DATABASE = "EXTERNAL_DATABASE",
}

export enum VerificationStatus {
  VERIFIED = "VERIFIED",
  UNVERIFIED = "UNVERIFIED",
  PENDING_REVIEW = "PENDING_REVIEW",
  CONFLICT_REQUIRES_REVIEW = "CONFLICT_REQUIRES_REVIEW",
  STALE = "STALE",
  REJECTED = "REJECTED",
}

export enum SourceHealthStatus {
  ACTIVE = "ACTIVE",
  HTTP_ERROR = "HTTP_ERROR",
  REDIRECT = "REDIRECT",
  REMOVED = "REMOVED",
  LOGIN_REQUIRED = "LOGIN_REQUIRED",
  BLOCKED = "BLOCKED",
  UNKNOWN = "UNKNOWN",
}

// ---------------------------------------------------------------------------
// Field State (Addendum #12 — user's requirement)
// ---------------------------------------------------------------------------

export enum FieldState {
  KNOWN = "KNOWN",
  NOT_DISCLOSED = "NOT_DISCLOSED",
  NOT_APPLICABLE = "NOT_APPLICABLE",
  CONDITIONAL = "CONDITIONAL",
  CONFLICTING = "CONFLICTING",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  UNKNOWN = "UNKNOWN",
}

// ---------------------------------------------------------------------------
// Data Freshness (Addendum #37)
// ---------------------------------------------------------------------------

export enum FreshnessScore {
  FRESH = "FRESH", // < 30 days
  RECENT = "RECENT", // 30-60 days
  STALE = "STALE", // 60-90 days
  VERY_STALE = "VERY_STALE", // > 90 days
  UNKNOWN = "UNKNOWN",
}

// ---------------------------------------------------------------------------
// Change Event Types (Addendum #13)
// ---------------------------------------------------------------------------

export enum ChangeEventType {
  FEE_INCREASE = "FEE_INCREASE",
  FEE_DECREASE = "FEE_DECREASE",
  REWARD_DEVALUATION = "REWARD_DEVALUATION",
  REWARD_ENHANCEMENT = "REWARD_ENHANCEMENT",
  LOUNGE_REDUCTION = "LOUNGE_REDUCTION",
  LOUNGE_ENHANCEMENT = "LOUNGE_ENHANCEMENT",
  FOREX_CHANGE = "FOREX_CHANGE",
  UPI_CHANGE = "UPI_CHANGE",
  CASHBACK_CHANGE = "CASHBACK_CHANGE",
  MILESTONE_CHANGE = "MILESTONE_CHANGE",
  WELCOME_BONUS_CHANGE = "WELCOME_BONUS_CHANGE",
  EXCLUSION_ADDED = "EXCLUSION_ADDED",
  EXCLUSION_REMOVED = "EXCLUSION_REMOVED",
  TRANSFER_RATIO_CHANGE = "TRANSFER_RATIO_CHANGE",
  CARD_LAUNCHED = "CARD_LAUNCHED",
  CARD_DISCONTINUED = "CARD_DISCONTINUED",
  CARD_REOPENED = "CARD_REOPENED",
  CARD_RELAUNCHED = "CARD_RELAUNCHED",
  NETWORK_CHANGE = "NETWORK_CHANGE",
  COBRAND_CHANGE = "COBRAND_CHANGE",
  ELIGIBILITY_CHANGE = "ELIGIBILITY_CHANGE",
  STATUS_CHANGE = "STATUS_CHANGE",
  INSURANCE_CHANGE = "INSURANCE_CHANGE",
  OTHER = "OTHER",
}

// ---------------------------------------------------------------------------
// Promotional Offer Layer (Addendum #14)
// ---------------------------------------------------------------------------

export enum OfferType {
  BASE_PRODUCT = "BASE_PRODUCT",
  CURRENT_PROMOTION = "CURRENT_PROMOTION",
  TARGETED_OFFER = "TARGETED_OFFER",
  PREQUALIFIED_OFFER = "PREQUALIFIED_OFFER",
  BANK_CHANNEL_OFFER = "BANK_CHANNEL_OFFER",
  MARKETPLACE_OFFER = "MARKETPLACE_OFFER",
  LIMITED_TIME_OFFER = "LIMITED_TIME_OFFER",
}

// ---------------------------------------------------------------------------
// Application Channel (Addendum #16)
// ---------------------------------------------------------------------------

export enum ApplicationChannel {
  BANK_WEBSITE = "BANK_WEBSITE",
  BANK_APP = "BANK_APP",
  BRANCH = "BRANCH",
  PARTNER_APP = "PARTNER_APP",
  FINTECH_APP = "FINTECH_APP",
  MARKETPLACE = "MARKETPLACE",
  PREQUALIFIED = "PREQUALIFIED",
  RELATIONSHIP_MANAGER = "RELATIONSHIP_MANAGER",
}

// ---------------------------------------------------------------------------
// Ranking & Affiliate (Addendum #17)
// ---------------------------------------------------------------------------

export enum RankingReason {
  SPONSORED = "SPONSORED",
  AFFILIATE = "AFFILIATE",
  EDITORIAL = "EDITORIAL",
  ALGORITHMIC = "ALGORITHMIC",
}

// ---------------------------------------------------------------------------
// Research Pipeline (Req #60)
// ---------------------------------------------------------------------------

export enum ResearchStatus {
  DISCOVERED = "DISCOVERED",
  EXTRACTED = "EXTRACTED",
  NORMALIZED = "NORMALIZED",
  SOURCE_ATTACHED = "SOURCE_ATTACHED",
  AI_CHECKED = "AI_CHECKED",
  HUMAN_REVIEW = "HUMAN_REVIEW",
  APPROVED = "APPROVED",
  PUBLISHED = "PUBLISHED",
  REJECTED = "REJECTED",
}

export enum ResearchJobType {
  ISSUER_RESEARCH = "ISSUER_RESEARCH",
  PRODUCT_DISCOVERY = "PRODUCT_DISCOVERY",
  SOURCE_CHECK = "SOURCE_CHECK",
  FEE_RECHECK = "FEE_RECHECK",
  BENEFIT_RECHECK = "BENEFIT_RECHECK",
  LINK_CHECK = "LINK_CHECK",
  DUPLICATE_SCAN = "DUPLICATE_SCAN",
  CHANGE_DETECTION = "CHANGE_DETECTION",
  SEO_REFRESH = "SEO_REFRESH",
  FINTECH_DISCOVERY = "FINTECH_DISCOVERY",
  LEGACY_DISCOVERY = "LEGACY_DISCOVERY",
}

export enum ResearchJobStatus {
  QUEUED = "QUEUED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  RETRYING = "RETRYING",
  CANCELLED = "CANCELLED",
}

// ---------------------------------------------------------------------------
// Research Coverage (Req #51)
// ---------------------------------------------------------------------------

export enum IssuerCoverageStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  PARTIALLY_COVERED = "PARTIALLY_COVERED",
  FULLY_RESEARCHED = "FULLY_RESEARCHED",
  NEEDS_REVERIFICATION = "NEEDS_REVERIFICATION",
}

// ---------------------------------------------------------------------------
// Claim & Conflict (Addendum #9-10)
// ---------------------------------------------------------------------------

export enum ClaimType {
  FEE = "FEE",
  REWARD = "REWARD",
  CASHBACK = "CASHBACK",
  BENEFIT = "BENEFIT",
  LOUNGE = "LOUNGE",
  ELIGIBILITY = "ELIGIBILITY",
  STATUS = "STATUS",
  INSURANCE = "INSURANCE",
  FOREX = "FOREX",
  UPI = "UPI",
  FUEL = "FUEL",
  RAILWAY = "RAILWAY",
  HOTEL = "HOTEL",
  TRAVEL = "TRAVEL",
  WELCOME = "WELCOME",
  MILESTONE = "MILESTONE",
  EXCLUSION = "EXCLUSION",
  TRANSFER_PARTNER = "TRANSFER_PARTNER",
  OTHER = "OTHER",
}

export enum ConflictStatus {
  DETECTED = "DETECTED",
  SOURCE_PRIORITY_CHECK = "SOURCE_PRIORITY_CHECK",
  DATE_CHECK = "DATE_CHECK",
  HUMAN_REVIEW = "HUMAN_REVIEW",
  RESOLVED = "RESOLVED",
  PUBLISHED = "PUBLISHED",
}

// ---------------------------------------------------------------------------
// Confidence (Addendum #73)
// ---------------------------------------------------------------------------

export enum ConfidenceLevel {
  HIGH = "HIGH", // 95-100
  MEDIUM = "MEDIUM", // 80-94
  LOW = "LOW", // 60-79
  REVIEW = "REVIEW", // < 60
}

// ---------------------------------------------------------------------------
// Admin & Audit
// ---------------------------------------------------------------------------

export enum AdminRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  VIEWER = "VIEWER",
}

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  VERIFY = "VERIFY",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
  IMPORT = "IMPORT",
  MERGE = "MERGE",
  RESOLVE_CONFLICT = "RESOLVE_CONFLICT",
}

// ---------------------------------------------------------------------------
// Employment & Eligibility
// ---------------------------------------------------------------------------

export enum EmploymentType {
  SALARIED = "SALARIED",
  SELF_EMPLOYED = "SELF_EMPLOYED",
  BUSINESS = "BUSINESS",
  PROFESSIONAL = "PROFESSIONAL",
  STUDENT = "STUDENT",
  RETIRED = "RETIRED",
  HOMEMAKER = "HOMEMAKER",
  DEFENCE = "DEFENCE",
  GOVERNMENT = "GOVERNMENT",
  NRI = "NRI",
  ANY = "ANY",
}

// ---------------------------------------------------------------------------
// Insurance Benefit Types
// ---------------------------------------------------------------------------

export enum InsuranceBenefitType {
  AIR_ACCIDENT = "AIR_ACCIDENT",
  TRAVEL_INSURANCE = "TRAVEL_INSURANCE",
  PURCHASE_PROTECTION = "PURCHASE_PROTECTION",
  LOST_CARD_LIABILITY = "LOST_CARD_LIABILITY",
  FRAUD_PROTECTION = "FRAUD_PROTECTION",
  BAGGAGE = "BAGGAGE",
  PERSONAL_ACCIDENT = "PERSONAL_ACCIDENT",
  MEDICAL = "MEDICAL",
  RENTAL_CAR = "RENTAL_CAR",
  TRIP_CANCELLATION = "TRIP_CANCELLATION",
  OTHER = "OTHER",
}

// ---------------------------------------------------------------------------
// Lounge Programs
// ---------------------------------------------------------------------------

export enum LoungeProgram {
  PRIORITY_PASS = "PRIORITY_PASS",
  DREAMFOLKS = "DREAMFOLKS",
  MASTERCARD_LOUNGE = "MASTERCARD_LOUNGE",
  VISA_LOUNGE = "VISA_LOUNGE",
  RUPAY_LOUNGE = "RUPAY_LOUNGE",
  DINERS_CLUB = "DINERS_CLUB",
  AMEX_LOUNGE = "AMEX_LOUNGE",
  ISSUER_SPECIFIC = "ISSUER_SPECIFIC",
  OTHER = "OTHER",
}

// ---------------------------------------------------------------------------
// Product Exclusion Categories (Addendum #65)
// ---------------------------------------------------------------------------

export enum ExclusionCategory {
  DEBIT_CARD = "DEBIT_CARD",
  PREPAID_CARD = "PREPAID_CARD",
  WALLET = "WALLET",
  BNPL = "BNPL",
  CREDIT_LINE = "CREDIT_LINE",
  LOAN = "LOAN",
  PAY_LATER = "PAY_LATER",
  GIFT_CARD = "GIFT_CARD",
  STORED_VALUE_CARD = "STORED_VALUE_CARD",
}

// ---------------------------------------------------------------------------
// AI Model Router (User's requirement #17)
// ---------------------------------------------------------------------------

export enum AITaskType {
  ARCHITECTURE_REVIEW = "ARCHITECTURE_REVIEW",
  SOURCE_DISCOVERY = "SOURCE_DISCOVERY",
  WEB_EXTRACTION = "WEB_EXTRACTION",
  PDF_EXTRACTION = "PDF_EXTRACTION",
  ENTITY_MATCHING = "ENTITY_MATCHING",
  DEDUPLICATION = "DEDUPLICATION",
  SOURCE_CONFLICT = "SOURCE_CONFLICT",
  CARD_CLASSIFICATION = "CARD_CLASSIFICATION",
  NATURAL_LANGUAGE_SEARCH = "NATURAL_LANGUAGE_SEARCH",
  RECOMMENDATION_EXPLANATION = "RECOMMENDATION_EXPLANATION",
  SEO_GENERATION = "SEO_GENERATION",
  FINAL_QA = "FINAL_QA",
}

// ---------------------------------------------------------------------------
// Recommendation Score Dimensions (Addendum #18)
// ---------------------------------------------------------------------------

export enum ScoreDimension {
  CASHBACK = "CASHBACK",
  REWARDS = "REWARDS",
  TRAVEL = "TRAVEL",
  UPI = "UPI",
  FUEL = "FUEL",
  RAILWAY = "RAILWAY",
  HOTEL = "HOTEL",
  FOREX = "FOREX",
  LOUNGE = "LOUNGE",
  FEE_EFFICIENCY = "FEE_EFFICIENCY",
  ELIGIBILITY = "ELIGIBILITY",
  OVERALL_FIT = "OVERALL_FIT",
}

// ---------------------------------------------------------------------------
// Calculation Scenario (Addendum #20)
// ---------------------------------------------------------------------------

export enum CalculationScenario {
  CONSERVATIVE = "CONSERVATIVE",
  BASE = "BASE",
  OPTIMISTIC = "OPTIMISTIC",
}

// ---------------------------------------------------------------------------
// Variant Types (Addendum #5)
// ---------------------------------------------------------------------------

export enum VariantType {
  NETWORK = "NETWORK",
  ACQUISITION = "ACQUISITION",
  CAMPAIGN = "CAMPAIGN",
}
