"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, X, ArrowRight, Sparkles, CheckCircle2, RotateCcw } from "lucide-react";
import { useCompare, MAX_COMPARE_CARDS } from "@/lib/context/compare-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CompareTray() {
  const pathname = usePathname();
  const { selectedCardSlugs, removeCard, clearCompare } = useCompare();

  // If on /compare page itself or no cards selected, hide the floating tray
  if (pathname === "/compare" || selectedCardSlugs.length === 0) {
    return null;
  }

  const compareUrl = `/compare?cards=${selectedCardSlugs.join(",")}`;
  const canCompare = selectedCardSlugs.length >= 2;

  return (
    <aside
      aria-label="Card comparison selection bar"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="rounded-2xl border border-slate-300/80 bg-slate-900/95 p-3.5 sm:p-4 text-white shadow-2xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Count & Cards Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 mr-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">
                <Layers className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold tracking-tight">
                Compare Tray ({selectedCardSlugs.length}/{MAX_COMPARE_CARDS})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {selectedCardSlugs.map((slug) => {
                const formattedName = slug
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ");
                return (
                  <span
                    key={slug}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs text-slate-200"
                  >
                    <span className="max-w-[130px] truncate">{formattedName}</span>
                    <button
                      type="button"
                      onClick={() => removeCard(slug)}
                      className="text-slate-400 hover:text-white transition-colors"
                      title="Remove card"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t border-slate-800 pt-2 sm:border-t-0 sm:pt-0">
            <button
              type="button"
              onClick={clearCompare}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Clear
            </button>

            {canCompare ? (
              <Link
                href={compareUrl}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md inline-flex items-center gap-1.5",
                )}
              >
                Compare Now ({selectedCardSlugs.length}) <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="text-[11px] text-amber-400 font-medium px-2 py-1">
                Select 1 more card to compare
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
