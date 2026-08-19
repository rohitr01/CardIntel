"use client";

import { X, Calculator, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import type { CardCalculationResult } from "@/lib/calculator/types";
import { formatMoney, money } from "@/lib/utils/money";

interface CalculationBreakdownProps {
  result: CardCalculationResult;
  onClose: () => void;
}

export function CalculationBreakdown({ result, onClose }: CalculationBreakdownProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="breakdown-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in-50"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 mb-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Deterministic Mathematical Trace</span>
            </div>
            <h2 id="breakdown-title" className="text-lg font-bold text-slate-900 dark:text-white">
              {result.cardOfficialName}
            </h2>
            <p className="text-xs text-slate-500">
              Complete calculation audit based on your annual spend of{" "}
              <strong>{formatMoney(money(result.totalAnnualSpend))}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step-by-Step Math Table */}
        <div className="mt-5 space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-500 font-bold">
                <tr>
                  <th className="p-3">Step / Pipeline Component</th>
                  <th className="p-3">Deterministic Formula & Rules</th>
                  <th className="p-3 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {result.mathSteps.map((step, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white align-top">
                      {step.step}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 align-top">
                      <div>{step.calculation}</div>
                      {step.notes && (
                        <div className="text-[10px] text-slate-400 mt-0.5">{step.notes}</div>
                      )}
                    </td>
                    <td className="p-3 font-bold text-right align-top whitespace-nowrap text-slate-900 dark:text-white">
                      {step.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Accelerated Breakdown Sub-table if present */}
          {result.rewardBreakdown.acceleratedBreakdowns.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/20">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                Accelerated Category Multipliers Breakdown:
              </h3>
              <div className="space-y-2">
                {result.rewardBreakdown.acceleratedBreakdowns.map((acc, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs bg-white p-2.5 rounded border border-slate-200/80 dark:bg-slate-900 dark:border-slate-700"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {acc.categoryOrMerchant}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {acc.rateDescription} • Spend: {formatMoney(money(acc.spendAmount))}
                        {acc.capApplied && (
                          <span className="text-amber-700 font-bold ml-1">
                            (Monthly Cap of {acc.capLimit} applied)
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      +{formatMoney(money(acc.monetaryValue))} / yr
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Summary Banner */}
          <div className="rounded-xl bg-slate-900 p-4 text-white dark:bg-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                True Net Annual Monetary Benefit
              </span>
              <span className="text-xl font-extrabold text-emerald-400">
                {formatMoney(money(result.cashEquivalentNetAnnualValue))} / year
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Effective Return:</span>
              <span className="text-sm font-bold text-white">
                {result.effectiveRewardRatePercent}% of spends
              </span>
            </div>
          </div>
        </div>

        {/* Close CTA */}
        <div className="mt-5 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            Close Math Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}
