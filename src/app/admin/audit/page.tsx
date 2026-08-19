import { getAuditLogs } from "@/services/admin-service";
import { Badge } from "@/components/ui/badge";
import { History, ShieldCheck, ArrowRight, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Audit & Change History — CardIntel Admin",
  description: "Immutable record of all administrative verification decisions and value changes.",
};

export default async function AuditPage() {
  const auditLogs = await getAuditLogs();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Audit & Change Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable audit record of all claim verifications, conflict resolutions, and field adjustments.
          </p>
        </div>

        <Badge variant="outline" className="text-xs border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <History className="h-3 w-3 mr-1" />
          {auditLogs.length} Logged Events
        </Badge>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Researcher</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity & Field</th>
                <th className="p-3.5">Value Change</th>
                <th className="p-3.5">Reason & Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Timestamp */}
                  <td className="p-3.5 whitespace-nowrap text-[11px] text-slate-500">
                    {new Date(log.timestamp).toLocaleString("en-IN")}
                  </td>

                  {/* Researcher */}
                  <td className="p-3.5 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                    {log.userEmail}
                  </td>

                  {/* Action */}
                  <td className="p-3.5 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold",
                        log.action === "APPROVE" || log.action === "VERIFY"
                          ? "border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
                          : log.action === "RESOLVE_CONFLICT"
                          ? "border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-300"
                          : "border-slate-300 text-slate-700 bg-slate-50 dark:border-slate-700 dark:text-slate-300",
                      )}
                    >
                      {log.action}
                    </Badge>
                  </td>

                  {/* Entity & Field */}
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {log.entityName}
                    </span>
                    {log.fieldName && (
                      <code className="text-[10px] text-slate-400 font-mono">
                        {log.fieldName}
                      </code>
                    )}
                  </td>

                  {/* Value Change */}
                  <td className="p-3.5 max-w-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-400 line-through text-[11px]">
                        {log.oldValue || "None"}
                      </span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {log.newValue}
                      </span>
                    </div>
                  </td>

                  {/* Reason & Source */}
                  <td className="p-3.5 max-w-sm">
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      {log.reason}
                    </p>
                    {log.sourceTitle && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Source: {log.sourceTitle}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
