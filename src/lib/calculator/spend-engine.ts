/**
 * CardIntel — Master Spend Calculation & Intelligence Engine
 *
 * Orchestrates the modular pipeline:
 * Spend Profile → Normalization → Fee & Waiver → Rewards & Caps → Fuel → Forex → Milestones → Lounge → Valuation → Step Math Audit → Ranking.
 */

import { money, formatMoney, toAmountNumber } from "@/lib/utils/money";
import { normalizeMonthlySpend } from "./transaction-normalizer";
import { evaluateFeeWaiver } from "./waiver-engine";
import { calculateCardFees } from "./fee-engine";
import { calculateCardRewards } from "./reward-engine";
import { calculateForexCost } from "./forex-engine";
import { calculateFuelWaiver } from "./fuel-engine";
import { calculateMilestones } from "./milestone-engine";
import { calculateLoungeBenefits } from "./lounge-engine";
import { aggregateValuation } from "./valuation-engine";
import { rankCalculatedCards } from "./ranking-engine";
import type {
  MonthlySpendProfile,
  ValuationConfig,
  CardCalculationResult,
  MathStep,
  CalculationCoverageStatus,
} from "./types";
import { demoCards } from "@/data/demo/cards";

export const defaultValuationConfig: ValuationConfig = {
  loungeValuationTier: "CONSERVATIVE",
  customLoungeValuePerVisit: 0,
  includeOptionalBenefitsInTotal: false,
};

