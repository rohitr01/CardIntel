/**
 * CardIntel — Fuel Benefit & Surcharge Waiver Engine
 *
 * Deterministic calculation of 1% fuel surcharge waiver within monthly caps.
 */

import { money, multiplyMoney, toAmountNumber, type Money } from "@/lib/utils/money";
import type { FuelCalculationResult } from "./types";

export function calculateFuelWaiver(
  card: any,
  fuelMonthlySpend: Money | number | string,
): FuelCalculationResult {
  const f = card.fuelBenefit || card.fuelBenefits?.[0];
  const fuelSpendMonthNum = toAmountNumber(fuelMonthlySpend);
  const fuelSpendAnnual = fuelSpendMonthNum * 12;

  if (!f || f.fuelSurchargeWaiver === false || fuelSpendMonthNum === 0) {
    return {
      eligibleFuelSpend: money(fuelSpendAnnual).amount,
      waiverPercent: 0,
      monthlyCap: "0.00",
      annualWaiverEarned: "0.00",
    };
  }

  const rawPercentStr = f.waiverPercent || "1.00%";
  const waiverPercent = parseFloat(rawPercentStr.replace("%", "")) || 1.0;
  const rawCapStr = f.monthlyCap || "₹250/month";
  const monthlyCapNum = parseFloat(rawCapStr.replace(/[^0-9.]/g, "")) || 250;

  // Monthly waiver = min(monthlySpend * waiverPercent, monthlyCap)
  const theoreticalMonthlyWaiver = fuelSpendMonthNum * (waiverPercent / 100);
  const actualMonthlyWaiverNum = Math.min(theoreticalMonthlyWaiver, monthlyCapNum);
  const annualWaiverNum = actualMonthlyWaiverNum * 12;

  return {
    eligibleFuelSpend: money(fuelSpendAnnual).amount,
    waiverPercent,
    monthlyCap: monthlyCapNum.toString(),
    annualWaiverEarned: money(annualWaiverNum).amount,
  };
}
