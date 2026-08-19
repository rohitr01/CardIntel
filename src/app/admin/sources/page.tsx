import { getSourcesList } from "@/services/admin-service";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Source Management — CardIntel Admin",
  description: "Tracked bank MITCs, schedules of charges, and regulatory circulars.",
};

export default async function SourcesPage() {
  const sources = await getSourcesList();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Source Management & Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registered primary documents, bank schedules, and regulatory circulars.
          </p>
        </div>

        <Badge variant="outline" className="text-xs border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
          {sources.length} Active Sources
        </Badge>
      </div>

      {/* Sources Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="p-3.5">Document Title & URL</th>
                <th className="p-3.5">Publisher & Type</th>
                <th className="p-3.5">Authority Tier</th>
                <th className="p-3.5">Health</th>
                <th className="p-3.5">Claims</th>
                <th className="p-3.5">Snapshots</th>
                <th className="p-3.5 text-right">Last Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {sources.map((src) => (
                <tr key={src.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Title & URL */}
                  <td className="p-3.5 max-w-sm">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {src.title}
                    </span>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 hover:underline font-mono inline-flex items-center gap-1 mt-0.5"
                    >
                      {src.url.replace("https://", "").slice(0, 40)}...
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>

                  {/* Publisher & Type */}
                  <td className="p-3.5">
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {src.publisher}
                    </span>
                    <Badge variant="outline" className="text-[10px] mt-1 border-slate-300 dark:border-slate-700">
                      {src.sourceType}
                    </Badge>
                  </td>

                  {/* Authority Tier */}
                  <td className="p-3.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold",
                        src.authorityScore >= 95
                          ? "border-emerald-400 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-950/40"
                          : "border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300",
                      )}
                    >
                      Tier {src.authorityScore >= 95 ? "1" : "2"} (Score: {src.authorityScore})
                    </Badge>
                  </td>

                  {/* Health */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{src.healthStatus} ({src.httpStatusCode || 200})</span>
                    </div>
                  </td>

                  {/* Claims Count */}
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {src.claimsCount} claims
                  </td>

                  {/* Snapshots Count */}
                  <td className="p-3.5 text-slate-500 dark:text-slate-400">
                    {src.snapshotsCount} captures
                  </td>

                  {/* Last Checked */}
                  <td className="p-3.5 text-right text-slate-400 text-[11px]">
                    {new Date(src.lastCheckedAt).toLocaleDateString("en-IN")}
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
