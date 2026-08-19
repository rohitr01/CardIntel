"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowUpDown,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CardCard } from "@/components/cards/card-card";
import { CardFilterSidebar, type FilterState } from "@/components/cards/card-filter-sidebar";

interface CardDiscoveryProps {
  initialCards: any[];
  initialTotal: number;
  isDemoData: boolean;
}

export function CardDiscovery({
  initialCards,
  initialTotal,
  isDemoData,
}: CardDiscoveryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read initial filter state from URL params
  const [filters, setFilters] = useState<FilterState>(() => ({
    q: searchParams.get("q") || undefined,
    issuers: searchParams.getAll("issuers").flatMap((i) => i.split(",")).filter(Boolean),
    coBrands: searchParams.getAll("coBrands").flatMap((c) => c.split(",")).filter(Boolean),
    networkTypes: searchParams.getAll("networkTypes").flatMap((n) => n.split(",")).filter(Boolean),
    categories: searchParams.getAll("categories").flatMap((c) => c.split(",")).filter(Boolean),
    statuses: searchParams.getAll("statuses").flatMap((s) => s.split(",")).filter(Boolean),
    employmentTypes: searchParams.getAll("employmentTypes").flatMap((e) => e.split(",")).filter(Boolean),
    minMonthlyIncome: searchParams.get("minMonthlyIncome") || undefined,
    minCibilScore: searchParams.get("minCibilScore") ? Number(searchParams.get("minCibilScore")) : undefined,
    includeUndisclosedCibil: searchParams.get("includeUndisclosedCibil") !== "false",
    includeUndisclosedIncome: searchParams.get("includeUndisclosedIncome") !== "false",
    isLifetimeFree: searchParams.get("isLifetimeFree") === "true",
    hasFeeWaiver: searchParams.get("hasFeeWaiver") === "true",
    maxAnnualFee: searchParams.get("maxAnnualFee") || undefined,
    isZeroForex: searchParams.get("isZeroForex") === "true",
    hasUPI: searchParams.get("hasUPI") === "true",
    hasLounge: searchParams.get("hasLounge") === "true",
    hasDomesticLounge: searchParams.get("hasDomesticLounge") === "true",
    hasIntlLounge: searchParams.get("hasIntlLounge") === "true",
    hasPriorityPass: searchParams.get("hasPriorityPass") === "true",
    hasFuelBenefit: searchParams.get("hasFuelBenefit") === "true",
    isFDBacked: searchParams.get("isFDBacked") === "true",
    isMetal: searchParams.get("isMetal") === "true",
    isBusiness: searchParams.get("isBusiness") === "true",
    mustHave: searchParams.getAll("mustHave").flatMap((m) => m.split(",")).filter(Boolean),
    exclude: searchParams.getAll("exclude").flatMap((e) => e.split(",")).filter(Boolean),
    sort: searchParams.get("sort") || "relevance",
  }));

  const [cards, setCards] = useState(initialCards);
  const [total, setTotal] = useState(initialTotal);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState(filters.q || "");

  // Sync state changes with URL query parameters and fetch updated data
  const updateUrlAndFetch = (newFilters: FilterState) => {
    const params = new URLSearchParams();

    if (newFilters.q) params.set("q", newFilters.q);
    if (newFilters.issuers.length > 0) params.set("issuers", newFilters.issuers.join(","));
    if (newFilters.coBrands.length > 0) params.set("coBrands", newFilters.coBrands.join(","));
    if (newFilters.networkTypes.length > 0) params.set("networkTypes", newFilters.networkTypes.join(","));
    if (newFilters.categories.length > 0) params.set("categories", newFilters.categories.join(","));
    if (newFilters.statuses.length > 0) params.set("statuses", newFilters.statuses.join(","));
    if (newFilters.employmentTypes.length > 0) params.set("employmentTypes", newFilters.employmentTypes.join(","));
    if (newFilters.minMonthlyIncome) params.set("minMonthlyIncome", newFilters.minMonthlyIncome);
    if (newFilters.minCibilScore) params.set("minCibilScore", String(newFilters.minCibilScore));
    if (!newFilters.includeUndisclosedCibil) params.set("includeUndisclosedCibil", "false");
    if (!newFilters.includeUndisclosedIncome) params.set("includeUndisclosedIncome", "false");
    if (newFilters.isLifetimeFree) params.set("isLifetimeFree", "true");
    if (newFilters.hasFeeWaiver) params.set("hasFeeWaiver", "true");
    if (newFilters.maxAnnualFee) params.set("maxAnnualFee", newFilters.maxAnnualFee);
    if (newFilters.isZeroForex) params.set("isZeroForex", "true");
    if (newFilters.hasUPI) params.set("hasUPI", "true");
    if (newFilters.hasLounge) params.set("hasLounge", "true");
    if (newFilters.hasIntlLounge) params.set("hasIntlLounge", "true");
    if (newFilters.hasFuelBenefit) params.set("hasFuelBenefit", "true");
    if (newFilters.isFDBacked) params.set("isFDBacked", "true");
    if (newFilters.isMetal) params.set("isMetal", "true");
    if (newFilters.mustHave.length > 0) params.set("mustHave", newFilters.mustHave.join(","));
    if (newFilters.exclude.length > 0) params.set("exclude", newFilters.exclude.join(","));
    if (newFilters.sort !== "relevance") params.set("sort", newFilters.sort);

    const queryString = params.toString();
    const targetUrl = `${pathname}${queryString ? `?${queryString}` : ""}`;

    startTransition(() => {
      router.replace(targetUrl, { scroll: false });
    });

    // Fetch filtered results from API
    fetch(`/api/v1/cards?${queryString}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setCards(json.data);
          setTotal(json.total);
        }
      })
      .catch((err) => console.error("Error fetching filtered cards:", err));
  };

  const handleFilterChange = (nextFilters: FilterState) => {
    setFilters(nextFilters);
    updateUrlAndFetch(nextFilters);
  };

  const handleResetFilters = () => {
    const defaultFilters: FilterState = {
      issuers: [],
      coBrands: [],
      networkTypes: [],
      categories: [],
      statuses: [],
      employmentTypes: [],
      includeUndisclosedCibil: true,
      includeUndisclosedIncome: true,
      mustHave: [],
      exclude: [],
      sort: "relevance",
    };
    setSearchInputValue("");
    setFilters(defaultFilters);
    updateUrlAndFetch(defaultFilters);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextFilters = { ...filters, q: searchInputValue.trim() || undefined };
    setFilters(nextFilters);
    updateUrlAndFetch(nextFilters);
  };

  // Active filter pills list
  const activePills: Array<{ label: string; onRemove: () => void }> = [];

  if (filters.q) {
    activePills.push({
      label: `"${filters.q}"`,
      onRemove: () => {
        setSearchInputValue("");
        handleFilterChange({ ...filters, q: undefined });
      },
    });
  }

  filters.issuers.forEach((iss) => {
    activePills.push({
      label: `Bank: ${iss.replace(/-/g, " ")}`,
      onRemove: () =>
        handleFilterChange({
          ...filters,
          issuers: filters.issuers.filter((i) => i !== iss),
        }),
    });
  });

  if (filters.isLifetimeFree) {
    activePills.push({
      label: "Lifetime Free",
      onRemove: () => handleFilterChange({ ...filters, isLifetimeFree: undefined }),
    });
  }

  if (filters.hasUPI) {
    activePills.push({
      label: "RuPay UPI",
      onRemove: () => handleFilterChange({ ...filters, hasUPI: undefined }),
    });
  }

  if (filters.hasLounge) {
    activePills.push({
      label: "Airport Lounge",
      onRemove: () => handleFilterChange({ ...filters, hasLounge: undefined }),
    });
  }

  if (filters.isZeroForex) {
    activePills.push({
      label: "0% Zero Forex",
      onRemove: () => handleFilterChange({ ...filters, isZeroForex: undefined }),
    });
  }

  if (filters.minMonthlyIncome) {
    activePills.push({
      label: `Income ≥ ₹${Number(filters.minMonthlyIncome).toLocaleString("en-IN")}/mo`,
      onRemove: () => handleFilterChange({ ...filters, minMonthlyIncome: undefined }),
    });
  }

  if (filters.minCibilScore) {
    activePills.push({
      label: `CIBIL ≥ ${filters.minCibilScore}`,
      onRemove: () => handleFilterChange({ ...filters, minCibilScore: undefined }),
    });
  }

  const quickFilters = [
    {
      label: "Lifetime free",
      active: !!filters.isLifetimeFree,
      onClick: () => handleFilterChange({ ...filters, isLifetimeFree: !filters.isLifetimeFree || undefined }),
    },
    {
      label: "RuPay UPI",
      active: !!filters.hasUPI,
      onClick: () => handleFilterChange({ ...filters, hasUPI: !filters.hasUPI || undefined }),
    },
    {
      label: "Lounge access",
      active: !!filters.hasLounge,
      onClick: () => handleFilterChange({ ...filters, hasLounge: !filters.hasLounge || undefined }),
    },
    {
      label: "Zero forex",
      active: !!filters.isZeroForex,
      onClick: () => handleFilterChange({ ...filters, isZeroForex: !filters.isZeroForex || undefined }),
    },
    {
      label: "Fuel waiver",
      active: !!filters.hasFuelBenefit,
      onClick: () => handleFilterChange({ ...filters, hasFuelBenefit: !filters.hasFuelBenefit || undefined }),
    },
  ];

  return (
    <div className="soft-band min-h-screen">
      <div className="consumer-shell py-7 sm:py-9">
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Verified catalogue
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Credit cards in India
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Compare fees, rewards, eligibility and benefits with CardIntel's official-source provenance layer.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-[28rem]">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search by card name, bank, or perk..."
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              className="h-11 rounded-lg border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus-visible:bg-white dark:border-slate-800 dark:bg-slate-950"
            />
          </form>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={filter.onClick}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                filter.active
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {total} {total === 1 ? "card" : "cards"} matching your criteria
            </span>
            {isPending && (
              <span className="text-xs text-slate-400 animate-pulse">
                Updating...
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Sort:</span>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value })}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="relevance">Relevance / Authority</option>
                <option value="fee_low">Lowest Annual Fee</option>
                <option value="fee_high">Highest Fee (Premium)</option>
                <option value="name">Card Name (A-Z)</option>
              </select>
            </div>

            <div className="lg:hidden">
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger
                  render={
                    <Button variant="outline" size="sm" className="h-9 text-xs font-bold">
                      <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
                      Filters {activePills.length > 0 && `(${activePills.length})`}
                    </Button>
                  }
                />
                <SheetContent side="left" className="w-[85vw] max-w-md overflow-y-auto p-6">
                  <SheetHeader className="mb-4">
                    <SheetTitle className="text-base font-bold">Filter Credit Cards</SheetTitle>
                  </SheetHeader>
                  <CardFilterSidebar
                    filters={filters}
                    onFilterChange={(f) => {
                      handleFilterChange(f);
                    }}
                    onReset={handleResetFilters}
                    totalResults={total}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {activePills.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Active filters:</span>
            {activePills.map((pill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
              >
                {pill.label}
                <button
                  type="button"
                  onClick={pill.onRemove}
                  className="hover:text-emerald-950 dark:hover:text-emerald-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-20 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <CardFilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              totalResults={total}
            />
          </div>
        </div>

        <div>
          {isDemoData && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Demo Mode Active:</strong> Showing structured UI test cards. Individual claims are undergoing source verification.
                </span>
              </div>
            </div>
          )}

          {cards.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
              <Layers className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
                No cards match your filter criteria
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your income or annual fee filters, or clearing some of the specific perks.
              </p>
              <div className="mt-5">
                <Button onClick={handleResetFilters} variant="outline" size="sm" className="text-xs">
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Reset All Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {cards.map((card: any) => (
                <CardCard key={card.id || card.slug} card={card} />
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
