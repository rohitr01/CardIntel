"use client";

import { useState } from "react";
import {
  Sparkles,
  Layers,
  TrendingUp,
  Settings2,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { CardValueCard } from "./card-value-card";
import { CalculationBreakdown } from "./calculation-breakdown";
import { BreakEven } from "./break-even";
import type {
  CardCalculationResult,
  ValuationConfig,
  LoungeValuationTier,
} from "@/lib/calculator/types";
import { Badge } from "@/components/ui/badge";

interface CalculatorResultsProps {
  calculatedCards: CardCalculationResult[];
  config: ValuationConfig;
  onConfigChange: (newConfig: ValuationConfig) => void;
}

export function CalculatorResults({
  calculatedCards,
  config,
  onConfigChange,
}: CalculatorResultsProps) {
  const [selectedMathCard, setSelectedMathCard] = useState<CardCalculationResult | null>(null);
  const [activeView, setActiveView] = useState<"ranked" | "breakeven">("ranked");

  const setTier = (tier: LoungeValuationTier) => {
    onConfigChange({
      ...config,
      loungeValuationTier: tier,
    });
  };

  const toggleIncludeOptional = (checked: boolean) => {
    onConfigChange({
      ...config,
      includeOptionalBenefitsInTotal: checked,
    });
  };

  return (
    <div className="space-y-6">
      {/* Valuation Controls & View Selector Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Left: View Tabs */}
        <div className="flex items-center rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setActiveView("ranked")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              activeView === "ranked"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Ranked Net Value ({calculatedCards.length} Cards)
          </button>

          <button
            type="button"
            onClick={() => setActiveView("breakeven")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              activeView === "breakeven"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Break-Even Analysis
          </button>
        </div>

        {/* Right: Transparent Lounge Valuation Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
            <span>Lounge Valuation:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setTier("CONSERVATIVE")}
                className={`rounded px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                  config.loungeValuationTier === "CONSERVATIVE"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                }`}
                title="Valued at ₹0 (Separates subjective perks from cash-equivalent rewards)"
              >
                Conservative (₹0)
              </button>
              <button
                type="button"
                onClick={() => setTier("STANDARD")}
                className={`rounded px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                  config.loungeValuationTier === "STANDARD"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                }`}
                title="Valued at standard ₹500 per lounge visit"
              >
                Standard (₹500)
              </button>
            </div>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
            <input
              type="checkbox"
              checked={config.includeOptionalBenefitsInTotal}
              onChange={(e) => toggleIncludeOptional(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Include in Total Ranking</span>
          </label>
        </div>
      </div>

      {/* Main Content Area */}
      {activeView === "ranked" && (
        <div className="space-y-4">
          {calculatedCards.map((result, idx) => (
            <CardValueCard
              key={result.cardSlug}
              rank={idx + 1}
              result={result}
              config={config}
              onOpenMath={() => setSelectedMathCard(result)}
            />
          ))}
        </div>
      )}

      {activeView === "breakeven" && (
        <BreakEven calculatedCards={calculatedCards} />
      )}

      {/* Math Modal Dialog */}
      {selectedMathCard && (
        <CalculationBreakdown
          result={selectedMathCard}
          onClose={() => setSelectedMathCard(null)}
        />
      )}
    </div>
  );
}
