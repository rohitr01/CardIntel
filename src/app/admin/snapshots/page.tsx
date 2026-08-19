import { getSnapshotsList } from "@/services/admin-service";
import { Badge } from "@/components/ui/badge";
import { Camera, CheckCircle2, FileText, Lock, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Source Snapshot Repository — CardIntel Admin",
  description: "Immutable cryptographically hashed primary source captures.",
};

export default async function SnapshotsPage() {
  const snapshots = await getSnapshotsList();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Immutable Snapshot Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cryptographically hashed (SHA-256) snapshots of official MITC schedules and regulatory filings.
          </p>
        </div>

        <Badge variant="outline" className="text-xs border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Lock className="h-3 w-3 mr-1" />
          Immutable Evidence Store
        </Badge>
      </div>

      {/* Snapshots Grid */}
      <div className="grid grid-cols-1 gap-4">
        {snapshots.map((snap) => (
          <div
            key={snap.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-bold border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300">
                    HTTP {snap.httpStatusCode} OK
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">ID: {snap.id}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {snap.sourceTitle}
                </h3>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-medium text-slate-500 block">
                  Captured: {new Date(snap.retrievedAt).toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                  {snap.associatedClaimsCount} Associated Claims
                </span>
              </div>
            </div>

            {/* Content Hash */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">SHA-256 Hash:</span>
              <code className="rounded bg-slate-100 dark:bg-slate-950 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all">
                {snap.contentHash}
              </code>
            </div>

            {/* Excerpt Box */}
            <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-3 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed">
              "{snap.excerpt}"
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
