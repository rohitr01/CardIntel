import Link from "next/link";
import { Landmark, ArrowRight, ShieldCheck, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getIssuers } from "@/services/issuer-service";

export const metadata = {
  title: "Credit Card Issuers & Banks in India",
  description: "Directory of 50+ RBI-regulated credit card issuers, private banks, PSU banks, foreign banks, and small finance banks.",
};

export default async function IssuersPage() {
  let issuers: any[] = [];
  try {
    const res = await getIssuers({ page: 1, pageSize: 50 });
    issuers = res.data;
  } catch (e) {
    console.warn("Could not fetch issuers from DB:", e);
  }

  // If DB is empty, use standard bank list
  const fallbackIssuers = [
    { name: "HDFC Bank", slug: "hdfc-bank", issuerType: "BANK", cardCount: 32, rbiRegulatedEntity: true },
    { name: "SBI Card", slug: "sbi-card", issuerType: "NBFC", cardCount: 28, rbiRegulatedEntity: true },
    { name: "ICICI Bank", slug: "icici-bank", issuerType: "BANK", cardCount: 24, rbiRegulatedEntity: true },
    { name: "Axis Bank", slug: "axis-bank", issuerType: "BANK", cardCount: 26, rbiRegulatedEntity: true },
    { name: "Kotak Mahindra Bank", slug: "kotak-mahindra-bank", issuerType: "BANK", cardCount: 14, rbiRegulatedEntity: true },
    { name: "IDFC FIRST Bank", slug: "idfc-first-bank", issuerType: "BANK", cardCount: 12, rbiRegulatedEntity: true },
    { name: "IndusInd Bank", slug: "indusind-bank", issuerType: "BANK", cardCount: 11, rbiRegulatedEntity: true },
    { name: "Federal Bank", slug: "federal-bank", issuerType: "BANK", cardCount: 8, rbiRegulatedEntity: true },
    { name: "AU Small Finance Bank", slug: "au-small-finance-bank", issuerType: "SMALL_FINANCE_BANK", cardCount: 9, rbiRegulatedEntity: true },
    { name: "RBL Bank", slug: "rbl-bank", issuerType: "BANK", cardCount: 15, rbiRegulatedEntity: true },
    { name: "American Express", slug: "american-express", issuerType: "FOREIGN_BANK", cardCount: 7, rbiRegulatedEntity: true },
    { name: "Standard Chartered Bank", slug: "standard-chartered", issuerType: "FOREIGN_BANK", cardCount: 8, rbiRegulatedEntity: true },
  ];

  const displayList = issuers.length > 0 ? issuers : fallbackIssuers;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 mb-2">
          <Landmark className="h-3.5 w-3.5" />
          <span>RBI Regulated Institutions</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Indian Credit Card Issuers & Banks
        </h1>
        <p className="mt-1 text-sm text-slate-500 max-w-2xl">
          Complete directory of licensed banks, non-banking financial companies (NBFCs), small finance banks, and co-branded fintech platform partners.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayList.map((issuer: any) => (
          <Link
            key={issuer.slug}
            href={`/cards?issuers=${issuer.slug}`}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-emerald-950 dark:group-hover:text-emerald-400">
                <Building className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="text-[10px]">
                {issuer.issuerType?.replace(/_/g, " ")}
              </Badge>
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
              {issuer.name}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {issuer.rbiRegulatedEntity ? "RBI Regulated Entity" : "Financial Institution"}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
              <span>View Credit Cards</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Building(props: any) {
  return <Landmark {...props} />;
}
