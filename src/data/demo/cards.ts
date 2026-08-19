/**
 * CardIntel — Demo & UI Test Card Dataset
 *
 * NOTE: These records are for UI and integration testing.
 * All records are explicitly flagged with `demoRecord: true`.
 * In accordance with CardIntel Core Principles, unverified demo data
 * must NOT be mixed into production verified claims.
 */

export const DATA_ENVIRONMENT = "DEMO" as const;

export interface DemoSourceInfo {
  title: string;
  sourceType: string;
  url: string;
  publisher: string;
  publishedDate?: string;
  retrievedDate: string;
  effectiveDate?: string;
  verificationStatus: "VERIFIED" | "UNVERIFIED" | "PENDING_REVIEW";
}

export interface DemoCard {
  id: string;
  slug: string;
  officialName: string;
  shortName: string;
  demoRecord: true;
  issuer: {
    name: string;
    shortName: string;
    slug: string;
    issuerType: string;
    logoUrl?: string;
  };
  brand?: {
    name: string;
    slug: string;
  };
  platform?: {
    name: string;
    slug: string;
  };
  coBrandPartner?: {
    name: string;
    slug: string;
  };
  network: {
    name: string;
    slug: string;
    type: "RUPAY" | "VISA" | "MASTERCARD" | "AMEX" | "DINERS";
  };
  categories: Array<{
    name: string;
    slug: string;
    isPrimary?: boolean;
  }>;
  status:
    | "ACTIVE"
    | "INVITE_ONLY"
    | "EXISTING_CUSTOMERS_ONLY"
    | "RELATIONSHIP_ONLY"
    | "TEMPORARILY_UNAVAILABLE"
    | "DISCONTINUED"
    | "LEGACY";
  consumerOrBusiness: "CONSUMER" | "BUSINESS" | "CORPORATE" | "BOTH";
  securedOrUnsecured: "SECURED" | "UNSECURED";
  physicalOrVirtual: "PHYSICAL" | "VIRTUAL" | "BOTH";
  isMetal?: boolean;
  launchDate?: string;
  applicationUrl?: string;
  officialProductUrl?: string;
  officialFeeUrl?: string;
  termsUrl?: string;
  description: string;

  // Fees
  joiningFee: {
    amount: string;
    gstApplicable: boolean;
    fieldState: "KNOWN" | "NOT_DISCLOSED" | "NOT_APPLICABLE" | "CONDITIONAL";
  };
  annualFee: {
    amount: string;
    gstApplicable: boolean;
    fieldState: "KNOWN" | "NOT_DISCLOSED" | "NOT_APPLICABLE" | "CONDITIONAL";
  };
  feeWaiver?: {
    isLifetimeFree: boolean;
    spendThreshold?: string;
    spendPeriod?: string;
    conditions?: string;
  };
  forexMarkup: {
    percentage: string; // e.g. "3.5%" or "0%"
    isZeroForex: boolean;
    fieldState: "KNOWN" | "NOT_DISCLOSED";
  };

  // Eligibility
  eligibility: {
    minMonthlyIncome?: string;
    minAnnualIncome?: string;
    incomeFieldState: "KNOWN" | "NOT_DISCLOSED" | "CONDITIONAL";
    minAge?: number;
    maxAge?: number;
    employmentTypes: Array<
      "SALARIED" | "SELF_EMPLOYED" | "BUSINESS" | "PROFESSIONAL" | "STUDENT" | "ANY"
    >;
    minCreditScore?: number;
    cibilFieldState: "KNOWN" | "NOT_DISCLOSED" | "CONDITIONAL";
    cibilRequirementNotes?: string;
    fdRequired: boolean;
    minFdAmount?: string;
    existingBankRelationship: boolean;
  };

  // Rewards & Cashback
  rewards: {
    rewardType: "CASHBACK" | "REWARD_POINTS" | "MILES";
    currencyName: string;
    baseRateDescription: string;
    acceleratedRates: Array<{
      categoryOrMerchant: string;
      rate: string;
      cap?: string;
      notes?: string;
    }>;
    monthlyCap?: string;
    pointExpiry?: string;
    redemptionRate?: string;
  };

  // Benefits
  loungeBenefits: {
    hasLounge: boolean;
    domesticVisitsPerYear?: number;
    domesticVisitsPerQuarter?: number;
    domesticUnlimited?: boolean;
    internationalVisitsPerYear?: number;
    internationalVisitsPerQuarter?: number;
    internationalUnlimited?: boolean;
    hasPriorityPass: boolean;
    spendConditionRequired: boolean;
    spendConditionDescription?: string;
  };
  fuelBenefit?: {
    fuelSurchargeWaiver: boolean;
    waiverPercent?: string;
    monthlyCap?: string;
    minTransaction?: string;
    maxTransaction?: string;
    networksSupported?: string[];
  };
  upiBenefit?: {
    upiEnabled: boolean;
    rewardsOnUpi?: string;
  };
  railwayBenefit?: {
    irctcDiscount?: string;
    bookingReward?: string;
  };
  travelBenefits?: string[];
  insuranceBenefits?: Array<{
    type: string;
    coverageAmount: string;
  }>;

  // Editorial & Structured Analysis
  bestFor: string[];
  notIdealFor: string[];
  whyThisCard: string[];
  watchOut: string[];

  // Source Provenance
  sources: DemoSourceInfo[];
  lastVerifiedAt: string;
  confidenceScore: number;
}

