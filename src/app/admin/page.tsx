import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Camera,
  History,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Scale,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAdminDashboardMetrics,
  getClaimsQueue,
  getConflictsQueue,
  getAuditLogs,
} from "@/services/admin-service";
import { cn } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const metrics = await getAdminDashboardMetrics();
  const pendingClaims = await getClaimsQueue("PENDING_VERIFICATION");
  const conflicts = await getConflictsQueue();
  const recentAudits = await getAuditLogs();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Provenance & Verification Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            System-wide credit card data health, field claims verification queue, and regulatory provenance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/claims"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs",
            )}
          >
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
            Open Verification Queue ({metrics.pendingClaimsCount})
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Verified Cards
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.fullyVerifiedCardsCount} / {metrics.totalCardsTracked}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              70%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">100% Tier 1 source provenance</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pending Queue
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {metrics.pendingClaimsCount}
            </span>
            <span className="text-[11px] font-medium text-slate-400">Claims to review</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Extracted from MITC & Schedules</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Unresolved Conflicts
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {metrics.unresolvedConflictsCount}
            </span>
            <span className="text-[11px] font-medium text-slate-400">Discrepancies</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Requires human adjudication</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Source Health
            </span>
            <FileText className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {metrics.sourcesHealthyPercent}%
            </span>
            <span className="text-[11px] font-medium text-slate-400">{metrics.tier1SourcesCount} Tier 1 MITCs</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Avg confidence: {metrics.averageConfidenceScore}%</p>
        </div>
      </div>

      {/* Action Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Queue Summary */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Pending Verification Claims ({pendingClaims.length})
              </h2>
            </div>
            <Link
              href="/admin/claims"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {pendingClaims.slice(0, 3).map((claim) => (
              <div
                key={claim.id}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {claim.cardName}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 block mt-0.5">
                    Field: <strong className="text-slate-700 dark:text-slate-200">{claim.fieldLabel}</strong>
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium block mt-1">
                    Proposed: {claim.claimedValue}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0 border-amber-300 text-amber-800 bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:bg-amber-950/40">
                  {claim.priority} Priority
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Unresolved Conflicts */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Active Source Conflicts ({conflicts.length})
              </h2>
            </div>
            <Link
              href="/admin/conflicts"
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1"
            >
              Adjudicate <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {conflict.cardName}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300 block mt-0.5">
                    Field: <strong>{conflict.fieldLabel}</strong>
                  </span>
                  <div className="mt-1 flex items-center gap-2 text-[11px]">
                    <span className="text-emerald-700 dark:text-emerald-400">
                      Tier 1: {conflict.claimA.value}
                    </span>
                    <span className="text-slate-400">vs</span>
                    <span className="text-rose-700 dark:text-rose-400">
                      Promo: {conflict.claimB.value}
                    </span>
                  </div>
                </div>
                <Link
                  href="/admin/conflicts"
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" }),
                    "text-[11px] h-7 px-2 border-rose-300 text-rose-700 dark:border-rose-800 dark:text-rose-300",
                  )}
                >
                  Resolve
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Audit Log Preview */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Verification Decisions & Audit Stream
            </h2>
          </div>
          <Link
            href="/admin/audit"
            className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-semibold inline-flex items-center gap-1"
          >
            Full Log <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentAudits.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-bold border-slate-300 dark:border-slate-700">
                    {log.action}
                  </Badge>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {log.entityName}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">{log.fieldName}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Reason: {log.reason}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-medium text-slate-400 block">
                  {new Date(log.timestamp).toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  By {log.userEmail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
