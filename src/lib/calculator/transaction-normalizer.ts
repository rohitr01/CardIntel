/**
 * CardIntel — Transaction & Spend Normalizer
 *
 * Converts user monthly category inputs into annual aggregates and structured buckets.
 */

import { money, addMoney, multiplyMoney, formatMoney, toAmountNumber, type Money } from "@/lib/utils/money";
import type { MonthlySpendProfile, SpendCategoryKey } from "./types";

export interface NormalizedSpendSummary {
  monthlyTotal: Money;
  annualTotal: Money;
  categorySpendsAnnual: Record<SpendCategoryKey, Money>;
  categorySpendsMonthly: Record<SpendCategoryKey, Money>;

  // Sub-aggregates
  onlineShoppingAnnual: Money;
  foodAndDiningAnnual: Money;
  groceryAnnual: Money;
  fuelAnnual: Money;
  utilitiesAnnual: Money;
  travelAnnual: Money;
  upiAnnual: Money;
  internationalAnnual: Money;
  generalOtherAnnual: Money;
  excludedAnnual: Money;
}

export function normalizeMonthlySpend(profile: MonthlySpendProfile): NormalizedSpendSummary {
  let monthlyTotal = money(0);
  const categorySpendsMonthly: Record<SpendCategoryKey, Money> = {} as any;
  const categorySpendsAnnual: Record<SpendCategoryKey, Money> = {} as any;

  // Initialize all known keys to 0
  const allKeys: SpendCategoryKey[] = [
    "shopping_amazon",
    "shopping_flipkart",
    "shopping_myntra",
    "shopping_tata_neu",
    "shopping_other_online",
    "shopping_offline_retail",
    "food_swiggy",
    "food_zomato",
    "food_eazydiner",
    "food_delivery_other",
    "food_restaurants",
    "grocery_blinkit",
    "grocery_zepto",
    "grocery_instamart",
    "grocery_dmart",
    "grocery_supermarket",
    "grocery_other",
    "fuel_hpcl",
    "fuel_bpcl",
    "fuel_indianoil",
    "fuel_other",
    "utilities_electricity",
    "utilities_mobile",
    "utilities_broadband",
    "utilities_dth",
    "utilities_other",
    "travel_flights",
    "travel_hotels",
    "travel_makemytrip",
    "travel_ixigo",
    "travel_irctc",
    "travel_other",
    "upi_merchant_qr",
    "international_online",
    "international_pos",
    "other_general_offline",
    "other_general_online",
    "excluded_rent",
    "excluded_wallet_load",
    "excluded_government",
    "excluded_education",
    "excluded_insurance",
  ];

  for (const key of allKeys) {
    const rawVal = profile[key];
    const num = Math.max(0, toAmountNumber(rawVal));
    const mVal = money(num);
    const aVal = multiplyMoney(mVal, 12);

    categorySpendsMonthly[key] = mVal;
    categorySpendsAnnual[key] = aVal;
    monthlyTotal = addMoney(monthlyTotal, mVal);
  }

  const annualTotal = multiplyMoney(monthlyTotal, 12);

  // Grouped sub-aggregates
  const sumKeys = (keys: SpendCategoryKey[]) =>
    keys.reduce((acc, k) => addMoney(acc, categorySpendsAnnual[k]), money(0));

  const onlineShoppingAnnual = sumKeys([
    "shopping_amazon",
    "shopping_flipkart",
    "shopping_myntra",
    "shopping_tata_neu",
    "shopping_other_online",
  ]);

  const foodAndDiningAnnual = sumKeys([
    "food_swiggy",
    "food_zomato",
    "food_eazydiner",
    "food_delivery_other",
    "food_restaurants",
  ]);

  const groceryAnnual = sumKeys([
    "grocery_blinkit",
    "grocery_zepto",
    "grocery_instamart",
    "grocery_dmart",
    "grocery_supermarket",
    "grocery_other",
  ]);

  const fuelAnnual = sumKeys(["fuel_hpcl", "fuel_bpcl", "fuel_indianoil", "fuel_other"]);

  const utilitiesAnnual = sumKeys([
    "utilities_electricity",
    "utilities_mobile",
    "utilities_broadband",
    "utilities_dth",
    "utilities_other",
  ]);

  const travelAnnual = sumKeys([
    "travel_flights",
    "travel_hotels",
    "travel_makemytrip",
    "travel_ixigo",
    "travel_irctc",
    "travel_other",
  ]);

  const upiAnnual = categorySpendsAnnual["upi_merchant_qr"];

  const internationalAnnual = sumKeys(["international_online", "international_pos"]);

  const generalOtherAnnual = sumKeys([
    "shopping_offline_retail",
    "other_general_offline",
    "other_general_online",
  ]);

  const excludedAnnual = sumKeys([
    "excluded_rent",
    "excluded_wallet_load",
    "excluded_government",
    "excluded_education",
    "excluded_insurance",
  ]);

  return {
    monthlyTotal,
    annualTotal,
    categorySpendsMonthly,
    categorySpendsAnnual,
    onlineShoppingAnnual,
    foodAndDiningAnnual,
    groceryAnnual,
    fuelAnnual,
    utilitiesAnnual,
    travelAnnual,
    upiAnnual,
    internationalAnnual,
    generalOtherAnnual,
    excludedAnnual,
  };
}
