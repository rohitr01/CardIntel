"use client";

import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Plane,
  Percent,
  Calculator,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatMoney, money } from "@/lib/utils/money";
import type { CardCalculationResult, ValuationConfig } from "@/lib/calculator/types";
import { cn } from "@/lib/utils";

interface CardValueCardProps {
  rank: number;
  result: CardCalculationResult;
  config: ValuationConfig;
  onOpenMath: () => void;
}

export function CardValueCard({
  rank,
  result,
  config,
  onOpenMath,
}: CardValueCardProps) {
  const isTop = rank === 1;
  const isSecond = rank === 2;

  const cashNetNum = Number(result.cashEquivalentNetAnnualValue);
  const optionalNetNum = Number(result.optionalBenefitAnnualValue);
  const totalNetNum = config.includeOptionalBenefitsInTotal
    ? Number(result.estimatedTotalAnnualValue)
    : cashNetNum;

  const isFeeWaived = result.feeBreakdown.feeWaiverMet;
  const isLtf = result.feeBreakdown.isLifetimeFree;

  return (
    <div
      className={`relative rounded-xl border bg-white p-5 sm:p-6 shadow-sm transition-all dark:bg-slate-900 ${
        isTop
          ? "border-emerald-500/80 shadow-emerald-500/5 ring-1 ring-emerald-500/30 dark:border-emerald-600"
          : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
      }`}
    >
      {/* Rank Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
              isTop
                ? "bg-emerald-600 text-white"
                : isSecond
                ? "bg-slate-800 text-white dark:bg-slate-700"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            #{rank}
          </span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {result.issuerName} • {result.networkType}
            </span>
            <Link
              href={`/cards/${result.cardSlug}`}
              className="text-base font-bold text-slate-900 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400 line-clamp-1 block"
            >
              {result.cardOfficialName}
            </Link>
          </div>
        </div>

        {/* Net Value Headline */}
        <div className="text-right shrink-0">
          <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider">
            {config.includeOptionalBenefitsInTotal ? "Total Estimated Benefit" : "Cash Net Benefit"}
          </span>
          <span
            className={`text-xl sm:text-2xl font-black ${
              totalNetNum >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {totalNetNum >= 0 ? "+" : ""}
            {formatMoney(money(totalNetNum))}
            <span className="text-xs font-normal text-slate-400"> / yr</span>
          </span>
          <span className="text-[10px] font-semibold text-slate-500 block">
            {result.effectiveRewardRatePercent}% Net Return on Spends
          </span>
        </div>
      </div>

      {/* Component breakdown summary pill strip */}
      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-100 text-xs dark:bg-slate-800/40 dark:border-slate-800">
        <div>
          <span className="text-[10px] text-slate-500 block">Rewards & Cashback:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            +{formatMoney(money(result.rewardBreakdown.totalAnnualRewardCashValue))}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 block">Fee Payable:</span>
          <span
            className={`font-bold ${
              isLtf || isFeeWaived
                ? "text-slate-700 dark:text-slate-300"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {isLtf
              ? "₹0 (LTF)"
              : isFeeWaived
              ? "₹0 (Waived)"
              : `-${formatMoney(money(result.feeBreakdown.netAnnualFeePayable))}`}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 block">Milestones & Fuel:</span>
          <span className="font-bold text-slate-900 dark:text-white">
            +
            {formatMoney(
              money(
                Number(result.milestoneBreakdown.totalMilestoneValue) +
                  Number(result.fuelBreakdown.annualWaiverEarned),
              ),
            )}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 block">
            Lounge ({config.loungeValuationTier}):
          </span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {optionalNetNum > 0 ? `+${formatMoney(money(optionalNetNum))}` : "₹0"}
          </span>
        </div>
      </div>

      {/* Footer Controls & Math Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onOpenMath}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
        >
          <Calculator className="h-3.5 w-3.5" />
          View Step-by-Step Math ({result.mathSteps.length} Steps)
        </button>

        <div className="flex items-center gap-2">
          <Link
            href={`/cards/${result.cardSlug}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "text-xs h-7 border-slate-300 dark:border-slate-700",
            )}
          >
            Full Specs
          </Link>
          <Link
            href={`/compare?cards=${result.cardSlug}`}
            className={cn(
              buttonVariants({ size: "sm" }),
              "text-xs h-7 bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-950",
            )}
          >
            Compare
          </Link>
        </div>
      </div>
    </div>
  );
}