export function calculateCardValue(
  card: any,
  profile: MonthlySpendProfile,
  config: ValuationConfig = defaultValuationConfig,
): CardCalculationResult {
  const summary = normalizeMonthlySpend(profile);
  const mathSteps: MathStep[] = [];
  const statusNotes: string[] = [];
  let status: CalculationCoverageStatus = "COMPLETE";

  // Step 1: Normalization
  mathSteps.push({
    step: "1. Annual Spend Aggregation",
    calculation: `Monthly Spend of ${formatMoney(summary.monthlyTotal)} × 12 months`,
    value: formatMoney(summary.annualTotal),
    notes: `Includes ${formatMoney(summary.onlineShoppingAnnual)} online shopping, ${formatMoney(summary.foodAndDiningAnnual)} dining, and ${formatMoney(summary.fuelAnnual)} fuel.`,
  });

  // Step 2: Fee Waiver Evaluation
  const eligibleSpendForWaiver = summary.annualTotal;
  const waiverResult = evaluateFeeWaiver(card, eligibleSpendForWaiver);

  // Step 3: Fee & Taxes Calculation
  const feeBreakdown = calculateCardFees(card, waiverResult.isMet);
  if (feeBreakdown.isLifetimeFree) {
    mathSteps.push({
      step: "2. Annual Fee & Taxes",
      calculation: "Lifetime Free Card (₹0 Joining + ₹0 Annual)",
      value: "₹0 Payable",
      notes: "No spend threshold required for lifetime free status.",
    });
  } else if (feeBreakdown.feeWaiverMet) {
    mathSteps.push({
      step: "2. Annual Fee & Taxes",
      calculation: `Annual Fee ₹${feeBreakdown.annualFeeAmount} waived (Annual spend exceeded ₹${feeBreakdown.feeWaiverThreshold})`,
      value: "₹0 Payable",
      notes: "Fee waiver criteria successfully triggered.",
    });
  } else {
    mathSteps.push({
      step: "2. Annual Fee & Taxes",
      calculation: `₹${feeBreakdown.annualFeeAmount} annual fee + 18% GST (₹${feeBreakdown.gstAmount})`,
      value: `-${formatMoney(money(feeBreakdown.netAnnualFeePayable))}`,
      notes: feeBreakdown.waiverNotes,
    });
  }

  // Step 4: Rewards & Cashback
  const rewardBreakdown = calculateCardRewards(card, summary);
  mathSteps.push({
    step: "3. Rewards & Cashback Earning",
    calculation: `Base CashPoints: ${formatMoney(money(rewardBreakdown.baseMonetaryValue))} + Accelerated Multipliers: ${formatMoney(money(rewardBreakdown.totalAcceleratedMonetaryValue))}`,
    value: `+${formatMoney(money(rewardBreakdown.totalAnnualRewardCashValue))}`,
    notes: rewardBreakdown.monthlyCapsDescription,
  });

  // Step 5: Fuel Surcharge Waiver
  const fuelBreakdown = calculateFuelWaiver(card, summary.categorySpendsMonthly["fuel_hpcl"]); // fuel aggregate
  if (Number(fuelBreakdown.annualWaiverEarned) > 0) {
    mathSteps.push({
      step: "4. Fuel Surcharge Waiver",
      calculation: `1% surcharge waiver on ${formatMoney(money(fuelBreakdown.eligibleFuelSpend))} fuel spend (Cap: ₹${fuelBreakdown.monthlyCap}/mo)`,
      value: `+${formatMoney(money(fuelBreakdown.annualWaiverEarned))}`,
    });
  }

  // Step 6: Milestones
  const milestoneBreakdown = calculateMilestones(card, summary.annualTotal, summary.monthlyTotal);
  if (Number(milestoneBreakdown.totalMilestoneValue) > 0) {
    mathSteps.push({
      step: "5. Milestone Spend Bonuses",
      calculation: milestoneBreakdown.unlockedMilestones.map((m) => m.description).join("; "),
      value: `+${formatMoney(money(milestoneBreakdown.totalMilestoneValue))}`,
    });
  }

  // Step 7: Forex Currency Markup Cost
  const forexBreakdown = calculateForexCost(card, summary.internationalAnnual);
  if (Number(forexBreakdown.totalForexLoss) > 0) {
    mathSteps.push({
      step: "6. Foreign Currency Markup Loss",
      calculation: `${forexBreakdown.forexMarkupPercent}% markup + 18% GST on ${formatMoney(money(forexBreakdown.totalInternationalSpend))} international spend`,
      value: `-${formatMoney(money(forexBreakdown.totalForexLoss))}`,
    });
  } else if (forexBreakdown.isZeroForex && toAmountNumber(summary.internationalAnnual) > 0) {
    mathSteps.push({
      step: "6. Foreign Currency Markup",
      calculation: "0% Zero Forex Markup Card",
      value: "₹0 Loss",
      notes: "Zero currency conversion loss.",
    });
  }

  // Step 8: Lounge Benefits
  const loungeBreakdown = calculateLoungeBenefits(card, summary.monthlyTotal, config);
  if (loungeBreakdown.hasLounge && Number(loungeBreakdown.annualEstimatedBenefitValue) > 0) {
    mathSteps.push({
      step: "7. Airport Lounge Valuation (Optional)",
      calculation: `${loungeBreakdown.domesticVisitsEligible} visits × ${formatMoney(money(loungeBreakdown.valuationPerVisit))} (${config.loungeValuationTier} tier)`,
      value: `+${formatMoney(money(loungeBreakdown.annualEstimatedBenefitValue))}`,
      notes: "Separated from cash-equivalent value.",
    });
  }

  // Step 9: Aggregated Valuation
  const valuation = aggregateValuation(
    summary.annualTotal,
    rewardBreakdown,
    feeBreakdown,
    forexBreakdown,
    loungeBreakdown,
    fuelBreakdown,
    milestoneBreakdown,
    config,
  );

  mathSteps.push({
    step: "8. True Net Annual Value",
    calculation: `(Rewards: ${formatMoney(money(rewardBreakdown.totalAnnualRewardCashValue))} + Milestones: ${formatMoney(money(milestoneBreakdown.totalMilestoneValue))} + Fuel: ${formatMoney(money(fuelBreakdown.annualWaiverEarned))}) - Fee Payable: ${formatMoney(money(feeBreakdown.netAnnualFeePayable))} - Forex Loss: ${formatMoney(money(forexBreakdown.totalForexLoss))}`,
    value: formatMoney(valuation.cashEquivalentNetAnnualValue),
    notes: `Effective Annual Return: ${valuation.effectiveRewardRatePercent}% of total spends.`,
  });

  return {
    cardSlug: card.slug,
    cardOfficialName: card.officialName || card.shortName,
    cardShortName: card.shortName || card.officialName,
    issuerName: card.issuer?.name || "Bank",
    networkType: card.network?.name || card.network?.type || "Visa",
    status,
    statusNotes,
    totalMonthlySpend: summary.monthlyTotal.amount,
    totalAnnualSpend: summary.annualTotal.amount,
    cashEquivalentNetAnnualValue: valuation.cashEquivalentNetAnnualValue.amount,
    optionalBenefitAnnualValue: valuation.optionalBenefitAnnualValue.amount,
    estimatedTotalAnnualValue: valuation.estimatedTotalAnnualValue.amount,
    effectiveRewardRatePercent: valuation.effectiveRewardRatePercent,
    feeBreakdown,
    rewardBreakdown,
    forexBreakdown,
    loungeBreakdown,
    fuelBreakdown,
    milestoneBreakdown,
    mathSteps,
  };
}

export function calculateAllCards(
  profile: MonthlySpendProfile,
  cards: any[] = demoCards,
  config: ValuationConfig = defaultValuationConfig,
): CardCalculationResult[] {
  const results = cards.map((card) => calculateCardValue(card, profile, config));
  return rankCalculatedCards(results, config);
}
