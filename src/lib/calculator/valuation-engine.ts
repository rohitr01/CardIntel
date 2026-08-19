/**
 * CardIntel — Valuation Engine
 *
 * Deterministic aggregation of True Cash-Equivalent Value and Optional Estimated Benefits.
 */

import { money, addMoney, subtractMoney, toAmountNumber, type Money } from "@/lib/utils/money";
import type {
  FeeCalculationResult,
  RewardCalculationResult,
  ForexCalculationResult,
  LoungeCalculationResult,
  FuelCalculationResult,
  MilestoneCalculationResult,
  ValuationConfig,
} from "./types";

export interface AggregatedValuation {
  cashEquivalentNetAnnualValue: Money;
  optionalBenefitAnnualValue: Money;
  estimatedTotalAnnualValue: Money;
  effectiveRewardRatePercent: number;
}

export function aggregateValuation(
  totalAnnualSpend: Money | number | string,
  rewardBreakdown: RewardCalculationResult,
  feeBreakdown: FeeCalculationResult,
  forexBreakdown: ForexCalculationResult,
  loungeBreakdown: LoungeCalculationResult,
  fuelBreakdown: FuelCalculationResult,
  milestoneBreakdown: MilestoneCalculationResult,
  config: ValuationConfig,
): AggregatedValuation {
  const rewardsDecimal = money(rewardBreakdown.totalAnnualRewardCashValue);
  const fuelDecimal = money(fuelBreakdown.annualWaiverEarned);
  const milestoneDecimal = money(milestoneBreakdown.totalMilestoneValue);
  const feePayableDecimal = money(feeBreakdown.netAnnualFeePayable);
  const forexLossDecimal = money(forexBreakdown.totalForexLoss);
  const loungeEstimatedDecimal = money(loungeBreakdown.annualEstimatedBenefitValue);

  // Total gross cash-equivalent inflows
  const grossInflows = addMoney(addMoney(rewardsDecimal, fuelDecimal), milestoneDecimal);

  // Total cash outflows
  const totalOutflows = addMoney(feePayableDecimal, forexLossDecimal);

  // True Net Cash-Equivalent Value
  const cashEquivalentNetAnnualValue = subtractMoney(grossInflows, totalOutflows);

  // Optional Estimated Benefits
  const optionalBenefitAnnualValue = loungeEstimatedDecimal;

  // Total Estimated Value
  const estimatedTotalAnnualValue = addMoney(cashEquivalentNetAnnualValue, optionalBenefitAnnualValue);

  // Effective reward percentage
  const spendNum = toAmountNumber(totalAnnualSpend);
  const netCashNum = toAmountNumber(cashEquivalentNetAnnualValue);
  const effectiveRewardRatePercent = spendNum > 0 ? parseFloat(((netCashNum / spendNum) * 100).toFixed(2)) : 0;

  return {
    cashEquivalentNetAnnualValue,
    optionalBenefitAnnualValue,
    estimatedTotalAnnualValue,
    effectiveRewardRatePercent,
  };
}
