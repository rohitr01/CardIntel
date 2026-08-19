"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ExternalLink,
  Layers,
  Plane,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatAnnualFeeWithWaiver, formatMoney, money } from "@/lib/utils/money";
import { useCompare } from "@/lib/context/compare-context";
import { cn } from "@/lib/utils";

interface CardCardProps {
  card: any;
}

function formatSlugLabel(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function CardCard({ card }: CardCardProps) {
  const { isInCompare, toggleCard } = useCompare();

  const isDemo = card.demoRecord === true || !card.createdAt;
  const officialName = card.officialName || card.shortName;
  const issuerName = card.issuer?.name || card.issuer?.shortName || "Bank";
  const networkType = card.network?.type || "VISA";
  const networkName = card.network?.name || networkType;
  const slug = card.slug;
  const inCompare = isInCompare(slug);
  const categories = card.categories || [];
  const bestFor = card.bestFor || [];
  const status = card.status || "ACTIVE";
  const score = isDemo ? 86 : Math.round(card.confidenceScore || 88);

  const joiningFeeAmount =
    card.joiningFee?.amount ??
    card.fees?.find((fee: any) => fee.feeType === "JOINING")?.amount ??
    "0.00";
  const annualFeeAmount =
    card.annualFee?.amount ??
    card.fees?.find((fee: any) => fee.feeType === "ANNUAL")?.amount ??
    "0.00";
  const gstApplicable =
    card.annualFee?.gstApplicable ??
    card.fees?.find((fee: any) => fee.feeType === "ANNUAL")?.gstApplicable ??
    true;

  const waiverInfo = card.feeWaiver || card.feeWaivers?.[0];
  const isLifetimeFree =
    waiverInfo?.isLifetimeFree ||
    (Number(annualFeeAmount) === 0 && Number(joiningFeeAmount) === 0);
  const waiverSpend = waiverInfo?.spendThreshold ? money(waiverInfo.spendThreshold) : null;

  const highlights: Array<{ icon: any; text: string; tone?: string }> = [];

  if (card.upiBenefit?.upiEnabled || card.upiBenefits?.[0]?.upiEnabled || networkType === "RUPAY") {
    highlights.push({
      icon: Zap,
      text: card.upiBenefit?.rewardsOnUpi || "RuPay UPI QR payments",
      tone: "text-violet-600",
    });
  }

  if (card.rewards?.acceleratedRates?.[0]) {
    const topReward = card.rewards.acceleratedRates[0];
    highlights.push({
      icon: TrendingUp,
      text: `${topReward.rate} on ${topReward.categoryOrMerchant.split(",")[0]}`,
      tone: "text-emerald-600",
    });
  } else if (card.rewards?.baseRateDescription) {
    highlights.push({
      icon: TrendingUp,
      text: card.rewards.baseRateDescription,
      tone: "text-emerald-600",
    });
  }

  const lounge = Array.isArray(card.loungeBenefits) ? card.loungeBenefits[0] : card.loungeBenefits;
  if (lounge?.hasLounge || lounge?.domesticVisitsPerYear || lounge?.domesticUnlimited) {
    highlights.push({
      icon: Plane,
      text: lounge.domesticUnlimited
        ? "Unlimited domestic lounge access"
        : `${lounge.domesticVisitsPerYear || 4} lounge visits/year`,
      tone: "text-blue-600",
    });
  }

  if (card.forexMarkup?.isZeroForex || card.forexBenefits?.[0]?.isZeroForex) {
    highlights.push({ icon: Sparkles, text: "0% forex markup", tone: "text-amber-600" });
  } else if (card.fuelBenefit?.fuelSurchargeWaiver || card.fuelBenefits?.[0]?.fuelSurchargeWaiver) {
    highlights.push({ icon: CheckCircle2, text: "Fuel surcharge waiver", tone: "text-slate-500" });
  }

  return (
    <article className="group flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 hover:bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300">
              Score {score}
            </Badge>
            <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[10px] font-bold">
              {networkName}
            </Badge>
            {isDemo && (
              <Badge variant="outline" className="rounded-md border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                Demo
              </Badge>
            )}
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            {issuerName}
          </p>
        </div>

        {status !== "ACTIVE" && (
          <Badge variant="outline" className="shrink-0 rounded-md border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-800">
            {status.replace(/_/g, " ")}
          </Badge>
        )}
      </div>

      <Link href={`/cards/${slug}`} className="mt-2 block">
        <h3 className="line-clamp-2 text-xl font-bold leading-snug text-slate-950 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">
          {officialName}
        </h3>
      </Link>

      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600 dark:text-slate-300">
        {bestFor[0] || card.description || `Best for ${formatSlugLabel(slug)}`}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {categories.slice(0, 3).map((cat: any) => {
          const catName = cat.category?.name || cat.name;
          return (
            <span
              key={cat.category?.slug || cat.slug || catName}
              className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {catName}
            </span>
          );
        })}
        {card.isMetal && (
          <span className="rounded-md bg-slate-950 px-2 py-1 text-[11px] font-bold text-white dark:bg-white dark:text-slate-950">
            Metal
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-lg border border-slate-200 text-xs dark:border-slate-800">
        <div className="border-r border-slate-200 p-3 dark:border-slate-800">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Joining
          </span>
          <strong className="mt-1 block text-slate-950 dark:text-white">
            {Number(joiningFeeAmount) === 0 ? "Free" : formatMoney(money(joiningFeeAmount))}
          </strong>
        </div>
        <div className="border-r border-slate-200 p-3 dark:border-slate-800">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Annual
          </span>
          <strong className="mt-1 block text-slate-950 dark:text-white">
            {isLifetimeFree
              ? "LTF"
              : formatAnnualFeeWithWaiver(money(annualFeeAmount), gstApplicable, waiverSpend, isLifetimeFree)}
          </strong>
        </div>
        <div className="p-3">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Source
          </span>
          <strong className="mt-1 flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            MITC
          </strong>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {highlights.slice(0, 3).map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={`${item.text}-${index}`} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", item.tone)} />
              <span className="line-clamp-1">{item.text}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            type="button"
            onClick={() => toggleCard(slug)}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-bold transition-colors",
              inCompare
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200",
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            {inCompare ? "Added" : "Compare"}
          </button>

          <div className="flex items-center gap-2">
            <Link
              href={`/cards/${slug}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 text-xs font-bold")}
            >
              Details
            </Link>
            {card.officialProductUrl && (
              <a
                href={card.officialProductUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "sm" }), "h-9 bg-slate-950 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950")}
              >
                Apply <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
