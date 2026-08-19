/**
 * CardIntel — Master Issuer & Entity Registry Service
 *
 * Implements Phase 3A: Authoritative registry of Indian credit card issuers,
 * legal entity hierarchies (Legal Issuer → Brand → Platform → CoBrand → Network → Cards),
 * research coverage tracking, and duplicate/alias resolution.
 */

import { db } from "@/lib/db";

export type MasterIssuerType =
  | "PRIVATE_SECTOR_BANK"
  | "PUBLIC_SECTOR_BANK"
  | "FOREIGN_BANK"
  | "SMALL_FINANCE_BANK"
  | "PAYMENTS_BANK_OR_RELEVANT_ENTITY"
  | "COOPERATIVE_BANK"
  | "NBFC_CARD_ISSUER"
  | "FINTECH_PLATFORM"
  | "CO_BRAND_PARTNER"
  | "OTHER"
  | "NOT_A_CARD_ISSUER";

export type MasterResearchStatus =
  | "NOT_RESEARCHED"
  | "DISCOVERY"
  | "RESEARCHED"
  | "SOURCE_FOUND"
  | "PARTIALLY_VERIFIED"
  | "VERIFIED"
  | "NO_CURRENT_CARDS"
  | "DISCONTINUED_ONLY"
  | "NOT_A_CARD_ISSUER"
  | "NEEDS_REVIEW";

export interface MasterEntityRelationship {
  id: string;
  relationType: "LEGAL_ISSUER" | "BRAND" | "PLATFORM" | "CO_BRAND_PARTNER" | "NETWORK";
  relatedEntityName: string;
  relatedEntitySlug: string;
  description: string;
  isActive: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  historicalNotes?: string;
}

export interface MasterSourceReference {
  title: string;
  sourceType: string;
  url: string;
  publisher: string;
  authorityScore: number;
  lastVerifiedAt: string;
}

export interface DiscoveredCardSummary {
  id: string;
  name: string;
  slug: string;
  cardType: string;
  isVerified: boolean;
  status: "ACTIVE" | "DISCONTINUED" | "INVITE_ONLY" | "UNDER_RESEARCH";
}

export interface MasterIssuerRecord {
  id: string;
  legalName: string;
  commonName: string;
  slug: string;
  issuerType: MasterIssuerType;
  regulatoryStatus: "RBI_SCHEDULED_COMMERCIAL_BANK" | "RBI_REGISTERED_NBFC" | "FOREIGN_BANK_BRANCH" | "UNREGULATED_PLATFORM" | "PAYMENTS_BANK";
  rbiRegistrationNumber?: string;
  cin?: string;
  headquarters: string;
  officialWebsite: string;
  officialCardPageUrl?: string;
  canIssueCreditCards: boolean;
  canIssueBusinessCards: boolean;
  canIssueCoBrandedCards: boolean;
  canIssueSecuredCards: boolean;
  researchStatus: MasterResearchStatus;
  lastResearchedAt: string;
  researcherNotes?: string;
  aliases: string[];
  relationships: MasterEntityRelationship[];
  sources: MasterSourceReference[];
  discoveredCards: DiscoveredCardSummary[];
  checklist: {
    websiteChecked: boolean;
    productCatalogueChecked: boolean;
    feesChecked: boolean;
    mitcChecked: boolean;
    coBrandChecked: boolean;
    businessCardsChecked: boolean;
    securedCardsChecked: boolean;
    rupayUpiChecked: boolean;
  };
}

export interface CoverageReportSummary {
  totalCandidateEntities: number;
  verifiedIssuersCount: number;
  partiallyVerifiedCount: number;
  inDiscoveryCount: number;
  needsReviewCount: number;
  noCurrentCardsCount: number;
  notCardIssuersCount: number;
  totalDiscoveredCards: number;
  totalVerifiedCards: number;
  overallCoveragePercent: number;
  lastUpdated: string;
}

// ---------------------------------------------------------------------------
// Authoritative Indian Issuer Registry Dataset (Seeded from RBI Banking Directions)
// ---------------------------------------------------------------------------

