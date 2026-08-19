"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Layers,
  Sparkles,
  SlidersHorizontal,
  Plus,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCompare, MAX_COMPARE_CARDS } from "@/lib/context/compare-context";
import { CompareMatrix } from "@/components/compare/compare-matrix";
import { CompareFinder } from "@/components/compare/compare-finder";

interface CompareContainerProps {
  initialCards: any[];
  availableCards: any[];
}

export function CompareContainer({
  initialCards,
  availableCards,
}: CompareContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { selectedCardSlugs, setCards, addCard, removeCard } = useCompare();

  const [mode, setMode] = useState<"matrix" | "finder">("matrix");
  const [activeCards, setActiveCards] = useState<any[]>(initialCards);

  // Sync context with initial cards on mount
  useEffect(() => {
    if (initialCards.length > 0) {
      setCards(initialCards.map((c) => c.slug));
    }
  }, []);

  // Update activeCards when URL params or available cards change
  const handleRemoveCard = (slug: string) => {
    if (activeCards.length <= 2) {
      alert("At least 2 cards are required for side-by-side comparison.");
      return;
    }
    const nextCards = activeCards.filter((c) => c.slug !== slug);
    setActiveCards(nextCards);
    removeCard(slug);

    const nextSlugs = nextCards.map((c) => c.slug).join(",");
    router.replace(`${pathname}?cards=${nextSlugs}`, { scroll: false });
  };

  const handleAddCard = (slug: string) => {
    if (activeCards.length >= MAX_COMPARE_CARDS) {
      alert(`Comparison is capped at ${MAX_COMPARE_CARDS} cards.`);
      return;
    }
    if (activeCards.some((c) => c.slug === slug)) return;

    const newCard = availableCards.find((c) => c.slug === slug);
    if (!newCard) return;

    const nextCards = [...activeCards, newCard];
    setActiveCards(nextCards);
    addCard(slug);

    const nextSlugs = nextCards.map((c) => c.slug).join(",");
    router.replace(`${pathname}?cards=${nextSlugs}`, { scroll: false });
  };

  const handleSelectFromFinder = (slug: string) => {
    handleAddCard(slug);
    setMode("matrix");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>CardIntel Provenance Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Credit Card Comparison Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare 2 to 5 cards side-by-side across 30+ verified parameters with zero marketing bias.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setMode("matrix")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              mode === "matrix"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Side-by-Side Matrix
          </button>

          <button
            type="button"
            onClick={() => setMode("finder")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              mode === "finder"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            Alternative Finder (Mode 2)
          </button>
        </div>
      </div>

      {/* Tab 1: Matrix View */}
      {mode === "matrix" && (
        <CompareMatrix
          cards={activeCards}
          onRemoveCard={handleRemoveCard}
          onAddCard={handleAddCard}
          availableCards={availableCards}
        />
      )}

      {/* Tab 2: Alternative Finder */}
      {mode === "finder" && (
        <CompareFinder
          availableCards={availableCards}
          onSelectForMatrix={handleSelectFromFinder}
        />
      )}
    </div>
  );
}
