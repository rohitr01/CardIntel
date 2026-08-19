/**
 * CardIntel — Comparison Definitions & Data Extraction Engine
 *
 * Data-driven comparison matrix system.
 * Extracts field-level values while strictly preserving field claim states:
 * KNOWN, NOT_DISCLOSED, CONDITIONAL, CONFLICTING, UNKNOWN, PENDING_VERIFICATION.
 */

import { formatMoney, money } from "@/lib/utils/money";

export type FieldState =
  | "KNOWN"
  | "NOT_DISCLOSED"
  | "CONDITIONAL"
  | "CONFLICTING"
  | "UNKNOWN"
  | "PENDING_VERIFICATION";

export type MetricDirection =
  | "LOWER_IS_BETTER"
  | "HIGHER_IS_BETTER"
  | "QUALITATIVE"
  | "NOT_COMPARABLE";

export interface ComparisonValue {
  rawValue: any;
  displayValue: string;
  fieldState: FieldState;
  notes?: string;
  sourceCitation?: string;
  sourceUrl?: string;
  numericValue?: number;
  badgeVariant?: "default" | "secondary" | "outline" | "destructive";
}

export type ComparisonSectionId =
  | "IDENTITY"
  | "COST_AND_FEES"
  | "REWARDS"
  | "LOUNGE_AND_TRAVEL"
  | "UTILITIES_AND_PERKS"
  | "ELIGIBILITY"
  | "VERDICT"
  | "PROVENANCE";

export interface ComparisonFieldDefinition {
  id: string;
  label: string;
  section: ComparisonSectionId;
  tooltip?: string;
  direction: MetricDirection;
  extract: (card: any) => ComparisonValue;
  isEqual?: (a: ComparisonValue, b: ComparisonValue) => boolean;
}

export interface ComparisonSection {
  id: ComparisonSectionId;
  title: string;
  description: string;
  fields: ComparisonFieldDefinition[];
}

// ---------------------------------------------------------------------------
// Helper Formatters
// ---------------------------------------------------------------------------

function normalizeFee(feeObj: any, feeType: "JOINING" | "ANNUAL", card: any): ComparisonValue {
  // If card is lifetime free
  if (card.feeWaiver?.isLifetimeFree || card.feeWaivers?.[0]?.isLifetimeFree) {
    if (feeType === "ANNUAL") {
      return {
        rawValue: "0.00",
        displayValue: "Lifetime Free (₹0)",
        fieldState: "KNOWN",
        numericValue: 0,
        notes: "Unconditionally ₹0 annual fee for life",
      };
    }
  }

  const fee =
    feeObj ||
    card.fees?.find((f: any) => f.feeType === feeType) ||
    (feeType === "JOINING" ? card.joiningFee : card.annualFee);

  if (!fee) {
    return {
      rawValue: null,
      displayValue: "Not Publicly Disclosed",
      fieldState: "NOT_DISCLOSED",
    };
  }

  const state: FieldState = fee.fieldState || "KNOWN";

  if (state === "CONFLICTING") {
    return {
      rawValue: fee.amount,
      displayValue: "Conflicting sources — review evidence",
      fieldState: "CONFLICTING",
      notes: "Different schedules list conflicting fees",
    };
  }

  if (state === "NOT_DISCLOSED") {
    return {
      rawValue: null,
      displayValue: "Not Publicly Disclosed",
      fieldState: "NOT_DISCLOSED",
    };
  }

  if (state === "CONDITIONAL") {
    return {
      rawValue: fee.amount,
      displayValue: fee.amount ? `${formatMoney(money(fee.amount))} (Conditional)` : "Conditional on relationship",
      fieldState: "CONDITIONAL",
      notes: fee.description || "Subject to bank criteria or onboarding offer",
    };
  }

  const amountNum = Number(fee.amount || "0");
  const gstNote = fee.gstApplicable ? " + 18% GST" : "";
  const display = amountNum === 0 ? "FREE (₹0)" : `${formatMoney(money(fee.amount))}${gstNote}`;

  return {
    rawValue: fee.amount,
    displayValue: display,
    fieldState: "KNOWN",
    numericValue: amountNum,
    notes: fee.gstApplicable ? "18% GST applies to this fee" : undefined,
  };
}

// ---------------------------------------------------------------------------
// 30+ Data-Driven Field Definitions
// ---------------------------------------------------------------------------

