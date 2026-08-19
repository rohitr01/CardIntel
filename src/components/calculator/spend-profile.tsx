"use client";

import { useState } from "react";
import {
  ShoppingBag,
  Utensils,
  ShoppingCart,
  Fuel,
  Zap,
  Plane,
  CreditCard,
  Globe,
  MoreHorizontal,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { CategoryInput } from "./category-input";
import type { MonthlySpendProfile, SpendCategoryKey } from "@/lib/calculator/types";
import { normalizeMonthlySpend } from "@/lib/calculator/transaction-normalizer";
import { formatMoney } from "@/lib/utils/money";

interface SpendProfileProps {
  profile: MonthlySpendProfile;
  onChange: (newProfile: MonthlySpendProfile) => void;
}

export function SpendProfile({ profile, onChange }: SpendProfileProps) {
  const [activeTab, setActiveTab] = useState<string>("shopping");

  const summary = normalizeMonthlySpend(profile);

  const updateCategory = (key: SpendCategoryKey, val: number) => {
    onChange({
      ...profile,
      [key]: val,
    });
  };

  // Preset spending templates
  const applyPreset = (preset: "starter" | "balanced" | "ecommerce" | "traveler") => {
    if (preset === "starter") {
      onChange({
        shopping_amazon: 3000,
        shopping_flipkart: 2000,
        food_swiggy: 2000,
        food_zomato: 1500,
        grocery_blinkit: 2500,
        fuel_hpcl: 2000,
        utilities_electricity: 2000,
        utilities_mobile: 1000,
        upi_merchant_qr: 5000,
        other_general_offline: 4000,
      });
    } else if (preset === "balanced") {
      onChange({
        shopping_amazon: 6000,
        shopping_flipkart: 4000,
        shopping_myntra: 3000,
        food_swiggy: 4000,
        food_zomato: 3000,
        grocery_blinkit: 5000,
        grocery_dmart: 4000,
        fuel_indianoil: 4000,
        utilities_electricity: 3500,
        utilities_broadband: 1500,
        travel_flights: 5000,
        upi_merchant_qr: 8000,
        other_general_offline: 7000,
      });
    } else if (preset === "ecommerce") {
      onChange({
        shopping_amazon: 15000,
        shopping_flipkart: 10000,
        shopping_myntra: 5000,
        shopping_tata_neu: 5000,
        food_swiggy: 6000,
        food_zomato: 5000,
        grocery_zepto: 6000,
        grocery_instamart: 4000,
        upi_merchant_qr: 10000,
        utilities_electricity: 4000,
        other_general_offline: 10000,
      });
    } else if (preset === "traveler") {
      onChange({
        travel_flights: 25000,
        travel_hotels: 15000,
        international_online: 15000,
        international_pos: 20000,
        shopping_amazon: 5000,
        food_restaurants: 8000,
        food_swiggy: 4000,
        grocery_supermarket: 6000,
        fuel_bpcl: 4000,
        upi_merchant_qr: 8000,
      });
    }
  };

  const clearAll = () => {
    onChange({});
  };

  const tabs = [
    { id: "shopping", label: "Shopping", icon: ShoppingBag, count: summary.onlineShoppingAnnual },
    { id: "food", label: "Food & Dining", icon: Utensils, count: summary.foodAndDiningAnnual },
    { id: "grocery", label: "Groceries", icon: ShoppingCart, count: summary.groceryAnnual },
    { id: "fuel", label: "Fuel", icon: Fuel, count: summary.fuelAnnual },
    { id: "utilities", label: "Utilities", icon: Zap, count: summary.utilitiesAnnual },
    { id: "travel", label: "Travel & Hotels", icon: Plane, count: summary.travelAnnual },
    { id: "upi", label: "RuPay UPI", icon: CreditCard, count: summary.upiAnnual },
    { id: "international", label: "International", icon: Globe, count: summary.internationalAnnual },
    { id: "other", label: "Other Spends", icon: MoreHorizontal, count: summary.generalOtherAnnual },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Spend Summary + Presets */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Total Monthly Spending
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {formatMoney(summary.monthlyTotal)}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                / month ({formatMoney(summary.annualTotal)} / year)
              </span>
            </div>
          </div>

          {/* Presets & Reset */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
              Presets:
            </span>
            <button
              type="button"
              onClick={() => applyPreset("starter")}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              ₹25k Starter
            </button>
            <button
              type="button"
              onClick={() => applyPreset("balanced")}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              ₹50k Balanced
            </button>
            <button
              type="button"
              onClick={() => applyPreset("ecommerce")}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              ₹75k E-Commerce
            </button>
            <button
              type="button"
              onClick={() => applyPreset("traveler")}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              ₹1L+ Traveler
            </button>

            {Number(summary.monthlyTotal) > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="ml-2 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 font-medium"
              >
                <RotateCcw className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const hasSpend = Number(tab.count) > 0;

          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${hasSpend ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
              <span>{tab.label}</span>
              {hasSpend && (
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {formatMoney(tab.count)}/yr
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Inputs for Active Tab */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* Shopping */}
        {activeTab === "shopping" && (
          <>
            <CategoryInput
              label="Amazon.in Shopping"
              description="Online electronics, essentials, Prime orders"
              icon={ShoppingBag}
              value={profile.shopping_amazon || 0}
              onChange={(val) => updateCategory("shopping_amazon", val)}
              presetValues={[2000, 5000, 10000, 20000]}
            />
            <CategoryInput
              label="Flipkart Shopping"
              description="E-commerce, appliances, Big Billion Days"
              icon={ShoppingBag}
              value={profile.shopping_flipkart || 0}
              onChange={(val) => updateCategory("shopping_flipkart", val)}
              presetValues={[2000, 5000, 10000, 20000]}
            />
            <CategoryInput
              label="Myntra / Ajio Fashion"
              description="Apparel, footwear, fashion accessories"
              icon={ShoppingBag}
              value={profile.shopping_myntra || 0}
              onChange={(val) => updateCategory("shopping_myntra", val)}
              presetValues={[1000, 3000, 5000, 10000]}
            />
            <CategoryInput
              label="Tata Neu App / Croma"
              description="Tata brands, electronics, 1mg, Westside"
              icon={ShoppingBag}
              value={profile.shopping_tata_neu || 0}
              onChange={(val) => updateCategory("shopping_tata_neu", val)}
              presetValues={[2000, 5000, 10000, 20000]}
            />
            <CategoryInput
              label="Other Online Shopping"
              description="Nykaa, Meesho, brand D2C websites"
              icon={ShoppingBag}
              value={profile.shopping_other_online || 0}
              onChange={(val) => updateCategory("shopping_other_online", val)}
              presetValues={[2000, 5000, 10000]}
            />
            <CategoryInput
              label="Offline Retail & Mall Spends"
              description="POS card swipes at offline brand stores"
              icon={ShoppingBag}
              value={profile.shopping_offline_retail || 0}
              onChange={(val) => updateCategory("shopping_offline_retail", val)}
              presetValues={[3000, 5000, 10000, 20000]}
            />
          </>
        )}

        {/* Food & Dining */}
        {activeTab === "food" && (
          <>
            <CategoryInput
              label="Swiggy Food Orders"
              description="Online food delivery & Swiggy Dineout"
              icon={Utensils}
              value={profile.food_swiggy || 0}
              onChange={(val) => updateCategory("food_swiggy", val)}
              presetValues={[1500, 3000, 6000, 10000]}
            />
            <CategoryInput
              label="Zomato Food Delivery"
              description="Zomato Gold, restaurant delivery"
              icon={Utensils}
              value={profile.food_zomato || 0}
              onChange={(val) => updateCategory("food_zomato", val)}
              presetValues={[1500, 3000, 6000, 10000]}
            />
            <CategoryInput
              label="EazyDiner / Gourmet Dining"
              description="Table bookings & restaurant dining discounts"
              icon={Utensils}
              value={profile.food_eazydiner || 0}
              onChange={(val) => updateCategory("food_eazydiner", val)}
              presetValues={[2000, 5000, 10000]}
            />
            <CategoryInput
              label="Offline Restaurants & Cafes"
              description="Dining out at restaurants, Starbucks, bars"
              icon={Utensils}
              value={profile.food_restaurants || 0}
              onChange={(val) => updateCategory("food_restaurants", val)}
              presetValues={[2000, 5000, 10000, 20000]}
            />
          </>
        )}

        {/* Groceries */}
        {activeTab === "grocery" && (
          <>
            <CategoryInput
              label="Blinkit / Zepto / Instamart"
              description="Quick commerce 10-minute grocery delivery"
              icon={ShoppingCart}
              value={profile.grocery_blinkit || 0}
              onChange={(val) => updateCategory("grocery_blinkit", val)}
              presetValues={[2000, 5000, 10000, 15000]}
            />
            <CategoryInput
              label="DMart / BigBasket / JioMart"
              description="Monthly supermarket groceries & bulk essentials"
              icon={ShoppingCart}
              value={profile.grocery_dmart || 0}
              onChange={(val) => updateCategory("grocery_dmart", val)}
              presetValues={[3000, 6000, 12000, 20000]}
            />
            <CategoryInput
              label="Local Supermarkets & Kirana"
              description="Offline grocery stores & supermarkets"
              icon={ShoppingCart}
              value={profile.grocery_supermarket || 0}
              onChange={(val) => updateCategory("grocery_supermarket", val)}
              presetValues={[2000, 5000, 10000]}
            />
          </>
        )}

        {/* Fuel */}
        {activeTab === "fuel" && (
          <>
            <CategoryInput
              label="HPCL Fuel Outlets"
              description="Petrol, diesel & lubricants at HPCL"
              icon={Fuel}
              value={profile.fuel_hpcl || 0}
              onChange={(val) => updateCategory("fuel_hpcl", val)}
              presetValues={[2000, 4000, 8000, 15000]}
            />
            <CategoryInput
              label="BPCL Fuel Outlets"
              description="Bharat Petroleum petrol & Speed fuel"
              icon={Fuel}
              value={profile.fuel_bpcl || 0}
              onChange={(val) => updateCategory("fuel_bpcl", val)}
              presetValues={[2000, 4000, 8000, 15000]}
            />
            <CategoryInput
              label="IndianOil (IOCL) Fuel Outlets"
              description="Indian Oil petrol pumps across India"
              icon={Fuel}
              value={profile.fuel_indianoil || 0}
              onChange={(val) => updateCategory("fuel_indianoil", val)}
              presetValues={[2000, 4000, 8000, 15000]}
            />
          </>
        )}

        {/* Utilities */}
        {activeTab === "utilities" && (
          <>
            <CategoryInput
              label="Electricity & Water Bills"
              description="State DISCOM electricity bills & piped gas"
              icon={Zap}
              value={profile.utilities_electricity || 0}
              onChange={(val) => updateCategory("utilities_electricity", val)}
              presetValues={[1500, 3000, 6000, 10000]}
            />
            <CategoryInput
              label="Mobile Postpaid & Recharges"
              description="Airtel, Jio, Vi postpaid mobile connections"
              icon={Zap}
              value={profile.utilities_mobile || 0}
              onChange={(val) => updateCategory("utilities_mobile", val)}
              presetValues={[500, 1000, 2000, 3000]}
            />
            <CategoryInput
              label="Broadband & DTH Recharges"
              description="Fiber broadband, Tata Play, Airtel DTH"
              icon={Zap}
              value={profile.utilities_broadband || 0}
              onChange={(val) => updateCategory("utilities_broadband", val)}
              presetValues={[800, 1500, 2500]}
            />
          </>
        )}

        {/* Travel & Hotels */}
        {activeTab === "travel" && (
          <>
            <CategoryInput
              label="Flight Bookings"
              description="Airline tickets (IndiGo, Air India, SmartBuy)"
              icon={Plane}
              value={profile.travel_flights || 0}
              onChange={(val) => updateCategory("travel_flights", val)}
              presetValues={[5000, 15000, 30000, 60000]}
            />
            <CategoryInput
              label="Hotel Bookings"
              description="Hotels, Airbnb, Marriott, Taj, MakeMyTrip"
              icon={Plane}
              value={profile.travel_hotels || 0}
              onChange={(val) => updateCategory("travel_hotels", val)}
              presetValues={[5000, 10000, 25000, 50000]}
            />
            <CategoryInput
              label="IRCTC Train & Bus Tickets"
              description="Rail ticket bookings on IRCTC app / web"
              icon={Plane}
              value={profile.travel_irctc || 0}
              onChange={(val) => updateCategory("travel_irctc", val)}
              presetValues={[1000, 3000, 6000]}
            />
          </>
        )}

        {/* RuPay UPI */}
        {activeTab === "upi" && (
          <div className="col-span-full">
            <CategoryInput
              label="RuPay UPI QR Merchant Payments"
              description="Scan & Pay at local grocery stores, tea stalls, pharmacies, fuel stations on Google Pay, PhonePe, Paytm"
              icon={CreditCard}
              value={profile.upi_merchant_qr || 0}
              onChange={(val) => updateCategory("upi_merchant_qr", val)}
              presetValues={[3000, 6000, 12000, 25000]}
            />
          </div>
        )}

        {/* International */}
        {activeTab === "international" && (
          <>
            <CategoryInput
              label="International Online Purchases"
              description="USD/EUR SaaS software, international sites, courses"
              icon={Globe}
              value={profile.international_online || 0}
              onChange={(val) => updateCategory("international_online", val)}
              presetValues={[3000, 8000, 20000, 50000]}
            />
            <CategoryInput
              label="International Travel Swipes (POS)"
              description="Physical card swipes abroad on overseas trips"
              icon={Globe}
              value={profile.international_pos || 0}
              onChange={(val) => updateCategory("international_pos", val)}
              presetValues={[10000, 25000, 50000, 100000]}
            />
          </>
        )}

        {/* Other Spends */}
        {activeTab === "other" && (
          <>
            <CategoryInput
              label="General Other Offline Spends"
              description="Miscellaneous retail POS transactions"
              icon={MoreHorizontal}
              value={profile.other_general_offline || 0}
              onChange={(val) => updateCategory("other_general_offline", val)}
              presetValues={[3000, 6000, 12000, 25000]}
            />
            <CategoryInput
              label="General Other Online Spends"
              description="Miscellaneous domestic e-commerce"
              icon={MoreHorizontal}
              value={profile.other_general_online || 0}
              onChange={(val) => updateCategory("other_general_online", val)}
              presetValues={[3000, 6000, 12000, 25000]}
            />
          </>
        )}
      </div>
    </div>
  );
}
