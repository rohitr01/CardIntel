"use client";

import { useState } from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
  HelpCircle,
  Sparkles,
  Shield,
  Zap,
  Plane,
  Building,
  CreditCard,
  Percent,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface FilterState {
  q?: string;
  issuers: string[];
  coBrands: string[];
  networkTypes: string[];
  categories: string[];
  statuses: string[];
  employmentTypes: string[];
  minMonthlyIncome?: string;
  minCibilScore?: number;
  includeUndisclosedCibil: boolean;
  includeUndisclosedIncome: boolean;
  isLifetimeFree?: boolean;
  hasFeeWaiver?: boolean;
  maxAnnualFee?: string;
  isZeroForex?: boolean;
  hasUPI?: boolean;
  hasLounge?: boolean;
  hasDomesticLounge?: boolean;
  hasIntlLounge?: boolean;
  hasPriorityPass?: boolean;
  hasFuelBenefit?: boolean;
  hasDiningBenefit?: boolean;
  hasShoppingBenefit?: boolean;
  hasRailwayBenefit?: boolean;
  isFDBacked?: boolean;
  isMetal?: boolean;
  isBusiness?: boolean;
  mustHave: string[];
  exclude: string[];
  potentiallyEligibleOnly?: boolean;
  sort: string;
}

interface CardFilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
}

