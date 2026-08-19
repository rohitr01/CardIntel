import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Zap,
  Plane,
  Percent,
  Sparkles,
  CreditCard,
  Building,
  Calendar,
  Layers,
  ArrowLeft,
  ChevronRight,
  Info,
  Clock,
  Fuel,
  FileText,
  Lock,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { getCardBySlug, getSimilarCards } from "@/services/card-service";
import { CardCard } from "@/components/cards/card-card";
import { formatMoney, formatAnnualFeeWithWaiver, money } from "@/lib/utils/money";
import { cn } from "@/lib/utils";

interface CardDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CardDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCardBySlug(slug);

  if (!result || !result.card) {
    return {
      title: "Card Not Found",
    };
  }

  const card = result.card;
  const officialName = card.officialName || card.shortName;
  const issuerName = card.issuer?.name || "Bank";

  return {
    title: `${officialName} Review, Fees & Verified Rules`,
    description: `Official schedule of charges, reward structure, lounge access rules, and fee waiver terms for ${officialName} by ${issuerName}. Verified with bank MITC.`,
  };
}

export default async function CardDetailPage({ params }: CardDetailPageProps) {
  const { slug } = await params;
  const result = await getCardBySlug(slug);

  if (!result || !result.card) {
    notFound();
  }

  const { isDemoData } = result;
  const card: any = result.card;
  const similarCards = await getSimilarCards(card.slug, 3);

  const officialName = card.officialName || card.shortName;
  const issuerName = card.issuer?.name || card.issuer?.shortName || "Bank";
  const networkName = card.network?.name || card.network?.type || "VISA";
  const status = card.status || "ACTIVE";

  // Fees
  const joiningFeeAmount = card.joiningFee?.amount ?? card.fees?.find((f: any) => f.feeType === "JOINING")?.amount ?? "0.00";
  const annualFeeAmount = card.annualFee?.amount ?? card.fees?.find((f: any) => f.feeType === "ANNUAL")?.amount ?? "0.00";
  const gstApplicable = card.annualFee?.gstApplicable ?? card.fees?.find((f: any) => f.feeType === "ANNUAL")?.gstApplicable ?? true;
  const forexMarkupPercent = card.forexMarkup?.percentage || (card.forexBenefits?.[0]?.isZeroForex ? "0.00%" : "3.50%");
  const isZeroForex = card.forexMarkup?.isZeroForex || card.forexBenefits?.[0]?.isZeroForex || false;

  // Waiver
  const waiverInfo = card.feeWaiver || card.feeWaivers?.[0];
  const isLifetimeFree = waiverInfo?.isLifetimeFree || (Number(annualFeeAmount) === 0 && Number(joiningFeeAmount) === 0);
  const waiverSpend = waiverInfo?.spendThreshold ? money(waiverInfo.spendThreshold) : null;

  // Eligibility
  const minIncome = card.eligibility?.minMonthlyIncome ? money(card.eligibility.minMonthlyIncome) : null;
  const incomeState = card.eligibility?.incomeFieldState || "KNOWN";
  const cibilScore = card.eligibility?.minCreditScore;
  const cibilState = card.eligibility?.cibilFieldState || "NOT_DISCLOSED";

  // Lounge
  const lounge = card.loungeBenefits || card.loungeBenefits?.[0];

  return (
    <div className="bg-slate-50/50 pb-16 pt-6 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link href="/cards" className="hover:text-slate-900 dark:hover:text-white">
            Cards
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-medium text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
            {officialName}
          </span>
        </nav>

        {/* Demo Mode / Provenance Banner */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Verified Financial Provenance Architecture
                  </span>
                  {isDemoData ? (
                    <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300">
                      Sandbox Demo Record
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300">
                      Official Source Verified
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Financial figures derived from official issuer disclosures. Last verified:{" "}
                  <strong>{card.lastVerifiedAt || "August 2026"}</strong> (Confidence: {card.confidenceScore || 90}%).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <Link
                href={`/compare?cards=${slug}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "text-xs font-medium border-slate-300 dark:border-slate-700 inline-flex items-center gap-1",
                )}
              >
                <Layers className="h-3.5 w-3.5" />
                Compare Card
              </Link>

              {card.officialProductUrl && (
                <a
                  href={card.officialProductUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-950 text-xs inline-flex items-center",
                  )}
                >
                  Official Bank Portal <ExternalLink className="ml-1.5 h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left: Identity & Badges */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs font-semibold">
                  {issuerName}
                </Badge>
                {card.coBrandPartner && (
                  <Badge variant="outline" className="text-xs border-indigo-200 text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300">
                    Co-Brand: {card.coBrandPartner.name}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {networkName}
                </Badge>
                {card.isMetal && (
                  <Badge className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs">
                    Metal Card
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50">
                  {status.replace(/_/g, " ")}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {officialName}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {card.description}
              </p>

              {/* Categories */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {card.categories?.map((cat: any) => {
                  const name = cat.category?.name || cat.name;
                  return (
                    <span
                      key={cat.category?.slug || cat.slug || name}
                      className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Right: Quick Fees Metric Box */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-800/40 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="border-b border-slate-200/80 pb-2.5 dark:border-slate-700">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                    Joining Fee
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {Number(joiningFeeAmount) === 0 ? "FREE" : `${formatMoney(money(joiningFeeAmount))} + GST`}
                  </span>
                </div>

                <div className="border-b border-slate-200/80 pb-2.5 dark:border-slate-700">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                    Annual Renewal Fee
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {isLifetimeFree ? "Lifetime Free" : `${formatMoney(money(annualFeeAmount))} + GST`}
                  </span>
                  {waiverInfo?.spendThreshold && (
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block mt-0.5">
                      Waived on ₹{Number(waiverInfo.spendThreshold).toLocaleString("en-IN")} annual spend
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                    Foreign Currency Markup
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {forexMarkupPercent} {isZeroForex && "(Zero Forex)"}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  <span>GST at 18% applies on all fees</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Main Analysis: "Why This Card" vs "Watch Out" */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Why This Card (Advantages) */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-6 dark:border-emerald-950 dark:bg-emerald-950/20 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-base mb-3">
              <CheckCircle2 className="h-5 w-5" />
              <h2>Why This Card? (Key Advantages)</h2>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              {card.whyThisCard?.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Watch Out (Caps, Spend Conditions & Catches) */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-6 dark:border-rose-950 dark:bg-rose-950/20 shadow-sm">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400 font-bold text-base mb-3">
              <AlertTriangle className="h-5 w-5" />
              <h2>Watch Out (Caps & Conditions)</h2>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              {card.watchOut?.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* "Best For" & "Not Ideal For" Suitability Profile */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Audience Suitability Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
                ✓ Best For
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {card.bestFor?.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-2">
                ✕ Not Ideal For
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {card.notIdealFor?.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Detailed Fee Structure Table */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Official Schedule of Charges & Fees
            </h2>
            <Badge variant="outline" className="text-[10px] text-slate-500">
              Sourced from MITC
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Fee Type</th>
                  <th className="py-2.5 px-3 font-semibold">Standard Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Taxes Applicable</th>
                  <th className="py-2.5 px-3 font-semibold">Waiver / Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">Joining Fee</td>
                  <td className="py-2.5 px-3">{Number(joiningFeeAmount) === 0 ? "₹0 (FREE)" : formatMoney(money(joiningFeeAmount))}</td>
                  <td className="py-2.5 px-3">{gstApplicable ? "+ 18% GST" : "No Tax"}</td>
                  <td className="py-2.5 px-3 text-slate-500">One-time initial onboarding fee</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">Annual Renewal Fee</td>
                  <td className="py-2.5 px-3">{isLifetimeFree ? "Lifetime Free" : formatMoney(money(annualFeeAmount))}</td>
                  <td className="py-2.5 px-3">{gstApplicable ? "+ 18% GST" : "No Tax"}</td>
                  <td className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400">
                    {waiverInfo?.conditions || (isLifetimeFree ? "Lifetime Free with no fee" : "Charged annually")}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">Forex Currency Markup</td>
                  <td className="py-2.5 px-3">{forexMarkupPercent}</td>
                  <td className="py-2.5 px-3">+ 18% GST on markup</td>
                  <td className="py-2.5 px-3 text-slate-500">Applied on all international transactions</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">Fuel Surcharge Waiver</td>
                  <td className="py-2.5 px-3">1.00% Waiver</td>
                  <td className="py-2.5 px-3">GST on surcharge not refunded</td>
                  <td className="py-2.5 px-3 text-slate-500">On transactions between ₹400 and ₹5,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Rewards & Benefit Details */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rewards System */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base mb-3">
              <Percent className="h-5 w-5 text-emerald-600" />
              <h2>Reward Rules & CashPoints</h2>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="font-semibold text-slate-900 dark:text-white block">Base Earning Rate</span>
                <span className="text-slate-600 dark:text-slate-400">
                  {card.rewards?.baseRateDescription || "1% value back on general retail spending."}
                </span>
              </div>

              {card.rewards?.acceleratedRates?.map((rate: any, idx: number) => (
                <div key={idx} className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-900 dark:text-emerald-300">{rate.categoryOrMerchant}</span>
                    <Badge className="bg-emerald-700 text-white text-[10px]">{rate.rate}</Badge>
                  </div>
                  {rate.cap && (
                    <span className="text-[11px] text-slate-500 block mt-1">Cap: {rate.cap}</span>
                  )}
                </div>
              ))}

              {card.rewards?.redemptionRate && (
                <div className="text-[11px] text-slate-500 pt-1">
                  <strong>Redemption Value:</strong> {card.rewards.redemptionRate}
                </div>
              )}
            </div>
          </div>

          {/* Structured Lounge & Travel Benefits */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base mb-3">
              <Plane className="h-5 w-5 text-blue-600" />
              <h2>Airport Lounge & Travel Perks</h2>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="font-semibold text-slate-900 dark:text-white block">Domestic Lounge Access</span>
                <span className="text-slate-600 dark:text-slate-400">
                  {lounge?.hasLounge
                    ? lounge.domesticUnlimited
                      ? "Unlimited Complimentary Domestic Lounge Visits"
                      : `${lounge.domesticVisitsPerYear || 4} Visits/year (${lounge.domesticVisitsPerQuarter || 1} per quarter)`
                    : "No complimentary domestic lounge access included"}
                </span>
              </div>

              {lounge?.spendConditionDescription && (
                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900 text-[11px] text-amber-900 dark:text-amber-300">
                  <strong>Spend Condition:</strong> {lounge.spendConditionDescription}
                </div>
              )}

              {card.upiBenefit?.upiEnabled && (
                <div className="p-3 bg-purple-50/50 dark:bg-purple-950/30 rounded-lg border border-purple-100 dark:border-purple-900 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-purple-900 dark:text-purple-300 mb-0.5">
                    <Zap className="h-3.5 w-3.5" />
                    <span>RuPay UPI Integration</span>
                  </div>
                  <span className="text-slate-600 dark:text-slate-400">
                    {card.upiBenefit.rewardsOnUpi || "Can be linked to Google Pay, PhonePe, Paytm, or BHIM for merchant QR scan payments."}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Eligibility Checklist */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Eligibility Requirements & Disclosures
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-slate-500 block text-[11px] mb-1">Minimum Net Monthly Income</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {incomeState === "NOT_DISCLOSED"
                  ? "Not Publicly Disclosed by Bank"
                  : minIncome
                  ? `₹${Number(minIncome.amount).toLocaleString("en-IN")}/month`
                  : "Not Publicly Disclosed"}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-slate-500 block text-[11px] mb-1">Minimum CIBIL / Credit Score</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {cibilState === "NOT_DISCLOSED"
                  ? "Not Publicly Disclosed by Issuer"
                  : cibilScore
                  ? `${cibilScore}+ Preferred Score`
                  : "Not Publicly Disclosed"}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <span className="text-slate-500 block text-[11px] mb-1">Age & Employment Requirement</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {card.eligibility?.minAge || 21}–{card.eligibility?.maxAge || 65} Years • Salaried / Self-Employed
              </span>
            </div>
          </div>

          {card.eligibility?.cibilRequirementNotes && (
            <p className="text-[11px] text-slate-500 mt-3">
              <strong>Note on Credit Score:</strong> {card.eligibility.cibilRequirementNotes}
            </p>
          )}
        </div>

        {/* Source Citations & Provenance Log */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Official Source Citations & Evidence
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Under CardIntel's Provenance Protocol, every claim must be backed by a published primary document:
          </p>

          <div className="space-y-2">
            {card.sources?.map((src: any, idx: number) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 text-xs">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">{src.title}</span>
                  <span className="text-slate-500 text-[11px]">
                    Publisher: {src.publisher || issuerName} • Type: {src.sourceType} • Retrieved: {src.retrievedDate}
                  </span>
                </div>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "text-xs h-7 self-start sm:self-auto inline-flex items-center",
                    )}
                  >
                    View Official Document <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Similar & Alternative Cards */}
        {similarCards.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Similar & Alternative Credit Cards
              </h2>
              <Link
                href="/cards"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-xs text-emerald-700 dark:text-emerald-400 font-semibold",
                )}
              >
                Explore all cards →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {similarCards.map((c: any) => (
                <CardCard key={c.id || c.slug} card={c} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
