/**
 * CardIntel — Break-Even Analysis Engine
 *
 * Deterministic calculation of spend crossover points:
 * "How much additional spending is required for a fee-charging card to beat a Lifetime Free card?"
 */

import { money, formatMoney } from "@/lib/utils/money";
import type { BreakEvenResult, CardCalculationResult } from "./types";

export function calculateBreakEven(
  cardAResult: CardCalculationResult,
  cardBResult: CardCalculationResult,
): BreakEvenResult {
  const feeA = Number(cardAResult.feeBreakdown.netAnnualFeePayable);
  const feeB = Number(cardBResult.feeBreakdown.netAnnualFeePayable);
  const feeDiff = feeA - feeB;

  const rewardA = Number(cardAResult.rewardBreakdown.totalAnnualRewardCashValue);
  const rewardB = Number(cardBResult.rewardBreakdown.totalAnnualRewardCashValue);
  const rewardDiff = rewardA - rewardB;

  const spendA = Number(cardAResult.totalAnnualSpend);

  if (feeDiff <= 0) {
    return {
      cardASlug: cardAResult.cardSlug,
      cardBSlug: cardBResult.cardSlug,
      cardAName: cardAResult.cardOfficialName,
      cardBName: cardBResult.cardOfficialName,
      feeDifference: "0.00",
      crossoverSpendAnnual: "0.00",
      crossoverSpendMonthly: "0.00",
      isBreakEvenPossible: true,
      narrative: `${cardAResult.cardShortName} has an equal or lower annual fee than ${cardBResult.cardShortName}. It is immediately ahead on cost.`,
    };
  }

  // Calculate effective reward margin
  const rewardMarginPercent = spendA > 0 ? (rewardDiff / spendA) : 0;

  if (rewardMarginPercent <= 0) {
    return {
      cardASlug: cardAResult.cardSlug,
      cardBSlug: cardBResult.cardSlug,
      cardAName: cardAResult.cardOfficialName,
      cardBName: cardBResult.cardOfficialName,
      feeDifference: feeDiff.toString(),
      crossoverSpendAnnual: "Infinity",
      crossoverSpendMonthly: "Infinity",
      isBreakEvenPossible: false,
      narrative: `Under this spend distribution, ${cardBResult.cardShortName} earns higher rewards and has a lower fee. ${cardAResult.cardShortName} will not break even.`,
    };
  }

  // Crossover spend = feeDiff / rewardMarginPercent
  const crossoverAnnualNum = Math.round(feeDiff / rewardMarginPercent);
  const crossoverMonthlyNum = Math.round(crossoverAnnualNum / 12);

  return {
    cardASlug: cardAResult.cardSlug,
    cardBSlug: cardBResult.cardSlug,
    cardAName: cardAResult.cardOfficialName,
    cardBName: cardBResult.cardOfficialName,
    feeDifference: feeDiff.toString(),
    crossoverSpendAnnual: crossoverAnnualNum.toString(),
    crossoverSpendMonthly: crossoverMonthlyNum.toString(),
    isBreakEvenPossible: true,
    narrative: `You need to spend at least ${formatMoney(money(crossoverAnnualNum))} per year (${formatMoney(money(crossoverMonthlyNum))}/month) on eligible categories for ${cardAResult.cardShortName}'s higher rewards to recover its ${formatMoney(money(feeDiff))} fee difference over ${cardBResult.cardShortName}.`,
  };
}
