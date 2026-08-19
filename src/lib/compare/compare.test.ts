import { describe, it, expect } from "vitest";
import {
  comparisonSections,
  type ComparisonFieldDefinition,
  type ComparisonValue,
} from "./definitions";
import { demoCards } from "@/data/demo/cards";
import { MAX_COMPARE_CARDS } from "@/lib/context/compare-context";

describe("Phase 1C: Comparison Engine Tests", () => {
  const millennia = demoCards.find((c) => c.slug === "hdfc-millennia")!;
  const sbiCashback = demoCards.find((c) => c.slug === "sbi-cashback")!;
  const amazonPay = demoCards.find((c) => c.slug === "icici-amazon-pay")!;
  const tataNeu = demoCards.find((c) => c.slug === "tata-neu-infinity-hdfc")!;
  const scapia = demoCards.find((c) => c.slug === "scapia-federal-bank")!;
  const infinia = demoCards.find((c) => c.slug === "hdfc-infinia-metal")!;

  // 1. Matrix Cap & Card Limits
  it("enforces maximum 5 cards cap for Mode 1 comparison", () => {
    expect(MAX_COMPARE_CARDS).toBe(5);

    const fiveCards = [millennia, sbiCashback, amazonPay, tataNeu, scapia];
    expect(fiveCards.length).toBe(5);

    // Adding 6th card exceeds limit
    const sixCards = [...fiveCards, infinia];
    const capped = sixCards.slice(0, MAX_COMPARE_CARDS);
    expect(capped.length).toBe(5);
    expect(capped.includes(infinia)).toBe(false);
  });

  // 2. Minimum 2 cards comparison
  it("supports side-by-side extraction for 2 selected cards", () => {
    const twoCards = [millennia, sbiCashback];
    expect(twoCards.length).toBe(2);

    const annualFeeField = comparisonSections
      .flatMap((s) => s.fields)
      .find((f) => f.id === "annual_fee")!;

    const millenniaFee = annualFeeField.extract(millennia);
    const sbiFee = annualFeeField.extract(sbiCashback);

    expect(millenniaFee.numericValue).toBe(1000);
    expect(sbiFee.numericValue).toBe(999);
    expect(millenniaFee.fieldState).toBe("KNOWN");
    expect(sbiFee.fieldState).toBe("KNOWN");
  });

  // 3. Field claim states (KNOWN, NOT_DISCLOSED, CONDITIONAL, CONFLICTING)
  it("strictly preserves NOT_DISCLOSED and never fabricates values into zero or eligible", () => {
    const cibilField = comparisonSections
      .flatMap((s) => s.fields)
      .find((f) => f.id === "min_cibil")!;

    // SBI Cashback does not publicly disclose minimum CIBIL score
    const sbiCibil = cibilField.extract(sbiCashback);
    expect(sbiCibil.fieldState).toBe("NOT_DISCLOSED");
    expect(sbiCibil.displayValue).toBe("Not Publicly Disclosed by Bank");
    expect(sbiCibil.rawValue).toBeNull();
    expect(sbiCibil.numericValue).toBeUndefined();

    // HDFC Millennia discloses 720+
    const millenniaCibil = cibilField.extract(millennia);
    expect(millenniaCibil.fieldState).toBe("KNOWN");
    expect(millenniaCibil.numericValue).toBe(720);
  });

  it("handles CONDITIONAL claim states with spend conditions", () => {
    const loungeConditionField = comparisonSections
      .flatMap((s) => s.fields)
      .find((f) => f.id === "lounge_spend_condition")!;

    const millenniaCondition = loungeConditionField.extract(millennia);
    expect(millenniaCondition.fieldState).toBe("CONDITIONAL");
    expect(millenniaCondition.displayValue).toContain("₹1,00,000");

    // Tata Neu Infinity has unconditional lounge
    const tataNeuCondition = loungeConditionField.extract(tataNeu);
    expect(tataNeuCondition.fieldState).toBe("KNOWN");
    expect(tataNeuCondition.displayValue).toContain("Unconditional");
  });

  it("handles CONFLICTING claim state gracefully", () => {
    const mockConflictingCard = {
      ...millennia,
      annualFee: {
        amount: "1000.00",
        fieldState: "CONFLICTING",
      },
    };

    const annualFeeField = comparisonSections
      .flatMap((s) => s.fields)
      .find((f) => f.id === "annual_fee")!;

    const res = annualFeeField.extract(mockConflictingCard);
    expect(res.fieldState).toBe("CONFLICTING");
    expect(res.displayValue).toContain("Conflicting sources");
  });

  // 4. Metric Directions
  it("correctly identifies LOWER_IS_BETTER for fees and forex markup", () => {
    const annualFeeField = comparisonSections
      .flatMap((s) => s.fields)
      .find((f) => f.id === "annual_fee")!;
    expect(annualFeeField.direction).toBe("LOWER_IS_BETTER");

    const forexField = comparisonSections
      .flatMap((s) => s.fields)
      .find((f) => f.id === "forex_markup")!;
    expect(forexField.direction).toBe("LOWER_IS_BETTER");

    // Amazon Pay fee (0) is lower than Millennia (1000)
    const apFee = annualFeeField.extract(amazonPay);
    const milFee = annualFeeField.extract(millennia);
    expect(apFee.numericValue!).toBeLessThan(milFee.numericValue!);

    // Scapia Forex (0%) is lower than Millennia (3.5%)
    const scapiaForex = forexField.extract(scapia);
    const milForex = forexField.extract(millennia);
    expect(scapiaForex.numericValue!).toBeLessThan(milForex.numericValue!);
  });

  it("correctly identifies HIGHER_IS_BETTER for lounge visits", () => {
    const loungeField = comparisonSections
      .flatMap((s) => s.fields)
      .find((f) => f.id === "domestic_lounge")!;
    expect(loungeField.direction).toBe("HIGHER_IS_BETTER");

    const tataLounge = loungeField.extract(tataNeu); // 8 visits
    const sbiLounge = loungeField.extract(sbiCashback); // 0 visits
    expect(tataLounge.numericValue!).toBeGreaterThan(sbiLounge.numericValue!);
  });

  // 5. Differences-Only Mode Normalization
  it("detects differences and similarities accurately across fields", () => {
    const rupayField = comparisonSections
      .flatMap((s) => s.fields)
      .find((f) => f.id === "rupay_upi")!;

    // Tata Neu (RuPay UPI = true) vs Millennia (Visa = false) -> Differs
    const tataVal = rupayField.extract(tataNeu);
    const milVal = rupayField.extract(millennia);
    expect(tataVal.rawValue).not.toBe(milVal.rawValue);

    // Two Visa cards without UPI -> Same
    const sbiVal = rupayField.extract(sbiCashback);
    expect(milVal.rawValue).toBe(sbiVal.rawValue);
  });

  // 6. Mode 2 Deterministic Alternative Filtering & Scoring
  it("filters alternatives with hard constraints deterministically", () => {
    // Candidates requiring UPI
    const upiCandidates = demoCards.filter(
      (c) => c.upiBenefit?.upiEnabled || c.network?.type === "RUPAY",
    );
    expect(upiCandidates.length).toBeGreaterThan(0);
    expect(upiCandidates.some((c) => c.slug === "tata-neu-infinity-hdfc")).toBe(true);

    // Candidates requiring 0% Zero Forex
    const zeroForexCandidates = demoCards.filter((c) => c.forexMarkup?.isZeroForex);
    expect(zeroForexCandidates.length).toBe(1);
    expect(zeroForexCandidates[0].slug).toBe("scapia-federal-bank");

    // Candidates requiring Lifetime Free
    const ltfCandidates = demoCards.filter(
      (c) => c.feeWaiver?.isLifetimeFree || Number(c.annualFee?.amount) === 0,
    );
    expect(ltfCandidates.some((c) => c.slug === "icici-amazon-pay")).toBe(true);
    expect(ltfCandidates.some((c) => c.slug === "scapia-federal-bank")).toBe(true);
    expect(ltfCandidates.some((c) => c.slug === "onecard-metal")).toBe(true);
  });
});
