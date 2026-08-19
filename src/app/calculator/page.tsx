"use client";

import { useState, useMemo } from "react";
import { Calculator, ShieldCheck, Sparkles, SlidersHorizontal } from "lucide-react";
import { SpendProfile } from "@/components/calculator/spend-profile";
import { CalculatorResults } from "@/components/calculator/calculator-results";
import { calculateAllCards, defaultValuationConfig } from "@/lib/calculator/spend-engine";
import type { MonthlySpendProfile, ValuationConfig } from "@/lib/calculator/types";
import { demoCards } from "@/data/demo/cards";

export default function CalculatorPage() {
  // Default spending profile: ₹50k balanced monthly spend
  const [profile, setProfile] = useState<MonthlySpendProfile>({
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

  const [valuationConfig, setValuationConfig] = useState<ValuationConfig>(defaultValuationConfig);

  // Re-calculate rankings live deterministically whenever profile or config changes
  const calculatedCards = useMemo(() => {
    return calculateAllCards(profile, demoCards, valuationConfig);
  }, [profile, valuationConfig]);

  return (
    <div className="bg-slate-50/50 pb-20 pt-10 dark:bg-slate-950 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 mb-3">
            <ShieldCheck className="h-4 w-4" />
            <span>CardIntel True Net Value Engine (Phase 2)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Deterministic Spend & Reward Calculator
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Enter your monthly spending breakdown across Amazon, Flipkart, Swiggy, Fuel, and UPI.
            Our deterministic mathematical engine evaluates fee waivers, category caps, and GST to rank cards by True Net Monetary Benefit.
          </p>
        </div>

        {/* 1. Spend Profile Input Section */}
        <section aria-label="Monthly Spend Profile Input">
          <SpendProfile profile={profile} onChange={setProfile} />
        </section>

        {/* 2. Ranked Calculation Results */}
        <section aria-label="Ranked Calculation Results">
          <CalculatorResults
            calculatedCards={calculatedCards}
            config={valuationConfig}
            onConfigChange={setValuationConfig}
          />
        </section>
      </div>
    </div>
  );
}
