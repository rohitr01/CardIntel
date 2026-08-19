/**
 * CardIntel — Fee Waiver Engine
 *
 * Deterministic evaluation of spend-based annual renewal fee waivers.
 */

import { money, toAmountNumber, type Money } from "@/lib/utils/money";

export interface FeeWaiverEvaluation {
  isWaiverEligible: boolean;
  spendThreshold?: Money;
  isMet: boolean;
  shortfall: Money;
  progressPercent: number;
}

export function evaluateFeeWaiver(
  card: any,
  eligibleAnnualSpend: Money | number | string,
): FeeWaiverEvaluation {
  const waiverInfo = card.feeWaiver || card.feeWaivers?.[0];
  const isLtf =
    waiverInfo?.isLifetimeFree === true ||
    (Number(card.annualFee?.amount ?? "0") === 0 && Number(card.joiningFee?.amount ?? "0") === 0);

  if (isLtf) {
    return {
      isWaiverEligible: true,
      spendThreshold: money(0),
      isMet: true,
      shortfall: money(0),
      progressPercent: 100,
    };
  }

  if (!waiverInfo?.spendThreshold) {
    return {
      isWaiverEligible: false,
      isMet: false,
      shortfall: money(0),
      progressPercent: 0,
    };
  }

  const threshold = money(waiverInfo.spendThreshold);
  const spendNum = toAmountNumber(eligibleAnnualSpend);
  const threshNum = toAmountNumber(threshold);

  if (spendNum >= threshNum) {
    return {
      isWaiverEligible: true,
      spendThreshold: threshold,
      isMet: true,
      shortfall: money(0),
      progressPercent: 100,
    };
  }

  const shortfallNum = Math.max(0, threshNum - spendNum);
  const progressPercent = threshNum > 0 ? Math.min(99, Math.round((spendNum / threshNum) * 100)) : 0;

  return {
    isWaiverEligible: true,
    spendThreshold: threshold,
    isMet: false,
    shortfall: money(shortfallNum),
    progressPercent,
  };
}
