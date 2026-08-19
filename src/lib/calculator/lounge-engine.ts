/**
 * CardIntel — Airport Lounge Benefit Engine
 *
 * Transparent evaluation of lounge access with user-controlled valuation tiers:
 * - Conservative: ₹0 (No arbitrary rupee value assumed)
 * - Standard: ₹500 / visit
 * - Custom: User-specified ₹ / visit
 *
 * Rules:
 * 1. "Unlimited access" is represented as an explicit entitlement (`isDomesticUnlimited: true`),
 *    never conflated with a finite visit count.
 * 2. Spend threshold conditions are evaluated strictly as eligibility gates (`spendConditionMet`).
 * 3. Undisclosed visit counts are preserved as `NOT_DISCLOSED` rather than assuming default numbers.
 * 4. Finite visit counts reflect verified issuer terms.
 */

import { money, toAmountNumber, type Money } from "@/lib/utils/money";
import type { LoungeCalculationResult, ValuationConfig } from "./types";

export function calculateLoungeBenefits(
  card: any,
  monthlySpend: Money | number | string,
  config: ValuationConfig,
): LoungeCalculationResult {
  const l = Array.isArray(card.loungeBenefits) ? card.loungeBenefits[0] : (card.loungeBenefit || card.loungeBenefits);

  if (!l || !l.hasLounge) {
    return {
      hasLounge: false,
      isDomesticUnlimited: false,
      isInternationalUnlimited: false,
      domesticVisitsEligible: 0,
      internationalVisitsEligible: 0,
      spendConditionRequired: false,
      spendConditionMet: true,
      valuationPerVisit: "0.00",
      annualEstimatedBenefitValue: "0.00",
      entitlementDescription: "No airport lounge privileges",
      notes: "No airport lounge privileges attached to this card.",
    };
  }

  const isDomesticUnlimited = Boolean(l.domesticUnlimited);
  const isInternationalUnlimited = Boolean(l.internationalUnlimited);
  const monthlySpendNum = toAmountNumber(monthlySpend);
  const quarterlySpendNum = monthlySpendNum * 3;
  const spendConditionRequired = l.spendConditionRequired === true;

  // Check if visit count is disclosed
  const isDomesticDisclosed = isDomesticUnlimited || typeof l.domesticVisitsPerYear === "number";
  const isInternationalDisclosed = isInternationalUnlimited || typeof l.internationalVisitsPerYear === "number";

  // Dynamic model-driven spend threshold condition
  let spendConditionMet = true;
  let requiredThreshold = 0;
  let thresholdPeriod = l.spendPeriod || "QUARTERLY";

  if (spendConditionRequired) {
    if (l.spendThresholdAmount) {
      requiredThreshold = Number(l.spendThresholdAmount);
    } else if (card.slug === "hdfc-millennia") {
      requiredThreshold = 100000;
    } else if (card.slug === "scapia-federal-bank") {
      requiredThreshold = 10000;
      thresholdPeriod = "MONTHLY";
    }

    const evaluationSpend = thresholdPeriod === "MONTHLY" ? monthlySpendNum : quarterlySpendNum;
    if (evaluationSpend < requiredThreshold) {
      spendConditionMet = false;
    }
  }

  // Entitlement description
  let entitlementDescription = "";
  if (isDomesticUnlimited) {
    entitlementDescription = "Unlimited Domestic";
  } else if (typeof l.domesticVisitsPerYear === "number") {
    entitlementDescription = `${l.domesticVisitsPerYear} Domestic / yr`;
  } else {
    entitlementDescription = "Domestic NOT_DISCLOSED";
  }

  if (isInternationalUnlimited) {
    entitlementDescription += " + Unlimited International";
  } else if (typeof l.internationalVisitsPerYear === "number" && l.internationalVisitsPerYear > 0) {
    entitlementDescription += ` + ${l.internationalVisitsPerYear} International / yr`;
  }

  if (spendConditionRequired) {
    entitlementDescription += ` (Conditional: ₹${requiredThreshold.toLocaleString("en-IN")}/${thresholdPeriod.toLowerCase()})`;
  }

  // Calculate visits for valuation purposes:
  // If unlimited and spend condition is met, standard calculation evaluates a reasonable estimated utilization (e.g. 12/yr domestic, 6/yr intl)
  // while preserving isDomesticUnlimited: true
  let domesticVisits = 0;
  if (spendConditionMet) {
    if (isDomesticUnlimited) {
      domesticVisits = 12; // Estimation benchmark for unlimited access
    } else if (typeof l.domesticVisitsPerYear === "number") {
      domesticVisits = l.domesticVisitsPerYear;
    } else {
      domesticVisits = 0; // If not disclosed, do not assume arbitrary visits
    }
  }

  let internationalVisits = 0;
  if (isInternationalUnlimited) {
    internationalVisits = 6; // Estimation benchmark for unlimited international access
  } else if (typeof l.internationalVisitsPerYear === "number") {
    internationalVisits = l.internationalVisitsPerYear;
  }

  const totalEligibleVisits = domesticVisits + internationalVisits;

  // Determine rupee valuation per visit
  let valuePerVisitNum = 0;
  if (config.loungeValuationTier === "STANDARD") {
    valuePerVisitNum = 500;
  } else if (config.loungeValuationTier === "CUSTOM") {
    valuePerVisitNum = Math.max(0, config.customLoungeValuePerVisit || 0);
  } else {
    // CONSERVATIVE (default)
    valuePerVisitNum = 0;
  }

  const totalEstimatedValueNum = totalEligibleVisits * valuePerVisitNum;

  let notes = "";
  if (!spendConditionMet) {
    notes = `Lounge access locked: Preceding spend is below required ₹${requiredThreshold.toLocaleString("en-IN")} (${thresholdPeriod.toLowerCase()}) spend condition.`;
  } else if (!isDomesticDisclosed) {
    notes = "Lounge privileges present, but exact annual visit frequency is not publicly disclosed by issuer.";
  } else if (isDomesticUnlimited) {
    notes = `Unlimited domestic lounge entitlement unlocked. Evaluated with benchmark utilization of ${domesticVisits} visits at ₹${valuePerVisitNum}/visit.`;
  } else if (valuePerVisitNum === 0) {
    notes = `${totalEligibleVisits} visits eligible. Conservative ₹0 valuation applied.`;
  } else {
    notes = `${totalEligibleVisits} visits valued at ₹${valuePerVisitNum}/visit.`;
  }

  return {
    hasLounge: true,
    isDomesticUnlimited,
    isInternationalUnlimited,
    domesticVisitsEligible: domesticVisits,
    internationalVisitsEligible: internationalVisits,
    spendConditionRequired,
    spendConditionMet,
    valuationPerVisit: money(valuePerVisitNum).amount,
    annualEstimatedBenefitValue: money(totalEstimatedValueNum).amount,
    entitlementDescription,
    notes,
    isNotDisclosed: !isDomesticDisclosed && !isInternationalDisclosed,
  };
}
