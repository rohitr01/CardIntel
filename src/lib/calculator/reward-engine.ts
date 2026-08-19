/**
 * CardIntel — Reward & Cashback Engine
 *
 * Deterministic calculation of base rewards, accelerated category multipliers,
 * monthly caps, merchant-specific rules, and official point redemption valuations.
 *
 * Supports both:
 * 1. Dynamic database-driven evaluation (Prisma RewardRule, CashbackRule, RewardProgram)
 * 2. Fallback verified rule handlers for core cards.
 */

import { money, addMoney, multiplyMoney, toAmountNumber, type Money } from "@/lib/utils/money";
import type { NormalizedSpendSummary } from "./transaction-normalizer";
import type {
  RewardCalculationResult,
  AcceleratedRewardBreakdown,
  SpendCategoryKey,
} from "./types";

export function calculateCardRewards(
  card: any,
  spendSummary: NormalizedSpendSummary,
): RewardCalculationResult {
  const r = card.rewards;
  const rewardType = r?.rewardType || (card.rewardPrograms?.[0]?.currencyName ? "REWARD_POINTS" : "CASHBACK");
  const currencyName =
    r?.currencyName ||
    card.rewardPrograms?.[0]?.currencyName ||
    (rewardType === "CASHBACK" ? "Cashback" : "Reward Points");

  const redemptionRateStr =
    r?.redemptionRate ||
    card.rewardPrograms?.[0]?.valuations?.[0]?.redemptionRate ||
    "1.00";
  const redemptionValuePerPoint = parseFloat(String(redemptionRateStr).replace(/[^0-9.]/g, "")) || 1.0;

  const monthly = spendSummary.categorySpendsMonthly;
  const m = (key: SpendCategoryKey) => toAmountNumber(monthly[key]);
  const acceleratedBreakdowns: AcceleratedRewardBreakdown[] = [];

  let monthlyBasePointsNum = 0;
  let monthlyAcceleratedCashValueNum = 0;
  let isUnlimited = true;
  let monthlyCapsDescription: string | undefined = undefined;

  // -------------------------------------------------------------------------
  // 1. Dynamic Database Rule Evaluation (when Prisma reward rules are loaded)
  // -------------------------------------------------------------------------
  const dynamicRules: any[] = card.rewardRules || card.rewardPrograms?.[0]?.rewardRules || [];
  const dynamicCashbackRules: any[] = card.cashbackRules || [];

  if (dynamicRules.length > 0 || dynamicCashbackRules.length > 0) {
    // Process dynamic cashback rules
    for (const rule of dynamicCashbackRules) {
      const ratePct = Number(rule.cashbackPercentage || rule.percentage || 0);
      const capMonthly = rule.maxMonthlyCashback ? Number(rule.maxMonthlyCashback) : Infinity;
      const categories: SpendCategoryKey[] = rule.applicableCategories || [];

      let eligibleMonthlySpend = 0;
      if (categories.length > 0) {
        for (const cat of categories) {
          eligibleMonthlySpend += m(cat);
        }
      } else if (rule.isAllOnline) {
        eligibleMonthlySpend = toAmountNumber(spendSummary.onlineShoppingAnnual) / 12;
      }

      if (eligibleMonthlySpend > 0 && ratePct > 0) {
        const rawCash = eligibleMonthlySpend * (ratePct / 100);
        const cappedCash = Math.min(rawCash, capMonthly);
        const isCapped = rawCash > capMonthly;

        acceleratedBreakdowns.push({
          categoryOrMerchant: rule.description || rule.categoryName || "Accelerated Cashback",
          spendAmount: (eligibleMonthlySpend * 12).toString(),
          rateDescription: `${ratePct}% Cashback`,
          pointsOrCashEarned: `₹${(cappedCash * 12).toLocaleString("en-IN")}`,
          monetaryValue: (cappedCash * 12).toString(),
          capApplied: isCapped,
          capLimit: capMonthly < Infinity ? `₹${capMonthly.toLocaleString("en-IN")}/mo` : undefined,
        });

        monthlyAcceleratedCashValueNum += cappedCash;
        if (isCapped) isUnlimited = false;
      }
    }

    // Process dynamic point rules
    for (const rule of dynamicRules) {
      const multiplier = Number(rule.multiplier || 1);
      const pointsPerUnit = Number(rule.pointsPerUnit || 1);
      const spendUnit = Number(rule.spendUnit || 100);
      const capPoints = rule.maxPointsCapPerBillingCycle ? Number(rule.maxPointsCapPerBillingCycle) : Infinity;

      let eligibleSpend = 0;
      if (rule.applicableCategories?.length) {
        for (const cat of rule.applicableCategories as SpendCategoryKey[]) {
          eligibleSpend += m(cat);
        }
      }

      if (eligibleSpend > 0) {
        const rawPoints = (eligibleSpend / spendUnit) * pointsPerUnit * multiplier;
        const cappedPoints = Math.min(rawPoints, capPoints);
        const cashVal = cappedPoints * redemptionValuePerPoint;
        const isCapped = rawPoints > capPoints;

        acceleratedBreakdowns.push({
          categoryOrMerchant: rule.description || "Accelerated Reward Multiplier",
          spendAmount: (eligibleSpend * 12).toString(),
          rateDescription: `${multiplier}X Points (1 Pt = ₹${redemptionValuePerPoint})`,
          pointsOrCashEarned: `${Math.round(cappedPoints * 12).toLocaleString("en-IN")} Points`,
          monetaryValue: (cashVal * 12).toString(),
          capApplied: isCapped,
          capLimit: capPoints < Infinity ? `${capPoints.toLocaleString("en-IN")} Pts/mo` : undefined,
        });

        monthlyAcceleratedCashValueNum += cashVal;
        if (isCapped) isUnlimited = false;
      }
    }
  }

  // -------------------------------------------------------------------------
  // 2. Verified Specialized Card Rules (Fallback & Benchmark Dataset)
  // -------------------------------------------------------------------------
  else if (card.slug === "hdfc-millennia") {
    isUnlimited = false;
    monthlyCapsDescription = "5% CashPoints capped at ₹1,00,000 / month; 1% base capped at ₹1,000/month";

    const eligible5PctMonthly =
      m("shopping_amazon") +
      m("shopping_flipkart") +
      m("shopping_myntra") +
      m("shopping_tata_neu") +
      m("food_swiggy") +
      m("food_zomato") +
      m("food_delivery_other");

    const raw5PctCash = eligible5PctMonthly * 0.05;
    const capped5PctCash = Math.min(raw5PctCash, 1000); // Max ₹1,000/mo

    acceleratedBreakdowns.push({
      categoryOrMerchant: "Amazon, Flipkart, Myntra, Swiggy, Zomato, Tata Neu",
      spendAmount: (eligible5PctMonthly * 12).toString(),
      rateDescription: "5% CashPoints (1 Point = ₹1.00)",
      pointsOrCashEarned: (capped5PctCash * 12).toString(),
      monetaryValue: (capped5PctCash * 12).toString(),
      capApplied: raw5PctCash > 1000,
      capLimit: "₹1,000 / month (1,000 CashPoints)",
    });

    const eligible1PctMonthly =
      m("shopping_other_online") +
      m("shopping_offline_retail") +
      m("food_eazydiner") +
      m("food_restaurants") +
      m("grocery_blinkit") +
      m("grocery_zepto") +
      m("grocery_instamart") +
      m("grocery_dmart") +
      m("grocery_supermarket") +
      m("grocery_other") +
      m("travel_flights") +
      m("travel_hotels") +
      m("travel_makemytrip") +
      m("travel_ixigo") +
      m("travel_irctc") +
      m("travel_other") +
      m("other_general_offline") +
      m("other_general_online");

    const raw1PctCash = eligible1PctMonthly * 0.01;
    const capped1PctCash = Math.min(raw1PctCash, 1000);

    monthlyBasePointsNum = capped1PctCash;
    monthlyAcceleratedCashValueNum = capped5PctCash;
  } else if (card.slug === "sbi-cashback") {
    isUnlimited = false;
    monthlyCapsDescription = "5% Online Cashback capped at ₹5,000/month; 1% Offline Cashback unlimited";

    const onlineMonthly =
      m("shopping_amazon") +
      m("shopping_flipkart") +
      m("shopping_myntra") +
      m("shopping_tata_neu") +
      m("shopping_other_online") +
      m("food_swiggy") +
      m("food_zomato") +
      m("food_delivery_other") +
      m("grocery_blinkit") +
      m("grocery_zepto") +
      m("grocery_instamart") +
      m("travel_flights") +
      m("travel_hotels") +
      m("travel_makemytrip") +
      m("travel_ixigo") +
      m("travel_irctc") +
      m("travel_other") +
      m("international_online") +
      m("other_general_online");

    const raw5PctCash = onlineMonthly * 0.05;
    const capped5PctCash = Math.min(raw5PctCash, 5000);

    acceleratedBreakdowns.push({
      categoryOrMerchant: "All Online Merchants (Shopping, Food, Travel, Groceries)",
      spendAmount: (onlineMonthly * 12).toString(),
      rateDescription: "5% Direct Cashback (auto-credited to statement)",
      pointsOrCashEarned: `₹${(capped5PctCash * 12).toLocaleString("en-IN")}`,
      monetaryValue: (capped5PctCash * 12).toString(),
      capApplied: raw5PctCash > 5000,
      capLimit: "₹5,000 / calendar month",
    });

    const offlineMonthly =
      m("shopping_offline_retail") +
      m("food_restaurants") +
      m("food_eazydiner") +
      m("grocery_dmart") +
      m("grocery_supermarket") +
      m("grocery_other") +
      m("international_pos") +
      m("other_general_offline");

    const offlineCash = offlineMonthly * 0.01;

    monthlyBasePointsNum = offlineCash;
    monthlyAcceleratedCashValueNum = capped5PctCash;
  } else if (card.slug === "icici-amazon-pay") {
    isUnlimited = true;
    monthlyCapsDescription = "No upper limits on cashback earning!";

    const amazonMonthly = m("shopping_amazon");
    const amazonCash = amazonMonthly * 0.05;

    acceleratedBreakdowns.push({
      categoryOrMerchant: "Amazon.in Purchases",
      spendAmount: (amazonMonthly * 12).toString(),
      rateDescription: "5% Unlimited Cashback for Prime Members",
      pointsOrCashEarned: `₹${(amazonCash * 12).toLocaleString("en-IN")}`,
      monetaryValue: (amazonCash * 12).toString(),
      capApplied: false,
    });

    const partnersMonthly =
      m("food_swiggy") +
      m("food_zomato") +
      m("utilities_electricity") +
      m("utilities_mobile") +
      m("utilities_broadband") +
      m("utilities_dth") +
      m("travel_flights") +
      m("travel_hotels");

    const partnersCash = partnersMonthly * 0.02;

    if (partnersMonthly > 0) {
      acceleratedBreakdowns.push({
        categoryOrMerchant: "Amazon Pay Partner Merchants & Bill Payments",
        spendAmount: (partnersMonthly * 12).toString(),
        rateDescription: "2% Unlimited Cashback",
        pointsOrCashEarned: `₹${(partnersCash * 12).toLocaleString("en-IN")}`,
        monetaryValue: (partnersCash * 12).toString(),
        capApplied: false,
      });
    }

    const otherMonthly =
      toAmountNumber(spendSummary.monthlyTotal) -
      amazonMonthly -
      partnersMonthly -
      m("fuel_hpcl") -
      m("fuel_bpcl") -
      m("fuel_indianoil") -
      m("fuel_other") -
      m("excluded_rent") -
      m("excluded_wallet_load");

    const otherCash = Math.max(0, otherMonthly) * 0.01;

    monthlyBasePointsNum = otherCash;
    monthlyAcceleratedCashValueNum = amazonCash + partnersCash;
  } else if (card.slug === "tata-neu-infinity-hdfc") {
    isUnlimited = true;
    const tataNeuMonthly = m("shopping_tata_neu");
    const tataBrandsMonthly = m("food_eazydiner") + m("travel_flights") * 0.3;

    const tataNeuCash = tataNeuMonthly * 0.10;
    const tataBrandsCash = tataBrandsMonthly * 0.05;

    if (tataNeuMonthly > 0) {
      acceleratedBreakdowns.push({
        categoryOrMerchant: "Tata Neu App Spends (10% NeuCoins)",
        spendAmount: (tataNeuMonthly * 12).toString(),
        rateDescription: "10% NeuCoins (1 NeuCoin = ₹1.00)",
        pointsOrCashEarned: (tataNeuCash * 12).toString(),
        monetaryValue: (tataNeuCash * 12).toString(),
        capApplied: false,
      });
    }

    const upiMonthly = m("upi_merchant_qr");
    const upiCash = upiMonthly * 0.015;

    if (upiMonthly > 0) {
      acceleratedBreakdowns.push({
        categoryOrMerchant: "RuPay UPI QR Merchant Payments",
        spendAmount: (upiMonthly * 12).toString(),
        rateDescription: "1.5% NeuCoins on UPI Scan & Pay",
        pointsOrCashEarned: (upiCash * 12).toString(),
        monetaryValue: (upiCash * 12).toString(),
        capApplied: false,
      });
    }

    const otherMonthly =
      toAmountNumber(spendSummary.monthlyTotal) -
      tataNeuMonthly -
      tataBrandsMonthly -
      upiMonthly -
      m("excluded_rent") -
      m("excluded_wallet_load");

    const otherCash = Math.max(0, otherMonthly) * 0.015;

    monthlyBasePointsNum = otherCash;
    monthlyAcceleratedCashValueNum = tataNeuCash + tataBrandsCash + upiCash;
  } else if (card.slug === "axis-airtel") {
    isUnlimited = false;
    monthlyCapsDescription = "Airtel 25% capped at ₹250/mo; Utility 10% capped at ₹250/mo; Swiggy/Zomato/BigBasket 10% capped at ₹500/mo";

    const airtelMonthly = m("utilities_mobile") + m("utilities_broadband") + m("utilities_dth");
    const cappedAirtelCash = Math.min(airtelMonthly * 0.25, 250);

    const utilityMonthly = m("utilities_electricity") + m("utilities_other");
    const cappedUtilityCash = Math.min(utilityMonthly * 0.10, 250);

    const foodMonthly = m("food_swiggy") + m("food_zomato") + m("grocery_blinkit") + m("grocery_instamart");
    const cappedFoodCash = Math.min(foodMonthly * 0.10, 500);

    if (airtelMonthly > 0) {
      acceleratedBreakdowns.push({
        categoryOrMerchant: "Airtel Mobile, Broadband, DTH (Airtel Thanks App)",
        spendAmount: (airtelMonthly * 12).toString(),
        rateDescription: "25% Cashback",
        pointsOrCashEarned: `₹${(cappedAirtelCash * 12).toLocaleString("en-IN")}`,
        monetaryValue: (cappedAirtelCash * 12).toString(),
        capApplied: airtelMonthly * 0.25 > 250,
        capLimit: "₹250 / month",
      });
    }

    if (foodMonthly > 0) {
      acceleratedBreakdowns.push({
        categoryOrMerchant: "Swiggy, Zomato & Grocery Delivery",
        spendAmount: (foodMonthly * 12).toString(),
        rateDescription: "10% Cashback",
        pointsOrCashEarned: `₹${(cappedFoodCash * 12).toLocaleString("en-IN")}`,
        monetaryValue: (cappedFoodCash * 12).toString(),
        capApplied: foodMonthly * 0.10 > 500,
        capLimit: "₹500 / month",
      });
    }

    const otherMonthly =
      toAmountNumber(spendSummary.monthlyTotal) -
      airtelMonthly -
      utilityMonthly -
      foodMonthly -
      m("excluded_rent") -
      m("excluded_wallet_load");

    const otherCash = Math.max(0, otherMonthly) * 0.01;

    monthlyBasePointsNum = otherCash;
    monthlyAcceleratedCashValueNum = cappedAirtelCash + cappedUtilityCash + cappedFoodCash;
  } else if (card.slug === "hdfc-infinia-metal") {
    isUnlimited = false;
    monthlyCapsDescription = "3.33% Base Points (5 pts/₹150); SmartBuy 10X (33.3%) capped at 10,000 bonus pts/month. 1 Point = ₹1.00";

    const smartBuyTravelMonthly = m("travel_flights") + m("travel_hotels");
    const basePts = (smartBuyTravelMonthly / 150) * 5;
    const bonusPts = Math.min((smartBuyTravelMonthly / 150) * 45, 10000);
    const smartBuyCash = (basePts + bonusPts) * 1.0;

    if (smartBuyTravelMonthly > 0) {
      acceleratedBreakdowns.push({
        categoryOrMerchant: "SmartBuy Flights & Hotel Bookings (10X Multiplier)",
        spendAmount: (smartBuyTravelMonthly * 12).toString(),
        rateDescription: "Up to 33.3% Value Back (1 Pt = ₹1.00 on Flights/Hotels)",
        pointsOrCashEarned: `${Math.round((basePts + bonusPts) * 12).toLocaleString("en-IN")} Points`,
        monetaryValue: (smartBuyCash * 12).toString(),
        capApplied: (smartBuyTravelMonthly / 150) * 45 > 10000,
        capLimit: "10,000 bonus points / calendar month",
      });
    }

    const otherMonthly =
      toAmountNumber(spendSummary.monthlyTotal) -
      smartBuyTravelMonthly -
      m("excluded_rent") -
      m("excluded_wallet_load");

    const otherPts = (Math.max(0, otherMonthly) / 150) * 5;
    const otherCash = otherPts * 1.0;

    monthlyBasePointsNum = otherCash;
    monthlyAcceleratedCashValueNum = smartBuyCash;
  } else if (card.slug === "scapia-federal-bank") {
    isUnlimited = true;
    monthlyCapsDescription = "Unlimited 20% Scapia Coins on Scapia Travel (4% value); 10% Coins on General Spends (2% value). 5 Coins = ₹1.00 on Travel";

    const travelMonthly =
      m("travel_flights") +
      m("travel_hotels") +
      m("travel_makemytrip") +
      m("travel_ixigo") +
      m("travel_other");

    // 20% Coins = 4% monetary value
    const travelCoins = travelMonthly * 0.20;
    const travelCash = travelCoins * 0.20; // 5 coins = ₹1

    if (travelMonthly > 0) {
      acceleratedBreakdowns.push({
        categoryOrMerchant: "Travel Bookings (Flights & Hotels via Scapia App)",
        spendAmount: (travelMonthly * 12).toString(),
        rateDescription: "20% Scapia Coins (4% Travel Value Back)",
        pointsOrCashEarned: `${Math.round(travelCoins * 12).toLocaleString("en-IN")} Coins`,
        monetaryValue: (travelCash * 12).toString(),
        capApplied: false,
      });
    }

    const otherMonthly =
      toAmountNumber(spendSummary.monthlyTotal) -
      travelMonthly -
      m("excluded_rent") -
      m("excluded_wallet_load");

    // 10% Coins = 2% monetary value
    const generalCoins = Math.max(0, otherMonthly) * 0.10;
    const generalCash = generalCoins * 0.20; // 5 coins = ₹1

    monthlyBasePointsNum = generalCash;
    monthlyAcceleratedCashValueNum = travelCash;
  } else if (card.slug === "federal-celesta") {
    isUnlimited = true;
    monthlyCapsDescription = "3X FedPoints on International/Travel (0.75%); 2X on Dining (0.50%); 1X base (0.25%). 1 FedPoint = ₹0.25";

    const travelMonthly =
      m("travel_flights") +
      m("travel_hotels") +
      m("international_pos") +
      m("international_online");
    const travelCash = (travelMonthly / 100) * 3 * 0.25;

    const diningMonthly = m("food_restaurants") + m("food_swiggy") + m("food_zomato");
    const diningCash = (diningMonthly / 100) * 2 * 0.25;

    if (travelMonthly > 0) {
      acceleratedBreakdowns.push({
        categoryOrMerchant: "International & Travel Spends (3X FedPoints)",
        spendAmount: (travelMonthly * 12).toString(),
        rateDescription: "3 FedPoints / ₹100 (0.75% value back)",
        pointsOrCashEarned: `${Math.round((travelMonthly / 100) * 3 * 12).toLocaleString("en-IN")} Points`,
        monetaryValue: (travelCash * 12).toString(),
        capApplied: false,
      });
    }

    if (diningMonthly > 0) {
      acceleratedBreakdowns.push({
        categoryOrMerchant: "Dining & Restaurants (2X FedPoints)",
        spendAmount: (diningMonthly * 12).toString(),
        rateDescription: "2 FedPoints / ₹100 (0.50% value back)",
        pointsOrCashEarned: `${Math.round((diningMonthly / 100) * 2 * 12).toLocaleString("en-IN")} Points`,
        monetaryValue: (diningCash * 12).toString(),
        capApplied: false,
      });
    }

    const otherMonthly =
      toAmountNumber(spendSummary.monthlyTotal) -
      travelMonthly -
      diningMonthly -
      m("excluded_rent") -
      m("excluded_wallet_load");

    const basePts = (Math.max(0, otherMonthly) / 100) * 1;
    monthlyBasePointsNum = basePts * 0.25;
    monthlyAcceleratedCashValueNum = travelCash + diningCash;
  } else if (card.slug === "federal-imperio") {
    isUnlimited = false;
    monthlyCapsDescription = "10X FedPoints on Grocery & Healthcare (2.50% capped at 2000 bonus pts/mo); 3X on Dining (0.75%); 1X base (0.25%)";

    const groceryMonthly =
      m("grocery_supermarket") +
      m("grocery_blinkit") +
      m("grocery_instamart") +
      m("grocery_zepto") +
      m("grocery_dmart") +
      m("grocery_other");

    // 10X = 10 pts per 100 = 1 pt per 10 INR
    const rawGroceryPts = (groceryMonthly / 100) * 10;
    const bonusGroceryPts = Math.min(rawGroceryPts, 2000);
    const groceryCash = bonusGroceryPts * 0.25;

    const diningMonthly = m("food_restaurants") + m("food_swiggy") + m("food_zomato");
    const diningCash = (diningMonthly / 100) * 3 * 0.25;

    if (groceryMonthly > 0) {
      acceleratedBreakdowns.push({
        categoryOrMerchant: "Grocery & Supermarket Spends (10X FedPoints)",
        spendAmount: (groceryMonthly * 12).toString(),
        rateDescription: "10 FedPoints / ₹100 (2.50% value back)",
        pointsOrCashEarned: `${Math.round(bonusGroceryPts * 12).toLocaleString("en-IN")} Points`,
        monetaryValue: (groceryCash * 12).toString(),
        capApplied: rawGroceryPts > 2000,
        capLimit: "2,000 bonus points / month",
      });
    }

    const otherMonthly =
      toAmountNumber(spendSummary.monthlyTotal) -
      groceryMonthly -
      diningMonthly -
      m("excluded_rent") -
      m("excluded_wallet_load");

    const basePts = (Math.max(0, otherMonthly) / 100) * 1;
    monthlyBasePointsNum = basePts * 0.25;
    monthlyAcceleratedCashValueNum = groceryCash + diningCash;
  } else if (card.slug === "federal-signet") {
    isUnlimited = true;
    monthlyCapsDescription = "3X FedPoints on Electronics & Apparel (0.75%); 2X on Entertainment (0.50%); 1X base (0.25%)";

    const shoppingMonthly = m("shopping_other_online") + m("shopping_offline_retail");
    const shoppingCash = (shoppingMonthly / 100) * 3 * 0.25;

    const entertainmentMonthly = m("other_general_online");
    const entertainmentCash = (entertainmentMonthly / 100) * 2 * 0.25;

    if (shoppingMonthly > 0) {
      acceleratedBreakdowns.push({
        categoryOrMerchant: "Online Shopping & Retail Spends (3X FedPoints)",
        spendAmount: (shoppingMonthly * 12).toString(),
        rateDescription: "3 FedPoints / ₹100 (0.75% value back)",
        pointsOrCashEarned: `${Math.round((shoppingMonthly / 100) * 3 * 12).toLocaleString("en-IN")} Points`,
        monetaryValue: (shoppingCash * 12).toString(),
        capApplied: false,
      });
    }

    const otherMonthly =
      toAmountNumber(spendSummary.monthlyTotal) -
      shoppingMonthly -
      entertainmentMonthly -
      m("excluded_rent") -
      m("excluded_wallet_load");

    const basePts = (Math.max(0, otherMonthly) / 100) * 1;
    monthlyBasePointsNum = basePts * 0.25;
    monthlyAcceleratedCashValueNum = shoppingCash + entertainmentCash;
  } else {
    // Standard general fallback
    const totalEligibleMonthly =
      toAmountNumber(spendSummary.monthlyTotal) -
      m("excluded_rent") -
      m("excluded_wallet_load");

    const baseVal = Math.max(0, totalEligibleMonthly) * 0.01;
    monthlyBasePointsNum = baseVal;
    monthlyAcceleratedCashValueNum = 0;
  }

  const annualBaseMonetaryValue = monthlyBasePointsNum * 12;
  const annualAcceleratedMonetaryValue = monthlyAcceleratedCashValueNum * 12;
  const totalAnnualRewardCashValue = annualBaseMonetaryValue + annualAcceleratedMonetaryValue;

  return {
    rewardType: rewardType as any,
    currencyName,
    redemptionRate: String(redemptionRateStr),
    baseSpendAmount: toAmountNumber(spendSummary.annualTotal).toString(),
    basePointsEarned: Math.round(annualBaseMonetaryValue / redemptionValuePerPoint).toString(),
    baseMonetaryValue: money(annualBaseMonetaryValue).amount,
    acceleratedBreakdowns,
    totalAcceleratedMonetaryValue: money(annualAcceleratedMonetaryValue).amount,
    totalAnnualRewardCashValue: money(totalAnnualRewardCashValue).amount,
    isUnlimited,
    monthlyCapsDescription,
  };
}
