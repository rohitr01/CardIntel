/**
 * CardIntel — Fee & Tax Engine
 *
 * Deterministic calculation of joining fees, annual renewal fees, and applicable GST.
 */

import { money, addMoney, multiplyMoney, toAmountNumber, type Money } from "@/lib/utils/money";
import type { FeeCalculationResult } from "./types";

export function calculateCardFees(card: any, isWaiverMet = false): FeeCalculationResult {
  const waiverInfo = card.feeWaiver || card.feeWaivers?.[0];
  const isLtf =
    waiverInfo?.isLifetimeFree === true ||
    (Number(card.annualFee?.amount ?? "0") === 0 && Number(card.joiningFee?.amount ?? "0") === 0);

  const joiningFeeRaw = card.joiningFee?.amount ?? "0.00";
  const annualFeeRaw = card.annualFee?.amount ?? "0.00";
  const gstApplicable = card.annualFee?.gstApplicable ?? card.fees?.[0]?.gstApplicable ?? true;
  const gstRatePercent = card.annualFee?.gstRatePercent ?? card.fees?.[0]?.gstRate ?? (gstApplicable ? 18 : 0);

  if (isLtf) {
    return {
      joiningFeeAmount: "0.00",
      annualFeeAmount: "0.00",
      gstRatePercent: 0,
      gstAmount: "0.00",
      grossAnnualFeeWithGst: "0.00",
      feeWaiverThreshold: "0.00",
      feeWaiverMet: true,
      netAnnualFeePayable: "0.00",
      isLifetimeFree: true,
      waiverNotes: "Unconditionally Lifetime Free card",
    };
  }

  const annualFeeDecimal = money(annualFeeRaw);
  const joiningFeeDecimal = money(joiningFeeRaw);

  const gstMultiplier = gstRatePercent / 100;
  const gstAmount = multiplyMoney(annualFeeDecimal, gstMultiplier);
  const grossAnnualFeeWithGst = addMoney(annualFeeDecimal, gstAmount);

  const waiverThreshold = waiverInfo?.spendThreshold ? String(waiverInfo.spendThreshold) : undefined;

  let netAnnualFeePayable = grossAnnualFeeWithGst;
  let waiverNotes: string | undefined = undefined;

  if (isWaiverMet && waiverThreshold) {
    netAnnualFeePayable = money(0);
    waiverNotes = `Annual fee of ₹${annualFeeRaw} + GST waived as annual spend met threshold of ₹${waiverThreshold}`;
  } else if (waiverThreshold) {
    waiverNotes = `Annual fee payable. Waived on ₹${waiverThreshold} annual spend.`;
  } else {
    waiverNotes = "No annual spend-based fee waiver available.";
  }

  return {
    joiningFeeAmount: joiningFeeDecimal.amount,
    annualFeeAmount: annualFeeDecimal.amount,
    gstRatePercent,
    gstAmount: gstAmount.amount,
    grossAnnualFeeWithGst: grossAnnualFeeWithGst.amount,
    feeWaiverThreshold: waiverThreshold,
    feeWaiverMet: isWaiverMet,
    netAnnualFeePayable: netAnnualFeePayable.amount,
    isLifetimeFree: false,
    waiverNotes,
  };
}
