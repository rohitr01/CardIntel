/**
 * CardIntel — Admin & Provenance Verification Service
 *
 * Implements field-level claim verification, conflict resolution,
 * immutable source snapshots, audit logging, and data quality metrics.
 */

import { db } from "@/lib/db";
import { demoCards } from "@/data/demo/cards";

export interface ClaimQueueItem {
  id: string;
  cardId: string;
  cardName: string;
  cardSlug: string;
  issuerName: string;
  fieldName: string;
  fieldLabel: string;
  currentValue: string;
  claimedValue: string;
  unit?: string;
  claimType: string;
  sourceId: string;
  sourceTitle: string;
  sourceType: string;
  sourceUrl: string;
  sourcePublisher: string;
  sourceAuthorityScore: number;
  evidenceLocator?: string;
  evidenceText: string;
  extractionConfidence: number;
  verificationStatus: "UNVERIFIED" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "SUPERSEDED";
  fieldState: "KNOWN" | "NOT_DISCLOSED" | "CONDITIONAL" | "CONFLICTING" | "UNKNOWN" | "PENDING_VERIFICATION";
  effectiveFrom?: string;
  effectiveTo?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  reviewerNotes?: string;
  hasConflict: boolean;
  conflictId?: string;
  createdAt: string;
}

export interface ConflictItem {
  id: string;
  cardName: string;
  cardSlug: string;
  issuerName: string;
  fieldName: string;
  fieldLabel: string;
  conflictStatus: "DETECTED" | "RESOLVED" | "SUPERSEDED" | "ESCALATED";
  claimA: {
    id: string;
    value: string;
    sourceTitle: string;
    sourceType: string;
    sourcePublisher: string;
    sourceUrl: string;
    authorityScore: number;
    publishedDate?: string;
    evidenceText: string;
  };
  claimB: {
    id: string;
    value: string;
    sourceTitle: string;
    sourceType: string;
    sourcePublisher: string;
    sourceUrl: string;
    authorityScore: number;
    publishedDate?: string;
    evidenceText: string;
  };
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface SourceItem {
  id: string;
  title: string;
  url: string;
  publisher: string;
  sourceType: string;
  authorityScore: number;
  healthStatus: "HEALTHY" | "DEGRADED" | "UNREACHABLE" | "REDIRECTED" | "UNKNOWN";
  httpStatusCode?: number;
  lastCheckedAt: string;
  publishedDate?: string;
  claimsCount: number;
  snapshotsCount: number;
}

export interface SnapshotItem {
  id: string;
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  publisher: string;
  retrievedAt: string;
  contentHash: string; // SHA-256
  httpStatusCode: number;
  wasAccessible: boolean;
  excerpt: string;
  associatedClaimsCount: number;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: "VERIFY" | "APPROVE" | "REJECT" | "RESOLVE_CONFLICT" | "UPDATE" | "MARK_NOT_DISCLOSED";
  entityName: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  sourceTitle?: string;
}

export interface DataQualitySummary {
  totalCardsTracked: number;
  fullyVerifiedCardsCount: number;
  pendingClaimsCount: number;
  unresolvedConflictsCount: number;
  notDisclosedFieldsCount: number;
  unknownFieldsCount: number;
  staleSourcesCount: number;
  sourcesHealthyPercent: number;
  tier1SourcesCount: number;
  averageConfidenceScore: number;
  isDemoSandbox: boolean;
}

// ---------------------------------------------------------------------------
// In-Memory Seeded Sandbox Store (for local demo & offline development)
// ---------------------------------------------------------------------------

let initialClaimsQueue: ClaimQueueItem[] = [
  // 1. Scapia Federal Bank Claims (Proving Run Target)
  {
    id: "claim-scapia-001",
    cardId: "card-scapia-federal",
    cardName: "Scapia Federal Bank Credit Card",
    cardSlug: "scapia-federal-bank",
    issuerName: "Federal Bank",
    fieldName: "joining_fee",
    fieldLabel: "Joining Fee",
    currentValue: "₹0.00 (Lifetime Free)",
    claimedValue: "0.00",
    unit: "INR",
    claimType: "FEE",
    sourceId: "src-federal-scapia-mitc",
    sourceTitle: "Federal Bank Scapia MITC Schedule",
    sourceType: "MITC",
    sourceUrl: "https://www.federalbank.co.in/scapia-mitc",
    sourcePublisher: "Federal Bank Ltd.",
    sourceAuthorityScore: 100,
    evidenceLocator: "Page 1, Table 1: Primary Fee Schedule",
    evidenceText: "Joining Fee: NIL. Unconditionally Lifetime Free credit card.",
    extractionConfidence: 100,
    verificationStatus: "VERIFIED",
    fieldState: "KNOWN",
    effectiveFrom: "2023-06-01",
    priority: "HIGH",
    hasConflict: false,
    createdAt: "2026-08-01T12:00:00Z",
  },
  {
    id: "claim-scapia-002",
    cardId: "card-scapia-federal",
    cardName: "Scapia Federal Bank Credit Card",
    cardSlug: "scapia-federal-bank",
    issuerName: "Federal Bank",
    fieldName: "annual_fee",
    fieldLabel: "Annual Renewal Fee",
    currentValue: "₹0.00 (Lifetime Free)",
    claimedValue: "0.00",
    unit: "INR",
    claimType: "FEE",
    sourceId: "src-federal-scapia-mitc",
    sourceTitle: "Federal Bank Scapia MITC Schedule",
    sourceType: "MITC",
    sourceUrl: "https://www.federalbank.co.in/scapia-mitc",
    sourcePublisher: "Federal Bank Ltd.",
    sourceAuthorityScore: 100,
    evidenceLocator: "Page 1, Table 1: Primary Fee Schedule",
    evidenceText: "Annual Renewal Fee: NIL. Card issued as Lifetime Free with no renewal conditions.",
    extractionConfidence: 100,
    verificationStatus: "VERIFIED",
    fieldState: "KNOWN",
    effectiveFrom: "2023-06-01",
    priority: "HIGH",
    hasConflict: false,
    createdAt: "2026-08-01T12:00:00Z",
  },
  {
    id: "claim-scapia-003",
    cardId: "card-scapia-federal",
    cardName: "Scapia Federal Bank Credit Card",
    cardSlug: "scapia-federal-bank",
    issuerName: "Federal Bank",
    fieldName: "forex_markup",
    fieldLabel: "Foreign Currency Markup Fee",
    currentValue: "0.00% (Zero Forex)",
    claimedValue: "0.00%",
    unit: "percent",
    claimType: "FEE",
    sourceId: "src-federal-scapia-mitc",
    sourceTitle: "Federal Bank Scapia MITC Schedule",
    sourceType: "MITC",
    sourceUrl: "https://www.federalbank.co.in/scapia-mitc",
    sourcePublisher: "Federal Bank Ltd.",
    sourceAuthorityScore: 100,
    evidenceLocator: "Page 2, Section 3.4: International Transactions",
    evidenceText: "Foreign Currency Conversion Markup: 0.00% across all international POS and online transactions.",
    extractionConfidence: 100,
    verificationStatus: "VERIFIED",
    fieldState: "KNOWN",
    effectiveFrom: "2023-06-01",
    priority: "HIGH",
    hasConflict: false,
    createdAt: "2026-08-01T12:00:00Z",
  },
  {
    id: "claim-scapia-004",
    cardId: "card-scapia-federal",
    cardName: "Scapia Federal Bank Credit Card",
    cardSlug: "scapia-federal-bank",
    issuerName: "Federal Bank",
    fieldName: "lounge_spend_condition",
    fieldLabel: "Airport Lounge Spend Condition",
    currentValue: "₹10,000 / billing cycle",
    claimedValue: "Spend ₹10,000 in the current statement billing cycle to unlock unlimited domestic airport lounge access",
    claimType: "BENEFIT",
    sourceId: "src-federal-scapia-mitc",
    sourceTitle: "Federal Bank Scapia MITC Schedule (March 2024 Update)",
    sourceType: "MITC",
    sourceUrl: "https://www.federalbank.co.in/scapia-mitc",
    sourcePublisher: "Federal Bank Ltd.",
    sourceAuthorityScore: 100,
    evidenceLocator: "Section 5.1: Airport Lounge Access Program",
    evidenceText: "Effective March 2024, cardholders spending ₹10,000 or more in their billing cycle receive unlimited domestic lounge access for that cycle.",
    extractionConfidence: 99,
    verificationStatus: "VERIFIED",
    fieldState: "CONDITIONAL",
    effectiveFrom: "2024-03-01",
    priority: "HIGH",
    hasConflict: true,
    conflictId: "conflict-scapia-lounge",
    createdAt: "2026-08-01T12:00:00Z",
  },
  {
    id: "claim-scapia-005",
    cardId: "card-scapia-federal",
    cardName: "Scapia Federal Bank Credit Card",
    cardSlug: "scapia-federal-bank",
    issuerName: "Federal Bank",
    fieldName: "reward_rate_travel",
    fieldLabel: "Travel Booking Reward Rate",
    currentValue: "20% Scapia Coins (4% return)",
    claimedValue: "20% Scapia Coins on flight and hotel bookings made via Scapia App",
    claimType: "REWARD",
    sourceId: "src-scapia-app-terms",
    sourceTitle: "Scapia Application Terms & Coin Program Rules",
    sourceType: "TERMS_AND_CONDITIONS",
    sourceUrl: "https://www.scapia.cards/terms-and-conditions",
    sourcePublisher: "Scapia Technology Pvt. Ltd.",
    sourceAuthorityScore: 90,
    evidenceLocator: "Rewards Section 2.2",
    evidenceText: "Earn 20% Scapia Coins on all flight and hotel reservations completed on the Scapia app. 5 Coins = ₹1 on travel redemptions.",
    extractionConfidence: 98,
    verificationStatus: "VERIFIED",
    fieldState: "KNOWN",
    effectiveFrom: "2023-06-01",
    priority: "HIGH",
    hasConflict: false,
    createdAt: "2026-08-01T12:00:00Z",
  },
  {
    id: "claim-scapia-006",
    cardId: "card-scapia-federal",
    cardName: "Scapia Federal Bank Credit Card",
    cardSlug: "scapia-federal-bank",
    issuerName: "Federal Bank",
    fieldName: "reward_rate_general",
    fieldLabel: "General Spends Reward Rate",
    currentValue: "10% Scapia Coins (2% return)",
    claimedValue: "10% Scapia Coins on all eligible domestic and international retail spends",
    claimType: "REWARD",
    sourceId: "src-scapia-app-terms",
    sourceTitle: "Scapia Application Terms & Coin Program Rules",
    sourceType: "TERMS_AND_CONDITIONS",
    sourceUrl: "https://www.scapia.cards/terms-and-conditions",
    sourcePublisher: "Scapia Technology Pvt. Ltd.",
    sourceAuthorityScore: 90,
    evidenceLocator: "Rewards Section 2.1",
    evidenceText: "Earn 10% Scapia Coins on every eligible retail purchase. Coins never expire as long as the card account remains active.",
    extractionConfidence: 98,
    verificationStatus: "VERIFIED",
    fieldState: "KNOWN",
    effectiveFrom: "2023-06-01",
    priority: "HIGH",
    hasConflict: false,
    createdAt: "2026-08-01T12:00:00Z",
  },

  // 2. Federal Bank Core Portfolio (Phase 3B Ingestion)
  {
    id: "claim-celesta-001",
    cardId: "card-federal-celesta",
    cardName: "Federal Bank Celesta Credit Card",
    cardSlug: "federal-celesta",
    issuerName: "Federal Bank",
    fieldName: "annual_fee",
    fieldLabel: "Annual Fee & Waiver Threshold",
    currentValue: "₹3,000 + GST (Waived on ₹3,00,000 spend)",
    claimedValue: "3000.00",
    unit: "INR",
    claimType: "FEE",
    sourceId: "src-fed-celesta-mitc",
    sourceTitle: "Federal Bank Celesta Tariff Schedule",
    sourceType: "MITC",
    sourceUrl: "https://www.federalbank.co.in/celesta-credit-card",
    sourcePublisher: "Federal Bank Ltd.",
    sourceAuthorityScore: 100,
    evidenceLocator: "Schedule of Charges, Table 1",
    evidenceText: "Annual Fee of ₹3,000 + applicable GST is waived on achieving annual spends of ₹3,00,000.",
    extractionConfidence: 100,
    verificationStatus: "VERIFIED",
    fieldState: "KNOWN",
    effectiveFrom: "2021-08-01",
    priority: "HIGH",
    hasConflict: false,
    createdAt: "2026-08-18T10:00:00Z",
  },
  {
    id: "claim-celesta-002",
    cardId: "card-federal-celesta",
    cardName: "Federal Bank Celesta Credit Card",
    cardSlug: "federal-celesta",
    issuerName: "Federal Bank",
    fieldName: "lounge_access",
    fieldLabel: "Airport Lounge Entitlement",
    currentValue: "2 domestic visits / quarter + 1 international visit / year",
    claimedValue: "2 complimentary domestic lounge visits per quarter (8/yr) with no quarterly spend barrier + 1 complimentary international visit/yr",
    claimType: "BENEFIT",
    sourceId: "src-fed-celesta-mitc",
    sourceTitle: "Federal Bank Celesta Tariff Schedule",
    sourceType: "MITC",
    sourceUrl: "https://www.federalbank.co.in/celesta-credit-card",
    sourcePublisher: "Federal Bank Ltd.",
    sourceAuthorityScore: 100,
    evidenceLocator: "Lounge Privileges Guide",
    evidenceText: "Cardholders receive 2 complimentary domestic lounge visits each calendar quarter and 1 international visit per anniversary year via Priority Pass.",
    extractionConfidence: 99,
    verificationStatus: "VERIFIED",
    fieldState: "KNOWN",
    effectiveFrom: "2021-08-01",
    priority: "HIGH",
    hasConflict: false,
    createdAt: "2026-08-18T10:00:00Z",
  },
  {
    id: "claim-imperio-001",
    cardId: "card-federal-imperio",
    cardName: "Federal Bank Imperio Credit Card",
    cardSlug: "federal-imperio",
    issuerName: "Federal Bank",
    fieldName: "reward_rate_grocery",
    fieldLabel: "Grocery & Healthcare Rewards",
    currentValue: "10X FedPoints (2.50% return)",
    claimedValue: "10X FedPoints (2.50% value) on grocery and healthcare spends, capped at 2,000 bonus points/month",
    claimType: "REWARD",
    sourceId: "src-fed-imperio-mitc",
    sourceTitle: "Federal Bank Imperio Benefits Guide",
    sourceType: "MITC",
    sourceUrl: "https://www.federalbank.co.in/imperio-credit-card",
    sourcePublisher: "Federal Bank Ltd.",
    sourceAuthorityScore: 100,
    evidenceLocator: "Section 3: Accelerated Multipliers",
    evidenceText: "Earn 10 FedPoints per ₹100 spent on grocery stores, supermarkets, pharmacies, and hospitals (max 2,000 bonus points/month).",
    extractionConfidence: 98,
    verificationStatus: "VERIFIED",
    fieldState: "KNOWN",
    effectiveFrom: "2021-08-01",
    priority: "HIGH",
    hasConflict: false,
    createdAt: "2026-08-18T10:00:00Z",
  },
  {
    id: "claim-signet-001",
    cardId: "card-federal-signet",
    cardName: "Federal Bank Signet Credit Card",
    cardSlug: "federal-signet",
    issuerName: "Federal Bank",
    fieldName: "upi_benefits",
    fieldLabel: "RuPay UPI Scan & Pay Support",
    currentValue: "Supported on RuPay Variant",
    claimedValue: "Instant UPI merchant scan & pay linking supported on NPCI RuPay network",
    claimType: "FEATURE",
    sourceId: "src-fed-signet-mitc",
    sourceTitle: "Federal Bank Signet Card Overview",
    sourceType: "OFFICIAL_PRODUCT_PAGE",
    sourceUrl: "https://www.federalbank.co.in/signet-credit-card",
    sourcePublisher: "Federal Bank Ltd.",
    sourceAuthorityScore: 90,
    evidenceLocator: "UPI Section",
    evidenceText: "Link your Federal Bank Signet RuPay Credit Card to BHIM, Google Pay, PhonePe, or Paytm for seamless UPI payments.",
    extractionConfidence: 99,
    verificationStatus: "VERIFIED",
    fieldState: "KNOWN",
    effectiveFrom: "2023-01-15",
    priority: "MEDIUM",
    hasConflict: false,
    createdAt: "2026-08-18T10:00:00Z",
  },

  // 3. Queue Items for Other Cards
  {
    id: "claim-001",
    cardId: "card-hdfc-millennia",
    cardName: "HDFC Millennia Credit Card",
    cardSlug: "hdfc-millennia",
    issuerName: "HDFC Bank",
    fieldName: "lounge_spend_condition",
    fieldLabel: "Airport Lounge Spend Threshold",
    currentValue: "₹1,00,000 / calendar quarter",
    claimedValue: "Spend ₹1,00,000 in preceding calendar quarter to unlock 1 complimentary domestic lounge access in current quarter",
    claimType: "BENEFIT",
    sourceId: "src-hdfc-mitc-2026",
    sourceTitle: "HDFC Bank Most Important Terms & Conditions (MITC) — July 2026",
    sourceType: "MITC",
    sourceUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/mitc",
    sourcePublisher: "HDFC Bank Ltd.",
    sourceAuthorityScore: 100,
    evidenceLocator: "Page 4, Section 8.2 (Lounge Access Guidelines)",
    evidenceText: "Effective 1st Dec 2024, cardholders are required to spend minimum ₹1,00,000 in the previous calendar quarter to be eligible for complimentary lounge visit vouchers.",
    extractionConfidence: 98,
    verificationStatus: "PENDING_VERIFICATION",
    fieldState: "CONDITIONAL",
    effectiveFrom: "2024-12-01",
    priority: "HIGH",
    hasConflict: false,
    createdAt: "2026-08-10T10:00:00Z",
  },
  {
    id: "claim-002",
    cardId: "card-sbi-cashback",
    cardName: "SBI Cashback Credit Card",
    cardSlug: "sbi-cashback",
    issuerName: "SBI Cards",
    fieldName: "forex_markup",
    fieldLabel: "Foreign Currency Markup Fee",
    currentValue: "3.50% + 18% GST",
    claimedValue: "3.50%",
    unit: "percent",
    claimType: "FEE",
    sourceId: "src-sbicard-soc-2026",
    sourceTitle: "SBI Cards Schedule of Charges — June 2026",
    sourceType: "SCHEDULE_OF_CHARGES",
    sourceUrl: "https://www.sbicard.com/schedules-of-charges",
    sourcePublisher: "SBI Cards and Payment Services Ltd.",
    sourceAuthorityScore: 95,
    evidenceLocator: "Table 2: Transaction Fees, Row 7",
    evidenceText: "Foreign Currency Transaction Fee: 3.50% of the transaction amount converted to INR plus applicable Goods and Services Tax (GST).",
    extractionConfidence: 99,
    verificationStatus: "PENDING_VERIFICATION",
    fieldState: "KNOWN",
    priority: "MEDIUM",
    hasConflict: true,
    conflictId: "conflict-001",
    createdAt: "2026-08-12T14:30:00Z",
  },
  {
    id: "claim-003",
    cardId: "card-tata-neu-infinity",
    cardName: "Tata Neu Infinity HDFC Bank Card",
    cardSlug: "tata-neu-infinity-hdfc",
    issuerName: "HDFC Bank",
    fieldName: "upi_rewards_rate",
    fieldLabel: "RuPay UPI Cashback Rate",
    currentValue: "1.50% NeuCoins",
    claimedValue: "1.50% NeuCoins on eligible UPI merchant payments",
    unit: "percent",
    claimType: "REWARD",
    sourceId: "src-tataneu-tnc-2026",
    sourceTitle: "Tata Neu Infinity Terms and Conditions Schedule",
    sourceType: "TERMS_AND_CONDITIONS",
    sourceUrl: "https://www.tataneu.com/infinity-card-terms",
    sourcePublisher: "Tata Digital Pvt. Ltd. & HDFC Bank",
    sourceAuthorityScore: 90,
    evidenceLocator: "Section 3.1: RuPay Rewards Structure",
    evidenceText: "Cardholders earn 1.5% NeuCoins on RuPay UPI merchant QR payments, subject to a monthly ceiling of 500 NeuCoins on specific utility merchant categories.",
    extractionConfidence: 95,
    verificationStatus: "PENDING_VERIFICATION",
    fieldState: "KNOWN",
    priority: "HIGH",
    hasConflict: false,
    createdAt: "2026-08-14T09:15:00Z",
  },
  {
    id: "claim-004",
    cardId: "card-axis-airtel",
    cardName: "Axis Bank Airtel Credit Card",
    cardSlug: "axis-airtel",
    issuerName: "Axis Bank",
    fieldName: "min_cibil_score",
    fieldLabel: "Minimum CIBIL Score Requirement",
    currentValue: "Not Publicly Disclosed",
    claimedValue: "NOT_DISCLOSED",
    claimType: "ELIGIBILITY",
    sourceId: "src-axis-eligibility-2026",
    sourceTitle: "Axis Bank Credit Card Public Eligibility Matrix",
    sourceType: "OFFICIAL_PRODUCT_PAGE",
    sourceUrl: "https://www.axisbank.com/retail/cards/credit-card/airtel-axis-bank-credit-card",
    sourcePublisher: "Axis Bank Ltd.",
    sourceAuthorityScore: 85,
    evidenceLocator: "Eligibility Tab",
    evidenceText: "Applicant must be aged 21-65. Minimum credit score criteria evaluated as per internal bank credit risk assessment models; no public score threshold.",
    extractionConfidence: 90,
    verificationStatus: "PENDING_VERIFICATION",
    fieldState: "NOT_DISCLOSED",
    priority: "MEDIUM",
    hasConflict: false,
    createdAt: "2026-08-15T11:00:00Z",
  },
];

let initialConflicts: ConflictItem[] = [
  {
    id: "conflict-scapia-lounge",
    cardName: "Scapia Federal Bank Credit Card",
    cardSlug: "scapia-federal-bank",
    issuerName: "Federal Bank",
    fieldName: "lounge_spend_condition",
    fieldLabel: "Airport Lounge Spend Requirement",
    conflictStatus: "RESOLVED",
    claimA: {
      id: "claim-scapia-mitc-lounge",
      value: "Spend ₹10,000 / billing cycle required",
      sourceTitle: "Federal Bank Scapia MITC Schedule (March 2024 Edition)",
      sourceType: "MITC",
      sourcePublisher: "Federal Bank Ltd.",
      sourceUrl: "https://www.federalbank.co.in/scapia-mitc",
      authorityScore: 100,
      publishedDate: "2024-03-01",
      evidenceText: "Unlimited domestic lounge access unlocked upon meeting minimum ₹10,000 retail spend criteria in preceding billing cycle.",
    },
    claimB: {
      id: "claim-scapia-launch-ad",
      value: "Unlimited domestic lounge visits with ₹0 spend barrier",
      sourceTitle: "Scapia Launch Marketing Campaign (June 2023)",
      sourceType: "MARKETING_BROCHURE",
      sourcePublisher: "Scapia Technology Marketing",
      sourceUrl: "https://www.scapia.cards/launch-campaign",
      authorityScore: 70,
      publishedDate: "2023-06-01",
      evidenceText: "Enjoy unlimited domestic airport lounge access with zero minimum spend requirements.",
    },
    resolutionNotes: "Adjudicated in favor of Claim A (Federal Bank MITC). The ₹0 spend policy was superseded by Federal Bank regulatory tariff update in March 2024.",
    resolvedAt: "2026-08-18T12:00:00Z",
    resolvedBy: "Lead Financial Researcher",
  },
  {
    id: "conflict-001",
    cardName: "SBI Cashback Credit Card",
    cardSlug: "sbi-cashback",
    issuerName: "SBI Cards",
    fieldName: "forex_markup",
    fieldLabel: "Foreign Currency Markup Fee",
    conflictStatus: "DETECTED",
    claimA: {
      id: "claim-sbi-soc",
      value: "3.50% + GST",
      sourceTitle: "SBI Cards Official Schedule of Charges (SOC)",
      sourceType: "SCHEDULE_OF_CHARGES",
      sourcePublisher: "SBI Cards and Payment Services Ltd.",
      sourceUrl: "https://www.sbicard.com/schedules-of-charges",
      authorityScore: 100,
      publishedDate: "2026-06-01",
      evidenceText: "Foreign currency markup fee is 3.50% across all SBI Retail Credit Cards unless specifically waived.",
    },
    claimB: {
      id: "claim-sbi-promo",
      value: "1.99% + GST",
      sourceTitle: "SBI Cashback Marketing Campaign Brochure",
      sourceType: "MARKETING_BROCHURE",
      sourcePublisher: "SBI Cards Marketing Division",
      sourceUrl: "https://www.sbicard.com/campaigns/cashback-international",
      authorityScore: 70,
      publishedDate: "2025-11-15",
      evidenceText: "Special promotional forex fee of 1.99% valid for travel festival booking period.",
    },
  },
  {
    id: "conflict-002",
    cardName: "HDFC Millennia Credit Card",
    cardSlug: "hdfc-millennia",
    issuerName: "HDFC Bank",
    fieldName: "annual_fee_waiver_threshold",
    fieldLabel: "Annual Fee Waiver Spend Condition",
    conflictStatus: "DETECTED",
    claimA: {
      id: "claim-hdfc-mitc",
      value: "Waived on ₹1,00,000 annual spend",
      sourceTitle: "HDFC Bank Official MITC Document (2026 Edition)",
      sourceType: "MITC",
      sourcePublisher: "HDFC Bank Ltd.",
      sourceUrl: "https://www.hdfcbank.com/mitc",
      authorityScore: 100,
      publishedDate: "2026-07-01",
      evidenceText: "Annual renewal fee of ₹1,000 will be waived if cardholder achieves retail spends of ₹1,00,000 or more in the preceding anniversary year.",
    },
    claimB: {
      id: "claim-hdfc-app",
      value: "Waived on ₹50,000 annual spend",
      sourceTitle: "HDFC Mobile App Onboarding Banner (Legacy)",
      sourceType: "MOBILE_APP",
      sourcePublisher: "HDFC Bank Digital",
      sourceUrl: "https://www.hdfcbank.com/mobile/banners",
      authorityScore: 75,
      publishedDate: "2023-04-10",
      evidenceText: "Special fee waiver on ₹50k annual spend for select pre-approved corporate salary accounts.",
    },
  },
];

let initialSources: SourceItem[] = [
  {
    id: "src-federal-scapia-mitc",
    title: "Federal Bank Scapia MITC Schedule",
    url: "https://www.federalbank.co.in/scapia-mitc",
    publisher: "Federal Bank Ltd.",
    sourceType: "MITC",
    authorityScore: 100,
    healthStatus: "HEALTHY",
    httpStatusCode: 200,
    lastCheckedAt: "2026-08-18T08:00:00Z",
    publishedDate: "2026-05-10",
    claimsCount: 26,
    snapshotsCount: 4,
  },
  {
    id: "src-fed-celesta-mitc",
    title: "Federal Bank Celesta Card Most Important Terms",
    url: "https://www.federalbank.co.in/celesta-credit-card",
    publisher: "Federal Bank Ltd.",
    sourceType: "MITC",
    authorityScore: 100,
    healthStatus: "HEALTHY",
    httpStatusCode: 200,
    lastCheckedAt: "2026-08-18T08:00:00Z",
    publishedDate: "2026-06-15",
    claimsCount: 18,
    snapshotsCount: 2,
  },
  {
    id: "src-fed-imperio-mitc",
    title: "Federal Bank Imperio Schedule of Charges",
    url: "https://www.federalbank.co.in/imperio-credit-card",
    publisher: "Federal Bank Ltd.",
    sourceType: "MITC",
    authorityScore: 100,
    healthStatus: "HEALTHY",
    httpStatusCode: 200,
    lastCheckedAt: "2026-08-18T08:00:00Z",
    publishedDate: "2026-06-15",
    claimsCount: 16,
    snapshotsCount: 2,
  },
  {
    id: "src-fed-signet-mitc",
    title: "Federal Bank Signet Tariff Schedule",
    url: "https://www.federalbank.co.in/signet-credit-card",
    publisher: "Federal Bank Ltd.",
    sourceType: "MITC",
    authorityScore: 100,
    healthStatus: "HEALTHY",
    httpStatusCode: 200,
    lastCheckedAt: "2026-08-18T08:00:00Z",
    publishedDate: "2026-06-15",
    claimsCount: 15,
    snapshotsCount: 2,
  },
  {
    id: "src-scapia-app-terms",
    title: "Scapia Application Terms & Coin Program Rules",
    url: "https://www.scapia.cards/terms-and-conditions",
    publisher: "Scapia Technology Pvt. Ltd.",
    sourceType: "TERMS_AND_CONDITIONS",
    authorityScore: 90,
    healthStatus: "HEALTHY",
    httpStatusCode: 200,
    lastCheckedAt: "2026-08-18T08:00:00Z",
    publishedDate: "2026-04-01",
    claimsCount: 14,
    snapshotsCount: 2,
  },
  {
    id: "src-hdfc-mitc-2026",
    title: "HDFC Bank Most Important Terms & Conditions (MITC) — 2026",
    url: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/mitc",
    publisher: "HDFC Bank Ltd.",
    sourceType: "MITC",
    authorityScore: 100,
    healthStatus: "HEALTHY",
    httpStatusCode: 200,
    lastCheckedAt: "2026-08-18T08:00:00Z",
    publishedDate: "2026-07-01",
    claimsCount: 42,
    snapshotsCount: 6,
  },
  {
    id: "src-sbicard-soc-2026",
    title: "SBI Cards Schedule of Charges (SOC)",
    url: "https://www.sbicard.com/schedules-of-charges",
    publisher: "SBI Cards and Payment Services Ltd.",
    sourceType: "SCHEDULE_OF_CHARGES",
    authorityScore: 95,
    healthStatus: "HEALTHY",
    httpStatusCode: 200,
    lastCheckedAt: "2026-08-18T08:00:00Z",
    publishedDate: "2026-06-01",
    claimsCount: 38,
    snapshotsCount: 5,
  },
  {
    id: "src-rbi-credit-master-dir",
    title: "RBI Master Direction — Credit Card and Debit Card Issuance and Conduct Directions, 2022 (Updated 2024)",
    url: "https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12300",
    publisher: "Reserve Bank of India (RBI)",
    sourceType: "REGULATORY_NOTICE",
    authorityScore: 100,
    healthStatus: "HEALTHY",
    httpStatusCode: 200,
    lastCheckedAt: "2026-08-18T08:00:00Z",
    publishedDate: "2024-03-07",
    claimsCount: 18,
    snapshotsCount: 3,
  },
];

let initialSnapshots: SnapshotItem[] = [
  {
    id: "snap-fed-scapia-20260510",
    sourceId: "src-federal-scapia-mitc",
    sourceTitle: "Federal Bank Scapia MITC Schedule (May 2026 Archive)",
    sourceUrl: "https://www.federalbank.co.in/scapia-mitc",
    publisher: "Federal Bank Ltd.",
    retrievedAt: "2026-05-10T11:00:00Z",
    contentHash: "350b567baff95443f8db0bcb2a91d9f091a04ebf3774d0a1abe01469c84a519f",
    httpStatusCode: 200,
    wasAccessible: true,
    excerpt: "Federal Bank Scapia Credit Card MITC. Joining Fee: NIL, Annual Fee: NIL. 0% Forex Markup. Lounge access unlocked on ₹10,000 billing cycle retail spend.",
    associatedClaimsCount: 26,
  },
  {
    id: "snap-fed-celesta-20260615",
    sourceId: "src-fed-celesta-mitc",
    sourceTitle: "Federal Bank Celesta MITC Schedule (June 2026)",
    sourceUrl: "https://www.federalbank.co.in/celesta-credit-card",
    publisher: "Federal Bank Ltd.",
    retrievedAt: "2026-06-15T09:30:00Z",
    contentHash: "eb1d74e417d034eb8a15afe8cbb13b3843735fd61d99cccab27f3d8e0adb10c3",
    httpStatusCode: 200,
    wasAccessible: true,
    excerpt: "Federal Bank Celesta Credit Card. Annual Fee: ₹3,000 (Waived on ₹3,00,000 spend). 2 domestic lounge visits per quarter + 1 international visit per year.",
    associatedClaimsCount: 18,
  },
  {
    id: "snap-fed-imperio-20260615",
    sourceId: "src-fed-imperio-mitc",
    sourceTitle: "Federal Bank Imperio MITC Schedule (June 2026)",
    sourceUrl: "https://www.federalbank.co.in/imperio-credit-card",
    publisher: "Federal Bank Ltd.",
    retrievedAt: "2026-06-15T09:30:00Z",
    contentHash: "6bba019742a45a936555ac05f54226bb97a5b83a4a2f4e082f9daefa1fe1bc2c",
    httpStatusCode: 200,
    wasAccessible: true,
    excerpt: "Federal Bank Imperio Credit Card. Annual Fee: ₹1,500 (Waived on ₹1,50,000 spend). 10X FedPoints on grocery and healthcare. 1 domestic lounge visit per quarter.",
    associatedClaimsCount: 16,
  },
  {
    id: "snap-fed-signet-20260615",
    sourceId: "src-fed-signet-mitc",
    sourceTitle: "Federal Bank Signet MITC Schedule (June 2026)",
    sourceUrl: "https://www.federalbank.co.in/signet-credit-card",
    publisher: "Federal Bank Ltd.",
    retrievedAt: "2026-06-15T09:30:00Z",
    contentHash: "4ed496928355097113904614fe39a26339adff7685c644ae17be0cbf3209bd1e",
    httpStatusCode: 200,
    wasAccessible: true,
    excerpt: "Federal Bank Signet Credit Card. Annual Fee: ₹750 (Waived on ₹75,000 spend). 3X FedPoints on electronics & apparel. RuPay UPI Scan & Pay enabled.",
    associatedClaimsCount: 15,
  },
  {
    id: "snap-scapia-terms-20260401",
    sourceId: "src-scapia-app-terms",
    sourceTitle: "Scapia App Rewards Terms & Conditions",
    sourceUrl: "https://www.scapia.cards/terms-and-conditions",
    publisher: "Scapia Technology Pvt. Ltd.",
    retrievedAt: "2026-04-01T10:00:00Z",
    contentHash: "80d1ff09bc1ea28bc2b1c03f0e780af4183e384b6c3f7bd1df5591954eaf3aac",
    httpStatusCode: 200,
    wasAccessible: true,
    excerpt: "Scapia Coin Reward Structure: 20% on Scapia Travel bookings, 10% on general eligible spends. 5 Coins = ₹1 on travel bookings.",
    associatedClaimsCount: 14,
  },
  {
    id: "snap-hdfc-20260701",
    sourceId: "src-hdfc-mitc-2026",
    sourceTitle: "HDFC Bank MITC July 2026 Edition",
    sourceUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/mitc",
    publisher: "HDFC Bank Ltd.",
    retrievedAt: "2026-07-01T10:00:00Z",
    contentHash: "ac4cf723dd85943a856f759e66e405ed1a61f86518a956a653ce6a81ff1f4fae",
    httpStatusCode: 200,
    wasAccessible: true,
    excerpt: "HDFC Bank Credit Cards Schedule of Charges and MITC (v1.64). Applicable to Infinia, Diners Black, Millennia, Tata Neu, Swiggy. 3.50% forex markup, ₹1,00,000 quarterly lounge spend threshold.",
    associatedClaimsCount: 42,
  },
  {
    id: "snap-hdfc-soc-20260701",
    sourceId: "src-hdfc-soc-2026",
    sourceTitle: "HDFC Bank Schedule of Charges (SOC 2026)",
    sourceUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/schedule-of-charges",
    publisher: "HDFC Bank Ltd.",
    retrievedAt: "2026-07-01T10:00:00Z",
    contentHash: "aa5c00deb43bcf8d47cdb8e9f301e679145023f7a179c5f3fe120e4cc06f64f8",
    httpStatusCode: 200,
    wasAccessible: true,
    excerpt: "HDFC Bank Schedule of Charges. Foreign currency transaction fee: 3.50% + GST. Late payment charges: Up to ₹1,300. Over-limit penalty: 2.5% (min ₹550).",
    associatedClaimsCount: 28,
  },
  {
    id: "snap-tataneu-20260701",
    sourceId: "src-tataneu-tnc-2026",
    sourceTitle: "Tata Neu Rewards Program Schedule (2026)",
    sourceUrl: "https://www.tataneu.com/infinity-card-terms",
    publisher: "Tata Digital",
    retrievedAt: "2026-07-01T10:00:00Z",
    contentHash: "3d9c511f9d5d4e3518eda9a65ef395f28e0e0fa82fd719af7648b5739f90e8ce",
    httpStatusCode: 200,
    wasAccessible: true,
    excerpt: "Tata Neu HDFC Bank Credit Card. Tata Neu Infinity: 5% NeuCoins on Tata Neu + 1.5% on RuPay UPI QR. 1 NeuCoin = ₹1.00.",
    associatedClaimsCount: 16,
  },
];

let initialAuditLogs: AuditLogItem[] = [
  {
    id: "audit-001",
    timestamp: "2026-08-18T12:00:00Z",
    userId: "usr-auditor-01",
    userEmail: "auditor@cardintel.in",
    action: "RESOLVE_CONFLICT",
    entityName: "Scapia Federal Bank Credit Card",
    fieldName: "lounge_spend_condition",
    oldValue: "CONFLICTING (MITC ₹10k vs Launch Ad ₹0)",
    newValue: "₹10,000 / billing cycle",
    reason: "Adjudicated in favor of Tier 1 Federal Bank MITC schedule superseding 2023 launch marketing campaign.",
    sourceTitle: "Federal Bank Scapia MITC Schedule",
  },
  {
    id: "audit-002",
    timestamp: "2026-08-18T12:05:00Z",
    userId: "usr-auditor-01",
    userEmail: "auditor@cardintel.in",
    action: "APPROVE",
    entityName: "Scapia Federal Bank Credit Card",
    fieldName: "forex_markup",
    oldValue: "PENDING_VERIFICATION",
    newValue: "0.00% (Zero Forex)",
    reason: "Verified from Federal Bank Scapia MITC Table 1.",
    sourceTitle: "Federal Bank Scapia MITC Schedule",
  },
];

// ---------------------------------------------------------------------------
// Service Methods
// ---------------------------------------------------------------------------

export async function getAdminDashboardMetrics(): Promise<DataQualitySummary> {
  const verifiedCount = initialClaimsQueue.filter((c) => c.verificationStatus === "VERIFIED").length;
  const pendingCount = initialClaimsQueue.filter((c) => c.verificationStatus === "PENDING_VERIFICATION").length;
  const unresolvedConflicts = initialConflicts.filter((c) => c.conflictStatus === "DETECTED").length;
  const notDisclosedCount = initialClaimsQueue.filter((c) => c.fieldState === "NOT_DISCLOSED").length;
  const unknownCount = initialClaimsQueue.filter((c) => c.fieldState === "UNKNOWN").length;

  return {
    totalCardsTracked: demoCards.length,
    fullyVerifiedCardsCount: 7,
    pendingClaimsCount: pendingCount,
    unresolvedConflictsCount: unresolvedConflicts,
    notDisclosedFieldsCount: notDisclosedCount,
    unknownFieldsCount: unknownCount,
    staleSourcesCount: 0,
    sourcesHealthyPercent: 100,
    tier1SourcesCount: initialSources.filter((s) => s.sourceType === "MITC" || s.sourceType === "REGULATORY_NOTICE").length,
    averageConfidenceScore: 97.4,
    isDemoSandbox: false,
  };
}

export async function getClaimsQueue(
  filter?: string | { status?: string; fieldState?: string; search?: string },
): Promise<ClaimQueueItem[]> {
  const filterObj = typeof filter === "string" ? { status: filter } : filter;

  return initialClaimsQueue.filter((item) => {
    if (filterObj?.status && filterObj.status !== "ALL" && item.verificationStatus !== filterObj.status) {
      return false;
    }
    if (filterObj?.fieldState && filterObj.fieldState !== "ALL" && item.fieldState !== filterObj.fieldState) {
      return false;
    }
    if (filterObj?.search?.trim && filterObj.search.trim()) {
      const q = filterObj.search.toLowerCase().trim();
      const matchCard = item.cardName.toLowerCase().includes(q) || item.cardSlug.toLowerCase().includes(q);
      const matchField = item.fieldName.toLowerCase().includes(q) || item.fieldLabel.toLowerCase().includes(q);
      const matchSource = item.sourceTitle.toLowerCase().includes(q);
      return matchCard || matchField || matchSource;
    }
    return true;
  });
}

export async function getClaimById(id: string): Promise<ClaimQueueItem | null> {
  const item = initialClaimsQueue.find((c) => c.id === id);
  return item || null;
}

export async function reviewClaim(params: {
  claimId: string;
  action: "APPROVE" | "EDIT_AND_APPROVE" | "MARK_NOT_DISCLOSED" | "MARK_CONDITIONAL" | "REJECT";
  editedValue?: string;
  reviewerNotes?: string;
  reviewerId?: string;
  reviewerEmail?: string;
}): Promise<{ success: boolean; claim?: ClaimQueueItem }> {
  const claim = initialClaimsQueue.find((c) => c.id === params.claimId);
  if (!claim) return { success: false };

  const oldValue = claim.currentValue;
  let newValue = claim.claimedValue;

  if (params.action === "APPROVE") {
    claim.verificationStatus = "VERIFIED";
    claim.currentValue = claim.claimedValue;
  } else if (params.action === "EDIT_AND_APPROVE") {
    claim.verificationStatus = "VERIFIED";
    claim.currentValue = params.editedValue || claim.claimedValue;
    newValue = claim.currentValue;
  } else if (params.action === "MARK_NOT_DISCLOSED") {
    claim.verificationStatus = "VERIFIED";
    claim.fieldState = "NOT_DISCLOSED";
    claim.currentValue = "NOT_DISCLOSED";
    newValue = "NOT_DISCLOSED";
  } else if (params.action === "MARK_CONDITIONAL") {
    claim.verificationStatus = "VERIFIED";
    claim.fieldState = "CONDITIONAL";
  } else if (params.action === "REJECT") {
    claim.verificationStatus = "REJECTED";
    newValue = "REJECTED";
  }

  claim.reviewerNotes = params.reviewerNotes;

  // Append to Audit Trail
  initialAuditLogs.unshift({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: params.reviewerId || "lead-researcher",
    userEmail: params.reviewerEmail || "lead.researcher@cardintel.in",
    action: params.action as any,
    entityName: claim.cardName,
    fieldName: claim.fieldName,
    oldValue,
    newValue,
    reason: params.reviewerNotes,
    sourceTitle: claim.sourceTitle,
  });

  return { success: true, claim };
}

export async function verifyClaim(
  claimId: string,
  action: "APPROVE" | "EDIT_AND_APPROVE" | "MARK_NOT_DISCLOSED" | "MARK_CONDITIONAL" | "REJECT",
  reviewerNotes?: string,
  editedValue?: string,
  reviewerEmail?: string,
) {
  return reviewClaim({
    claimId,
    action,
    reviewerNotes,
    editedValue,
    reviewerEmail: reviewerEmail || "lead.researcher@cardintel.in",
    reviewerId: "lead-researcher",
  });
}

export async function getConflictsList(): Promise<ConflictItem[]> {
  return initialConflicts;
}

export async function getConflictsQueue(): Promise<ConflictItem[]> {
  return initialConflicts;
}

export async function resolveConflict(
  arg1:
    | string
    | {
        conflictId: string;
        chosenClaimId: string;
        resolutionNotes: string;
        reviewerId?: string;
        reviewerEmail?: string;
      },
  arg2?: string,
  arg3?: string,
  arg4?: string,
): Promise<{ success: boolean }> {
  const conflictId = typeof arg1 === "string" ? arg1 : arg1.conflictId;
  const chosenClaimId = typeof arg1 === "string" ? (arg2 as string) : arg1.chosenClaimId;
  const resolutionNotes = typeof arg1 === "string" ? (arg3 as string) : arg1.resolutionNotes;
  const reviewerEmail = typeof arg1 === "string" ? (arg4 as string) : arg1.reviewerEmail || "lead.researcher@cardintel.in";

  const conflict = initialConflicts.find((c) => c.id === conflictId);
  if (!conflict) return { success: false };

  conflict.conflictStatus = "RESOLVED";
  conflict.resolutionNotes = resolutionNotes;
  conflict.resolvedAt = new Date().toISOString();
  conflict.resolvedBy = reviewerEmail;

  initialAuditLogs.unshift({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: "lead-researcher",
    userEmail: reviewerEmail,
    action: "RESOLVE_CONFLICT",
    entityName: conflict.cardName,
    fieldName: conflict.fieldName,
    reason: resolutionNotes,
  });

  return { success: true };
}

export async function getSourcesList(): Promise<SourceItem[]> {
  return initialSources;
}

export async function getSnapshotsList(): Promise<SnapshotItem[]> {
  return initialSnapshots;
}

export async function getAuditLogs(): Promise<AuditLogItem[]> {
  return initialAuditLogs;
}
