import { describe, it, expect } from "vitest";
import { normalizeMonthlySpend } from "./transaction-normalizer";
import { calculateCardRewards } from "./reward-engine";
import { calculateCardFees } from "./fee-engine";
import { evaluateFeeWaiver } from "./waiver-engine";
import { calculateForexCost } from "./forex-engine";
import { calculateFuelWaiver } from "./fuel-engine";
import { calculateMilestones } from "./milestone-engine";
import { calculateLoungeBenefits } from "./lounge-engine";
import { aggregateValuation } from "./valuation-engine";
import { calculateBreakEven } from "./break-even-engine";
import { calculateCardValue, calculateAllCards, defaultValuationConfig } from "./spend-engine";
import { demoCards } from "@/data/demo/cards";
import { money, formatMoney } from "@/lib/utils/money";

describe("Phase 2: Deterministic Calculator & Valuation Engine Tests", () => {
  const millennia = demoCards.find((c) => c.slug === "hdfc-millennia")!;
  const sbiCashback = demoCards.find((c) => c.slug === "sbi-cashback")!;
  const amazonPay = demoCards.find((c) => c.slug === "icici-amazon-pay")!;
  const tataNeu = demoCards.find((c) => c.slug === "tata-neu-infinity-hdfc")!;
  const scapia = demoCards.find((c) => c.slug === "scapia-federal-bank")!;
  const airtel = demoCards.find((c) => c.slug === "axis-airtel")!;
  const infinia = demoCards.find((c) => c.slug === "hdfc-infinia-metal")!;

  // 1. Transaction & Spend Normalization
  it("normalizes monthly category inputs into annual aggregates with exact decimal precision", () => {
    const summary = normalizeMonthlySpend({
      shopping_amazon: 5000,
      food_swiggy: 3000,
      fuel_hpcl: 2000,
    });

    expect(Number(summary.monthlyTotal.amount)).toBe(10000);
    expect(Number(summary.annualTotal.amount)).toBe(120000);
    expect(Number(summary.onlineShoppingAnnual.amount)).toBe(60000);
    expect(Number(summary.foodAndDiningAnnual.amount)).toBe(36000);
    expect(Number(summary.fuelAnnual.amount)).toBe(24000);
  });

  // 2. Accelerated Rewards & Monthly Caps
  it("strictly enforces monthly caps on accelerated cashback (HDFC Millennia ₹1,000/mo cap)", () => {
    // ₹40,000 spend on Amazon -> 5% = ₹2,000, but capped at ₹1,000/month = ₹12,000/year
    const summary = normalizeMonthlySpend({
      shopping_amazon: 40000,
    });

    const reward = calculateCardRewards(millennia, summary);
    expect(reward.acceleratedBreakdowns[0].capApplied).toBe(true);
    expect(Number(reward.totalAcceleratedMonetaryValue)).toBe(12000); // 1,000 * 12
  });

  it("strictly enforces SBI Cashback ₹5,000 monthly online cashback cap", () => {
    // ₹1,50,000 online monthly spend -> 5% = ₹7,500, but capped at ₹5,000/month = ₹60,000/year
    const summary = normalizeMonthlySpend({
      shopping_amazon: 100000,
      shopping_flipkart: 50000,
    });

    const reward = calculateCardRewards(sbiCashback, summary);
    expect(reward.acceleratedBreakdowns[0].capApplied).toBe(true);
    expect(Number(reward.totalAcceleratedMonetaryValue)).toBe(60000); // 5,000 * 12
  });

  it("evaluates unlimited cashback for ICICI Amazon Pay without caps", () => {
    // ₹1,00,000 Amazon monthly spend -> 5% = ₹5,000/mo = ₹60,000/year (unlimited)
    const summary = normalizeMonthlySpend({
      shopping_amazon: 100000,
    });

    const reward = calculateCardRewards(amazonPay, summary);
    expect(reward.isUnlimited).toBe(true);
    expect(reward.acceleratedBreakdowns[0].capApplied).toBe(false);
    expect(Number(reward.totalAcceleratedMonetaryValue)).toBe(60000);
  });

  // 3. RuPay UPI Rewards
  it("calculates 1.5% NeuCoins on RuPay UPI merchant spends for Tata Neu Infinity", () => {
    const summary = normalizeMonthlySpend({
      upi_merchant_qr: 10000, // ₹10k/mo = ₹1.2L/yr
    });

    const reward = calculateCardRewards(tataNeu, summary);
    const upiBreakdown = reward.acceleratedBreakdowns.find((b) =>
      b.categoryOrMerchant.includes("RuPay UPI"),
    );
    expect(upiBreakdown).toBeDefined();
    expect(Number(upiBreakdown!.monetaryValue)).toBe(1800); // 1.5% of 1.2L = ₹1,800
  });

  // 4. Fuel Surcharge Waiver
  it("calculates 1% fuel surcharge waiver within monthly caps", () => {
    const fuelRes = calculateFuelWaiver(millennia, money(10000)); // ₹10,000 fuel spend/mo
    // 1% of 10,000 = ₹100/mo (within ₹250 cap) -> ₹1,200/yr
    expect(Number(fuelRes.annualWaiverEarned)).toBe(1200);

    const highFuelRes = calculateFuelWaiver(millennia, money(50000)); // ₹50k fuel -> 1% = ₹500, capped at ₹250/mo
    expect(Number(highFuelRes.annualWaiverEarned)).toBe(3000); // 250 * 12 = 3000
  });

  // 5. Fee Waiver Logic & Taxes
  it("triggers annual fee waiver when spend exceeds threshold", () => {
    // Millennia waiver threshold = ₹1,00,000
    const waiverMet = evaluateFeeWaiver(millennia, money(150000));
    expect(waiverMet.isMet).toBe(true);

    const feeMet = calculateCardFees(millennia, true);
    expect(feeMet.feeWaiverMet).toBe(true);
    expect(Number(feeMet.netAnnualFeePayable)).toBe(0);

    // When spend is below threshold (e.g. ₹50,000)
    const waiverNotMet = evaluateFeeWaiver(millennia, money(50000));
    expect(waiverNotMet.isMet).toBe(false);

    const feePayable = calculateCardFees(millennia, false);
    expect(feePayable.feeWaiverMet).toBe(false);
    expect(Number(feePayable.netAnnualFeePayable)).toBe(1180); // 1000 + 18% GST
  });

  it("handles Lifetime Free cards with ₹0 net fee payable", () => {
    const feeLtf = calculateCardFees(amazonPay, true);
    expect(feeLtf.isLifetimeFree).toBe(true);
    expect(Number(feeLtf.netAnnualFeePayable)).toBe(0);
  });

  // 6. Foreign Currency Markup (Forex)
  it("calculates 0% forex loss on zero forex cards and 3.5% + GST on standard cards", () => {
    const intlSpend = money(100000); // ₹1,00,000 international spend

    // Scapia: 0% Forex
    const scapiaForex = calculateForexCost(scapia, intlSpend);
    expect(scapiaForex.isZeroForex).toBe(true);
    expect(Number(scapiaForex.totalForexLoss)).toBe(0);

    // Millennia: 3.5% + 18% GST = 4.13% total cost -> ₹4,130
    const milForex = calculateForexCost(millennia, intlSpend);
    expect(milForex.isZeroForex).toBe(false);
    expect(Number(milForex.forexMarkupCost)).toBe(3500);
    expect(Number(milForex.forexGstCost)).toBe(630);
    expect(Number(milForex.totalForexLoss)).toBe(4130);
  });

  // 7. Milestone Benefits
  it("unlocks ₹1,000 quarterly milestone vouchers on HDFC Millennia", () => {
    // Quarterly spend ₹1,00,000 (Monthly spend ₹35,000 = ₹1,05,000/qtr = ₹4,20,000/yr)
    const ms = calculateMilestones(millennia, money(420000), money(35000));
    expect(ms.unlockedMilestones.length).toBe(1);
    expect(Number(ms.totalMilestoneValue)).toBe(4000); // 4 quarters * 1000
  });

  // 8. Lounge Valuation Separation
  it("separates optional lounge valuation from cash-equivalent value", () => {
    const profile = {
      shopping_amazon: 30000,
      food_swiggy: 10000,
    };

    // Conservative tier (₹0 valuation)
    const conservativeRes = calculateCardValue(millennia, profile, {
      loungeValuationTier: "CONSERVATIVE",
      includeOptionalBenefitsInTotal: false,
    });
    expect(Number(conservativeRes.optionalBenefitAnnualValue)).toBe(0);

    // Standard tier (₹500 / visit)
    const standardRes = calculateCardValue(millennia, profile, {
      loungeValuationTier: "STANDARD",
      includeOptionalBenefitsInTotal: true,
    });
    expect(Number(standardRes.optionalBenefitAnnualValue)).toBe(2000); // 4 visits * 500
    expect(Number(standardRes.estimatedTotalAnnualValue)).toBe(
      Number(standardRes.cashEquivalentNetAnnualValue) + 2000,
    );
  });

  // 9. Break-Even Analysis
  it("calculates deterministic spend break-even point between fee-charging and LTF card", () => {
    const profile = {
      shopping_flipkart: 5000,
      shopping_other_online: 5000,
    };

    const resSbi = calculateCardValue(sbiCashback, profile);
    const resAp = calculateCardValue(amazonPay, profile);

    const breakEven = calculateBreakEven(resSbi, resAp);
    expect(breakEven.isBreakEvenPossible).toBe(true);
    expect(Number(breakEven.crossoverSpendAnnual)).toBeGreaterThan(0);
    expect(Number(breakEven.feeDifference)).toBeGreaterThan(0);
  });

  // 10. End-to-End Card Ranking
  it("ranks eligible cards deterministically by True Net Cash Benefit", () => {
    // E-commerce heavy profile: ₹50k Amazon, ₹30k Flipkart
    const ranked = calculateAllCards({
      shopping_amazon: 50000,
      shopping_flipkart: 30000,
    });

    expect(ranked.length).toBeGreaterThan(0);
    // Highest cash benefit card should be rank #1
    expect(Number(ranked[0].cashEquivalentNetAnnualValue)).toBeGreaterThanOrEqual(
      Number(ranked[1].cashEquivalentNetAnnualValue),
    );
  });

  // 11. Zero & Invalid Spend Safety
  it("handles ₹0 zero spend safely without runtime errors or division by zero", () => {
    const zeroRes = calculateCardValue(millennia, {});
    expect(Number(zeroRes.totalMonthlySpend)).toBe(0);
    expect(Number(zeroRes.totalAnnualSpend)).toBe(0);
    expect(zeroRes.effectiveRewardRatePercent).toBe(0);
    expect(Number(zeroRes.cashEquivalentNetAnnualValue)).toBe(-1180); // Annual fee payable
  });

  // 12. Dynamic Database Rule Evaluation (Audit Finding AUD-001)
  it("dynamically evaluates arbitrary card reward rules loaded from database without hardcoded slugs", () => {
    const customCard = {
      id: "card-custom-mock",
      slug: "arbitrary-new-bank-card",
      officialName: "Arbitrary New Bank Card",
      joiningFee: { amount: "500.00" },
      annualFee: { amount: "500.00" },
      rewardPrograms: [
        {
          currencyName: "CustomPoints",
          valuations: [{ redemptionRate: "0.50" }],
          rewardRules: [
            {
              multiplier: 10,
              pointsPerUnit: 1,
              spendUnit: 100,
              maxPointsCapPerBillingCycle: 2000,
              applicableCategories: ["shopping_amazon", "shopping_flipkart"],
              description: "10X CustomPoints on Amazon & Flipkart",
            },
          ],
        },
      ],
      cashbackRules: [
        {
          cashbackPercentage: 5,
          maxMonthlyCashback: 500,
          applicableCategories: ["food_swiggy"],
          description: "5% Swiggy Cashback",
        },
      ],
    };

    const summary = normalizeMonthlySpend({
      shopping_amazon: 30000, // 30000/100 * 1 * 10 = 3000 pts -> capped at 2000 pts/mo = ₹1000/mo cash
      food_swiggy: 15000, // 15000 * 5% = 750 -> capped at 500/mo cash
    });

    const reward = calculateCardRewards(customCard, summary);
    expect(reward.acceleratedBreakdowns.length).toBe(2);
    // Point rule check: 2000 pts * 0.50 = ₹1,000/mo -> ₹12,000/yr
    const pointBreakdown = reward.acceleratedBreakdowns.find((b) => b.rateDescription.includes("10X"));
    expect(pointBreakdown?.capApplied).toBe(true);
    expect(Number(pointBreakdown?.monetaryValue)).toBe(12000);

    // Cashback rule check: 500/mo -> ₹6,000/yr
    const cashBreakdown = reward.acceleratedBreakdowns.find((b) => b.rateDescription.includes("5%"));
    expect(cashBreakdown?.capApplied).toBe(true);
    expect(Number(cashBreakdown?.monetaryValue)).toBe(6000);
  });

  // 13. Dynamic Model-Driven Lounge Spend Condition (Audit Finding AUD-002)
  it("dynamically evaluates lounge spend threshold from model without matching card slug", () => {
    const customLoungeCard = {
      slug: "new-lounge-card",
      loungeBenefits: [
        {
          hasLounge: true,
          domesticVisitsPerYear: 8,
          spendConditionRequired: true,
          spendThresholdAmount: "50000",
          spendPeriod: "QUARTERLY",
        },
      ],
    };

    // Monthly spend ₹10k = Quarterly ₹30k (< ₹50k required threshold) -> Lounge locked
    const lockedRes = calculateLoungeBenefits(customLoungeCard, money(10000), {
      loungeValuationTier: "STANDARD",
      includeOptionalBenefitsInTotal: true,
    });
    expect(lockedRes.spendConditionMet).toBe(false);
    expect(lockedRes.domesticVisitsEligible).toBe(0);

    // Monthly spend ₹20k = Quarterly ₹60k (>= ₹50k required threshold) -> Lounge unlocked
    const unlockedRes = calculateLoungeBenefits(customLoungeCard, money(20000), {
      loungeValuationTier: "STANDARD",
      includeOptionalBenefitsInTotal: true,
    });
    expect(unlockedRes.spendConditionMet).toBe(true);
    expect(unlockedRes.domesticVisitsEligible).toBe(8);
  });

  // 14. Configurable GST Rate (Audit Finding AUD-004)
  it("allows configurable GST rate from card schema with 18% default fallback", () => {
    const zeroGstCard = {
      annualFee: { amount: "1000.00", gstRatePercent: 0 },
    };
    const feeRes = calculateCardFees(zeroGstCard, false);
    expect(feeRes.gstRatePercent).toBe(0);
    expect(Number(feeRes.netAnnualFeePayable)).toBe(1000);

    const defaultGstCard = {
      annualFee: { amount: "1000.00" },
    };
    const defaultFeeRes = calculateCardFees(defaultGstCard, false);
    expect(defaultFeeRes.gstRatePercent).toBe(18);
    expect(Number(defaultFeeRes.netAnnualFeePayable)).toBe(1180);
  });

  // 15. Federal Bank Scapia Proving Pipeline: Zero Forex, Travel Multipliers & Spend-Gated Lounge
  it("evaluates Federal Bank Scapia card deterministically with 0% forex and spend-gated lounge access", () => {
    const scapiaCard = demoCards.find((c) => c.slug === "scapia-federal-bank");
    expect(scapiaCard).toBeDefined();

    // Spend profile: ₹20k International, ₹10k Travel Flights, ₹10k Retail = ₹40k/mo total
    const spendProfile = {
      international_pos: 20000,
      travel_flights: 10000,
      shopping_other_online: 10000,
    };

    const res = calculateCardValue(scapiaCard, spendProfile, {
      loungeValuationTier: "STANDARD",
      includeOptionalBenefitsInTotal: true,
    });

    // 1. Forex verification: 0% markup fee (gross forex fee is 0)
    expect(res.forexBreakdown.isZeroForex).toBe(true);
    expect(Number(res.forexBreakdown.totalForexLoss)).toBe(0);

    // 2. Fee verification: Lifetime free card
    expect(res.feeBreakdown.isLifetimeFree).toBe(true);
    expect(Number(res.feeBreakdown.netAnnualFeePayable)).toBe(0);

    // 3. Rewards verification:
    // Travel: ₹10k/mo * 12 * 4% = ₹4,800/yr (24,000 Coins)
    // General: ₹30k/mo * 12 * 2% = ₹7,200/yr (36,000 Coins)
    // Total Annual Rewards = ₹12,000/yr
    expect(Number(res.rewardBreakdown.totalAnnualRewardCashValue)).toBe(12000);

    // 4. Lounge verification: Monthly spend ₹40k exceeds ₹10k threshold
    expect(res.loungeBreakdown.spendConditionMet).toBe(true);
    expect(res.loungeBreakdown.isDomesticUnlimited).toBe(true);
    expect(res.loungeBreakdown.entitlementDescription).toContain("Unlimited Domestic");

    // 5. True Cash Equivalent Net Annual Value: Exactly ₹12,000 (Rewards ₹12k - Fee ₹0 - Forex ₹0)
    expect(Number(res.cashEquivalentNetAnnualValue)).toBe(12000);
  });

  // 16. Lounge Model Sanity Audit: Unlimited vs Finite vs Conditional vs NOT_DISCLOSED
  it("strictly separates unlimited entitlement from visit counts and handles NOT_DISCLOSED without assuming numbers", () => {
    // A. Unlimited Entitlement Card (e.g. Scapia / Infinia)
    const unlimitedCard = {
      slug: "unlimited-card",
      loungeBenefits: [{ hasLounge: true, domesticUnlimited: true, internationalUnlimited: true }],
    };
    const unlimitedRes = calculateLoungeBenefits(unlimitedCard, money(0), {
      loungeValuationTier: "STANDARD",
      includeOptionalBenefitsInTotal: true,
    });
    expect(unlimitedRes.isDomesticUnlimited).toBe(true);
    expect(unlimitedRes.isInternationalUnlimited).toBe(true);
    expect(unlimitedRes.entitlementDescription).toBe("Unlimited Domestic + Unlimited International");
    expect(unlimitedRes.spendConditionRequired).toBe(false);

    // B. Finite Entitlement Card (e.g. 4 domestic visits/yr)
    const finiteCard = {
      slug: "finite-card",
      loungeBenefits: [{ hasLounge: true, domesticVisitsPerYear: 4, internationalVisitsPerYear: 2 }],
    };
    const finiteRes = calculateLoungeBenefits(finiteCard, money(0), {
      loungeValuationTier: "STANDARD",
      includeOptionalBenefitsInTotal: true,
    });
    expect(finiteRes.isDomesticUnlimited).toBe(false);
    expect(finiteRes.domesticVisitsEligible).toBe(4);
    expect(finiteRes.internationalVisitsEligible).toBe(2);
    expect(finiteRes.entitlementDescription).toBe("4 Domestic / yr + 2 International / yr");

    // C. Conditional Spend-Gated Card (₹10,000 monthly spend condition)
    const conditionalCard = {
      slug: "conditional-card",
      loungeBenefits: [
        {
          hasLounge: true,
          domesticUnlimited: true,
          spendConditionRequired: true,
          spendThresholdAmount: "10000",
          spendPeriod: "MONTHLY",
        },
      ],
    };
    // Spend below ₹10k -> Locked
    const condLocked = calculateLoungeBenefits(conditionalCard, money(5000), {
      loungeValuationTier: "STANDARD",
      includeOptionalBenefitsInTotal: true,
    });
    expect(condLocked.spendConditionMet).toBe(false);
    expect(condLocked.domesticVisitsEligible).toBe(0);
    expect(condLocked.isDomesticUnlimited).toBe(true); // Entitlement remains unlimited

    // Spend at or above ₹10k -> Unlocked
    const condUnlocked = calculateLoungeBenefits(conditionalCard, money(12000), {
      loungeValuationTier: "STANDARD",
      includeOptionalBenefitsInTotal: true,
    });
    expect(condUnlocked.spendConditionMet).toBe(true);
    expect(condUnlocked.domesticVisitsEligible).toBe(12); // Evaluation utilization benchmark
    expect(condUnlocked.isDomesticUnlimited).toBe(true);

    // D. NOT_DISCLOSED Entitlement Card (hasLounge is true, but no visit count or unlimited disclosure)
    const undisclosedCard = {
      slug: "undisclosed-lounge-card",
      loungeBenefits: [{ hasLounge: true }],
    };
    const undisclosedRes = calculateLoungeBenefits(undisclosedCard, money(10000), {
      loungeValuationTier: "STANDARD",
      includeOptionalBenefitsInTotal: true,
    });
    expect(undisclosedRes.isNotDisclosed).toBe(true);
    expect(undisclosedRes.isDomesticUnlimited).toBe(false);
    expect(undisclosedRes.domesticVisitsEligible).toBe(0); // Never assumes arbitrary 4 or 12
    expect(undisclosedRes.entitlementDescription).toContain("NOT_DISCLOSED");
    expect(Number(undisclosedRes.annualEstimatedBenefitValue)).toBe(0);
  });
});