export function CardFilterSidebar({
  filters,
  onFilterChange,
  onReset,
  totalResults,
}: CardFilterSidebarProps) {
  // Collapsible section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    eligibility: true,
    banks: true,
    fees: true,
    useCases: true,
    rewards: true,
    networks: false,
    cardTypes: false,
    status: false,
    mustHave: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const issuersList = [
    { slug: "hdfc-bank", name: "HDFC Bank", count: "32" },
    { slug: "sbi-card", name: "SBI Card", count: "28" },
    { slug: "icici-bank", name: "ICICI Bank", count: "24" },
    { slug: "axis-bank", name: "Axis Bank", count: "26" },
    { slug: "kotak-mahindra-bank", name: "Kotak Mahindra Bank", count: "14" },
    { slug: "idfc-first-bank", name: "IDFC FIRST Bank", count: "12" },
    { slug: "indusind-bank", name: "IndusInd Bank", count: "11" },
    { slug: "federal-bank", name: "Federal Bank", count: "8" },
    { slug: "au-small-finance-bank", name: "AU Small Finance Bank", count: "9" },
    { slug: "rbl-bank", name: "RBL Bank", count: "15" },
    { slug: "american-express", name: "American Express", count: "7" },
    { slug: "standard-chartered", name: "Standard Chartered", count: "8" },
    { slug: "onecard", name: "OneCard (FPL)", count: "2" },
  ];

  const coBrandsList = [
    { slug: "amazon-pay", name: "Amazon Pay" },
    { slug: "tata-neu", name: "Tata Neu / Digital" },
    { slug: "airtel", name: "Airtel" },
    { slug: "swiggy", name: "Swiggy" },
    { slug: "zomato", name: "Zomato" },
    { slug: "irctc", name: "IRCTC / Railway" },
    { slug: "flipkart", name: "Flipkart" },
  ];

  const handleIssuerToggle = (slug: string) => {
    const next = filters.issuers.includes(slug)
      ? filters.issuers.filter((s) => s !== slug)
      : [...filters.issuers, slug];
    onFilterChange({ ...filters, issuers: next });
  };

  const handleCoBrandToggle = (slug: string) => {
    const next = filters.coBrands.includes(slug)
      ? filters.coBrands.filter((s) => s !== slug)
      : [...filters.coBrands, slug];
    onFilterChange({ ...filters, coBrands: next });
  };

  const handleNetworkToggle = (net: string) => {
    const next = filters.networkTypes.includes(net)
      ? filters.networkTypes.filter((n) => n !== net)
      : [...filters.networkTypes, net];
    onFilterChange({ ...filters, networkTypes: next });
  };

  const handleMustHaveToggle = (key: string) => {
    const next = filters.mustHave.includes(key)
      ? filters.mustHave.filter((k) => k !== key)
      : [...filters.mustHave, key];
    onFilterChange({ ...filters, mustHave: next });
  };

  const handleExcludeToggle = (key: string) => {
    const next = filters.exclude.includes(key)
      ? filters.exclude.filter((k) => k !== key)
      : [...filters.exclude, key];
    onFilterChange({ ...filters, exclude: next });
  };

  return (
    <aside className="w-full space-y-6 text-sm">
      {/* Top Filter Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-bold text-slate-900 dark:text-white">Filters</span>
          <Badge variant="secondary" className="text-[11px] px-1.5 py-0">
            {totalResults}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-7 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white px-2"
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          Reset
        </Button>
      </div>

      {/* 1. Quick Profile / Eligibility */}
      <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/40 p-3.5 dark:border-emerald-950 dark:bg-emerald-950/20">
        <div
          onClick={() => toggleSection("eligibility")}
          className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider"
        >
          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Check Cards For Me</span>
          </div>
          {openSections.eligibility ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>

        {openSections.eligibility && (
          <div className="mt-3 space-y-3.5 pt-2 border-t border-emerald-200/50 dark:border-emerald-900/50 text-xs">
            {/* Monthly Income */}
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                My Net Monthly Salary / Income
              </label>
              <select
                value={filters.minMonthlyIncome || ""}
                onChange={(e) =>
                  onFilterChange({ ...filters, minMonthlyIncome: e.target.value || undefined })
                }
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="">Any Income Level</option>
                <option value="25000">₹25,000+ / month (₹3L/yr)</option>
                <option value="35000">₹35,000+ / month (₹4.2L/yr)</option>
                <option value="50000">₹50,000+ / month (₹6L/yr)</option>
                <option value="100000">₹1,00,000+ / month (₹12L/yr)</option>
                <option value="250000">₹2,50,000+ / month (₹30L/yr)</option>
              </select>
            </div>

            {/* CIBIL Score */}
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                My CIBIL Score
              </label>
              <select
                value={filters.minCibilScore || ""}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    minCibilScore: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="">Any Credit Score</option>
                <option value="700">700+ (Good)</option>
                <option value="720">720+ (Standard)</option>
                <option value="750">750+ (Excellent)</option>
                <option value="780">780+ (Super-Prime)</option>
              </select>
            </div>

            {/* Undisclosed CIBIL Toggle */}
            <label className="flex items-start gap-2 cursor-pointer pt-0.5">
              <input
                type="checkbox"
                checked={filters.includeUndisclosedCibil}
                onChange={(e) =>
                  onFilterChange({ ...filters, includeUndisclosedCibil: e.target.checked })
                }
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                Include cards where issuer has not publicly disclosed a minimum score
              </span>
            </label>

            {/* Employment Type */}
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Employment Type
              </label>
              <div className="flex flex-wrap gap-1">
                {["SALARIED", "SELF_EMPLOYED", "STUDENT"].map((emp) => {
                  const isSelected = filters.employmentTypes.includes(emp);
                  const label =
                    emp === "SALARIED" ? "Salaried" : emp === "SELF_EMPLOYED" ? "Self-Employed" : "Student";
                  return (
                    <button
                      type="button"
                      key={emp}
                      onClick={() => {
                        const next = isSelected
                          ? filters.employmentTypes.filter((e) => e !== emp)
                          : [...filters.employmentTypes, emp];
                        onFilterChange({ ...filters, employmentTypes: next });
                      }}
                      className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                        isSelected
                          ? "bg-emerald-700 text-white dark:bg-emerald-600"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Banks & Issuers */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <div
          onClick={() => toggleSection("banks")}
          className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2.5"
        >
          <div className="flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-slate-500" />
            <span>Bank / Issuer ({filters.issuers.length || "All"})</span>
          </div>
          {openSections.banks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>

        {openSections.banks && (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {issuersList.map((issuer) => {
              const checked = filters.issuers.includes(issuer.slug);
              return (
                <label
                  key={issuer.slug}
                  className="flex items-center justify-between text-xs cursor-pointer py-1 px-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleIssuerToggle(issuer.slug)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className={checked ? "font-semibold text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}>
                      {issuer.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{issuer.count}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Cost & Fees */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <div
          onClick={() => toggleSection("fees")}
          className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2.5"
        >
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-slate-500" />
            <span>Fees & Waivers</span>
          </div>
          {openSections.fees ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>

        {openSections.fees && (
          <div className="space-y-2.5 pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.isLifetimeFree}
                onChange={(e) =>
                  onFilterChange({ ...filters, isLifetimeFree: e.target.checked || undefined })
                }
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Lifetime Free Only (₹0 Joining & Annual Fee)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.hasFeeWaiver}
                onChange={(e) =>
                  onFilterChange({ ...filters, hasFeeWaiver: e.target.checked || undefined })
                }
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700 dark:text-slate-300">
                Annual Fee Waiver Available (on spend threshold)
              </span>
            </label>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Max Annual Fee</label>
              <select
                value={filters.maxAnnualFee || ""}
                onChange={(e) =>
                  onFilterChange({ ...filters, maxAnnualFee: e.target.value || undefined })
                }
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="">Any Annual Fee</option>
                <option value="500">Up to ₹500/year</option>
                <option value="1000">Up to ₹1,000/year</option>
                <option value="3000">Up to ₹3,000/year</option>
                <option value="5000">Up to ₹5,000/year</option>
                <option value="10000">Up to ₹10,000/year</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 4. Perks & Use Cases */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <div
          onClick={() => toggleSection("useCases")}
          className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2.5"
        >
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-slate-500" />
            <span>Perks & Use Cases</span>
          </div>
          {openSections.useCases ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>

        {openSections.useCases && (
          <div className="space-y-2 pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.hasUPI}
                onChange={(e) => onFilterChange({ ...filters, hasUPI: e.target.checked || undefined })}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                RuPay UPI on QR Scanner Enabled
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.hasLounge}
                onChange={(e) =>
                  onFilterChange({ ...filters, hasLounge: e.target.checked || undefined })
                }
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700 dark:text-slate-300">
                Domestic Airport Lounge Access
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.hasIntlLounge}
                onChange={(e) =>
                  onFilterChange({ ...filters, hasIntlLounge: e.target.checked || undefined })
                }
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700 dark:text-slate-300">
                International Lounge / Priority Pass
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.isZeroForex}
                onChange={(e) =>
                  onFilterChange({ ...filters, isZeroForex: e.target.checked || undefined })
                }
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700 dark:text-slate-300">
                0% Zero Forex Markup
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.hasFuelBenefit}
                onChange={(e) =>
                  onFilterChange({ ...filters, hasFuelBenefit: e.target.checked || undefined })
                }
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700 dark:text-slate-300">
                Fuel Surcharge Waiver
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.isFDBacked}
                onChange={(e) =>
                  onFilterChange({ ...filters, isFDBacked: e.target.checked || undefined })
                }
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700 dark:text-slate-300">
                Secured / FD-Backed Card (No CIBIL needed)
              </span>
            </label>
          </div>
        )}
      </div>

      {/* 5. Co-Brand Partners */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">
          Co-Brand Partner
        </div>
        <div className="flex flex-wrap gap-1.5">
          {coBrandsList.map((cb) => {
            const isSelected = filters.coBrands.includes(cb.slug);
            return (
              <button
                type="button"
                key={cb.slug}
                onClick={() => handleCoBrandToggle(cb.slug)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                  isSelected
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {cb.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Payment Networks */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">
          Network
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["RUPAY", "VISA", "MASTERCARD", "AMEX", "DINERS"].map((net) => {
            const isSelected = filters.networkTypes.includes(net);
            return (
              <button
                type="button"
                key={net}
                onClick={() => handleNetworkToggle(net)}
                className={`rounded px-2 py-1 text-[11px] font-medium uppercase transition-colors ${
                  isSelected
                    ? "bg-emerald-700 text-white dark:bg-emerald-600"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {net}
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Must-Have & Exclude Tiers */}
      <div>
        <div
          onClick={() => toggleSection("mustHave")}
          className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2.5"
        >
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-slate-500" />
            <span>Must-Have / Exclude Rules</span>
          </div>
          {openSections.mustHave ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>

        {openSections.mustHave && (
          <div className="space-y-3 pt-1 text-xs">
            <div>
              <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400 block mb-1">
                Must Have:
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  { key: "upi", label: "UPI" },
                  { key: "lounge", label: "Lounge" },
                  { key: "zero_forex", label: "0% Forex" },
                  { key: "ltf", label: "LTF" },
                ].map((item) => {
                  const isSelected = filters.mustHave.includes(item.key);
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => handleMustHaveToggle(item.key)}
                      className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                        isSelected
                          ? "bg-emerald-800 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      + {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium text-rose-700 dark:text-rose-400 block mb-1">
                Exclude / Negative Filter:
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  { key: "high_annual_fee", label: "Annual Fee > ₹1k" },
                  { key: "high_forex", label: "Forex > 2%" },
                  { key: "no_lounge", label: "No Lounge" },
                  { key: "no_upi", label: "No UPI" },
                ].map((item) => {
                  const isSelected = filters.exclude.includes(item.key);
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => handleExcludeToggle(item.key)}
                      className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                        isSelected
                          ? "bg-rose-700 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      ✕ {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