export const demoCards: DemoCard[] = [
  {
    id: "demo-hdfc-millennia",
    slug: "hdfc-millennia",
    officialName: "HDFC Bank Millennia Credit Card",
    shortName: "HDFC Millennia",
    demoRecord: true,
    issuer: {
      name: "HDFC Bank",
      shortName: "HDFC",
      slug: "hdfc-bank",
      issuerType: "BANK",
    },
    network: {
      name: "Visa",
      slug: "visa",
      type: "VISA",
    },
    categories: [
      { name: "Cashback", slug: "cashback", isPrimary: true },
      { name: "Shopping", slug: "shopping" },
      { name: "Dining", slug: "dining" },
    ],
    status: "ACTIVE",
    consumerOrBusiness: "CONSUMER",
    securedOrUnsecured: "UNSECURED",
    physicalOrVirtual: "BOTH",
    launchDate: "2019-09-01",
    officialProductUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/millennia-cards",
    officialFeeUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/charges",
    description:
      "Popular lifestyle cashback credit card offering 5% cashback on leading e-commerce platforms like Amazon, Flipkart, and Swiggy, plus 1% on other spends.",
    joiningFee: {
      amount: "1000.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    annualFee: {
      amount: "1000.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    feeWaiver: {
      isLifetimeFree: false,
      spendThreshold: "100000.00",
      spendPeriod: "annual",
      conditions: "Waived on spends of ₹1,00,000 or more in the preceding 12 months.",
    },
    forexMarkup: {
      percentage: "3.50%",
      isZeroForex: false,
      fieldState: "KNOWN",
    },
    eligibility: {
      minMonthlyIncome: "35000.00",
      minAnnualIncome: "420000.00",
      incomeFieldState: "KNOWN",
      minAge: 21,
      maxAge: 60,
      employmentTypes: ["SALARIED", "SELF_EMPLOYED"],
      minCreditScore: 720,
      cibilFieldState: "KNOWN",
      cibilRequirementNotes: "Disclosed preferred score of 720+; applicants with lower scores subject to internal bank credit assessment.",
      fdRequired: false,
      existingBankRelationship: false,
    },
    rewards: {
      rewardType: "CASHBACK",
      currencyName: "CashPoints",
      baseRateDescription: "1% CashPoints on all other spends and wallet loads.",
      acceleratedRates: [
        {
          categoryOrMerchant: "Amazon, Flipkart, Swiggy, Zomato, Myntra, Tata CLiQ, Uber, BookMyShow, Cult.fit, SonyLIV",
          rate: "5% Cashback",
          cap: "₹1,000 CashPoints per calendar month across partner merchants",
        },
      ],
      monthlyCap: "₹1,000 for 5% category + ₹1,000 for 1% category per month",
      pointExpiry: "2 years from earning date",
      redemptionRate: "1 CashPoint = ₹1 for statement balance (min. 500 CashPoints required)",
    },
    loungeBenefits: {
      hasLounge: true,
      domesticVisitsPerYear: 4,
      domesticVisitsPerQuarter: 1,
      hasPriorityPass: false,
      spendConditionRequired: true,
      spendConditionDescription: "1 complimentary domestic lounge visit per quarter on spending ₹1,00,000 or more in previous calendar quarter.",
    },
    fuelBenefit: {
      fuelSurchargeWaiver: true,
      waiverPercent: "1.00%",
      monthlyCap: "₹250.00",
      minTransaction: "400.00",
      maxTransaction: "5000.00",
    },
    bestFor: [
      "Online shopping enthusiasts (Amazon, Flipkart, Myntra)",
      "Food delivery regulars (Swiggy, Zomato)",
      "Users spending ₹1 Lakh+ annually to waive annual fee",
    ],
    notIdealFor: [
      "Frequent international travelers (3.5% forex fee)",
      "High spenders needing more than ₹1,000 monthly 5% cashback cap",
      "Lounge seekers without quarterly spend of ₹1 Lakh",
    ],
    whyThisCard: [
      "Broad 5% cashback coverage on 10 major digital platforms with 1:1 statement credit conversion.",
      "Low annual fee threshold (₹1 Lakh) makes annual fee waiver easily achievable for active card users.",
      "1% cashback even on select wallet loads and offline retail swipes.",
    ],
    watchOut: [
      "5% accelerated cashback is strictly capped at ₹1,000 CashPoints per calendar month.",
      "Domestic lounge access now mandates ₹1,00,000 spend in the previous calendar quarter.",
      "Standard 3.5% + 18% GST foreign currency transaction markup applies.",
    ],
    sources: [
      {
        title: "HDFC Bank Millennia Terms & Charges Schedule",
        sourceType: "OFFICIAL_MITC",
        url: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/millennia-cards",
        publisher: "HDFC Bank Limited",
        publishedDate: "2026-04-01",
        retrievedDate: "2026-08-18",
        verificationStatus: "UNVERIFIED",
      },
    ],
    lastVerifiedAt: "2026-08-18",
    confidenceScore: 88,
  },
  {
    id: "demo-sbi-cashback",
    slug: "sbi-cashback",
    officialName: "Cashback SBI Card",
    shortName: "SBI Cashback",
    demoRecord: true,
    issuer: {
      name: "SBI Card",
      shortName: "SBI Card",
      slug: "sbi-card",
      issuerType: "NBFC",
    },
    network: {
      name: "Visa",
      slug: "visa",
      type: "VISA",
    },
    categories: [
      { name: "Cashback", slug: "cashback", isPrimary: true },
      { name: "Shopping", slug: "shopping" },
      { name: "Entry Level", slug: "entry-level" },
    ],
    status: "ACTIVE",
    consumerOrBusiness: "CONSUMER",
    securedOrUnsecured: "UNSECURED",
    physicalOrVirtual: "BOTH",
    launchDate: "2022-09-01",
    officialProductUrl: "https://www.sbicard.com/en/personal/credit-cards/rewards/cashback-sbi-card.page",
    description:
      "India's most popular flat 5% online shopping cashback card across almost all online merchants without merchant restriction.",
    joiningFee: {
      amount: "999.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    annualFee: {
      amount: "999.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    feeWaiver: {
      isLifetimeFree: false,
      spendThreshold: "200000.00",
      spendPeriod: "annual",
      conditions: "Annual fee reversal on achieving annual spends of ₹2,00,000 or more.",
    },
    forexMarkup: {
      percentage: "3.50%",
      isZeroForex: false,
      fieldState: "KNOWN",
    },
    eligibility: {
      minMonthlyIncome: "30000.00",
      minAnnualIncome: "360000.00",
      incomeFieldState: "KNOWN",
      minAge: 21,
      maxAge: 70,
      employmentTypes: ["SALARIED", "SELF_EMPLOYED"],
      cibilFieldState: "NOT_DISCLOSED",
      cibilRequirementNotes: "Minimum score not publicly disclosed by SBI Card; approvals subject to internal credit policy.",
      fdRequired: false,
      existingBankRelationship: false,
    },
    rewards: {
      rewardType: "CASHBACK",
      currencyName: "Direct Cashback",
      baseRateDescription: "1% cashback on offline spends and general utility/non-excluded transactions.",
      acceleratedRates: [
        {
          categoryOrMerchant: "All online spends across e-commerce (merchant-agnostic)",
          rate: "5% Cashback",
          cap: "₹5,000 cashback per statement cycle",
        },
      ],
      monthlyCap: "₹5,000 per statement cycle for 5% online tier",
      redemptionRate: "Auto-credited to SBI Card statement within 2 days of statement generation",
    },
    loungeBenefits: {
      hasLounge: false,
      hasPriorityPass: false,
      spendConditionRequired: false,
    },
    fuelBenefit: {
      fuelSurchargeWaiver: true,
      waiverPercent: "1.00%",
      monthlyCap: "₹100.00",
      minTransaction: "500.00",
      maxTransaction: "3000.00",
    },
    bestFor: [
      "Versatile online shoppers buying across multiple websites and platforms",
      "Anyone who wants direct automatic statement credit cashback",
      "Spenders doing ₹20,000–₹1,00,000 online monthly",
    ],
    notIdealFor: [
      "Travelers needing airport lounge access (no lounge benefits provided)",
      "High utility, insurance, rent, wallet, fuel, or jewelry spend (these categories are excluded from 5%)",
      "Users spending under ₹2 Lakhs looking for a guaranteed zero-fee card",
    ],
    whyThisCard: [
      "Industry-leading 5% online cashback without being locked into specific merchant platforms.",
      "High monthly cashback cap of ₹5,000 allows rewards on up to ₹1,00,000 online monthly spend.",
      "Automatic statement credit credit—no manual voucher redemption or points devaluation risk.",
    ],
    watchOut: [
      "Zero airport lounge access benefits included.",
      "Major excluded categories: Rent, Utilities, Fuel, Insurance, Education, Wallet Loads, Government, Jewelry.",
      "₹2 Lakh annual spend required for fee waiver.",
    ],
    sources: [
      {
        title: "SBI Card Cashback MITC and Exclusions Schedule",
        sourceType: "OFFICIAL_MITC",
        url: "https://www.sbicard.com",
        publisher: "SBI Cards and Payment Services Ltd",
        retrievedDate: "2026-08-18",
        verificationStatus: "UNVERIFIED",
      },
    ],
    lastVerifiedAt: "2026-08-18",
    confidenceScore: 90,
  },
  {
    id: "demo-icici-amazon-pay",
    slug: "icici-amazon-pay",
    officialName: "Amazon Pay ICICI Bank Credit Card",
    shortName: "ICICI Amazon Pay",
    demoRecord: true,
    issuer: {
      name: "ICICI Bank",
      shortName: "ICICI",
      slug: "icici-bank",
      issuerType: "BANK",
    },
    coBrandPartner: {
      name: "Amazon Pay India",
      slug: "amazon-pay",
    },
    network: {
      name: "Visa",
      slug: "visa",
      type: "VISA",
    },
    categories: [
      { name: "Lifetime Free", slug: "lifetime-free", isPrimary: true },
      { name: "Cashback", slug: "cashback" },
      { name: "Co-Branded", slug: "co-branded" },
      { name: "Shopping", slug: "shopping" },
    ],
    status: "ACTIVE",
    consumerOrBusiness: "CONSUMER",
    securedOrUnsecured: "UNSECURED",
    physicalOrVirtual: "BOTH",
    launchDate: "2018-10-01",
    officialProductUrl: "https://www.icicibank.com/personal-banking/cards/credit-cards/amazon-pay-credit-card",
    description:
      "India's iconic unconditional Lifetime Free co-branded credit card offering 5% unlimited cashback on Amazon for Prime members and 3% for non-Prime members.",
    joiningFee: {
      amount: "0.00",
      gstApplicable: false,
      fieldState: "KNOWN",
    },
    annualFee: {
      amount: "0.00",
      gstApplicable: false,
      fieldState: "KNOWN",
    },
    feeWaiver: {
      isLifetimeFree: true,
      conditions: "Unconditionally Lifetime Free (No joining fee, no annual fee ever).",
    },
    forexMarkup: {
      percentage: "3.50%",
      isZeroForex: false,
      fieldState: "KNOWN",
    },
    eligibility: {
      minMonthlyIncome: "25000.00",
      minAnnualIncome: "300000.00",
      incomeFieldState: "KNOWN",
      minAge: 18,
      maxAge: 65,
      employmentTypes: ["SALARIED", "SELF_EMPLOYED"],
      minCreditScore: 700,
      cibilFieldState: "KNOWN",
      cibilRequirementNotes: "Typically requires 700+ CIBIL score or pre-approved invitation on Amazon app.",
      fdRequired: false,
      existingBankRelationship: false,
    },
    rewards: {
      rewardType: "CASHBACK",
      currencyName: "Amazon Pay Balance",
      baseRateDescription: "1% unlimited cashback on all other domestic retail spends.",
      acceleratedRates: [
        {
          categoryOrMerchant: "Amazon India (for Amazon Prime members)",
          rate: "5% Unlimited Cashback",
          cap: "No Upper Limit (Unlimited)",
        },
        {
          categoryOrMerchant: "Amazon India (for Non-Prime members)",
          rate: "3% Unlimited Cashback",
          cap: "No Upper Limit (Unlimited)",
        },
        {
          categoryOrMerchant: "Amazon Pay Partner Merchants (Flight/Hotel bookings, Recharges, Bill payments on Amazon)",
          rate: "2% Unlimited Cashback",
          cap: "No Upper Limit (Unlimited)",
        },
      ],
      redemptionRate: "Auto-credited directly as Amazon Pay balance every month with no expiry",
    },
    loungeBenefits: {
      hasLounge: false,
      hasPriorityPass: false,
      spendConditionRequired: false,
    },
    fuelBenefit: {
      fuelSurchargeWaiver: true,
      waiverPercent: "1.00%",
      monthlyCap: "Unlimited",
      minTransaction: "400.00",
      maxTransaction: "4000.00",
    },
    bestFor: [
      "Frequent Amazon Prime shoppers",
      "Anyone seeking a 100% Lifetime Free credit card with zero maintenance worry",
      "Beginners building credit score with high utility spend",
    ],
    notIdealFor: [
      "Offline shoppers looking for >1% reward rates",
      "Travelers needing airport lounge access",
      "Non-Amazon ecosystem shoppers",
    ],
    whyThisCard: [
      "Zero joining and zero annual fee for life with no spend conditions.",
      "Unlimited 5% cashback on Amazon with zero monthly cap.",
      "Monthly earnings are automatically credited directly into Amazon Pay balance.",
    ],
    watchOut: [
      "Cashback is credited as Amazon Pay balance—cannot be withdrawn to bank account directly.",
      "No complimentary airport lounge access.",
      "5% rate requires active paid Amazon Prime membership.",
    ],
    sources: [
      {
        title: "Amazon Pay ICICI Card Feature Schedule",
        sourceType: "OFFICIAL_BANK_PAGE",
        url: "https://www.icicibank.com",
        publisher: "ICICI Bank Limited",
        retrievedDate: "2026-08-18",
        verificationStatus: "UNVERIFIED",
      },
    ],
    lastVerifiedAt: "2026-08-18",
    confidenceScore: 92,
  },
  {
    id: "demo-tata-neu-infinity",
    slug: "tata-neu-infinity-hdfc",
    officialName: "Tata Neu Infinity HDFC Bank Credit Card",
    shortName: "Tata Neu Infinity",
    demoRecord: true,
    issuer: {
      name: "HDFC Bank",
      shortName: "HDFC",
      slug: "hdfc-bank",
      issuerType: "BANK",
    },
    coBrandPartner: {
      name: "Tata Digital",
      slug: "tata-neu",
    },
    network: {
      name: "RuPay",
      slug: "rupay",
      type: "RUPAY",
    },
    categories: [
      { name: "UPI", slug: "upi", isPrimary: true },
      { name: "Cashback", slug: "cashback" },
      { name: "Co-Branded", slug: "co-branded" },
      { name: "Shopping", slug: "shopping" },
    ],
    status: "ACTIVE",
    consumerOrBusiness: "CONSUMER",
    securedOrUnsecured: "UNSECURED",
    physicalOrVirtual: "BOTH",
    launchDate: "2022-08-01",
    officialProductUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/tata-neu-infinity-credit-card",
    description:
      "Premier RuPay UPI credit card offering 1.5% NeuCoins on UPI spends and up to 10% value back across the Tata ecosystem brands.",
    joiningFee: {
      amount: "1499.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    annualFee: {
      amount: "1499.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    feeWaiver: {
      isLifetimeFree: false,
      spendThreshold: "300000.00",
      spendPeriod: "annual",
      conditions: "Waived on spends of ₹3,00,000 or more in the previous anniversary year.",
    },
    forexMarkup: {
      percentage: "2.00%",
      isZeroForex: false,
      fieldState: "KNOWN",
    },
    eligibility: {
      minMonthlyIncome: "100000.00",
      minAnnualIncome: "1200000.00",
      incomeFieldState: "KNOWN",
      minAge: 21,
      maxAge: 60,
      employmentTypes: ["SALARIED", "SELF_EMPLOYED"],
      cibilFieldState: "NOT_DISCLOSED",
      fdRequired: false,
      existingBankRelationship: false,
    },
    rewards: {
      rewardType: "REWARD_POINTS",
      currencyName: "NeuCoins",
      baseRateDescription: "1.5% NeuCoins on non-Tata and other eligible spends.",
      acceleratedRates: [
        {
          categoryOrMerchant: "Tata Neu Ecosystem (BigBasket, Croma, Tata 1mg, Air India, Taj Hotels, Westside, Titan, Tata CLiQ)",
          rate: "5% NeuCoins + 5% NeuPass (Total 10%)",
          cap: "No cap on core 5% NeuCoins",
        },
        {
          categoryOrMerchant: "Merchant UPI Spends (Linked via Tata Neu UPI / BHIM)",
          rate: "1.5% NeuCoins on UPI",
          cap: "500 NeuCoins per calendar month on UPI",
        },
      ],
      pointExpiry: "1 year from date of earning",
      redemptionRate: "1 NeuCoin = ₹1 across Tata brands on Tata Neu app",
    },
    loungeBenefits: {
      hasLounge: true,
      domesticVisitsPerYear: 8,
      domesticVisitsPerQuarter: 2,
      internationalVisitsPerYear: 4,
      hasPriorityPass: true,
      spendConditionRequired: false,
      spendConditionDescription: "Complimentary domestic and international lounge access with Priority Pass.",
    },
    fuelBenefit: {
      fuelSurchargeWaiver: true,
      waiverPercent: "1.00%",
      monthlyCap: "₹500.00",
      minTransaction: "400.00",
      maxTransaction: "5000.00",
    },
    upiBenefit: {
      upiEnabled: true,
      rewardsOnUpi: "1.5% NeuCoins on eligible merchant QR payments (up to 500 NeuCoins/month)",
    },
    bestFor: [
      "Frequent Tata ecosystem users (BigBasket groceries, Croma electronics, 1mg medicines, Air India)",
      "UPI power users wanting high 1.5% rewards on QR code scan payments",
      "Travelers wanting domestic and international lounge access with lowered 2% forex fee",
    ],
    notIdealFor: [
      "People who do not shop on BigBasket/Croma or Tata brands",
      "Anyone who dislikes brand-restricted loyalty currencies (NeuCoins)",
      "Low spenders unable to justify the ₹1,499 annual fee",
    ],
    whyThisCard: [
      "Industry best 1.5% rewards on RuPay UPI merchant QR payments.",
      "Generous 8 domestic + 4 international lounge visits per year without tough quarterly spend barriers.",
      "Reduced 2.0% forex markup compared to the typical 3.5% bank standard.",
    ],
    watchOut: [
      "UPI cashback is capped at 500 NeuCoins per calendar month.",
      "NeuCoins expire within 365 days of issuance if unused.",
      "₹3,00,000 spend required for annual fee waiver.",
    ],
    sources: [
      {
        title: "HDFC Tata Neu Infinity Card Schedule",
        sourceType: "OFFICIAL_MITC",
        url: "https://www.hdfcbank.com",
        publisher: "HDFC Bank Limited",
        retrievedDate: "2026-08-18",
        verificationStatus: "UNVERIFIED",
      },
    ],
    lastVerifiedAt: "2026-08-18",
    confidenceScore: 89,
  },
  {
    id: "demo-scapia-federal",
    slug: "scapia-federal-bank",
    officialName: "Scapia Federal Bank Credit Card",
    shortName: "Scapia Card",
    demoRecord: true,
    issuer: {
      name: "Federal Bank",
      shortName: "Federal Bank",
      slug: "federal-bank",
      issuerType: "BANK",
    },
    platform: {
      name: "Scapia Technology",
      slug: "scapia",
    },
    network: {
      name: "Visa",
      slug: "visa",
      type: "VISA",
    },
    categories: [
      { name: "Forex", slug: "forex", isPrimary: true },
      { name: "Travel", slug: "travel" },
      { name: "Lifetime Free", slug: "lifetime-free" },
    ],
    status: "ACTIVE",
    consumerOrBusiness: "CONSUMER",
    securedOrUnsecured: "UNSECURED",
    physicalOrVirtual: "BOTH",
    launchDate: "2023-06-01",
    officialProductUrl: "https://www.scapia.cards",
    description:
      "Travel-focused zero-forex credit card issued by Federal Bank with zero annual fee and unlimited domestic lounge access on spend threshold.",
    joiningFee: {
      amount: "0.00",
      gstApplicable: false,
      fieldState: "KNOWN",
    },
    annualFee: {
      amount: "0.00",
      gstApplicable: false,
      fieldState: "KNOWN",
    },
    feeWaiver: {
      isLifetimeFree: true,
      conditions: "Zero joining and zero annual fee forever.",
    },
    forexMarkup: {
      percentage: "0.00%",
      isZeroForex: true,
      fieldState: "KNOWN",
    },
    eligibility: {
      minMonthlyIncome: "30000.00",
      incomeFieldState: "KNOWN",
      minAge: 21,
      maxAge: 65,
      employmentTypes: ["SALARIED", "SELF_EMPLOYED"],
      minCreditScore: 750,
      cibilFieldState: "KNOWN",
      cibilRequirementNotes: "Requires 750+ CIBIL score. Existing Federal Bank cardholders may face onboarding restrictions.",
      fdRequired: false,
      existingBankRelationship: false,
    },
    rewards: {
      rewardType: "REWARD_POINTS",
      currencyName: "Scapia Coins",
      baseRateDescription: "10% Scapia Coins (2% value back) on domestic and international spends.",
      acceleratedRates: [
        {
          categoryOrMerchant: "Travel bookings on Scapia App (Flights and Hotels)",
          rate: "20% Scapia Coins (4% value back)",
          cap: "Unlimited",
        },
      ],
      pointExpiry: "Coins do not expire as long as card is active",
      redemptionRate: "5 Scapia Coins = ₹1 on flight and hotel bookings in Scapia app",
    },
    loungeBenefits: {
      hasLounge: true,
      domesticUnlimited: true,
      hasPriorityPass: false,
      spendConditionRequired: true,
      spendConditionDescription: "Unlimited domestic lounge access on spending ₹10,000 or more in the current statement billing cycle.",
    },
    fuelBenefit: {
      fuelSurchargeWaiver: false,
    },
    bestFor: [
      "International travelers wanting true 0% forex markup worldwide",
      "Anyone wanting a Lifetime Free card with low lounge spend barrier (₹10k/month)",
      "Frequent flight and hotel bookers",
    ],
    notIdealFor: [
      "People wanting cash or statement credit cashback (Coins can only be used on travel in-app)",
      "Non-travelers who don't book flights/hotels",
      "Existing Federal Bank credit card holders due to single-card policy",
    ],
    whyThisCard: [
      "True 0% forex markup saves 3.5% to 4.13% on all international online and POS transactions.",
      "Lowest domestic lounge access threshold in India: ₹10,000 spend in the billing cycle unlocks lounge access.",
      "100% lifetime free with no hidden maintenance fees.",
    ],
    watchOut: [
      "Scapia Coins can only be redeemed for flight and hotel bookings inside the Scapia app.",
      "No fuel surcharge waiver provided.",
      "Strict onboarding criteria regarding previous Federal Bank relationship.",
    ],
    sources: [
      {
        title: "Federal Bank Scapia MITC and Travel Terms",
        sourceType: "OFFICIAL_MITC",
        url: "https://www.federalbank.co.in",
        publisher: "The Federal Bank Ltd",
        retrievedDate: "2026-08-18",
        verificationStatus: "UNVERIFIED",
      },
    ],
    lastVerifiedAt: "2026-08-18",
    confidenceScore: 87,
  },
  {
    id: "demo-onecard-metal",
    slug: "onecard-metal",
    officialName: "OneCard Metal Credit Card",
    shortName: "OneCard",
    demoRecord: true,
    issuer: {
      name: "Federal Bank / SBM / CSB / South Indian Bank",
      shortName: "Partner Banks",
      slug: "federal-bank",
      issuerType: "BANK",
    },
    platform: {
      name: "FPL Technologies (OneCard)",
      slug: "onecard",
    },
    network: {
      name: "Visa",
      slug: "visa",
      type: "VISA",
    },
    categories: [
      { name: "Metal", slug: "metal", isPrimary: true },
      { name: "Lifetime Free", slug: "lifetime-free" },
      { name: "FD-Backed / Secured", slug: "fd-backed" },
      { name: "Rewards", slug: "rewards" },
    ],
    status: "ACTIVE",
    consumerOrBusiness: "CONSUMER",
    securedOrUnsecured: "UNSECURED",
    physicalOrVirtual: "BOTH",
    isMetal: true,
    launchDate: "2020-02-01",
    officialProductUrl: "https://www.getonecard.app",
    description:
      "App-first metal credit card with zero annual fee, 5x reward points on top two monthly spend categories, and an instant FD-backed option.",
    joiningFee: {
      amount: "0.00",
      gstApplicable: false,
      fieldState: "KNOWN",
    },
    annualFee: {
      amount: "0.00",
      gstApplicable: false,
      fieldState: "KNOWN",
    },
    feeWaiver: {
      isLifetimeFree: true,
      conditions: "Lifetime free metal card with zero annual fees.",
    },
    forexMarkup: {
      percentage: "1.00%",
      isZeroForex: false,
      fieldState: "KNOWN",
    },
    eligibility: {
      minAge: 18,
      maxAge: 70,
      employmentTypes: ["SALARIED", "SELF_EMPLOYED", "STUDENT", "ANY"],
      incomeFieldState: "NOT_DISCLOSED",
      cibilFieldState: "KNOWN",
      minCreditScore: 730,
      cibilRequirementNotes: "730+ for unsecured metal card. If CIBIL is low or new-to-credit, available as secured card with ₹5,000+ FD.",
      fdRequired: false,
      minFdAmount: "5000.00",
      existingBankRelationship: false,
    },
    rewards: {
      rewardType: "REWARD_POINTS",
      currencyName: "OnePoints",
      baseRateDescription: "1 point per ₹50 spent (0.2% base value).",
      acceleratedRates: [
        {
          categoryOrMerchant: "Top 2 spend categories in the month",
          rate: "5X Rewards (1.0% value back)",
          cap: "No cap",
        },
      ],
      pointExpiry: "Points never expire",
      redemptionRate: "10 OnePoints = ₹1. Instant 1-tap statement credit payoff.",
    },
    loungeBenefits: {
      hasLounge: false,
      hasPriorityPass: false,
      spendConditionRequired: false,
    },
    fuelBenefit: {
      fuelSurchargeWaiver: true,
      waiverPercent: "1.00%",
      monthlyCap: "₹400.00",
      minTransaction: "400.00",
      maxTransaction: "4000.00",
    },
    bestFor: [
      "Users looking for a premium metal card with zero annual fee",
      "New-to-credit or credit repair users (instant FD option starting ₹5,000)",
      "Anyone who wants low 1% forex markup on international spends",
    ],
    notIdealFor: [
      "Lounge seekers (no airport lounge access included)",
      "High reward seekers looking for 3%+ returns on general retail",
    ],
    whyThisCard: [
      "Solid metal card with zero joining and annual fees.",
      "Very low 1.0% forex fee compared to 3.5% standard bank charges.",
      "FD-backed option starting at just ₹5,000 helps build/repair CIBIL credit score.",
    ],
    watchOut: [
      "Base reward rate is relatively low at 0.2% (1% on top two spend categories).",
      "No complimentary domestic or international lounge visits.",
      "Issuing bank partner is assigned algorithmically at application time.",
    ],
    sources: [
      {
        title: "OneCard Terms of Service and Most Important Terms",
        sourceType: "OFFICIAL_TERMS",
        url: "https://www.getonecard.app/legal",
        publisher: "FPL Technologies / Partner Banks",
        retrievedDate: "2026-08-18",
        verificationStatus: "UNVERIFIED",
      },
    ],
    lastVerifiedAt: "2026-08-18",
    confidenceScore: 86,
  },
  {
    id: "demo-hdfc-infinia",
    slug: "hdfc-infinia-metal",
    officialName: "HDFC Bank Infinia Credit Card (Metal Edition)",
    shortName: "HDFC Infinia",
    demoRecord: true,
    issuer: {
      name: "HDFC Bank",
      shortName: "HDFC",
      slug: "hdfc-bank",
      issuerType: "BANK",
    },
    network: {
      name: "Visa",
      slug: "visa",
      type: "VISA",
    },
    categories: [
      { name: "Super Premium", slug: "super-premium", isPrimary: true },
      { name: "Metal", slug: "metal" },
      { name: "Travel", slug: "travel" },
      { name: "Dining", slug: "dining" },
    ],
    status: "INVITE_ONLY",
    consumerOrBusiness: "CONSUMER",
    securedOrUnsecured: "UNSECURED",
    physicalOrVirtual: "BOTH",
    isMetal: true,
    launchDate: "2021-10-01",
    officialProductUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/infinia-credit-card",
    description:
      "India's gold-standard invitation-only super premium metal credit card offering 3.3% base reward rate and up to 33% reward rate via SmartBuy travel portal.",
    joiningFee: {
      amount: "12500.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    annualFee: {
      amount: "12500.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    feeWaiver: {
      isLifetimeFree: false,
      spendThreshold: "1000000.00",
      spendPeriod: "annual",
      conditions: "Waived on spends of ₹10,00,000 or more in the preceding 12 months.",
    },
    forexMarkup: {
      percentage: "2.00%",
      isZeroForex: false,
      fieldState: "KNOWN",
    },
    eligibility: {
      minMonthlyIncome: "300000.00",
      minAnnualIncome: "3600000.00",
      incomeFieldState: "KNOWN",
      minAge: 21,
      maxAge: 65,
      employmentTypes: ["SALARIED", "SELF_EMPLOYED", "BUSINESS"],
      minCreditScore: 780,
      cibilFieldState: "KNOWN",
      cibilRequirementNotes: "Strictly invitation-only. Typically requires ₹3 Lakh+ net monthly salary or ₹8 Lakh+ existing card limit on HDFC cards.",
      fdRequired: false,
      existingBankRelationship: true,
    },
    rewards: {
      rewardType: "REWARD_POINTS",
      currencyName: "Reward Points",
      baseRateDescription: "5 points per ₹150 spent (3.33% reward rate on general spends).",
      acceleratedRates: [
        {
          categoryOrMerchant: "SmartBuy Flight Bookings",
          rate: "5X Points (16.6% Reward Rate)",
          cap: "15,000 points/month on SmartBuy",
        },
        {
          categoryOrMerchant: "SmartBuy Hotel Bookings & Instant Vouchers",
          rate: "10X Points (33.3% Reward Rate)",
          cap: "15,000 points/month on SmartBuy",
        },
      ],
      monthlyCap: "15,000 accelerated bonus points per calendar month",
      pointExpiry: "3 years from date of earning",
      redemptionRate: "1 Reward Point = ₹1.00 for flight/hotel bookings on SmartBuy or 1:1 air miles transfer",
    },
    loungeBenefits: {
      hasLounge: true,
      domesticUnlimited: true,
      internationalUnlimited: true,
      hasPriorityPass: true,
      spendConditionRequired: false,
      spendConditionDescription: "Unlimited domestic and international lounge access for primary and add-on cardholders with complimentary guest access.",
    },
    fuelBenefit: {
      fuelSurchargeWaiver: true,
      waiverPercent: "1.00%",
      monthlyCap: "₹1000.00",
      minTransaction: "400.00",
      maxTransaction: "10000.00",
    },
    bestFor: [
      "High net-worth individuals spending ₹10L+ annually",
      "Frequent luxury travelers seeking 1:1 points-to-miles conversion and 33% travel returns",
      "Users wanting unconditional unlimited worldwide lounge access with guest passes",
    ],
    notIdealFor: [
      "Moderate spenders unable to qualify for invitation criteria (₹3L/month net income)",
      "Users who do not travel or book flights/hotels via SmartBuy",
    ],
    whyThisCard: [
      "Unmatched 3.3% base reward rate with 1:1 valuation (1 point = ₹1) on flights and hotels.",
      "Unlimited domestic and international lounge access with complimentary guest visits.",
      "Low 2% forex markup fee and 12,500 bonus reward points on fee payment.",
    ],
    watchOut: [
      "Strict invitation-only approval criteria.",
      "SmartBuy accelerated points are capped at 15,000 bonus points per month.",
      "₹10 Lakh annual spend required for fee waiver.",
    ],
    sources: [
      {
        title: "HDFC Bank Infinia Card Guide and MITC",
        sourceType: "OFFICIAL_MITC",
        url: "https://www.hdfcbank.com",
        publisher: "HDFC Bank Limited",
        retrievedDate: "2026-08-18",
        verificationStatus: "UNVERIFIED",
      },
    ],
    lastVerifiedAt: "2026-08-18",
    confidenceScore: 94,
  },
  {
    id: "demo-axis-airtel",
    slug: "axis-airtel",
    officialName: "Airtel Axis Bank Credit Card",
    shortName: "Axis Airtel",
    demoRecord: true,
    issuer: {
      name: "Axis Bank",
      shortName: "Axis",
      slug: "axis-bank",
      issuerType: "BANK",
    },
    coBrandPartner: {
      name: "Bharti Airtel",
      slug: "airtel",
    },
    network: {
      name: "Mastercard",
      slug: "mastercard",
      type: "MASTERCARD",
    },
    categories: [
      { name: "Cashback", slug: "cashback", isPrimary: true },
      { name: "Co-Branded", slug: "co-branded" },
      { name: "Dining", slug: "dining" },
      { name: "Entry Level", slug: "entry-level" },
    ],
    status: "ACTIVE",
    consumerOrBusiness: "CONSUMER",
    securedOrUnsecured: "UNSECURED",
    physicalOrVirtual: "BOTH",
    launchDate: "2022-03-01",
    officialProductUrl: "https://www.axisbank.com/retail/cards/credit-card/airtel-axis-bank-credit-card",
    description:
      "High-yield utility and dining cashback card providing 25% cashback on Airtel bills, 10% on Swiggy/Zomato/BigBasket, and 10% on utility bills.",
    joiningFee: {
      amount: "500.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    annualFee: {
      amount: "500.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    feeWaiver: {
      isLifetimeFree: false,
      spendThreshold: "200000.00",
      spendPeriod: "annual",
      conditions: "Annual fee waived on spending ₹2,00,000 or more in the year.",
    },
    forexMarkup: {
      percentage: "3.50%",
      isZeroForex: false,
      fieldState: "KNOWN",
    },
    eligibility: {
      minMonthlyIncome: "25000.00",
      minAnnualIncome: "300000.00",
      incomeFieldState: "KNOWN",
      minAge: 18,
      maxAge: 70,
      employmentTypes: ["SALARIED", "SELF_EMPLOYED"],
      minCreditScore: 720,
      cibilFieldState: "KNOWN",
      cibilRequirementNotes: "Typically requires 720+ CIBIL score. Applied primarily via Airtel Thanks App.",
      fdRequired: false,
      existingBankRelationship: false,
    },
    rewards: {
      rewardType: "CASHBACK",
      currencyName: "Statement Credit",
      baseRateDescription: "1% unlimited cashback on other retail transactions.",
      acceleratedRates: [
        {
          categoryOrMerchant: "Airtel Mobile, Broadband, DTH, Wi-Fi via Airtel Thanks App",
          rate: "25% Cashback",
          cap: "₹250 per calendar month",
        },
        {
          categoryOrMerchant: "Utility Bill Payments (Electricity, Gas, Water via Airtel Thanks App)",
          rate: "10% Cashback",
          cap: "₹250 per calendar month",
        },
        {
          categoryOrMerchant: "Swiggy, Zomato, BigBasket",
          rate: "10% Cashback",
          cap: "₹500 per calendar month combined",
        },
      ],
      monthlyCap: "₹250 (Airtel) + ₹250 (Utilities) + ₹500 (Swiggy/Zomato/BB) = ₹1,000/month",
      redemptionRate: "Auto-credited directly to card statement each month",
    },
    loungeBenefits: {
      hasLounge: true,
      domesticVisitsPerYear: 4,
      domesticVisitsPerQuarter: 1,
      hasPriorityPass: false,
      spendConditionRequired: true,
      spendConditionDescription: "1 complimentary domestic lounge visit per quarter upon spending ₹50,000 in previous 3 calendar months.",
    },
    fuelBenefit: {
      fuelSurchargeWaiver: true,
      waiverPercent: "1.00%",
      monthlyCap: "₹500.00",
      minTransaction: "400.00",
      maxTransaction: "4000.00",
    },
    bestFor: [
      "Households paying Airtel broadband, DTH, or mobile postpaid bills",
      "Regular utility bill payers (electricity, water, piped gas)",
      "Food delivery and grocery spenders (Swiggy, Zomato, BigBasket)",
    ],
    notIdealFor: [
      "Non-Airtel subscribers (misses the flagship 25% cashback category)",
      "Large spenders exceeding the ₹250/month utility cap",
      "Frequent international travelers",
    ],
    whyThisCard: [
      "25% cashback on Airtel services yields up to ₹3,000 savings annually on phone/broadband.",
      "10% cashback on electricity/water/gas bills easily offsets the modest ₹500 fee within 2 months.",
      "10% cashback on Swiggy and Zomato delivers up to ₹6,000 annual food savings.",
    ],
    watchOut: [
      "Strict category-wise monthly caps: ₹250 for Airtel, ₹250 for Utilities, ₹500 for Food/Grocery.",
      "Cashback on utility bills requires paying through the Airtel Thanks App.",
      "Domestic lounge access requires ₹50,000 spend in preceding 3 months.",
    ],
    sources: [
      {
        title: "Airtel Axis Bank Credit Card Terms & Conditions",
        sourceType: "OFFICIAL_MITC",
        url: "https://www.axisbank.com",
        publisher: "Axis Bank Limited",
        retrievedDate: "2026-08-18",
        verificationStatus: "UNVERIFIED",
      },
    ],
    lastVerifiedAt: "2026-08-18",
    confidenceScore: 89,
  },
  {
    id: "demo-idfc-first-wealth",
    slug: "idfc-first-wealth",
    officialName: "IDFC FIRST Wealth Credit Card",
    shortName: "IDFC Wealth",
    demoRecord: true,
    issuer: {
      name: "IDFC FIRST Bank",
      shortName: "IDFC FIRST",
      slug: "idfc-first-bank",
      issuerType: "BANK",
    },
    network: {
      name: "Visa",
      slug: "visa",
      type: "VISA",
    },
    categories: [
      { name: "Lifetime Free", slug: "lifetime-free", isPrimary: true },
      { name: "Premium", slug: "premium" },
      { name: "Forex", slug: "forex" },
      { name: "Travel", slug: "travel" },
    ],
    status: "ACTIVE",
    consumerOrBusiness: "CONSUMER",
    securedOrUnsecured: "UNSECURED",
    physicalOrVirtual: "BOTH",
    launchDate: "2021-01-01",
    officialProductUrl: "https://www.idfcfirstbank.com/credit-card/wealth",
    description:
      "Unconditional Lifetime Free premium credit card with 1.5% low forex markup, complimentary domestic and international lounge visits, and movie ticket discounts.",
    joiningFee: {
      amount: "0.00",
      gstApplicable: false,
      fieldState: "KNOWN",
    },
    annualFee: {
      amount: "0.00",
      gstApplicable: false,
      fieldState: "KNOWN",
    },
    feeWaiver: {
      isLifetimeFree: true,
      conditions: "Unconditionally Lifetime Free (No joining fee, no annual fee ever).",
    },
    forexMarkup: {
      percentage: "1.50%",
      isZeroForex: false,
      fieldState: "KNOWN",
    },
    eligibility: {
      minMonthlyIncome: "250000.00",
      minAnnualIncome: "3000000.00",
      incomeFieldState: "KNOWN",
      minAge: 21,
      maxAge: 65,
      employmentTypes: ["SALARIED", "SELF_EMPLOYED", "BUSINESS"],
      minCreditScore: 750,
      cibilFieldState: "KNOWN",
      fdRequired: false,
      existingBankRelationship: false,
    },
    rewards: {
      rewardType: "REWARD_POINTS",
      currencyName: "FIRST Reward Points",
      baseRateDescription: "3X points on offline spends (0.75% value back) and 6X on online spends (1.50% value back).",
      acceleratedRates: [
        {
          categoryOrMerchant: "Spends exceeding ₹30,000 in a billing cycle & birthday spends",
          rate: "10X Points (2.5% value back)",
          cap: "No cap",
        },
      ],
      pointExpiry: "Reward points never expire",
      redemptionRate: "1 FIRST Reward Point = ₹0.25 on bill payments, gift cards, and online checkouts",
    },
    loungeBenefits: {
      hasLounge: true,
      domesticVisitsPerQuarter: 4,
      domesticVisitsPerYear: 16,
      internationalVisitsPerQuarter: 4,
      internationalVisitsPerYear: 16,
      hasPriorityPass: true,
      spendConditionRequired: true,
      spendConditionDescription: "4 complimentary domestic and international lounge visits per quarter on spending ₹20,000 in previous calendar month.",
    },
    fuelBenefit: {
      fuelSurchargeWaiver: true,
      waiverPercent: "1.00%",
      monthlyCap: "₹300.00",
      minTransaction: "200.00",
      maxTransaction: "5000.00",
    },
    bestFor: [
      "High earners seeking an unconditional Lifetime Free premium card",
      "Frequent travelers needing high lounge quota (16 domestic + 16 intl/year)",
      "Anyone wanting low 1.5% forex markup without paying annual fees",
    ],
    notIdealFor: [
      "Applicants with salary under ₹2.5L/month",
      "Pure cashback seekers wanting direct statement credits",
    ],
    whyThisCard: [
      "Zero joining and zero annual fee forever with premium wealth-tier benefits.",
      "Low 1.5% forex markup fee—half the typical bank charge.",
      "Reward points never expire and have zero redemption fee.",
    ],
    watchOut: [
      "High income eligibility requirement (₹36 Lakhs annual income).",
      "Lounge visits require spending ₹20,000 in the previous calendar month.",
      "Base offline reward rate is modest (0.75%).",
    ],
    sources: [
      {
        title: "IDFC FIRST Wealth Card Schedule of Charges",
        sourceType: "OFFICIAL_MITC",
        url: "https://www.idfcfirstbank.com",
        publisher: "IDFC FIRST Bank Limited",
        retrievedDate: "2026-08-18",
        verificationStatus: "UNVERIFIED",
      },
    ],
    lastVerifiedAt: "2026-08-18",
    confidenceScore: 91,
  },
  {
    id: "demo-kotak-white",
    slug: "kotak-white",
    officialName: "Kotak White Credit Card",
    shortName: "Kotak White",
    demoRecord: true,
    issuer: {
      name: "Kotak Mahindra Bank",
      shortName: "Kotak",
      slug: "kotak-mahindra-bank",
      issuerType: "BANK",
    },
    network: {
      name: "Visa",
      slug: "visa",
      type: "VISA",
    },
    categories: [
      { name: "Premium", slug: "premium", isPrimary: true },
      { name: "Shopping", slug: "shopping" },
      { name: "Rewards", slug: "rewards" },
    ],
    status: "ACTIVE",
    consumerOrBusiness: "CONSUMER",
    securedOrUnsecured: "UNSECURED",
    physicalOrVirtual: "BOTH",
    launchDate: "2021-06-01",
    officialProductUrl: "https://www.kotak.com/en/personal-banking/cards/credit-cards/white-credit-card.html",
    description:
      "Milestone-focused premium card rewarding spenders with White Pass value vouchers on achieving annual spend milestones.",
    joiningFee: {
      amount: "3000.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    annualFee: {
      amount: "3000.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    feeWaiver: {
      isLifetimeFree: false,
      spendThreshold: "500000.00",
      spendPeriod: "annual",
      conditions: "Annual fee waived on annual spends of ₹5,00,000 or more.",
    },
    forexMarkup: {
      percentage: "3.50%",
      isZeroForex: false,
      fieldState: "KNOWN",
    },
    eligibility: {
      minMonthlyIncome: "150000.00",
      minAnnualIncome: "1800000.00",
      incomeFieldState: "KNOWN",
      minAge: 21,
      maxAge: 65,
      employmentTypes: ["SALARIED", "SELF_EMPLOYED"],
      cibilFieldState: "NOT_DISCLOSED",
      fdRequired: false,
      existingBankRelationship: false,
    },
    rewards: {
      rewardType: "REWARD_POINTS",
      currencyName: "White Pass Vouchers",
      baseRateDescription: "Milestone-driven White Pass vouchers worth up to ₹27,000 on ₹12 Lakhs annual spend.",
      acceleratedRates: [
        {
          categoryOrMerchant: "Spend Milestones (₹2L, ₹4L, ₹6L, ₹9L, ₹12L)",
          rate: "Up to ₹27,000 White Pass vouchers across premium brands",
          cap: "Max ₹27,000 per year",
        },
      ],
      pointExpiry: "White Pass vouchers valid for 1 year from issuance",
      redemptionRate: "1 White Pass = ₹1 across luxury and retail partner brand vouchers",
    },
    loungeBenefits: {
      hasLounge: true,
      domesticVisitsPerYear: 8,
      domesticVisitsPerQuarter: 2,
      internationalVisitsPerYear: 4,
      hasPriorityPass: true,
      spendConditionRequired: false,
      spendConditionDescription: "Complimentary domestic lounge and international lounge access with Priority Pass.",
    },
    fuelBenefit: {
      fuelSurchargeWaiver: true,
      waiverPercent: "1.00%",
      monthlyCap: "₹500.00",
      minTransaction: "500.00",
      maxTransaction: "3000.00",
    },
    bestFor: [
      "Spenders doing predictable ₹4L–₹12L yearly retail spending",
      "Users who enjoy luxury shopping and lifestyle brand vouchers",
    ],
    notIdealFor: [
      "Low spenders under ₹2 Lakhs per year",
      "Anyone wanting regular per-transaction reward points",
    ],
    whyThisCard: [
      "High return on achieving clear milestone spends without point calculation complexity.",
      "Complimentary domestic and international lounge access.",
      "White Pass vouchers redeemable on luxury brands, flight portals, and top retailers.",
    ],
    watchOut: [
      "No regular per-transaction reward points—rewards come solely from milestone achievements.",
      "₹5 Lakh annual spend needed for annual fee waiver.",
      "Standard 3.5% foreign currency markup.",
    ],
    sources: [
      {
        title: "Kotak White Credit Card MITC",
        sourceType: "OFFICIAL_MITC",
        url: "https://www.kotak.com",
        publisher: "Kotak Mahindra Bank Limited",
        retrievedDate: "2026-08-18",
        verificationStatus: "UNVERIFIED",
      },
    ],
    lastVerifiedAt: "2026-08-18",
    confidenceScore: 85,
  },
  {
    id: "demo-sbi-simplyclick",
    slug: "sbi-simplyclick",
    officialName: "SimplyCLICK SBI Card",
    shortName: "SBI SimplyCLICK",
    demoRecord: true,
    issuer: {
      name: "SBI Card",
      shortName: "SBI Card",
      slug: "sbi-card",
      issuerType: "NBFC",
    },
    network: {
      name: "Visa",
      slug: "visa",
      type: "VISA",
    },
    categories: [
      { name: "Shopping", slug: "shopping", isPrimary: true },
      { name: "Rewards", slug: "rewards" },
      { name: "Entry Level", slug: "entry-level" },
    ],
    status: "ACTIVE",
    consumerOrBusiness: "CONSUMER",
    securedOrUnsecured: "UNSECURED",
    physicalOrVirtual: "BOTH",
    launchDate: "2015-08-01",
    officialProductUrl: "https://www.sbicard.com/en/personal/credit-cards/shopping/simplyclick-sbi-card.page",
    description:
      "Popular entry-level rewards card offering 10X reward points on partner e-commerce merchants and 5X on all other online spends.",
    joiningFee: {
      amount: "499.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    annualFee: {
      amount: "499.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    feeWaiver: {
      isLifetimeFree: false,
      spendThreshold: "100000.00",
      spendPeriod: "annual",
      conditions: "Annual fee reversal on annual spends of ₹1,00,000 or more.",
    },
    forexMarkup: {
      percentage: "3.50%",
      isZeroForex: false,
      fieldState: "KNOWN",
    },
    eligibility: {
      minMonthlyIncome: "20000.00",
      minAnnualIncome: "240000.00",
      incomeFieldState: "KNOWN",
      minAge: 21,
      maxAge: 70,
      employmentTypes: ["SALARIED", "SELF_EMPLOYED"],
      cibilFieldState: "NOT_DISCLOSED",
      fdRequired: false,
      existingBankRelationship: false,
    },
    rewards: {
      rewardType: "REWARD_POINTS",
      currencyName: "SBI Reward Points",
      baseRateDescription: "1 reward point per ₹100 on offline spends (0.25% value).",
      acceleratedRates: [
        {
          categoryOrMerchant: "Partner merchants (Amazon, BookMyShow, Cleartrip, Lenskart, Netmeds, Apollo 24/7)",
          rate: "10X Points (2.50% value back)",
          cap: "10,000 points/month combined",
        },
        {
          categoryOrMerchant: "All other online spends",
          rate: "5X Points (1.25% value back)",
          cap: "10,000 points/month combined",
        },
      ],
      pointExpiry: "2 years from earning",
      redemptionRate: "4 Reward Points = ₹1 (₹0.25 per point) for vouchers and statement credit",
    },
    loungeBenefits: {
      hasLounge: false,
      hasPriorityPass: false,
      spendConditionRequired: false,
    },
    fuelBenefit: {
      fuelSurchargeWaiver: true,
      waiverPercent: "1.00%",
      monthlyCap: "₹100.00",
      minTransaction: "500.00",
      maxTransaction: "3000.00",
    },
    bestFor: [
      "First-time credit card applicants with moderate income (₹20,000/month)",
      "Online shoppers purchasing across partner brands (BookMyShow, Cleartrip, Netmeds)",
    ],
    notIdealFor: [
      "Travelers needing airport lounge access",
      "Heavy offline spenders (0.25% base reward rate is low)",
    ],
    whyThisCard: [
      "Low income threshold (₹20,000/month) makes it accessible for beginners.",
      "Amazon gift card worth ₹500 provided upon joining fee payment.",
      "10X reward points on popular partner websites.",
    ],
    watchOut: [
      "Zero airport lounge access.",
      "₹99 + GST redemption fee charged per reward catalogue redemption.",
      "Reward redemption rate is ₹0.25 per point.",
    ],
    sources: [
      {
        title: "SBI SimplyCLICK Card MITC",
        sourceType: "OFFICIAL_MITC",
        url: "https://www.sbicard.com",
        publisher: "SBI Cards & Payment Services Ltd",
        retrievedDate: "2026-08-18",
        verificationStatus: "UNVERIFIED",
      },
    ],
    lastVerifiedAt: "2026-08-18",
    confidenceScore: 88,
  },
  {
    id: "demo-federal-celesta",
    slug: "federal-celesta",
    officialName: "Federal Bank Celesta Credit Card",
    shortName: "Federal Celesta",
    demoRecord: true,
    issuer: {
      name: "Federal Bank",
      shortName: "Federal Bank",
      slug: "federal-bank",
      issuerType: "BANK",
    },
    network: {
      name: "Visa / Mastercard",
      slug: "visa-infinite",
      type: "VISA",
    },
    categories: [
      { name: "Premium", slug: "premium", isPrimary: true },
      { name: "Travel", slug: "travel" },
      { name: "Lounge", slug: "lounge" },
    ],
    status: "ACTIVE",
    consumerOrBusiness: "CONSUMER",
    securedOrUnsecured: "UNSECURED",
    physicalOrVirtual: "BOTH",
    launchDate: "2021-08-01",
    officialProductUrl: "https://www.federalbank.co.in/celesta-credit-card",
    description:
      "Super-premium credit card from Federal Bank with domestic & international lounge privileges, Buy 1 Get 1 on BookMyShow, and accelerated travel rewards.",
    joiningFee: {
      amount: "3000.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    annualFee: {
      amount: "3000.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    feeWaiver: {
      isLifetimeFree: false,
      spendThreshold: "300000.00",
      spendPeriod: "ANNUAL",
      conditions: "Annual fee of ₹3,000 waived on spending ₹3,00,000 or more in the previous anniversary year.",
    },
    forexMarkup: {
      percentage: "2.00%",
      isZeroForex: false,
      fieldState: "KNOWN",
    },
    eligibility: {
      minMonthlyIncome: "150000.00",
      incomeFieldState: "KNOWN",
      minAge: 21,
      maxAge: 65,
      employmentTypes: ["SALARIED", "SELF_EMPLOYED"],
      minCreditScore: 750,
      cibilFieldState: "KNOWN",
      fdRequired: false,
      existingBankRelationship: false,
    },
    rewards: {
      rewardType: "REWARD_POINTS",
      currencyName: "FedPoints",
      baseRateDescription: "1 FedPoint per ₹100 spent (0.25% value back).",
      acceleratedRates: [
        {
          categoryOrMerchant: "International & Travel Spends",
          rate: "3X FedPoints (0.75% value back)",
          cap: "No cap",
        },
        {
          categoryOrMerchant: "Dining Spends",
          rate: "2X FedPoints (0.50% value back)",
          cap: "No cap",
        },
      ],
      pointExpiry: "3 years from date of accrual",
      redemptionRate: "1 FedPoint = ₹0.25 on Federal Bank rewards portal",
    },
    loungeBenefits: {
      hasLounge: true,
      domesticVisitsPerYear: 8, // 2 visits per quarter
      hasPriorityPass: true,
      internationalVisitsPerYear: 1,
      spendConditionRequired: false,
    },
    fuelBenefit: {
      fuelSurchargeWaiver: true,
      waiverPercent: "1.00%",
      monthlyCap: "₹150.00",
      minTransaction: "400.00",
      maxTransaction: "5000.00",
    },
    bestFor: [
      "Federal Bank relationship holders wanting super-premium perks",
      "Movie goers wanting Buy 1 Get 1 on BookMyShow (up to ₹350/mo)",
      "Travelers wanting unconditional 2 domestic lounge visits per quarter",
    ],
    notIdealFor: [
      "Users looking for zero annual fee cards",
      "General shoppers looking for high base return (0.25% base rate)",
    ],
    whyThisCard: [
      "2 complimentary domestic airport lounge visits every quarter with zero spend barrier.",
      "1 complimentary international airport lounge visit per year via Priority Pass.",
      "Buy 1 Get 1 ticket on BookMyShow up to ₹350 once per month.",
    ],
    watchOut: [
      "High annual fee of ₹3,000 requires ₹3L spend to waive.",
      "Base reward earning rate is modest at 0.25%.",
    ],
    sources: [
      {
        title: "Federal Bank Celesta MITC and Benefits Guide",
        sourceType: "OFFICIAL_MITC",
        url: "https://www.federalbank.co.in/celesta-credit-card",
        publisher: "The Federal Bank Ltd",
        retrievedDate: "2026-08-18",
        verificationStatus: "VERIFIED",
      },
    ],
    lastVerifiedAt: "2026-08-18",
    confidenceScore: 98,
  },
  {
    id: "demo-federal-imperio",
    slug: "federal-imperio",
    officialName: "Federal Bank Imperio Credit Card",
    shortName: "Federal Imperio",
    demoRecord: true,
    issuer: {
      name: "Federal Bank",
      shortName: "Federal Bank",
      slug: "federal-bank",
      issuerType: "BANK",
    },
    network: {
      name: "Mastercard / Visa",
      slug: "mastercard-platinum",
      type: "MASTERCARD",
    },
    categories: [
      { name: "Lifestyle", slug: "lifestyle", isPrimary: true },
      { name: "Grocery", slug: "grocery" },
      { name: "Lounge", slug: "lounge" },
    ],
    status: "ACTIVE",
    consumerOrBusiness: "CONSUMER",
    securedOrUnsecured: "UNSECURED",
    physicalOrVirtual: "BOTH",
    launchDate: "2021-08-01",
    officialProductUrl: "https://www.federalbank.co.in/imperio-credit-card",
    description:
      "Mid-tier lifestyle credit card from Federal Bank with 10X reward points on grocery and healthcare, 1 domestic lounge visit per quarter, and dining discounts.",
    joiningFee: {
      amount: "1500.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    annualFee: {
      amount: "1500.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    feeWaiver: {
      isLifetimeFree: false,
      spendThreshold: "150000.00",
      spendPeriod: "ANNUAL",
      conditions: "Annual renewal fee waived on spending ₹1,50,000 in preceding anniversary year.",
    },
    forexMarkup: {
      percentage: "2.50%",
      isZeroForex: false,
      fieldState: "KNOWN",
    },
    eligibility: {
      minMonthlyIncome: "75000.00",
      incomeFieldState: "KNOWN",
      minAge: 21,
      maxAge: 65,
      employmentTypes: ["SALARIED", "SELF_EMPLOYED"],
      minCreditScore: 730,
      cibilFieldState: "KNOWN",
      fdRequired: false,
      existingBankRelationship: false,
    },
    rewards: {
      rewardType: "REWARD_POINTS",
      currencyName: "FedPoints",
      baseRateDescription: "1 FedPoint per ₹100 spent (0.25% value back).",
      acceleratedRates: [
        {
          categoryOrMerchant: "Grocery & Healthcare Spends",
          rate: "10X FedPoints (2.50% value back)",
          cap: "2,000 bonus points/month",
        },
        {
          categoryOrMerchant: "Dining Spends",
          rate: "3X FedPoints (0.75% value back)",
          cap: "No cap",
        },
      ],
      pointExpiry: "3 years from accrual",
      redemptionRate: "1 FedPoint = ₹0.25 on Federal Bank rewards portal",
    },
    loungeBenefits: {
      hasLounge: true,
      domesticVisitsPerYear: 4, // 1 visit per quarter
      hasPriorityPass: false,
      spendConditionRequired: false,
    },
    fuelBenefit: {
      fuelSurchargeWaiver: true,
      waiverPercent: "1.00%",
      monthlyCap: "₹100.00",
      minTransaction: "400.00",
      maxTransaction: "4000.00",
    },
    bestFor: [
      "Households spending on grocery and medical/healthcare bills (2.5% return)",
      "Users wanting 1 complimentary domestic lounge visit per quarter with no spend condition",
    ],
    notIdealFor: [
      "Users wanting zero annual fee",
      "High international spenders (2.5% forex markup)",
    ],
    whyThisCard: [
      "10X reward points on grocery and healthcare transactions.",
      "1 complimentary domestic airport lounge visit per quarter (4/year).",
      "Buy 1 Get 1 on BookMyShow (up to ₹100 once per month).",
    ],
    watchOut: [
      "10X grocery/healthcare bonus capped at 2,000 points per month.",
      "Annual fee waiver requires ₹1,50,000 yearly spend.",
    ],
    sources: [
      {
        title: "Federal Bank Imperio MITC Schedule",
        sourceType: "OFFICIAL_MITC",
        url: "https://www.federalbank.co.in/imperio-credit-card",
        publisher: "The Federal Bank Ltd",
        retrievedDate: "2026-08-18",
        verificationStatus: "VERIFIED",
      },
    ],
    lastVerifiedAt: "2026-08-18",
    confidenceScore: 97,
  },
  {
    id: "demo-federal-signet",
    slug: "federal-signet",
    officialName: "Federal Bank Signet Credit Card",
    shortName: "Federal Signet",
    demoRecord: true,
    issuer: {
      name: "Federal Bank",
      shortName: "Federal Bank",
      slug: "federal-bank",
      issuerType: "BANK",
    },
    network: {
      name: "RuPay / Visa",
      slug: "rupay-platinum",
      type: "RUPAY",
    },
    categories: [
      { name: "Entry Level", slug: "entry-level", isPrimary: true },
      { name: "RuPay UPI", slug: "rupay-upi" },
      { name: "Shopping", slug: "shopping" },
    ],
    status: "ACTIVE",
    consumerOrBusiness: "CONSUMER",
    securedOrUnsecured: "UNSECURED",
    physicalOrVirtual: "BOTH",
    launchDate: "2021-08-01",
    officialProductUrl: "https://www.federalbank.co.in/signet-credit-card",
    description:
      "Accessible entry-tier credit card from Federal Bank with RuPay UPI Scan & Pay, 3X reward points on electronics and apparel, and spend-gated lounge access.",
    joiningFee: {
      amount: "750.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    annualFee: {
      amount: "750.00",
      gstApplicable: true,
      fieldState: "KNOWN",
    },
    feeWaiver: {
      isLifetimeFree: false,
      spendThreshold: "75000.00",
      spendPeriod: "ANNUAL",
      conditions: "Annual fee waived on spending ₹75,000 in preceding anniversary year.",
    },
    forexMarkup: {
      percentage: "3.00%",
      isZeroForex: false,
      fieldState: "KNOWN",
    },
    eligibility: {
      minMonthlyIncome: "30000.00",
      incomeFieldState: "KNOWN",
      minAge: 21,
      maxAge: 65,
      employmentTypes: ["SALARIED", "SELF_EMPLOYED"],
      minCreditScore: 700,
      cibilFieldState: "KNOWN",
      fdRequired: false,
      existingBankRelationship: false,
    },
    rewards: {
      rewardType: "REWARD_POINTS",
      currencyName: "FedPoints",
      baseRateDescription: "1 FedPoint per ₹100 spent (0.25% value back).",
      acceleratedRates: [
        {
          categoryOrMerchant: "Electronics & Apparel Spends",
          rate: "3X FedPoints (0.75% value back)",
          cap: "No cap",
        },
        {
          categoryOrMerchant: "Entertainment Spends",
          rate: "2X FedPoints (0.50% value back)",
          cap: "No cap",
        },
      ],
      pointExpiry: "3 years from accrual",
      redemptionRate: "1 FedPoint = ₹0.25 on Federal Bank rewards portal",
    },
    loungeBenefits: {
      hasLounge: true,
      domesticVisitsPerYear: 4, // 1 visit per quarter on spend
      hasPriorityPass: false,
      spendConditionRequired: true,
      spendConditionDescription: "1 complimentary domestic lounge visit per quarter on spending ₹20,000 or more in preceding calendar quarter.",
    },
    fuelBenefit: {
      fuelSurchargeWaiver: true,
      waiverPercent: "1.00%",
      monthlyCap: "₹75.00",
      minTransaction: "400.00",
      maxTransaction: "4000.00",
    },
    bestFor: [
      "First-time applicants wanting an affordable card with RuPay UPI",
      "Electronics and clothing shopping",
    ],
    notIdealFor: [
      "Frequent travelers needing high lounge quota",
      "High-spend reward optimizers",
    ],
    whyThisCard: [
      "RuPay variant supports instant UPI Scan & Pay across all merchants.",
      "Low annual fee of ₹750 easily waived on ₹75k yearly spend.",
      "1 domestic lounge visit per quarter on achieving ₹20k quarterly spend.",
    ],
    watchOut: [
      "Lounge visit requires ₹20,000 spend in preceding quarter.",
      "Low base reward rate of 0.25%.",
    ],
    sources: [
      {
        title: "Federal Bank Signet MITC Schedule",
        sourceType: "OFFICIAL_MITC",
        url: "https://www.federalbank.co.in/signet-credit-card",
        publisher: "The Federal Bank Ltd",
        retrievedDate: "2026-08-18",
        verificationStatus: "VERIFIED",
      },
    ],
    lastVerifiedAt: "2026-08-18",
    confidenceScore: 96,
  },
];