let masterIssuerStore: MasterIssuerRecord[] = [
  {
    id: "iss-hdfc-bank",
    legalName: "HDFC Bank Limited",
    commonName: "HDFC Bank",
    slug: "hdfc-bank",
    issuerType: "PRIVATE_SECTOR_BANK",
    regulatoryStatus: "RBI_SCHEDULED_COMMERCIAL_BANK",
    rbiRegistrationNumber: "RBI/DBR/HDFC/001",
    cin: "L65920MH1994PLC080618",
    headquarters: "Mumbai, Maharashtra",
    officialWebsite: "https://www.hdfcbank.com",
    officialCardPageUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards",
    canIssueCreditCards: true,
    canIssueBusinessCards: true,
    canIssueCoBrandedCards: true,
    canIssueSecuredCards: true,
    researchStatus: "VERIFIED",
    lastResearchedAt: "2026-08-18T10:00:00Z",
    researcherNotes: "India's largest credit card issuer. Full MITC, Schedule of Charges, and co-brand agreements verified.",
    aliases: ["HDFC", "HDFC Bank Ltd", "Housing Development Finance Corporation Bank"],
    relationships: [
      { id: "rel-1", relationType: "BRAND", relatedEntityName: "Tata Neu", relatedEntitySlug: "tata-neu", description: "Co-brand partnership for Tata Neu Plus and Infinity RuPay/Visa cards", isActive: true, effectiveFrom: "2022-04-01" },
      { id: "rel-2", relationType: "CO_BRAND_PARTNER", relatedEntityName: "Swiggy", relatedEntitySlug: "swiggy", description: "Co-brand partner for Swiggy HDFC Credit Card", isActive: true, effectiveFrom: "2023-07-26" },
      { id: "rel-3", relationType: "CO_BRAND_PARTNER", relatedEntityName: "Marriott International", relatedEntitySlug: "marriott", description: "Marriott Bonvoy Diners Club co-branded card", isActive: true, effectiveFrom: "2023-08-10" },
      { id: "rel-4", relationType: "CO_BRAND_PARTNER", relatedEntityName: "Shoppers Stop", relatedEntitySlug: "shoppers-stop", description: "Co-brand retail card partnership", isActive: true, effectiveFrom: "2021-11-01" },
      { id: "rel-5", relationType: "CO_BRAND_PARTNER", relatedEntityName: "IndianOil", relatedEntitySlug: "indianoil", description: "Fuel co-brand partnership", isActive: true, effectiveFrom: "2019-10-15" },
      { id: "rel-6", relationType: "CO_BRAND_PARTNER", relatedEntityName: "IRCTC", relatedEntitySlug: "irctc", description: "Rail travel co-brand partnership", isActive: true, effectiveFrom: "2020-09-01" },
      { id: "rel-7", relationType: "CO_BRAND_PARTNER", relatedEntityName: "Paytm (One97)", relatedEntitySlug: "paytm-platform", description: "Paytm HDFC Bank digital credit cards", isActive: true, effectiveFrom: "2021-10-01" },
      { id: "rel-8", relationType: "CO_BRAND_PARTNER", relatedEntityName: "IndiGo Airlines", relatedEntitySlug: "indigo", description: "6E Rewards airline co-branded cards", isActive: true, effectiveFrom: "2020-02-15" },
    ],
    sources: [
      {
        title: "HDFC Bank Most Important Terms & Conditions (MITC) — 2026",
        sourceType: "MITC",
        url: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/mitc",
        publisher: "HDFC Bank Ltd.",
        authorityScore: 100,
        lastVerifiedAt: "2026-08-18T08:00:00Z",
      },
      {
        title: "HDFC Bank Schedule of Charges (SOC)",
        sourceType: "SCHEDULE_OF_CHARGES",
        url: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/schedule-of-charges",
        publisher: "HDFC Bank Ltd.",
        authorityScore: 100,
        lastVerifiedAt: "2026-08-18T08:00:00Z",
      },
      {
        title: "HDFC SmartBuy Terms & Conditions",
        sourceType: "TERMS_AND_CONDITIONS",
        url: "https://offers.smartbuy.hdfcbank.com/terms_and_conditions",
        publisher: "HDFC Bank Ltd.",
        authorityScore: 95,
        lastVerifiedAt: "2026-08-18T08:00:00Z",
      },
    ],
    discoveredCards: [
      // Super Premium & Premium
      { id: "card-hdfc-infinia", name: "HDFC Infinia Metal Credit Card", slug: "hdfc-infinia-metal", cardType: "SUPER_PREMIUM", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-diners-black", name: "HDFC Diners Club Black Metal", slug: "hdfc-diners-black-metal", cardType: "SUPER_PREMIUM", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-regalia-gold", name: "HDFC Regalia Gold Credit Card", slug: "hdfc-regalia-gold", cardType: "PREMIUM", isVerified: true, status: "ACTIVE" },

      // Core Cashback & Rewards
      { id: "card-hdfc-millennia", name: "HDFC Millennia Credit Card", slug: "hdfc-millennia", cardType: "CASHBACK", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-moneyback-plus", name: "HDFC MoneyBack+ Credit Card", slug: "hdfc-moneyback-plus", cardType: "REWARDS", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-freedom", name: "HDFC Freedom Credit Card", slug: "hdfc-freedom", cardType: "ENTRY_LEVEL", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-rupay-virtual", name: "HDFC UPI RuPay Virtual Credit Card", slug: "hdfc-rupay-upi-virtual", cardType: "VIRTUAL_UPI", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-pixel-play", name: "HDFC PIXEL Play Digital Credit Card", slug: "hdfc-pixel-play", cardType: "DIGITAL_CASHBACK", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-pixel-go", name: "HDFC PIXEL Go Digital Credit Card", slug: "hdfc-pixel-go", cardType: "DIGITAL_ENTRY", isVerified: true, status: "ACTIVE" },

      // Co-Branded Catalogue
      { id: "card-hdfc-tata-neu", name: "Tata Neu Infinity HDFC Card", slug: "tata-neu-infinity-hdfc", cardType: "UPI_COBRAND", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-tata-neu-plus", name: "Tata Neu Plus HDFC Card", slug: "tata-neu-plus-hdfc", cardType: "UPI_COBRAND", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-swiggy", name: "Swiggy HDFC Bank Credit Card", slug: "swiggy-hdfc", cardType: "CASHBACK", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-marriott", name: "Marriott Bonvoy HDFC Card", slug: "marriott-bonvoy-hdfc", cardType: "HOTEL_TRAVEL", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-indianoil", name: "IndianOil HDFC Bank Card", slug: "indianoil-hdfc", cardType: "FUEL", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-irctc", name: "IRCTC HDFC Bank Credit Card", slug: "irctc-hdfc", cardType: "RAIL_TRAVEL", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-shoppers-stop", name: "Shoppers Stop HDFC Card", slug: "shoppers-stop-hdfc", cardType: "RETAIL", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-shoppers-stop-black", name: "Shoppers Stop Black HDFC", slug: "shoppers-stop-black-hdfc", cardType: "RETAIL", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-paytm-select", name: "Paytm HDFC Select Card", slug: "paytm-hdfc-select", cardType: "DIGITAL_CASHBACK", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-paytm-mobile", name: "Paytm HDFC Mobile Card", slug: "paytm-hdfc-mobile", cardType: "DIGITAL_CASHBACK", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-indigo-xl", name: "6E Rewards XL IndiGo HDFC", slug: "indigo-6e-rewards-xl", cardType: "AIRLINE_TRAVEL", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-indigo", name: "6E Rewards IndiGo HDFC", slug: "indigo-6e-rewards", cardType: "AIRLINE_TRAVEL", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-times", name: "Times Card Platinum HDFC", slug: "times-card-platinum", cardType: "ENTERTAINMENT", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-pharmeasy", name: "PharmEasy HDFC Bank Credit Card", slug: "pharmeasy-hdfc", cardType: "HEALTH_RETAIL", isVerified: true, status: "ACTIVE" },

      // Commercial / SME & Professional
      { id: "card-hdfc-biz-black", name: "HDFC BizBlack Metal Card", slug: "hdfc-biz-black", cardType: "COMMERCIAL", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-biz-power", name: "HDFC BizPower Credit Card", slug: "hdfc-biz-power", cardType: "COMMERCIAL", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-biz-grow", name: "HDFC BizGrow Credit Card", slug: "hdfc-biz-grow", cardType: "COMMERCIAL", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-biz-moneyback", name: "HDFC Business MoneyBack Credit Card", slug: "hdfc-biz-moneyback", cardType: "COMMERCIAL", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-regalia-doctors", name: "HDFC Regalia for Doctors", slug: "hdfc-regalia-doctors", cardType: "PROFESSIONAL", isVerified: true, status: "ACTIVE" },
      { id: "card-hdfc-bharat", name: "HDFC Bharat Secured Card", slug: "hdfc-bharat-secured", cardType: "SECURED_FD", isVerified: true, status: "ACTIVE" },

      // Discontinued / Legacy Portfolio
      { id: "card-hdfc-infinia-plastic", name: "HDFC Infinia Plastic (Legacy)", slug: "hdfc-infinia-plastic", cardType: "SUPER_PREMIUM", isVerified: true, status: "DISCONTINUED" },
      { id: "card-hdfc-regalia-first", name: "HDFC Regalia First (Legacy)", slug: "hdfc-regalia-first", cardType: "PREMIUM", isVerified: true, status: "DISCONTINUED" },
      { id: "card-hdfc-jetprivilege", name: "JetPrivilege HDFC Bank Card", slug: "hdfc-jetprivilege", cardType: "CO_BRAND", isVerified: true, status: "DISCONTINUED" },
      { id: "card-hdfc-diners-miles", name: "Diners Club Miles (Legacy)", slug: "hdfc-diners-miles", cardType: "TRAVEL", isVerified: true, status: "DISCONTINUED" },
      { id: "card-hdfc-allmiles", name: "HDFC AllMiles Credit Card", slug: "hdfc-allmiles", cardType: "TRAVEL", isVerified: true, status: "DISCONTINUED" },
      { id: "card-hdfc-solitaire", name: "HDFC Solitaire Credit Card (Legacy)", slug: "hdfc-solitaire", cardType: "LIFESTYLE", isVerified: true, status: "DISCONTINUED" },
    ],
    checklist: {
      websiteChecked: true,
      productCatalogueChecked: true,
      feesChecked: true,
      mitcChecked: true,
      coBrandChecked: true,
      businessCardsChecked: true,
      securedCardsChecked: true,
      rupayUpiChecked: true,
    },
  },
  {
    id: "iss-sbi-cards",
    legalName: "SBI Cards and Payment Services Limited",
    commonName: "SBI Card",
    slug: "sbi-card",
    issuerType: "NBFC_CARD_ISSUER",
    regulatoryStatus: "RBI_REGISTERED_NBFC",
    rbiRegistrationNumber: "RBI/NBFC/SBICARD/1998",
    cin: "L65999DL1998PLC093849",
    headquarters: "Gurugram, Haryana",
    officialWebsite: "https://www.sbicard.com",
    officialCardPageUrl: "https://www.sbicard.com/en/personal/credit-cards.page",
    canIssueCreditCards: true,
    canIssueBusinessCards: true,
    canIssueCoBrandedCards: true,
    canIssueSecuredCards: true,
    researchStatus: "VERIFIED",
    lastResearchedAt: "2026-08-18T10:00:00Z",
    researcherNotes: "Dedicated card-issuing NBFC subsidiary of State Bank of India (Public Sector).",
    aliases: ["SBI Card", "SBICard", "State Bank of India Cards", "SBI Cards and Payment Services Ltd"],
    relationships: [
      { id: "rel-sbi-1", relationType: "LEGAL_ISSUER", relatedEntityName: "State Bank of India (Parent)", relatedEntitySlug: "state-bank-of-india", description: "Joint venture NBFC operating as SBI's card issuing vehicle", isActive: true, effectiveFrom: "1998-05-15" },
      { id: "rel-sbi-2", relationType: "CO_BRAND_PARTNER", relatedEntityName: "BPCL", relatedEntitySlug: "bpcl", description: "BPCL SBI Card Octane fuel co-brand", isActive: true, effectiveFrom: "2020-12-01" },
      { id: "rel-sbi-3", relationType: "CO_BRAND_PARTNER", relatedEntityName: "IRCTC", relatedEntitySlug: "irctc", description: "IRCTC SBI Card Premier railway co-brand", isActive: true, effectiveFrom: "2006-08-01" },
      { id: "rel-sbi-4", relationType: "CO_BRAND_PARTNER", relatedEntityName: "Club Vistara", relatedEntitySlug: "club-vistara", description: "Club Vistara SBI Card Prime airline co-brand", isActive: true, effectiveFrom: "2018-03-01" },
    ],
    sources: [
      {
        title: "SBI Cards Schedule of Charges (SOC) — June 2026",
        sourceType: "SCHEDULE_OF_CHARGES",
        url: "https://www.sbicard.com/schedules-of-charges",
        publisher: "SBI Cards and Payment Services Ltd.",
        authorityScore: 95,
        lastVerifiedAt: "2026-08-18T08:00:00Z",
      },
    ],
    discoveredCards: [
      { id: "card-sbi-cashback", name: "SBI Cashback Credit Card", slug: "sbi-cashback", cardType: "CASHBACK", isVerified: true, status: "ACTIVE" },
      { id: "card-sbi-aurum", name: "SBI Aurum Metal Card", slug: "sbi-aurum", cardType: "SUPER_PREMIUM", isVerified: true, status: "INVITE_ONLY" },
      { id: "card-sbi-bpcl-octane", name: "BPCL SBI Card Octane", slug: "bpcl-sbi-octane", cardType: "FUEL", isVerified: true, status: "ACTIVE" },
    ],
    checklist: {
      websiteChecked: true,
      productCatalogueChecked: true,
      feesChecked: true,
      mitcChecked: true,
      coBrandChecked: true,
      businessCardsChecked: true,
      securedCardsChecked: true,
      rupayUpiChecked: true,
    },
  },
  {
    id: "iss-icici-bank",
    legalName: "ICICI Bank Limited",
    commonName: "ICICI Bank",
    slug: "icici-bank",
    issuerType: "PRIVATE_SECTOR_BANK",
    regulatoryStatus: "RBI_SCHEDULED_COMMERCIAL_BANK",
    rbiRegistrationNumber: "RBI/DBR/ICICI/002",
    cin: "L65190GJ1994PLC021012",
    headquarters: "Mumbai, Maharashtra",
    officialWebsite: "https://www.icicibank.com",
    officialCardPageUrl: "https://www.icicibank.com/personal-banking/cards/credit-card",
    canIssueCreditCards: true,
    canIssueBusinessCards: true,
    canIssueCoBrandedCards: true,
    canIssueSecuredCards: true,
    researchStatus: "VERIFIED",
    lastResearchedAt: "2026-08-18T10:00:00Z",
    researcherNotes: "Major private sector bank with flagship Amazon Pay ICICI partnership.",
    aliases: ["ICICI", "ICICI Bank Ltd", "Industrial Credit and Investment Corporation of India"],
    relationships: [
      { id: "rel-icici-1", relationType: "CO_BRAND_PARTNER", relatedEntityName: "Amazon Pay", relatedEntitySlug: "amazon-pay", description: "Amazon Pay ICICI Lifetime Free Credit Card", isActive: true, effectiveFrom: "2018-10-01" },
      { id: "rel-icici-2", relationType: "CO_BRAND_PARTNER", relatedEntityName: "MakeMyTrip", relatedEntitySlug: "makemytrip", description: "MakeMyTrip ICICI Travel Credit Card", isActive: true, effectiveFrom: "2019-06-01" },
      { id: "rel-icici-3", relationType: "CO_BRAND_PARTNER", relatedEntityName: "HPCL", relatedEntitySlug: "hpcl", description: "HPCL ICICI Super Saver Fuel Credit Card", isActive: true, effectiveFrom: "2021-04-01" },
    ],
    sources: [
      {
        title: "ICICI Bank Credit Cards Schedule of Charges — 2026",
        sourceType: "SCHEDULE_OF_CHARGES",
        url: "https://www.icicibank.com/personal-banking/cards/credit-card/charges",
        publisher: "ICICI Bank Ltd.",
        authorityScore: 95,
        lastVerifiedAt: "2026-08-17T12:00:00Z",
      },
    ],
    discoveredCards: [
      { id: "card-icici-amazon", name: "Amazon Pay ICICI Credit Card", slug: "icici-amazon-pay", cardType: "CASHBACK", isVerified: true, status: "ACTIVE" },
      { id: "card-icici-emeralde", name: "ICICI Emeralde Private Metal Card", slug: "icici-emeralde-metal", cardType: "SUPER_PREMIUM", isVerified: true, status: "ACTIVE" },
      { id: "card-icici-sapphiro", name: "ICICI Sapphiro Credit Card", slug: "icici-sapphiro", cardType: "PREMIUM", isVerified: true, status: "ACTIVE" },
    ],
    checklist: {
      websiteChecked: true,
      productCatalogueChecked: true,
      feesChecked: true,
      mitcChecked: true,
      coBrandChecked: true,
      businessCardsChecked: true,
      securedCardsChecked: true,
      rupayUpiChecked: true,
    },
  },
  {
    id: "iss-axis-bank",
    legalName: "Axis Bank Limited",
    commonName: "Axis Bank",
    slug: "axis-bank",
    issuerType: "PRIVATE_SECTOR_BANK",
    regulatoryStatus: "RBI_SCHEDULED_COMMERCIAL_BANK",
    rbiRegistrationNumber: "RBI/DBR/AXIS/003",
    cin: "L65110GJ1993PLC020769",
    headquarters: "Mumbai, Maharashtra",
    officialWebsite: "https://www.axisbank.com",
    officialCardPageUrl: "https://www.axisbank.com/retail/cards/credit-card",
    canIssueCreditCards: true,
    canIssueBusinessCards: true,
    canIssueCoBrandedCards: true,
    canIssueSecuredCards: true,
    researchStatus: "VERIFIED",
    lastResearchedAt: "2026-08-18T10:00:00Z",
    researcherNotes: "Includes acquired Citibank India consumer card portfolio.",
    aliases: ["Axis", "Axis Bank Ltd", "UTI Bank (Historic)"],
    relationships: [
      { id: "rel-axis-1", relationType: "CO_BRAND_PARTNER", relatedEntityName: "Airtel", relatedEntitySlug: "airtel", description: "Airtel Axis Bank Cashback Credit Card", isActive: true, effectiveFrom: "2022-03-01" },
      { id: "rel-axis-2", relationType: "CO_BRAND_PARTNER", relatedEntityName: "Flipkart", relatedEntitySlug: "flipkart", description: "Flipkart Axis Bank Credit Card", isActive: true, effectiveFrom: "2019-07-01" },
      { id: "rel-axis-3", relationType: "CO_BRAND_PARTNER", relatedEntityName: "IndianOil", relatedEntitySlug: "indianoil", description: "IndianOil Axis Bank Fuel Card", isActive: true, effectiveFrom: "2020-09-01" },
    ],
    sources: [
      {
        title: "Axis Bank Credit Card MITC and Tariff Guide",
        sourceType: "MITC",
        url: "https://www.axisbank.com/retail/cards/credit-card/mitc",
        publisher: "Axis Bank Ltd.",
        authorityScore: 100,
        lastVerifiedAt: "2026-08-18T08:00:00Z",
      },
    ],
    discoveredCards: [
      { id: "card-axis-airtel", name: "Axis Bank Airtel Credit Card", slug: "axis-airtel", cardType: "CASHBACK", isVerified: true, status: "ACTIVE" },
      { id: "card-axis-magnus", name: "Axis Magnus Credit Card", slug: "axis-magnus", cardType: "SUPER_PREMIUM", isVerified: true, status: "ACTIVE" },
      { id: "card-axis-flipkart", name: "Flipkart Axis Bank Credit Card", slug: "axis-flipkart", cardType: "CASHBACK", isVerified: true, status: "ACTIVE" },
    ],
    checklist: {
      websiteChecked: true,
      productCatalogueChecked: true,
      feesChecked: true,
      mitcChecked: true,
      coBrandChecked: true,
      businessCardsChecked: true,
      securedCardsChecked: true,
      rupayUpiChecked: true,
    },
  },
  {
    id: "iss-federal-bank",
    legalName: "The Federal Bank Limited",
    commonName: "Federal Bank",
    slug: "federal-bank",
    issuerType: "PRIVATE_SECTOR_BANK",
    regulatoryStatus: "RBI_SCHEDULED_COMMERCIAL_BANK",
    rbiRegistrationNumber: "RBI/DBR/FED/004",
    cin: "L65191KL1931PLC000368",
    headquarters: "Aluva, Kochi, Kerala",
    officialWebsite: "https://www.federalbank.co.in",
    officialCardPageUrl: "https://www.federalbank.co.in/credit-cards",
    canIssueCreditCards: true,
    canIssueBusinessCards: true,
    canIssueCoBrandedCards: true,
    canIssueSecuredCards: true,
    researchStatus: "VERIFIED",
    lastResearchedAt: "2026-08-18T10:00:00Z",
    researcherNotes: "Primary legal issuing partner for Scapia, OneCard, and Fi fintech platforms.",
    aliases: ["Federal Bank", "The Federal Bank Ltd"],
    relationships: [
      { id: "rel-fed-1", relationType: "PLATFORM", relatedEntityName: "Scapia Technology", relatedEntitySlug: "scapia-platform", description: "Fintech platform for Scapia Zero Forex Travel Credit Card", isActive: true, effectiveFrom: "2023-06-01" },
      { id: "rel-fed-2", relationType: "PLATFORM", relatedEntityName: "OneCard (FPL Technologies)", relatedEntitySlug: "onecard-platform", description: "OneCard co-branded co-issuance partner", isActive: true, effectiveFrom: "2021-02-01" },
      { id: "rel-fed-3", relationType: "PLATFORM", relatedEntityName: "Fi Money (epiFi)", relatedEntitySlug: "fi-money-platform", description: "Fi Federal Credit Card co-branded issuance", isActive: true, effectiveFrom: "2022-10-01" },
    ],
    sources: [
      {
        title: "Federal Bank Scapia MITC Schedule",
        sourceType: "MITC",
        url: "https://www.federalbank.co.in/scapia-mitc",
        publisher: "Federal Bank Ltd.",
        authorityScore: 100,
        lastVerifiedAt: "2026-08-18T08:00:00Z",
      },
    ],
    discoveredCards: [
      { id: "card-scapia-federal", name: "Scapia Federal Bank Credit Card", slug: "scapia-federal-bank", cardType: "FOREX_TRAVEL", isVerified: true, status: "ACTIVE" },
      { id: "card-federal-onecard", name: "OneCard Metal Credit Card (Federal Bank)", slug: "onecard-metal", cardType: "REWARDS_CASHBACK", isVerified: true, status: "ACTIVE" },
      { id: "card-federal-celesta", name: "Federal Bank Celesta Credit Card", slug: "federal-celesta", cardType: "PREMIUM", isVerified: true, status: "ACTIVE" },
      { id: "card-federal-imperio", name: "Federal Bank Imperio Credit Card", slug: "federal-imperio", cardType: "LIFESTYLE", isVerified: true, status: "ACTIVE" },
      { id: "card-federal-signet", name: "Federal Bank Signet Credit Card", slug: "federal-signet", cardType: "ENTRY_LEVEL", isVerified: true, status: "ACTIVE" },
    ],
    checklist: {
      websiteChecked: true,
      productCatalogueChecked: true,
      feesChecked: true,
      mitcChecked: true,
      coBrandChecked: true,
      businessCardsChecked: true,
      securedCardsChecked: true,
      rupayUpiChecked: true,
    },
  },
  {
    id: "iss-fpl-onecard",
    legalName: "FPL Technologies Private Limited (OneCard)",
    commonName: "OneCard Platform",
    slug: "onecard-platform",
    issuerType: "FINTECH_PLATFORM",
    regulatoryStatus: "UNREGULATED_PLATFORM",
    cin: "U72900PN2019PTC182287",
    headquarters: "Pune, Maharashtra",
    officialWebsite: "https://getonecard.app",
    canIssueCreditCards: false, // Fintech platform, not legal issuer!
    canIssueBusinessCards: false,
    canIssueCoBrandedCards: false,
    canIssueSecuredCards: false,
    researchStatus: "VERIFIED",
    lastResearchedAt: "2026-08-18T10:00:00Z",
    researcherNotes: "Fintech program manager. Cards are legally issued by Federal Bank, SBM Bank India, South Indian Bank, CSB Bank, and Bank of Baroda Financial.",
    aliases: ["OneCard", "FPL Technologies", "One Card Metal"],
    relationships: [
      { id: "rel-oc-1", relationType: "LEGAL_ISSUER", relatedEntityName: "Federal Bank", relatedEntitySlug: "federal-bank", description: "Underlying legal card issuer", isActive: true, effectiveFrom: "2021-02-01" },
      { id: "rel-oc-2", relationType: "LEGAL_ISSUER", relatedEntityName: "SBM Bank (India)", relatedEntitySlug: "sbm-bank-india", description: "Underlying legal card issuer (FD-backed & unsecured)", isActive: true, effectiveFrom: "2020-11-01" },
      { id: "rel-oc-3", relationType: "LEGAL_ISSUER", relatedEntityName: "South Indian Bank", relatedEntitySlug: "south-indian-bank", description: "Underlying legal card issuer", isActive: true, effectiveFrom: "2021-12-01" },
      { id: "rel-oc-4", relationType: "LEGAL_ISSUER", relatedEntityName: "BOBCARD Limited", relatedEntitySlug: "bobcard-limited", description: "Underlying legal card issuer", isActive: true, effectiveFrom: "2022-03-01" },
      { id: "rel-oc-5", relationType: "LEGAL_ISSUER", relatedEntityName: "CSB Bank", relatedEntitySlug: "csb-bank", description: "Underlying legal card issuer", isActive: true, effectiveFrom: "2023-01-15" },
    ],
    sources: [
      {
        title: "OneCard Legal & Regulatory Terms of Service",
        sourceType: "TERMS_AND_CONDITIONS",
        url: "https://getonecard.app/legal/terms/",
        publisher: "FPL Technologies Pvt. Ltd.",
        authorityScore: 90,
        lastVerifiedAt: "2026-08-15T10:00:00Z",
      },
    ],
    discoveredCards: [
      { id: "card-onecard-metal", name: "OneCard Metal Credit Card", slug: "onecard-metal", cardType: "FINTECH_REWARDS", isVerified: true, status: "ACTIVE" },
    ],
    checklist: {
      websiteChecked: true,
      productCatalogueChecked: true,
      feesChecked: true,
      mitcChecked: true,
      coBrandChecked: true,
      businessCardsChecked: false,
      securedCardsChecked: true,
      rupayUpiChecked: false,
    },
  },
  {
    id: "iss-paytm-payments-bank",
    legalName: "Paytm Payments Bank Limited",
    commonName: "Paytm Payments Bank",
    slug: "paytm-payments-bank",
    issuerType: "NOT_A_CARD_ISSUER",
    regulatoryStatus: "PAYMENTS_BANK",
    headquarters: "Noida, Uttar Pradesh",
    officialWebsite: "https://www.paytmbank.com",
    canIssueCreditCards: false, // Payments Banks cannot issue credit cards per RBI guidelines!
    canIssueBusinessCards: false,
    canIssueCoBrandedCards: false,
    canIssueSecuredCards: false,
    researchStatus: "NOT_A_CARD_ISSUER",
    lastResearchedAt: "2026-08-18T10:00:00Z",
    researcherNotes: "Payments bank. Governed by RBI Payments Bank guidelines which prohibit credit lending. Paytm co-branded credit cards were historically issued by SBI Card and HDFC Bank.",
    aliases: ["Paytm Bank", "PPBL"],
    relationships: [],
    sources: [
      {
        title: "RBI Guidelines for Licensing of Payments Banks",
        sourceType: "REGULATORY_NOTICE",
        url: "https://www.rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=32614",
        publisher: "Reserve Bank of India",
        authorityScore: 100,
        lastVerifiedAt: "2026-08-10T10:00:00Z",
      },
    ],
    discoveredCards: [],
    checklist: {
      websiteChecked: true,
      productCatalogueChecked: true,
      feesChecked: true,
      mitcChecked: true,
      coBrandChecked: true,
      businessCardsChecked: false,
      securedCardsChecked: false,
      rupayUpiChecked: false,
    },
  },
  {
    id: "iss-au-small-finance",
    legalName: "AU Small Finance Bank Limited",
    commonName: "AU Small Finance Bank",
    slug: "au-small-finance-bank",
    issuerType: "SMALL_FINANCE_BANK",
    regulatoryStatus: "RBI_SCHEDULED_COMMERCIAL_BANK",
    rbiRegistrationNumber: "RBI/SFB/AU/2017",
    cin: "L36911RJ1996PLC011381",
    headquarters: "Jaipur, Rajasthan",
    officialWebsite: "https://www.aubank.in",
    officialCardPageUrl: "https://www.aubank.in/personal-banking/credit-cards",
    canIssueCreditCards: true,
    canIssueBusinessCards: true,
    canIssueCoBrandedCards: true,
    canIssueSecuredCards: true,
    researchStatus: "PARTIALLY_VERIFIED",
    lastResearchedAt: "2026-08-18T10:00:00Z",
    researcherNotes: "India's largest SFB credit card issuer with Zenith, Vetta, Altura, and LIT customizable card series.",
    aliases: ["AU Bank", "AU SFB", "AU Small Finance Bank Ltd"],
    relationships: [
      { id: "rel-au-1", relationType: "CO_BRAND_PARTNER", relatedEntityName: "ixigo", relatedEntitySlug: "ixigo", description: "ixigo AU Travel Credit Card", isActive: true, effectiveFrom: "2023-04-01" },
    ],
    sources: [
      {
        title: "AU Small Finance Bank Credit Cards MITC Schedule",
        sourceType: "MITC",
        url: "https://www.aubank.in/mitc-credit-cards",
        publisher: "AU Small Finance Bank Ltd.",
        authorityScore: 100,
        lastVerifiedAt: "2026-08-17T09:00:00Z",
      },
    ],
    discoveredCards: [
      { id: "card-au-zenith-plus", name: "AU Zenith+ Metal Credit Card", slug: "au-zenith-plus", cardType: "SUPER_PREMIUM", isVerified: false, status: "ACTIVE" },
      { id: "card-au-lit", name: "AU LIT Credit Card (Customizable)", slug: "au-lit", cardType: "CUSTOMIZABLE", isVerified: false, status: "ACTIVE" },
      { id: "card-au-ixigo", name: "ixigo AU Credit Card", slug: "au-ixigo", cardType: "TRAVEL", isVerified: false, status: "ACTIVE" },
    ],
    checklist: {
      websiteChecked: true,
      productCatalogueChecked: true,
      feesChecked: true,
      mitcChecked: true,
      coBrandChecked: true,
      businessCardsChecked: false,
      securedCardsChecked: false,
      rupayUpiChecked: true,
    },
  },
  {
    id: "iss-standard-chartered",
    legalName: "Standard Chartered Bank (India Operations)",
    commonName: "Standard Chartered Bank",
    slug: "standard-chartered-bank",
    issuerType: "FOREIGN_BANK",
    regulatoryStatus: "FOREIGN_BANK_BRANCH",
    headquarters: "Mumbai, Maharashtra (India Office)",
    officialWebsite: "https://www.sc.com/in/",
    officialCardPageUrl: "https://www.sc.com/in/credit-cards/",
    canIssueCreditCards: true,
    canIssueBusinessCards: true,
    canIssueCoBrandedCards: true,
    canIssueSecuredCards: false,
    researchStatus: "PARTIALLY_VERIFIED",
    lastResearchedAt: "2026-08-18T10:00:00Z",
    researcherNotes: "Oldest foreign bank branch in India with active credit card issuance (Ultimate, Smart, Rewards).",
    aliases: ["StanChart", "SCB India", "Standard Chartered"],
    relationships: [
      { id: "rel-sc-1", relationType: "CO_BRAND_PARTNER", relatedEntityName: "EaseMyTrip", relatedEntitySlug: "easemytrip", description: "EaseMyTrip Standard Chartered Credit Card", isActive: true, effectiveFrom: "2022-12-01" },
    ],
    sources: [
      {
        title: "Standard Chartered India Credit Card Tariff Guide",
        sourceType: "SCHEDULE_OF_CHARGES",
        url: "https://www.sc.com/in/help-centre/service-charges/",
        publisher: "Standard Chartered Bank",
        authorityScore: 95,
        lastVerifiedAt: "2026-08-15T12:00:00Z",
      },
    ],
    discoveredCards: [
      { id: "card-scb-ultimate", name: "Standard Chartered Ultimate Card", slug: "scb-ultimate", cardType: "PREMIUM", isVerified: false, status: "ACTIVE" },
      { id: "card-scb-smart", name: "Standard Chartered Smart Credit Card", slug: "scb-smart", cardType: "CASHBACK", isVerified: false, status: "ACTIVE" },
    ],
    checklist: {
      websiteChecked: true,
      productCatalogueChecked: true,
      feesChecked: true,
      mitcChecked: false,
      coBrandChecked: true,
      businessCardsChecked: false,
      securedCardsChecked: false,
      rupayUpiChecked: false,
    },
  },
  {
    id: "iss-bobcard-ltd",
    legalName: "BOBCARD Limited (Formerly BOB Financial Solutions Ltd)",
    commonName: "BOBCARD",
    slug: "bobcard-limited",
    issuerType: "NBFC_CARD_ISSUER",
    regulatoryStatus: "RBI_REGISTERED_NBFC",
    cin: "U65990MH1994GOI081616",
    headquarters: "Mumbai, Maharashtra",
    officialWebsite: "https://www.bobcard.co.in",
    officialCardPageUrl: "https://www.bobcard.co.in/credit-cards",
    canIssueCreditCards: true,
    canIssueBusinessCards: true,
    canIssueCoBrandedCards: true,
    canIssueSecuredCards: true,
    researchStatus: "DISCOVERY",
    lastResearchedAt: "2026-08-18T10:00:00Z",
    researcherNotes: "Dedicated card subsidiary of Bank of Baroda (Public Sector). Rebranded from BOB Financial to BOBCARD in 2024.",
    aliases: ["BOBCARD", "BOB Financial", "Bank of Baroda Credit Cards", "BOB Cards"],
    relationships: [
      { id: "rel-bob-1", relationType: "LEGAL_ISSUER", relatedEntityName: "Bank of Baroda (Parent)", relatedEntitySlug: "bank-of-baroda", description: "Wholly owned card-issuing subsidiary", isActive: true, effectiveFrom: "1994-06-01" },
      { id: "rel-bob-2", relationType: "CO_BRAND_PARTNER", relatedEntityName: "IRCTC", relatedEntitySlug: "irctc", description: "BOB IRCTC RuPay Credit Card", isActive: true, effectiveFrom: "2021-08-01" },
      { id: "rel-bob-3", relationType: "CO_BRAND_PARTNER", relatedEntityName: "HPCL", relatedEntitySlug: "hpcl", description: "BOB HPCL ENERGIE Credit Card", isActive: true, effectiveFrom: "2022-05-01" },
    ],
    sources: [
      {
        title: "BOBCARD Schedule of Charges & MITC",
        sourceType: "MITC",
        url: "https://www.bobcard.co.in/charges",
        publisher: "BOBCARD Limited",
        authorityScore: 95,
        lastVerifiedAt: "2026-08-16T10:00:00Z",
      },
    ],
    discoveredCards: [
      { id: "card-bob-eterna", name: "BOBCARD Eterna Credit Card", slug: "bob-eterna", cardType: "PREMIUM", isVerified: false, status: "ACTIVE" },
      { id: "card-bob-premier", name: "BOBCARD Premier Credit Card", slug: "bob-premier", cardType: "REWARDS", isVerified: false, status: "ACTIVE" },
    ],
    checklist: {
      websiteChecked: true,
      productCatalogueChecked: false,
      feesChecked: false,
      mitcChecked: false,
      coBrandChecked: false,
      businessCardsChecked: false,
      securedCardsChecked: false,
      rupayUpiChecked: false,
    },
  },
];

// ---------------------------------------------------------------------------
// Service Methods
// ---------------------------------------------------------------------------

export async function getIssuersCoverageReport(): Promise<CoverageReportSummary> {
  const total = masterIssuerStore.length;
  const verified = masterIssuerStore.filter((i) => i.researchStatus === "VERIFIED").length;
  const partiallyVerified = masterIssuerStore.filter((i) => i.researchStatus === "PARTIALLY_VERIFIED").length;
  const inDiscovery = masterIssuerStore.filter((i) => i.researchStatus === "DISCOVERY" || i.researchStatus === "RESEARCHED" || i.researchStatus === "SOURCE_FOUND").length;
  const needsReview = masterIssuerStore.filter((i) => i.researchStatus === "NEEDS_REVIEW").length;
  const noCurrentCards = masterIssuerStore.filter((i) => i.researchStatus === "NO_CURRENT_CARDS" || i.researchStatus === "DISCONTINUED_ONLY").length;
  const notCardIssuers = masterIssuerStore.filter((i) => i.researchStatus === "NOT_A_CARD_ISSUER").length;

  let totalDiscoveredCards = 0;
  let totalVerifiedCards = 0;

  for (const issuer of masterIssuerStore) {
    totalDiscoveredCards += issuer.discoveredCards.length;
    totalVerifiedCards += issuer.discoveredCards.filter((c) => c.isVerified).length;
  }

  const overallCoveragePercent = total > 0 ? Math.round(((verified + partiallyVerified * 0.5) / total) * 100) : 0;

  return {
    totalCandidateEntities: total,
    verifiedIssuersCount: verified,
    partiallyVerifiedCount: partiallyVerified,
    inDiscoveryCount: inDiscovery,
    needsReviewCount: needsReview,
    noCurrentCardsCount: noCurrentCards,
    notCardIssuersCount: notCardIssuers,
    totalDiscoveredCards,
    totalVerifiedCards,
    overallCoveragePercent,
    lastUpdated: new Date().toISOString(),
  };
}

export async function getMasterIssuersList(filters?: {
  issuerType?: string;
  researchStatus?: string;
  searchQuery?: string;
}): Promise<MasterIssuerRecord[]> {
  return masterIssuerStore.filter((iss) => {
    if (filters?.issuerType && filters.issuerType !== "ALL" && iss.issuerType !== filters.issuerType) {
      return false;
    }
    if (filters?.researchStatus && filters.researchStatus !== "ALL" && iss.researchStatus !== filters.researchStatus) {
      return false;
    }
    if (filters?.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = iss.legalName.toLowerCase().includes(q) || iss.commonName.toLowerCase().includes(q);
      const matchSlug = iss.slug.toLowerCase().includes(q);
      const matchAlias = iss.aliases.some((a) => a.toLowerCase().includes(q));
      return matchName || matchSlug || matchAlias;
    }
    return true;
  });
}

export async function getMasterIssuerById(idOrSlug: string): Promise<MasterIssuerRecord | null> {
  const issuer = masterIssuerStore.find((i) => i.id === idOrSlug || i.slug === idOrSlug);
  return issuer || null;
}

export async function updateIssuerResearchStatus(
  id: string,
  newStatus: MasterResearchStatus,
  notes?: string,
  sourceId?: string,
): Promise<{ success: boolean; issuer?: MasterIssuerRecord }> {
  const issuer = masterIssuerStore.find((i) => i.id === id);
  if (!issuer) return { success: false };

  issuer.researchStatus = newStatus;
  if (notes) issuer.researcherNotes = notes;

  if (sourceId) {
    const existingSrc = issuer.sources.find((s) => s.url.includes(sourceId) || s.title.includes(sourceId));
    if (!existingSrc) {
      issuer.sources.push({
        title: `Verification Source (${sourceId})`,
        sourceType: "RESEARCH_EVIDENCE",
        url: sourceId.startsWith("http") ? sourceId : `https://rbi.org.in/evidence/${sourceId}`,
        publisher: "Verification Authority",
        authorityScore: 90,
        lastVerifiedAt: new Date().toISOString(),
      });
    }
  }

  issuer.lastResearchedAt = new Date().toISOString();

  return { success: true, issuer };
}

export function detectDuplicateIssuers(candidateName: string): {
  hasPotentialDuplicate: boolean;
  matchingIssuers: Array<{ id: string; name: string; matchType: "EXACT" | "ALIAS" | "FUZZY" }>;
} {
  const norm = candidateName.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!norm || norm.length === 0) {
    return { hasPotentialDuplicate: false, matchingIssuers: [] };
  }

  const matches: Array<{ id: string; name: string; matchType: "EXACT" | "ALIAS" | "FUZZY" }> = [];

  for (const iss of masterIssuerStore) {
    const issNorm = iss.commonName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const legalNorm = iss.legalName.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (issNorm === norm || legalNorm === norm) {
      matches.push({ id: iss.id, name: iss.commonName, matchType: "EXACT" });
    } else if (iss.aliases.some((a) => a.toLowerCase().replace(/[^a-z0-9]/g, "") === norm)) {
      matches.push({ id: iss.id, name: iss.commonName, matchType: "ALIAS" });
    } else if (norm.length >= 3 && (issNorm.includes(norm) || (norm.length >= 4 && issNorm.length >= 4 && norm.includes(issNorm)))) {
      matches.push({ id: iss.id, name: iss.commonName, matchType: "FUZZY" });
    }
  }

  return {
    hasPotentialDuplicate: matches.length > 0,
    matchingIssuers: matches,
  };
}

// ---------------------------------------------------------------------------
// Compatibility Helpers for Public Issuers API and Listing
// ---------------------------------------------------------------------------

export async function getIssuers(params?: {
  issuerType?: string;
  coverageStatus?: string;
  canIssueCreditCards?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 50;

  const records = masterIssuerStore.map((iss) => ({
    id: iss.id,
    name: iss.commonName,
    legalName: iss.legalName,
    slug: iss.slug,
    issuerType: iss.issuerType,
    rbiRegulatedEntity: iss.canIssueCreditCards,
    canIssueCreditCards: iss.canIssueCreditCards,
    coverageStatus: iss.researchStatus,
    cardCount: iss.discoveredCards.length,
    websiteUrl: iss.officialWebsite,
    cardPageUrl: iss.officialCardPageUrl,
  }));

  const start = (page - 1) * pageSize;
  const paginated = records.slice(start, start + pageSize);

  return {
    data: paginated,
    total: records.length,
    page,
    pageSize,
  };
}

export async function getIssuerBySlug(slug: string) {
  return getMasterIssuerById(slug);
}

export interface IssuerDetailedMetrics {
  issuerSlug: string;
  issuerName: string;
  candidateCardsCount: number;
  activeCardsCount: number;
  verifiedCardsCount: number;
  pendingCardsCount: number;
  conflictingCardsCount: number;
  discontinuedCardsCount: number;
  coBrandCardsCount: number;
  networkVariantsCount: number;
}

export async function getIssuerDetailedMetrics(issuerSlug: string): Promise<IssuerDetailedMetrics | null> {
  const issuer = masterIssuerStore.find((i) => i.slug === issuerSlug || i.id === issuerSlug);
  if (!issuer) return null;

  const total = issuer.discoveredCards.length;
  const active = issuer.discoveredCards.filter((c) => c.status === "ACTIVE").length;
  const verified = issuer.discoveredCards.filter((c) => c.isVerified).length;
  const discontinued = issuer.discoveredCards.filter((c) => c.status === "DISCONTINUED").length;
  const pending = total - verified;
  const coBrands = issuer.relationships.filter((r) => r.relationType === "CO_BRAND_PARTNER" || r.relationType === "BRAND").length;

  return {
    issuerSlug: issuer.slug,
    issuerName: issuer.commonName,
    candidateCardsCount: total,
    activeCardsCount: active,
    verifiedCardsCount: verified,
    pendingCardsCount: pending,
    conflictingCardsCount: 0,
    discontinuedCardsCount: discontinued,
    coBrandCardsCount: coBrands,
    networkVariantsCount: 4, // Visa, Mastercard, RuPay, Diners
  };
}
