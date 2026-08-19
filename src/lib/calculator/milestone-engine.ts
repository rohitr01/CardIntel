/**
 * CardIntel — Milestone Benefit Engine
 *
 * Evaluates quarterly and annual spend milestone vouchers and bonuses.
 */

import { money, addMoney, toAmountNumber, type Money } from "@/lib/utils/money";
import type { MilestoneCalculationResult } from "./types";

export function calculateMilestones(
  card: any,
  annualSpend: Money | number | string,
  monthlySpend: Money | number | string,
): MilestoneCalculationResult {
  const spendNum = toAmountNumber(annualSpend);
  const monthlySpendNum = toAmountNumber(monthlySpend);
  const quarterlySpendNum = monthlySpendNum * 3;
  const unlockedMilestones: Array<{
    spendThreshold: string;
    description: string;
    monetaryValue: string;
  }> = [];

  let totalMilestoneDecimal = money(0);

  // Card-specific milestone logic based on verified rules:

  // HDFC Millennia: ₹1,000 gift voucher on ₹1,00,000 spend every calendar quarter (up to ₹4,000/yr)
  if (card.slug === "hdfc-millennia") {
    if (quarterlySpendNum >= 100000) {
      const quartersMet = Math.min(4, Math.floor(quarterlySpendNum / 100000));
      const totalQuartersMet = Math.min(4, Math.floor(spendNum / 100000));
      const finalQuarters = Math.max(quartersMet, totalQuartersMet);
      if (finalQuarters > 0) {
        const val = finalQuarters * 1000;
        unlockedMilestones.push({
          spendThreshold: "₹1,00,000 / quarter",
          description: `₹1,000 voucher across ${finalQuarters} eligible quarters`,
          monetaryValue: val.toString(),
        });
        totalMilestoneDecimal = addMoney(totalMilestoneDecimal, money(val));
      }
    }
  }

  // IDFC FIRST Wealth: ₹500 voucher on ₹30,000 monthly spend
  if (card.slug === "idfc-first-wealth" && monthlySpendNum >= 30000) {
    const val = 500 * 12;
    unlockedMilestones.push({
      spendThreshold: "₹30,000 / month",
      description: "₹500 monthly milestone voucher",
      monetaryValue: val.toString(),
    });
    totalMilestoneDecimal = addMoney(totalMilestoneDecimal, money(val));
  }

  // Generic card milestoneBenefits array from Prisma schema if present
  if (Array.isArray(card.milestoneBenefits)) {
    for (const mb of card.milestoneBenefits) {
      const threshNum = Number(mb.spendThreshold || 0);
      if (threshNum > 0 && spendNum >= threshNum) {
        const valNum = Number(mb.benefitValue || 0);
        unlockedMilestones.push({
          spendThreshold: `₹${threshNum}`,
          description: mb.description || "Annual Spend Milestone Bonus",
          monetaryValue: valNum.toString(),
        });
        totalMilestoneDecimal = addMoney(totalMilestoneDecimal, money(valNum));
      }
    }
  }

  return {
    unlockedMilestones,
    totalMilestoneValue: totalMilestoneDecimal.amount,
  };
}
