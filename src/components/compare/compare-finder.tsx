"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  SlidersHorizontal,
  Zap,
  Percent,
  Plane,
  CreditCard,
  Building,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatMoney, money } from "@/lib/utils/money";
import { demoCards } from "@/data/demo/cards";
import { cn } from "@/lib/utils";

interface CompareFinderProps {
  availableCards?: any[];
  onSelectForMatrix: (slug: string) => void;
}

export function CompareFinder({
  availableCards = demoCards,
  onSelectForMatrix,
}: CompareFinderProps) {
  const [baselineSlug, setBaselineSlug] = useState<string>("hdfc-millennia");
  const [selectedTargetCategory, setSelectedTargetCategory] = useState<string>("");
  const [maxAnnualFeeFilter, setMaxAnnualFeeFilter] = useState<string>("");
  const [mustHaveUpi, setMustHaveUpi] = useState<boolean>(false);
  const [mustHaveLounge, setMustHaveLounge] = useState<boolean>(false);
  const [mustHaveZeroForex, setMustHaveZeroForex] = useState<boolean>(false);
  const [mustHaveLtf, setMustHaveLtf] = useState<boolean>(false);
  const [excludeHighFee, setExcludeHighFee] = useState<boolean>(false);

  const baselineCard = useMemo(() => {
    return availableCards.find((c) => c.slug === baselineSlug) || availableCards[0];
  }, [availableCards, baselineSlug]);

  // Deterministic Scoring & Trade-Off Engine
  const matchedAlternatives = useMemo(() => {
    if (!baselineCard) return [];

    let candidates = availableCards.filter((c) => c.slug !== baselineCard.slug);

    // Hard Filters (Must-Have)
    if (mustHaveUpi) {
      candidates = candidates.filter((c) => c.upiBenefit?.upiEnabled || c.network?.type === "RUPAY");
    }
    if (mustHaveLounge) {
      candidates = candidates.filter((c) => c.loungeBenefits?.hasLounge);
    }
    if (mustHaveZeroForex) {
      candidates = candidates.filter((c) => c.forexMarkup?.isZeroForex);
    }
    if (mustHaveLtf) {
      candidates = candidates.filter(
        (c) => c.feeWaiver?.isLifetimeFree || Number(c.annualFee?.amount) === 0,
      );
    }
    if (excludeHighFee) {
      candidates = candidates.filter((c) => Number(c.annualFee?.amount || 0) <= 1000);
    }
    if (maxAnnualFeeFilter) {
      const maxFee = Number(maxAnnualFeeFilter);
      candidates = candidates.filter((c) => Number(c.annualFee?.amount || 0) <= maxFee);
    }
    if (selectedTargetCategory) {
      candidates = candidates.filter((c) =>
        c.categories?.some((cat: any) => (cat.slug || cat.name) === selectedTargetCategory),
      );
    }

    // Compute Deterministic Trade-offs & Score for each candidate
    const scored = candidates.map((candidate) => {
      let score = 50; // base similarity score
      const advantages: string[] = [];
      const disadvantages: string[] = [];
      const tradeOffs: string[] = [];

      const baseFee = Number(baselineCard.annualFee?.amount || 0);
      const candFee = Number(candidate.annualFee?.amount || 0);

      // Fee Comparison
      if (candFee < baseFee) {
        score += 15;
        advantages.push(
          `Lower Annual Fee: ${formatMoney(money(candFee))} vs ${formatMoney(money(baseFee))} (Saves ${formatMoney(money(baseFee - candFee))}/yr)`,
        );
      } else if (candFee > baseFee) {
        score -= 10;
        disadvantages.push(
          `Higher Annual Fee: ${formatMoney(money(candFee))} vs ${formatMoney(money(baseFee))}`,
        );
      }

      // Lifetime Free
      if (candidate.feeWaiver?.isLifetimeFree && !baselineCard.feeWaiver?.isLifetimeFree) {
        score += 20;
        advantages.push("Unconditionally Lifetime Free (₹0 Annual Fee for life)");
      }

      // RuPay UPI
      const candUpi = candidate.upiBenefit?.upiEnabled || candidate.network?.type === "RUPAY";
      const baseUpi = baselineCard.upiBenefit?.upiEnabled || baselineCard.network?.type === "RUPAY";
      if (candUpi && !baseUpi) {
        score += 15;
        advantages.push("Supports UPI QR merchant payments on PhonePe / GPay");
      } else if (!candUpi && baseUpi) {
        disadvantages.push("Does not support UPI QR scanning payments");
      }

      // Lounge
      const candLounge = candidate.loungeBenefits?.domesticVisitsPerYear || (candidate.loungeBenefits?.domesticUnlimited ? 99 : 0);
      const baseLounge = baselineCard.loungeBenefits?.domesticVisitsPerYear || (baselineCard.loungeBenefits?.domesticUnlimited ? 99 : 0);
      if (candLounge > baseLounge) {
        score += 15;
        advantages.push(`More Domestic Lounge Access (${candLounge} vs ${baseLounge || 0} visits/yr)`);
      } else if (candLounge < baseLounge) {
        disadvantages.push(`Fewer Lounge Visits (${candLounge || 0} vs ${baseLounge} visits/yr)`);
      }

      // Forex
      const candForex = candidate.forexMarkup?.isZeroForex ? 0 : parseFloat(candidate.forexMarkup?.percentage?.replace("%", "") || "3.5");
      const baseForex = baselineCard.forexMarkup?.isZeroForex ? 0 : parseFloat(baselineCard.forexMarkup?.percentage?.replace("%", "") || "3.5");
      if (candForex < baseForex) {
        score += 15;
        advantages.push(`Lower Forex Markup (${candForex}% vs ${baseForex}%)`);
      } else if (candForex > baseForex) {
        disadvantages.push(`Higher Forex Markup (${candForex}% vs ${baseForex}%)`);
      }

      // Category match
      const commonCategories = candidate.categories?.filter((cc: any) =>
        baselineCard.categories?.some((bc: any) => (bc.slug || bc.name) === (cc.slug || cc.name)),
      );
      if (commonCategories?.length > 0) {
        score += 10;
      }

      return {
        card: candidate,
        score: Math.min(99, Math.max(10, score)),
        advantages,
        disadvantages,
        tradeOffs,
      };
    });

    // Sort by deterministic score descending
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }, [
    availableCards,
    baselineCard,
    mustHaveUpi,
    mustHaveLounge,
    mustHaveZeroForex,
    mustHaveLtf,
    excludeHighFee,
    maxAnnualFeeFilter,
    selectedTargetCategory,
  ]);

  return (
    <div className="space-y-8">
      {/* Configuration Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Deterministic Alternative Card Recommender (Mode 2)
          </h2>
        </div>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Select your baseline card or target preferences. Our deterministic ranking engine compares candidate features, scores utility, and calculates trade-offs.
        </p>

        {/* Baseline Card Selector */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              1. Select Baseline Card to Compare Against:
            </label>
            <select
              value={baselineSlug}
              onChange={(e) => setBaselineSlug(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              {availableCards.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.issuer?.name} — {c.officialName || c.shortName} ({c.annualFee?.amount === "0.00" ? "Lifetime Free" : formatMoney(money(c.annualFee?.amount || 0))})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              2. Target Category Focus:
            </label>
            <select
              value={selectedTargetCategory}
              onChange={(e) => setSelectedTargetCategory(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="">Any Category</option>
              <option value="cashback">Cashback Cards</option>
              <option value="upi">RuPay UPI Cards</option>
              <option value="lifetime-free">Lifetime Free (LTF)</option>
              <option value="forex">Zero / Low Forex Markup</option>
              <option value="travel">Travel & Airport Lounge</option>
              <option value="shopping">Shopping & E-Commerce</option>
            </select>
          </div>
        </div>

        {/* Hard Constraint Toggles */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">
            Hard Constraints & Requirements:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setMustHaveUpi(!mustHaveUpi)}
              className={`rounded-lg px-3 py-1.5 font-medium border transition-colors flex items-center gap-1.5 ${
                mustHaveUpi
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              Must Have RuPay UPI
            </button>

            <button
              type="button"
              onClick={() => setMustHaveLounge(!mustHaveLounge)}
              className={`rounded-lg px-3 py-1.5 font-medium border transition-colors flex items-center gap-1.5 ${
                mustHaveLounge
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
              }`}
            >
              <Plane className="h-3.5 w-3.5" />
              Must Have Airport Lounge
            </button>

            <button
              type="button"
              onClick={() => setMustHaveZeroForex(!mustHaveZeroForex)}
              className={`rounded-lg px-3 py-1.5 font-medium border transition-colors flex items-center gap-1.5 ${
                mustHaveZeroForex
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Must Have 0% Zero Forex
            </button>

            <button
              type="button"
              onClick={() => setMustHaveLtf(!mustHaveLtf)}
              className={`rounded-lg px-3 py-1.5 font-medium border transition-colors flex items-center gap-1.5 ${
                mustHaveLtf
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Lifetime Free Only
            </button>

            <button
              type="button"
              onClick={() => setExcludeHighFee(!excludeHighFee)}
              className={`rounded-lg px-3 py-1.5 font-medium border transition-colors flex items-center gap-1.5 ${
                excludeHighFee
                  ? "bg-rose-700 text-white border-rose-700"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
              }`}
            >
              <XCircle className="h-3.5 w-3.5" />
              Exclude Fees &gt; ₹1,000
            </button>
          </div>
        </div>
      </div>

      {/* Trade-off Analysis Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Alternative Matches for {baselineCard.officialName || baselineCard.shortName}
            </h3>
            <p className="text-xs text-slate-500">
              Ranked by utility score and comparative advantage over your baseline card.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {matchedAlternatives.length} Matches Found
          </Badge>
        </div>

        {matchedAlternatives.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
            <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
            <h4 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
              No matching alternatives meet all hard criteria
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              Try disabling one of the must-have requirements above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matchedAlternatives.map(({ card, score, advantages, disadvantages }) => {
              const isLtf = card.feeWaiver?.isLifetimeFree || Number(card.annualFee?.amount) === 0;

              return (
                <div
                  key={card.slug}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                          {card.issuer?.name}
                        </span>
                        <Link
                          href={`/cards/${card.slug}`}
                          className="font-bold text-base text-slate-900 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
                        >
                          {card.officialName || card.shortName}
                        </Link>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                          {score}% Match
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isLtf ? "Lifetime Free" : `${formatMoney(money(card.annualFee?.amount || 0))}/yr`}
                        </span>
                      </div>
                    </div>

                    {/* Where Alternative Beats Baseline */}
                    {advantages.length > 0 && (
                      <div className="rounded-lg bg-emerald-50/60 p-3 mb-3 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900">
                        <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                          ✓ Where this beats {baselineCard.shortName || "baseline"}:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                          {advantages.map((adv, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{adv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Where Baseline Beats Alternative */}
                    {disadvantages.length > 0 && (
                      <div className="rounded-lg bg-slate-50 p-3 mb-3 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          ✕ Trade-offs vs {baselineCard.shortName || "baseline"}:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                          {disadvantages.map((dis, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                              <span>{dis}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectForMatrix(card.slug)}
                      className="text-xs h-8 border-slate-300 dark:border-slate-700"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add to Matrix
                    </Button>

                    <Link
                      href={`/cards/${card.slug}`}
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "text-xs h-8 bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-950",
                      )}
                    >
                      View Details <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