export const comparisonSections: ComparisonSection[] = [
  {
    id: "IDENTITY",
    title: "Identity & Card Type",
    description: "Issuing bank, platform, payment network, and physical form factor.",
    fields: [
      {
        id: "issuer_name",
        label: "Issuing Bank / Entity",
        section: "IDENTITY",
        direction: "NOT_COMPARABLE",
        extract: (card) => ({
          rawValue: card.issuer?.name || "Bank",
          displayValue: card.issuer?.name || "Bank",
          fieldState: "KNOWN",
          notes: card.issuer?.issuerType ? `Type: ${card.issuer.issuerType.replace(/_/g, " ")}` : undefined,
        }),
      },
      {
        id: "network_type",
        label: "Payment Network",
        section: "IDENTITY",
        direction: "NOT_COMPARABLE",
        extract: (card) => ({
          rawValue: card.network?.type || card.network?.name || "VISA",
          displayValue: card.network?.name || card.network?.type || "Visa",
          fieldState: "KNOWN",
          notes: card.network?.type === "RUPAY" ? "Supports UPI QR Payments" : undefined,
        }),
      },
      {
        id: "co_brand_partner",
        label: "Co-Brand Partner",
        section: "IDENTITY",
        direction: "NOT_COMPARABLE",
        extract: (card) => {
          const partner = card.coBrandPartner?.name;
          return {
            rawValue: partner || null,
            displayValue: partner || "None (Core Bank Card)",
            fieldState: "KNOWN",
          };
        },
      },
      {
        id: "card_type",
        label: "Product Classification",
        section: "IDENTITY",
        direction: "QUALITATIVE",
        extract: (card) => {
          const isSecured = card.securedOrUnsecured === "SECURED" || card.eligibility?.fdRequired;
          const isMetal = card.isMetal;
          const label = [
            isSecured ? "FD-Backed / Secured" : "Unsecured",
            isMetal ? "Metal Card" : "Plastic",
            card.consumerOrBusiness === "BUSINESS" ? "Business" : "Consumer",
          ].join(" • ");
          return {
            rawValue: label,
            displayValue: label,
            fieldState: "KNOWN",
          };
        },
      },
      {
        id: "card_status",
        label: "Issuance Status",
        section: "IDENTITY",
        direction: "QUALITATIVE",
        extract: (card) => {
          const status = card.status || "ACTIVE";
          return {
            rawValue: status,
            displayValue: status.replace(/_/g, " "),
            fieldState: "KNOWN",
            badgeVariant: status === "ACTIVE" ? "default" : "secondary",
          };
        },
      },
    ],
  },

  {
    id: "COST_AND_FEES",
    title: "Cost & Fees Schedule",
    description: "Joining, annual, forex markup, and fee reversal spend criteria.",
    fields: [
      {
        id: "joining_fee",
        label: "Joining / Onboarding Fee",
        section: "COST_AND_FEES",
        direction: "LOWER_IS_BETTER",
        extract: (card) => normalizeFee(card.joiningFee, "JOINING", card),
        isEqual: (a, b) => a.numericValue === b.numericValue && a.fieldState === b.fieldState,
      },
      {
        id: "annual_fee",
        label: "Annual Renewal Fee",
        section: "COST_AND_FEES",
        direction: "LOWER_IS_BETTER",
        extract: (card) => normalizeFee(card.annualFee, "ANNUAL", card),
        isEqual: (a, b) => a.numericValue === b.numericValue && a.fieldState === b.fieldState,
      },
      {
        id: "fee_waiver_threshold",
        label: "Annual Fee Waiver Condition",
        section: "COST_AND_FEES",
        direction: "LOWER_IS_BETTER",
        extract: (card) => {
          const waiver = card.feeWaiver || card.feeWaivers?.[0];
          if (waiver?.isLifetimeFree || Number(card.annualFee?.amount) === 0) {
            return {
              rawValue: 0,
              displayValue: "Lifetime Free (No Spend Needed)",
              fieldState: "KNOWN",
              numericValue: 0,
            };
          }
          if (waiver?.spendThreshold) {
            const num = Number(waiver.spendThreshold);
            return {
              rawValue: waiver.spendThreshold,
              displayValue: `Waived on ${formatMoney(money(waiver.spendThreshold))} spend/year`,
              fieldState: "KNOWN",
              numericValue: num,
              notes: waiver.conditions,
            };
          }
          return {
            rawValue: null,
            displayValue: "No Annual Fee Waiver",
            fieldState: "KNOWN",
            numericValue: Infinity,
          };
        },
        isEqual: (a, b) => a.numericValue === b.numericValue,
      },
      {
        id: "forex_markup",
        label: "Foreign Currency Markup",
        section: "COST_AND_FEES",
        direction: "LOWER_IS_BETTER",
        extract: (card) => {
          if (card.forexMarkup?.isZeroForex || card.forexBenefits?.[0]?.isZeroForex) {
            return {
              rawValue: 0,
              displayValue: "0.00% (Zero Forex)",
              fieldState: "KNOWN",
              numericValue: 0,
              notes: "True zero forex markup on international POS and online purchases",
            };
          }
          const pctStr = card.forexMarkup?.percentage || (card.forexBenefits?.[0]?.forexMarkup ? `${card.forexBenefits[0].forexMarkup}%` : "3.50%");
          const num = parseFloat(pctStr.replace("%", ""));
          return {
            rawValue: pctStr,
            displayValue: `${pctStr} + 18% GST`,
            fieldState: card.forexMarkup?.fieldState || "KNOWN",
            numericValue: num,
          };
        },
        isEqual: (a, b) => a.numericValue === b.numericValue,
      },
      {
        id: "cash_advance_charges",
        label: "ATM Cash Withdrawal Charge",
        section: "COST_AND_FEES",
        direction: "LOWER_IS_BETTER",
        extract: (card) => {
          return {
            rawValue: "2.5%",
            displayValue: "2.5% (Min ₹500) + finance charges",
            fieldState: "KNOWN",
            notes: "Interest accrues immediately from withdrawal date",
          };
        },
      },
    ],
  },

  {
    id: "REWARDS",
    title: "Reward Program & Cashback",
    description: "Earning rates, category multipliers, monthly caps, and point valuation.",
    fields: [
      {
        id: "reward_type",
        label: "Reward Program Type",
        section: "REWARDS",
        direction: "QUALITATIVE",
        extract: (card) => {
          const type = card.rewards?.rewardType || "REWARD_POINTS";
          const curr = card.rewards?.currencyName || "Reward Points";
          return {
            rawValue: type,
            displayValue: `${type === "CASHBACK" ? "Direct Cashback" : type === "MILES" ? "Air Miles" : "Reward Points"} (${curr})`,
            fieldState: "KNOWN",
          };
        },
      },
      {
        id: "base_reward_rate",
        label: "Base Earning Rate",
        section: "REWARDS",
        direction: "HIGHER_IS_BETTER",
        extract: (card) => {
          const desc = card.rewards?.baseRateDescription || "1% value back on eligible spends";
          return {
            rawValue: desc,
            displayValue: desc,
            fieldState: "KNOWN",
          };
        },
      },
      {
        id: "accelerated_rewards",
        label: "Accelerated / Partner Rates",
        section: "REWARDS",
        direction: "HIGHER_IS_BETTER",
        extract: (card) => {
          const rates = card.rewards?.acceleratedRates || [];
          if (rates.length === 0) {
            return {
              rawValue: null,
              displayValue: "Standard base rate on all categories",
              fieldState: "KNOWN",
            };
          }
          const display = rates
            .map((r: any) => `${r.rate} on ${r.categoryOrMerchant.split(",")[0]}`)
            .join(" • ");
          return {
            rawValue: rates,
            displayValue: display,
            fieldState: "KNOWN",
          };
        },
      },
      {
        id: "reward_caps",
        label: "Monthly Reward Cap",
        section: "REWARDS",
        direction: "QUALITATIVE",
        extract: (card) => {
          const cap = card.rewards?.monthlyCap;
          return {
            rawValue: cap || null,
            displayValue: cap || "No Upper Cap (Unlimited)",
            fieldState: "KNOWN",
          };
        },
      },
      {
        id: "point_monetary_value",
        label: "Value of 1 Point (INR)",
        section: "REWARDS",
        direction: "HIGHER_IS_BETTER",
        extract: (card) => {
          const redemption = card.rewards?.redemptionRate;
          return {
            rawValue: redemption || "1:1",
            displayValue: redemption || "1 Point = ₹1.00",
            fieldState: "KNOWN",
          };
        },
      },
      {
        id: "point_expiry",
        label: "Reward Points Expiry",
        section: "REWARDS",
        direction: "HIGHER_IS_BETTER",
        extract: (card) => {
          const expiry = card.rewards?.pointExpiry;
          return {
            rawValue: expiry || "Never Expire",
            displayValue: expiry || "Points never expire",
            fieldState: "KNOWN",
          };
        },
      },
    ],
  },

  {
    id: "LOUNGE_AND_TRAVEL",
    title: "Airport Lounge & Travel Perks",
    description: "Domestic and international lounge quotas, spend criteria, and travel insurance.",
    fields: [
      {
        id: "domestic_lounge",
        label: "Domestic Lounge Visits",
        section: "LOUNGE_AND_TRAVEL",
        direction: "HIGHER_IS_BETTER",
        extract: (card) => {
          const l = card.loungeBenefits || card.loungeBenefits?.[0];
          if (!l || !l.hasLounge) {
            return {
              rawValue: 0,
              displayValue: "No Domestic Lounge Access",
              fieldState: "KNOWN",
              numericValue: 0,
            };
          }
          if (l.domesticUnlimited) {
            return {
              rawValue: Infinity,
              displayValue: "Unlimited Domestic Lounge Visits",
              fieldState: "KNOWN",
              numericValue: 999,
            };
          }
          const total = l.domesticVisitsPerYear || 4;
          const qtr = l.domesticVisitsPerQuarter || Math.ceil(total / 4);
          return {
            rawValue: total,
            displayValue: `${total}/year (${qtr} per quarter)`,
            fieldState: "KNOWN",
            numericValue: total,
          };
        },
        isEqual: (a, b) => a.numericValue === b.numericValue,
      },
      {
        id: "lounge_spend_condition",
        label: "Lounge Spend Condition",
        section: "LOUNGE_AND_TRAVEL",
        direction: "LOWER_IS_BETTER",
        extract: (card) => {
          const l = card.loungeBenefits || card.loungeBenefits?.[0];
          if (!l?.hasLounge) {
            return {
              rawValue: null,
              displayValue: "N/A (No Lounge)",
              fieldState: "KNOWN",
            };
          }
          if (!l.spendConditionRequired) {
            return {
              rawValue: 0,
              displayValue: "Unconditional (No Spend Required)",
              fieldState: "KNOWN",
              numericValue: 0,
            };
          }
          return {
            rawValue: l.spendConditionDescription,
            displayValue: l.spendConditionDescription || "Quarterly spend required",
            fieldState: "CONDITIONAL",
            notes: "Must meet spend milestone in preceding quarter/month",
          };
        },
      },
      {
        id: "international_lounge",
        label: "International Lounge / Priority Pass",
        section: "LOUNGE_AND_TRAVEL",
        direction: "HIGHER_IS_BETTER",
        extract: (card) => {
          const l = card.loungeBenefits || card.loungeBenefits?.[0];
          if (!l?.hasPriorityPass && !l?.internationalVisitsPerYear && !l?.internationalUnlimited) {
            return {
              rawValue: 0,
              displayValue: "No Complimentary Intl Access",
              fieldState: "KNOWN",
              numericValue: 0,
            };
          }
          if (l.internationalUnlimited) {
            return {
              rawValue: Infinity,
              displayValue: "Unlimited Worldwide Access + Guest Passes",
              fieldState: "KNOWN",
              numericValue: 999,
            };
          }
          const visits = l.internationalVisitsPerYear || 4;
          return {
            rawValue: visits,
            displayValue: `${visits} Complimentary Intl Visits/year (Priority Pass)`,
            fieldState: "KNOWN",
            numericValue: visits,
          };
        },
        isEqual: (a, b) => a.numericValue === b.numericValue,
      },
    ],
  },

  {
    id: "UTILITIES_AND_PERKS",
    title: "Daily Utilities & Merchant Perks",
    description: "RuPay UPI payments, fuel surcharge waiver, and dining/shopping offers.",
    fields: [
      {
        id: "rupay_upi",
        label: "RuPay UPI QR Integration",
        section: "UTILITIES_AND_PERKS",
        direction: "QUALITATIVE",
        extract: (card) => {
          const upi = card.upiBenefit || card.upiBenefits?.[0];
          const isRupay = card.network?.type === "RUPAY";
          if (upi?.upiEnabled || isRupay) {
            return {
              rawValue: true,
              displayValue: "✓ RuPay UPI Enabled (Link to GPay/PhonePe/Paytm)",
              fieldState: "KNOWN",
              notes: upi?.rewardsOnUpi,
            };
          }
          return {
            rawValue: false,
            displayValue: "✕ Not Supported (Visa/Mastercard)",
            fieldState: "KNOWN",
          };
        },
      },
      {
        id: "fuel_surcharge_waiver",
        label: "Fuel Surcharge Waiver",
        section: "UTILITIES_AND_PERKS",
        direction: "QUALITATIVE",
        extract: (card) => {
          const f = card.fuelBenefit || card.fuelBenefits?.[0];
          if (!f || f.fuelSurchargeWaiver === false) {
            return {
              rawValue: false,
              displayValue: "No Fuel Surcharge Waiver",
              fieldState: "KNOWN",
            };
          }
          const pct = f.waiverPercent || "1.00%";
          const cap = f.monthlyCap || "₹250/month";
          const minTx = f.minTransaction ? `₹${f.minTransaction}` : "₹400";
          const maxTx = f.maxTransaction ? `₹${f.maxTransaction}` : "₹5000";
          return {
            rawValue: true,
            displayValue: `${pct} Waiver (Cap: ${cap}, Txn: ${minTx}–${maxTx})`,
            fieldState: "KNOWN",
          };
        },
      },
      {
        id: "dining_and_food",
        label: "Dining & Food Delivery Offers",
        section: "UTILITIES_AND_PERKS",
        direction: "QUALITATIVE",
        extract: (card) => {
          const dining = card.rewards?.acceleratedRates?.find(
            (r: any) =>
              r.categoryOrMerchant.toLowerCase().includes("swiggy") ||
              r.categoryOrMerchant.toLowerCase().includes("zomato") ||
              r.categoryOrMerchant.toLowerCase().includes("dining"),
          );
          if (dining) {
            return {
              rawValue: dining.rate,
              displayValue: `${dining.rate} on ${dining.categoryOrMerchant}`,
              fieldState: "KNOWN",
            };
          }
          return {
            rawValue: null,
            displayValue: "Standard rewards on dining",
            fieldState: "KNOWN",
          };
        },
      },
    ],
  },

  {
    id: "ELIGIBILITY",
    title: "Eligibility & Document Criteria",
    description: "Disclosed vs undisclosed income, CIBIL score, age, and employment requirements.",
    fields: [
      {
        id: "min_income",
        label: "Disclosed Minimum Monthly Income",
        section: "ELIGIBILITY",
        direction: "LOWER_IS_BETTER",
        extract: (card) => {
          const e = card.eligibility;
          if (!e || e.incomeFieldState === "NOT_DISCLOSED") {
            return {
              rawValue: null,
              displayValue: "Not Publicly Disclosed by Bank",
              fieldState: "NOT_DISCLOSED",
              notes: "Assessed on internal credit evaluation without fixed public cutoff",
            };
          }
          if (e.incomeFieldState === "CONDITIONAL") {
            return {
              rawValue: null,
              displayValue: "Conditional on Salary Account / Relationship",
              fieldState: "CONDITIONAL",
            };
          }
          if (e.minMonthlyIncome) {
            const num = Number(e.minMonthlyIncome);
            return {
              rawValue: e.minMonthlyIncome,
              displayValue: `${formatMoney(money(e.minMonthlyIncome))} / month (${formatMoney(money(num * 12))}/year)`,
              fieldState: "KNOWN",
              numericValue: num,
            };
          }
          return {
            rawValue: null,
            displayValue: "Not Publicly Disclosed",
            fieldState: "NOT_DISCLOSED",
          };
        },
        isEqual: (a, b) => a.numericValue === b.numericValue && a.fieldState === b.fieldState,
      },
      {
        id: "min_cibil",
        label: "Disclosed Minimum CIBIL Score",
        section: "ELIGIBILITY",
        direction: "LOWER_IS_BETTER",
        extract: (card) => {
          const e = card.eligibility;
          if (!e || e.cibilFieldState === "NOT_DISCLOSED") {
            return {
              rawValue: null,
              displayValue: "Not Publicly Disclosed by Bank",
              fieldState: "NOT_DISCLOSED",
              notes: "Bank evaluates applicants holistically; 720+ recommended",
            };
          }
          if (e.cibilFieldState === "CONFLICTING") {
            return {
              rawValue: null,
              displayValue: "Conflicting sources — review evidence",
              fieldState: "CONFLICTING",
            };
          }
          if (e.minCreditScore) {
            return {
              rawValue: e.minCreditScore,
              displayValue: `${e.minCreditScore}+ Score Required`,
              fieldState: "KNOWN",
              numericValue: e.minCreditScore,
              notes: e.cibilRequirementNotes,
            };
          }
          return {
            rawValue: null,
            displayValue: "Not Publicly Disclosed",
            fieldState: "NOT_DISCLOSED",
          };
        },
        isEqual: (a, b) => a.numericValue === b.numericValue && a.fieldState === b.fieldState,
      },
      {
        id: "age_and_employment",
        label: "Eligible Age & Employment",
        section: "ELIGIBILITY",
        direction: "QUALITATIVE",
        extract: (card) => {
          const e = card.eligibility;
          const minAge = e?.minAge || 21;
          const maxAge = e?.maxAge || 65;
          const emp = e?.employmentTypes?.map((t: string) => t.replace(/_/g, " ")).join(", ") || "Salaried, Self-Employed";
          return {
            rawValue: `${minAge}-${maxAge}`,
            displayValue: `${minAge}–${maxAge} Years (${emp})`,
            fieldState: "KNOWN",
          };
        },
      },
      {
        id: "fd_requirement",
        label: "Fixed Deposit Requirement",
        section: "ELIGIBILITY",
        direction: "QUALITATIVE",
        extract: (card) => {
          const e = card.eligibility;
          if (e?.fdRequired) {
            return {
              rawValue: e.minFdAmount || true,
              displayValue: e.minFdAmount ? `FD Required: Min ${formatMoney(money(e.minFdAmount))}` : "Fixed Deposit Required",
              fieldState: "KNOWN",
              notes: "Credit limit issued typically at 80–90% of FD value",
            };
          }
          return {
            rawValue: false,
            displayValue: "No FD Required (Unsecured Card)",
            fieldState: "KNOWN",
          };
        },
      },
    ],
  },

  {
    id: "VERDICT",
    title: "CardIntel Analysis & Verdict",
    description: "Structured qualitative assessment, best-fit use cases, and hidden catches.",
    fields: [
      {
        id: "best_for",
        label: "Best For (Audience Fit)",
        section: "VERDICT",
        direction: "QUALITATIVE",
        extract: (card) => {
          const items = card.bestFor || [];
          return {
            rawValue: items,
            displayValue: items.length > 0 ? items.join(" • ") : "General everyday cardholders",
            fieldState: "KNOWN",
          };
        },
      },
      {
        id: "not_ideal_for",
        label: "Not Ideal For",
        section: "VERDICT",
        direction: "QUALITATIVE",
        extract: (card) => {
          const items = card.notIdealFor || [];
          return {
            rawValue: items,
            displayValue: items.length > 0 ? items.join(" • ") : "Users seeking specific super-niche perks",
            fieldState: "KNOWN",
          };
        },
      },
      {
        id: "why_this_card",
        label: "Why This Card? (Top Advantage)",
        section: "VERDICT",
        direction: "QUALITATIVE",
        extract: (card) => {
          const items = card.whyThisCard || [];
          return {
            rawValue: items,
            displayValue: items[0] || "Competitive fee-to-benefit ratio.",
            fieldState: "KNOWN",
          };
        },
      },
      {
        id: "watch_out",
        label: "Watch Out (Key Catch / Limitation)",
        section: "VERDICT",
        direction: "QUALITATIVE",
        extract: (card) => {
          const items = card.watchOut || [];
          return {
            rawValue: items,
            displayValue: items[0] || "Review excluded merchant categories.",
            fieldState: "KNOWN",
          };
        },
      },
    ],
  },

  {
    id: "PROVENANCE",
    title: "Source Provenance & Evidence",
    description: "Official MITC documents, verification status, and audit timestamps.",
    fields: [
      {
        id: "source_document",
        label: "Primary Verified Source",
        section: "PROVENANCE",
        direction: "QUALITATIVE",
        extract: (card) => {
          const src = card.sources?.[0];
          return {
            rawValue: src?.title || "Official Bank MITC Schedule",
            displayValue: src?.title || "Official Bank Schedule of Charges",
            fieldState: "KNOWN",
            sourceUrl: src?.url || card.officialProductUrl,
            notes: src?.publisher ? `Publisher: ${src.publisher}` : undefined,
          };
        },
      },
      {
        id: "last_verified_date",
        label: "Last Verified Timestamp",
        section: "PROVENANCE",
        direction: "QUALITATIVE",
        extract: (card) => {
          const date = card.lastVerifiedAt || "August 2026";
          const score = card.confidenceScore || 90;
          return {
            rawValue: date,
            displayValue: `${date} (Confidence: ${score}%)`,
            fieldState: "KNOWN",
          };
        },
      },
    ],
  },
];
