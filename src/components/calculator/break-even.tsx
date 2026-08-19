"use client";

import { useState, useMemo } from "react";
import { TrendingUp, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from "lucide-react";
import { formatMoney, money } from "@/lib/utils/money";
import { calculateBreakEven } from "@/lib/calculator/break-even-engine";
import type { CardCalculationResult } from "@/lib/calculator/types";

interface BreakEvenProps {
  calculatedCards: CardCalculationResult[];
}

export function BreakEven({ calculatedCards }: BreakEvenProps) {
  const [cardASlug, setCardASlug] = useState<string>("sbi-cashback");
  const [cardBSlug, setCardBSlug] = useState<string>("icici-amazon-pay");

  const cardA = useMemo(
    () => calculatedCards.find((c) => c.cardSlug === cardASlug) || calculatedCards[0],
    [calculatedCards, cardASlug],
  );

  const cardB = useMemo(
    () => calculatedCards.find((c) => c.cardSlug === cardBSlug) || calculatedCards[1] || calculatedCards[0],
    [calculatedCards, cardBSlug],
  );

  const breakEvenResult = useMemo(() => {
    if (!cardA || !cardB) return null;
    return calculateBreakEven(cardA, cardB);
  }, [cardA, cardB]);

  if (!cardA || !cardB || !breakEvenResult) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Spend Break-Even & Fee Crossover Analysis
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Find out exactly how much spend is required for a fee-charging card to beat a Lifetime Free (LTF) or competitor card.
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Card A (e.g. Fee-Charging Card):
          </label>
          <select
            value={cardASlug}
            onChange={(e) => setCardASlug(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            {calculatedCards.map((c) => (
              <option key={c.cardSlug} value={c.cardSlug}>
                {c.cardOfficialName} (Fee: ₹{c.feeBreakdown.annualFeeAmount})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Card B (e.g. Lifetime Free or Benchmark Card):
          </label>
          <select
            value={cardBSlug}
            onChange={(e) => setCardBSlug(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            {calculatedCards.map((c) => (
              <option key={c.cardSlug} value={c.cardSlug}>
                {c.cardOfficialName} (Fee: ₹{c.feeBreakdown.annualFeeAmount})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result Card */}
      <div className="rounded-xl bg-slate-50 p-5 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Annual Break-Even Crossover Spend
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {breakEvenResult.isBreakEvenPossible && breakEvenResult.crossoverSpendAnnual !== "Infinity"
                ? `${formatMoney(money(breakEvenResult.crossoverSpendAnnual))} / year`
                : "No Crossover under current spend"}
            </span>
            {breakEvenResult.isBreakEvenPossible && breakEvenResult.crossoverSpendMonthly !== "Infinity" && (
              <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                (~{formatMoney(money(breakEvenResult.crossoverSpendMonthly))} / month on eligible categories)
              </span>
            )}
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 block">Annual Fee Difference:</span>
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {formatMoney(money(breakEvenResult.feeDifference))}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 leading-relaxed">
          {breakEvenResult.narrative}
        </p>
      </div>
    </div>
  );
}
