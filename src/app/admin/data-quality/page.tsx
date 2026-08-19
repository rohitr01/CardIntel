import { getAdminDashboardMetrics } from "@/services/admin-service";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  FileText,
  Clock,
  Info,
} from "lucide-react";

export const metadata = {
  title: "Data Quality & Coverage — CardIntel Admin",
  description: "Field-level data quality metrics, NOT_DISCLOSED vs UNKNOWN analysis, and source health.",
};

export default async function DataQualityPage() {
  const metrics = await getAdminDashboardMetrics();

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Data Quality & Provenance Metrics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Quantitative metrics on field-level verification completeness, missing data taxonomy, and source freshness.
        </p>
      </div>

      {/* Critical Taxonomy Alert: NOT_DISCLOSED vs UNKNOWN */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-900/50 dark:bg-blue-950/20 space-y-2">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-bold text-blue-900 dark:text-blue-200">
            CardIntel Field Taxonomy: NOT_DISCLOSED vs UNKNOWN
          </h2>
        </div>
        <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
          In our financial data architecture, <strong className="font-bold">NOT_DISCLOSED</strong> and <strong className="font-bold">UNKNOWN</strong> are strictly not equivalent:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-blue-100 dark:border-blue-900/40">
            <Badge variant="outline" className="text-[10px] font-bold border-slate-400 text-slate-700 dark:text-slate-300 mb-1">
              NOT_DISCLOSED
            </Badge>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              The issuer officially does not disclose this parameter publicly (e.g. internal CIBIL risk cutoff models or proprietary lounge partner access rules).
            </p>
          </div>
          <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-blue-100 dark:border-blue-900/40">
            <Badge variant="outline" className="text-[10px] font-bold border-amber-400 text-amber-700 dark:text-amber-300 mb-1">
              UNKNOWN
            </Badge>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              The parameter exists publicly in bank documentation but has not yet been researched, extracted, or verified by our research team.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Breakdown Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Total Tracked Cards</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.totalCardsTracked}
          </div>
          <p className="text-[11px] text-slate-400">Indian market coverage</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Verified Cards (100% Provenance)</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.fullyVerifiedCardsCount}
          </div>
          <p className="text-[11px] text-slate-400">Zero unverified financial fields</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Pending Review Queue</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {metrics.pendingClaimsCount}
          </div>
          <p className="text-[11px] text-slate-400">Extracted claims awaiting human review</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Unresolved Conflicts</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {metrics.unresolvedConflictsCount}
          </div>
          <p className="text-[11px] text-slate-400">Conflicting sources needing adjudication</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <span className="text-xs text-slate-500 font-semibold">NOT_DISCLOSED Fields</span>
          <div className="text-2xl font-black text-slate-700 dark:text-slate-300">
            {metrics.notDisclosedFieldsCount}
          </div>
          <p className="text-[11px] text-slate-400">Bank intentionally undisclosed</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <span className="text-xs text-slate-500 font-semibold">UNKNOWN Fields</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {metrics.unknownFieldsCount}
          </div>
          <p className="text-[11px] text-slate-400">Needs research investigation</p>
        </div>
      </div>
    </div>
  );
}
