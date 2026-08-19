"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  X,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Share2,
  Check,
  Eye,
  EyeOff,
  Building,
  CreditCard,
  Percent,
  Plane,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  comparisonSections,
  type ComparisonFieldDefinition,
  type ComparisonValue,
  type FieldState,
} from "@/lib/compare/definitions";
import { formatMoney, money } from "@/lib/utils/money";
import { demoCards } from "@/data/demo/cards";
import { cn } from "@/lib/utils";

interface CompareMatrixProps {
  cards: any[];
  onRemoveCard: (slug: string) => void;
  onAddCard: (slug: string) => void;
  availableCards?: any[];
}

export function CompareMatrix({
  cards,
  onRemoveCard,
  onAddCard,
  availableCards = demoCards,
}: CompareMatrixProps) {
  const [highlightDifferencesOnly, setHighlightDifferencesOnly] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [addCardSearch, setAddCardSearch] = useState("");
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);

  const canAddMore = cards.length < 5;

  // Filter candidates for "Add Card" slot
  const candidateCards = useMemo(() => {
    const currentSlugs = cards.map((c) => c.slug);
    return availableCards.filter(
      (c) =>
        !currentSlugs.includes(c.slug) &&
        (c.officialName?.toLowerCase().includes(addCardSearch.toLowerCase()) ||
          c.shortName?.toLowerCase().includes(addCardSearch.toLowerCase()) ||
          c.issuer?.name?.toLowerCase().includes(addCardSearch.toLowerCase())),
    );
  }, [cards, availableCards, addCardSearch]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  // Helper to check if a row differs across selected cards
  const isRowDifferent = (field: ComparisonFieldDefinition) => {
    if (cards.length <= 1) return false;
    const values = cards.map((c) => field.extract(c));
    const first = values[0];

    for (let i = 1; i < values.length; i++) {
      const current = values[i];
      if (field.isEqual) {
        if (!field.isEqual(first, current)) return true;
      } else {
        if (
          first.displayValue !== current.displayValue ||
          first.fieldState !== current.fieldState
        ) {
          return true;
        }
      }
    }
    return false;
  };

  // Helper to find the best card index for numeric metrics
  const getBestCardIndex = (field: ComparisonFieldDefinition) => {
    if (cards.length <= 1 || field.direction === "QUALITATIVE" || field.direction === "NOT_COMPARABLE") {
      return -1;
    }

    const values = cards.map((c) => field.extract(c));
    const validNumeric = values
      .map((v, idx) => ({ num: v.numericValue, idx, state: v.fieldState }))
      .filter((item) => item.num !== undefined && item.num !== null && !isNaN(item.num) && item.state === "KNOWN");

    if (validNumeric.length === 0) return -1;

    if (field.direction === "LOWER_IS_BETTER") {
      validNumeric.sort((a, b) => a.num! - b.num!);
      // If all are equal, don't single one out
      if (validNumeric.length > 1 && validNumeric[0].num === validNumeric[1].num) {
        return -1;
      }
      return validNumeric[0].idx;
    }

    if (field.direction === "HIGHER_IS_BETTER") {
      validNumeric.sort((a, b) => b.num! - a.num!);
      if (validNumeric.length > 1 && validNumeric[0].num === validNumeric[1].num) {
        return -1;
      }
      return validNumeric[0].idx;
    }

    return -1;
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar: Highlight Diff, Share URL, Card Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Comparing {cards.length} Cards
            </span>
            <Badge variant="outline" className="text-[10px] text-slate-500">
              Max 5 Cards
            </Badge>
          </div>

          <label className="flex items-center gap-2 cursor-pointer border-l border-slate-200 pl-3 dark:border-slate-800 text-xs">
            <input
              type="checkbox"
              checked={highlightDifferencesOnly}
              onChange={(e) => setHighlightDifferencesOnly(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Highlight Differences Only
            </span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="h-8 text-xs font-medium border-slate-300 dark:border-slate-700"
          >
            {copiedUrl ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                Copied Link!
              </>
            ) : (
              <>
                <Share2 className="mr-1.5 h-3.5 w-3.5" />
                Share Matrix Link
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Responsive Table Container with Horizontal Scroll & Sticky First Column */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full border-collapse text-left text-xs min-w-[700px]">
          {/* Sticky Header Row: Card Tiles */}
          <thead className="sticky top-16 z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200 dark:bg-slate-900/95 dark:border-slate-800">
            <tr>
              <th className="sticky left-0 z-40 w-56 bg-slate-50/95 p-4 font-bold text-slate-900 dark:bg-slate-900/95 dark:text-white border-r border-slate-200 dark:border-slate-800">
                <span className="text-xs uppercase tracking-wider text-slate-500">
                  Feature / Parameter
                </span>
              </th>

              {cards.map((card, idx) => {
                const officialName = card.officialName || card.shortName;
                const issuerName = card.issuer?.name || "Bank";
                const joiningFee = card.joiningFee?.amount ?? "0.00";
                const annualFee = card.annualFee?.amount ?? "0.00";
                const isLtf = card.feeWaiver?.isLifetimeFree || (Number(annualFee) === 0 && Number(joiningFee) === 0);

                return (
                  <th
                    key={card.slug || idx}
                    className="w-64 p-4 align-top font-normal border-r border-slate-200/80 last:border-r-0 dark:border-slate-800/80"
                  >
                    <div className="flex flex-col justify-between h-full space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                            {issuerName}
                          </span>
                          {cards.length > 2 && (
                            <button
                              type="button"
                              onClick={() => onRemoveCard(card.slug)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 rounded"
                              title="Remove card from comparison"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        <Link
                          href={`/cards/${card.slug}`}
                          className="font-bold text-slate-900 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400 line-clamp-2 leading-snug"
                        >
                          {officialName}
                        </Link>
                      </div>

                      {/* Quick Fee Badge */}
                      <div className="rounded-md bg-white p-2 border border-slate-200/80 dark:bg-slate-800/60 dark:border-slate-700 text-[11px]">
                        <span className="text-slate-500 block">Annual Fee:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {isLtf ? "Lifetime Free" : formatMoney(money(annualFee))}
                        </span>
                      </div>

                      {/* Official Apply / Detail Buttons */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <Link
                          href={`/cards/${card.slug}`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "xs" }),
                            "w-full text-[11px] font-medium border-slate-300 dark:border-slate-700",
                          )}
                        >
                          Details
                        </Link>
                        {card.officialProductUrl && (
                          <a
                            href={card.officialProductUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              buttonVariants({ size: "xs" }),
                              "w-full text-[11px] bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-950 font-medium inline-flex items-center justify-center",
                            )}
                          >
                            Apply <ExternalLink className="ml-1 h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </th>
                );
              })}

              {/* Slot to Add Next Card */}
              {canAddMore && (
                <th className="w-52 p-4 align-middle text-center bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddDropdownOpen(!addDropdownOpen)}
                      className="h-9 w-full border-dashed border-slate-300 text-xs font-semibold text-slate-600 hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-300"
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Add Card ({cards.length}/5)
                    </Button>

                    {addDropdownOpen && (
                      <div className="absolute right-0 top-11 z-50 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950 text-left animate-in fade-in-50">
                        <input
                          type="text"
                          placeholder="Search card name or bank..."
                          value={addCardSearch}
                          onChange={(e) => setAddCardSearch(e.target.value)}
                          className="mb-2 w-full rounded-md border border-slate-200 px-2.5 py-1 text-xs dark:border-slate-800 dark:bg-slate-900"
                          autoFocus
                        />
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {candidateCards.map((c) => (
                            <button
                              type="button"
                              key={c.slug}
                              onClick={() => {
                                onAddCard(c.slug);
                                setAddDropdownOpen(false);
                                setAddCardSearch("");
                              }}
                              className="w-full text-left p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-xs flex flex-col"
                            >
                              <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                                {c.officialName || c.shortName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {c.issuer?.name} • {c.network?.name}
                              </span>
                            </button>
                          ))}
                          {candidateCards.length === 0 && (
                            <div className="p-2 text-center text-xs text-slate-400">
                              No cards found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </th>
              )}
            </tr>
          </thead>

          {/* Sections Body */}
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {comparisonSections.map((section) => {
              // Filter fields if "Highlight Differences Only" is active
              const visibleFields = highlightDifferencesOnly
                ? section.fields.filter((f) => isRowDifferent(f))
                : section.fields;

              if (visibleFields.length === 0) return null;

              return (
                <tr key={section.id} className="contents">
                  {/* Section Title Header Row */}
                  <tr className="bg-slate-100/70 dark:bg-slate-800/50">
                    <td
                      colSpan={cards.length + 1 + (canAddMore ? 1 : 0)}
                      className="sticky left-0 py-2.5 px-4 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider"
                    >
                      <div className="flex items-center gap-2">
                        <span>{section.title}</span>
                        <span className="text-[10px] font-normal text-slate-500 normal-case">
                          — {section.description}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Individual Field Rows */}
                  {visibleFields.map((field) => {
                    const isDiff = isRowDifferent(field);
                    const bestIndex = getBestCardIndex(field);

                    return (
                      <tr
                        key={field.id}
                        className={`transition-colors ${
                          isDiff
                            ? "bg-amber-50/20 hover:bg-amber-50/40 dark:bg-amber-950/10 dark:hover:bg-amber-950/20"
                            : "hover:bg-slate-50/60 dark:hover:bg-slate-900/40"
                        }`}
                      >
                        {/* Sticky Left Column: Field Label */}
                        <td className="sticky left-0 z-20 w-56 bg-white dark:bg-slate-900 p-3.5 font-medium text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between gap-1">
                            <span>{field.label}</span>
                            {isDiff && (
                              <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                Diff
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Card Data Cells */}
                        {cards.map((card, cardIdx) => {
                          const val: ComparisonValue = field.extract(card);
                          const isBest = cardIdx === bestIndex;

                          return (
                            <td
                              key={card.slug || cardIdx}
                              className={`p-3.5 align-top border-r border-slate-200/60 last:border-r-0 dark:border-slate-800/60 ${
                                isBest
                                  ? "bg-emerald-50/40 dark:bg-emerald-950/20"
                                  : ""
                              }`}
                            >
                              <div className="space-y-1">
                                {/* Value & Claim State Badge */}
                                <div className="flex items-start justify-between gap-1.5">
                                  <span
                                    className={`font-semibold ${
                                      val.fieldState === "NOT_DISCLOSED"
                                        ? "text-slate-400 font-normal italic"
                                        : val.fieldState === "CONFLICTING"
                                        ? "text-amber-700 dark:text-amber-400 font-bold"
                                        : "text-slate-900 dark:text-white"
                                    }`}
                                  >
                                    {val.displayValue}
                                  </span>

                                  {isBest && (
                                    <Badge className="bg-emerald-600 text-white text-[9px] px-1 py-0 shrink-0 font-bold">
                                      Best
                                    </Badge>
                                  )}
                                </div>

                                {/* State Alert Badges */}
                                {val.fieldState === "CONFLICTING" && (
                                  <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                                    <AlertTriangle className="h-3 w-3 shrink-0" />
                                    <span>Conflicting sources — review evidence</span>
                                  </div>
                                )}

                                {val.fieldState === "CONDITIONAL" && (
                                  <span className="inline-block rounded bg-amber-50 border border-amber-200 px-1 py-0 text-[10px] text-amber-800 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-300">
                                    Conditional
                                  </span>
                                )}

                                {val.notes && (
                                  <p className="text-[11px] text-slate-500 leading-tight">
                                    {val.notes}
                                  </p>
                                )}

                                {val.sourceUrl && (
                                  <a
                                    href={val.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-[10px] text-emerald-600 hover:underline pt-0.5"
                                  >
                                    View Source <ExternalLink className="ml-0.5 h-2.5 w-2.5" />
                                  </a>
                                )}
                              </div>
                            </td>
                          );
                        })}

                        {canAddMore && <td className="bg-slate-50/20 dark:bg-slate-900/10" />}
                      </tr>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
