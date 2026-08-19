import { Suspense } from "react";
import type { Metadata } from "next";
import { getCards } from "@/services/card-service";
import { CardDiscovery } from "@/components/cards/card-discovery";

export const metadata: Metadata = {
  title: "Discover Credit Cards in India",
  description:
    "Filter through India's leading credit cards by bank, income eligibility, CIBIL score, joining fee, reward points, airport lounge access, and RuPay UPI support.",
};

interface CardsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CardsPage({ searchParams }: CardsPageProps) {
  const sp = await searchParams;

  const parseArray = (val: string | string[] | undefined) => {
    if (!val) return undefined;
    if (Array.isArray(val)) return val.flatMap((v) => v.split(",").map((s) => s.trim()).filter(Boolean));
    return val.split(",").map((s) => s.trim()).filter(Boolean);
  };

  const getSingleString = (val: string | string[] | undefined) => {
    if (Array.isArray(val)) return val[0];
    return val;
  };

  const filters = {
    q: getSingleString(sp.q),
    issuers: parseArray(sp.issuers),
    coBrands: parseArray(sp.coBrands),
    networkTypes: parseArray(sp.networkTypes) as any,
    categories: parseArray(sp.categories),
    statuses: parseArray(sp.statuses) as any,
    employmentTypes: parseArray(sp.employmentTypes),
    minMonthlyIncome: getSingleString(sp.minMonthlyIncome),
    minCibilScore: getSingleString(sp.minCibilScore) ? Number(getSingleString(sp.minCibilScore)) : undefined,
    includeUndisclosedCibil: getSingleString(sp.includeUndisclosedCibil) !== "false",
    includeUndisclosedIncome: getSingleString(sp.includeUndisclosedIncome) !== "false",
    isLifetimeFree: getSingleString(sp.isLifetimeFree) === "true",
    hasFeeWaiver: getSingleString(sp.hasFeeWaiver) === "true",
    maxAnnualFee: getSingleString(sp.maxAnnualFee),
    isZeroForex: getSingleString(sp.isZeroForex) === "true",
    hasUPI: getSingleString(sp.hasUPI) === "true",
    hasLounge: getSingleString(sp.hasLounge) === "true",
    hasIntlLounge: getSingleString(sp.hasIntlLounge) === "true",
    hasFuelBenefit: getSingleString(sp.hasFuelBenefit) === "true",
    isFDBacked: getSingleString(sp.isFDBacked) === "true",
    isMetal: getSingleString(sp.isMetal) === "true",
    mustHave: parseArray(sp.mustHave),
    exclude: parseArray(sp.exclude),
    sort: (getSingleString(sp.sort) as any) || "relevance",
    page: 1,
    pageSize: 20,
  };

  const result = await getCards(filters);

  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading cards...</div>}>
      <CardDiscovery
        initialCards={result.data}
        initialTotal={result.total}
        isDemoData={result.isDemoData ?? true}
      />
    </Suspense>
  );
}
