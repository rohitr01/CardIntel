/**
 * CardIntel — Foreign Currency Markup Engine
 *
 * Deterministic calculation of international currency conversion costs and GST.
 */

import { money, addMoney, multiplyMoney, toAmountNumber, type Money } from "@/lib/utils/money";
import type { ForexCalculationResult } from "./types";

export function calculateForexCost(
  card: any,
  internationalAnnualSpend: Money | number | string,
): ForexCalculationResult {
  const isZeroForex =
    card.forexMarkup?.isZeroForex === true || card.forexBenefits?.[0]?.isZeroForex === true;

  const spendNum = toAmountNumber(internationalAnnualSpend);
  const spendMoney = money(spendNum);

  if (isZeroForex || spendNum === 0) {
    return {
      totalInternationalSpend: spendMoney.amount,
      forexMarkupPercent: 0,
      isZeroForex: isZeroForex,
      forexMarkupCost: "0.00",
      forexGstCost: "0.00",
      totalForexLoss: "0.00",
    };
  }

  const rawPercentStr =
    card.forexMarkup?.percentage ||
    (card.forexBenefits?.[0]?.forexMarkup ? `${card.forexBenefits[0].forexMarkup}%` : "3.50%");

  const markupPercent = parseFloat(rawPercentStr.replace("%", "")) || 3.5;
  const markupMultiplier = markupPercent / 100;

  const markupCost = multiplyMoney(spendMoney, markupMultiplier);
  const gstCost = multiplyMoney(markupCost, 0.18); // 18% GST applies to bank forex markup fee
  const totalForexLoss = addMoney(markupCost, gstCost);

  return {
    totalInternationalSpend: spendMoney.amount,
    forexMarkupPercent: markupPercent,
    isZeroForex: false,
    forexMarkupCost: markupCost.amount,
    forexGstCost: gstCost.amount,
    totalForexLoss: totalForexLoss.amount,
  };
}
