import Link from "next/link";
import { ShieldCheck, CheckCircle2, Lock, FileText, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Research Methodology & Provenance Architecture",
  description: "How CardIntel collects, verifies, and scores Indian credit card data with 100% field-level source provenance.",
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 mb-3">
          <ShieldCheck className="h-4 w-4" />
          <span>CardIntel Provenance Protocol</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Our Research Methodology
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          How we collect, verify, and maintain source-traceable financial data without marketing bias or fabricated claims.
        </p>
      </div>

      <div className="space-y-8 text-sm text-slate-700 dark:text-slate-300">
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            1. Source Hierarchy & Authority Rules
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            We classify all information into strict authority tiers. When two documents conflict, the higher authority source always overrides:
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between">
              <span className="font-semibold">Tier 1: Regulatory Notices (RBI, NPCI) & Official Bank MITC</span>
              <span className="text-emerald-600 font-bold">100 / 100 Authority</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between">
              <span className="font-semibold">Tier 2: Official Fee Schedules & Product Pages</span>
              <span className="text-blue-600 font-bold">90 / 100 Authority</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between">
              <span className="font-semibold">Tier 3: Annual Reports & Verified Public Statements</span>
              <span className="text-purple-600 font-bold">80 / 100 Authority</span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            2. Handling Undisclosed Data
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Many issuers do not publicly disclose fixed CIBIL score cutoffs or exact income criteria. We strictly distinguish between:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <li><strong>KNOWN:</strong> The bank has published an exact figure in their schedule.</li>
            <li><strong>NOT_DISCLOSED:</strong> The bank assesses applicants on holistic internal criteria without a public threshold. We never fabricate a fake minimum score.</li>
            <li><strong>CONDITIONAL:</strong> Criteria depends on existing relationship, salary account, or fixed deposit.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            3. Deterministic Arithmetic
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            All GST calculations, reward point valuations, milestone calculations, and fee waiver verifications are performed by deterministic application code using currency-safe Decimal arithmetic, never by generative AI.
          </p>
        </section>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/cards"
          className={cn(
            buttonVariants(),
            "bg-slate-900 text-white hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950 inline-flex items-center",
          )}
        >
          Start Exploring Verified Cards <ArrowRight className="ml-1.5 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
