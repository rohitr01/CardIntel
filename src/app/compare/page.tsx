import { Suspense } from "react";
import type { Metadata } from "next";
import { getCardsForComparison } from "@/services/card-service";
import { CompareContainer } from "@/components/compare/compare-container";
import { demoCards } from "@/data/demo/cards";

export const metadata: Metadata = {
  title: "Compare Credit Cards Side-by-Side — India's Verified Comparison Matrix",
  description:
    "Compare up to 5 Indian credit cards across 30+ verified parameters: joining fees, annual fee waiver thresholds, GST notes, cashback rates, airport lounge rules, and RuPay UPI support.",
};

interface ComparePageProps {
  searchParams: Promise<{ cards?: string; mode?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const sp = await searchParams;
  const cardSlugsParam = sp.cards;

  // Default to popular comparison set if no cards specified in URL
  const defaultSlugs = ["hdfc-millennia", "sbi-cashback", "icici-amazon-pay"];
  const targetSlugs = cardSlugsParam
    ? cardSlugsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5)
    : defaultSlugs;

  const validSlugs = targetSlugs.length >= 2 ? targetSlugs : defaultSlugs;
  const initialCards = await getCardsForComparison(validSlugs);

  return (
    <div className="bg-slate-50/50 pb-16 pt-8 dark:bg-slate-950 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading comparison matrix...</div>}>
          <CompareContainer
            initialCards={initialCards.length >= 2 ? initialCards : demoCards.slice(0, 3)}
            availableCards={demoCards}
          />
        </Suspense>
      </div>
    </div>
  );
}
