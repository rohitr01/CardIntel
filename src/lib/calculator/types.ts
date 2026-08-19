/**
 * CardIntel — Spend Calculator & Value Engine Type Definitions
 *
 * Deterministic, currency-safe calculation data structures.
 */

import { Prisma } from "@prisma/client";

export type Decimal = Prisma.Decimal;

export type SpendCategoryKey =
  // Shopping
  | "shopping_amazon"
  | "shopping_flipkart"
  | "shopping_myntra"
  | "shopping_tata_neu"
  | "shopping_other_online"
  | "shopping_offline_retail"
  // Food & Dining
  | "food_swiggy"
  | "food_zomato"
  | "food_eazydiner"
  | "food_delivery_other"
  | "food_restaurants"
  // Groceries
  | "grocery_blinkit"
  | "grocery_zepto"
  | "grocery_instamart"
  | "grocery_dmart"
  | "grocery_supermarket"
  | "grocery_other"
  // Fuel
  | "fuel_hpcl"
  | "fuel_bpcl"
  | "fuel_indianoil"
  | "fuel_other"
  // Utilities & Bills
  | "utilities_electricity"
  | "utilities_mobile"
  | "utilities_broadband"
  | "utilities_dth"
  | "utilities_other"
  // Travel
  | "travel_flights"
  | "travel_hotels"
  | "travel_makemytrip"
  | "travel_ixigo"
  | "travel_irctc"
  | "travel_other"
  // UPI
  | "upi_merchant_qr"
  // International
  | "international_online"
  | "international_pos"
  // Other General
  | "other_general_offline"
  | "other_general_online"
  // Potentially Excluded
  | "excluded_rent"
  | "excluded_wallet_load"
  | "excluded_government"
  | "excluded_education"
  | "excluded_insurance";

export type MonthlySpendProfile = Partial<Record<SpendCategoryKey, number | string>>;

export interface Transaction {
  id?: string;
  amount: number | string;
  date?: string;
  merchant?: string;
  categoryKey: SpendCategoryKey;
  mcc?: string;
  paymentMethod?: "CREDIT_CARD" | "RUPAY_UPI";
  isInternational?: boolean;
  currency?: string;
}

export type LoungeValuationTier = "CONSERVATIVE" | "STANDARD" | "CUSTOM";

export interface ValuationConfig {
  loungeValuationTier: LoungeValuationTier;
  customLoungeValuePerVisit?: number;
  includeOptionalBenefitsInTotal: boolean;
  asOfDate?: string; // Point-in-time calculation (ISO date string)
}

export type CalculationCoverageStatus =
  | "COMPLETE"
  | "INCOMPLETE_MISSING_DATA"
  | "CONDITIONAL_ASSUMPTIONS"
  | "CONFLICTING_DATA";

export interface MathStep {
  step: string;
  calculation: string;
  value: string;
  notes?: string;
}

export interface AcceleratedRewardBreakdown {
  categoryOrMerchant: string;
  spendAmount: string;
  rateDescription: string;
  pointsOrCashEarned: string;
  monetaryValue: string;
  capApplied: boolean;
  capLimit?: string;
}

export interface RewardCalculationResult {
  rewardType: "CASHBACK" | "REWARD_POINTS" | "MILES";
  currencyName: string;
  redemptionRate: string; // e.g. "0.25" (₹0.25 per point)
  baseSpendAmount: string;
  basePointsEarned: string;
  baseMonetaryValue: string;
  acceleratedBreakdowns: AcceleratedRewardBreakdown[];
  totalAcceleratedMonetaryValue: string;
  totalAnnualRewardCashValue: string;
  isUnlimited: boolean;
  monthlyCapsDescription?: string;
}

export interface FeeCalculationResult {
  joiningFeeAmount: string;
  annualFeeAmount: string;
  gstRatePercent: number; // e.g. 18
  gstAmount: string;
  grossAnnualFeeWithGst: string;
  feeWaiverThreshold?: string;
  feeWaiverMet: boolean;
  netAnnualFeePayable: string;
  isLifetimeFree: boolean;
  waiverNotes?: string;
}

export interface ForexCalculationResult {
  totalInternationalSpend: string;
  forexMarkupPercent: number;
  isZeroForex: boolean;
  forexMarkupCost: string;
  forexGstCost: string;
  totalForexLoss: string;
}

export interface LoungeCalculationResult {
  hasLounge: boolean;
  isDomesticUnlimited: boolean;
  isInternationalUnlimited: boolean;
  domesticVisitsEligible: number;
  internationalVisitsEligible: number;
  spendConditionRequired: boolean;
  spendConditionMet: boolean;
  valuationPerVisit: string;
  annualEstimatedBenefitValue: string;
  notes?: string;
  entitlementDescription: string;
  isNotDisclosed?: boolean;
}

export interface FuelCalculationResult {
  eligibleFuelSpend: string;
  waiverPercent: number;
  monthlyCap: string;
  annualWaiverEarned: string;
}

export interface MilestoneCalculationResult {
  unlockedMilestones: Array<{
    spendThreshold: string;
    description: string;
    monetaryValue: string;
  }>;
  totalMilestoneValue: string;
}

export interface CardCalculationResult {
  cardSlug: string;
  cardOfficialName: string;
  cardShortName: string;
  issuerName: string;
  networkType: string;
  status: CalculationCoverageStatus;
  statusNotes: string[];

  // Spend totals
  totalMonthlySpend: string;
  totalAnnualSpend: string;

  // Key Monetary Totals
  cashEquivalentNetAnnualValue: string; // (Rewards + Fuel Waiver + Fee Waiver - Fees - Forex)
  optionalBenefitAnnualValue: string;  // (Lounge value, etc.)
  estimatedTotalAnnualValue: string;   // Cash + Optional
  effectiveRewardRatePercent: number;  // Cash Net / Total Annual Spend * 100

  // Detailed Component Breakdowns
  rewardBreakdown: RewardCalculationResult;
  feeBreakdown: FeeCalculationResult;
  forexBreakdown: ForexCalculationResult;
  loungeBreakdown: LoungeCalculationResult;
  fuelBreakdown: FuelCalculationResult;
  milestoneBreakdown: MilestoneCalculationResult;

  // Step-by-Step Math Audit
  mathSteps: MathStep[];
}

export interface BreakEvenResult {
  cardASlug: string;
  cardBSlug: string;
  cardAName: string;
  cardBName: string;
  feeDifference: string;
  crossoverSpendAnnual: string;
  crossoverSpendMonthly: string;
  isBreakEvenPossible: boolean;
  narrative: string;
}
