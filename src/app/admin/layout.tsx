import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ShieldCheck, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Admin Console & Provenance Verification — CardIntel",
  description: "Administrative verification workflows, field-level claim review, and source conflict resolution.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Admin Verification Notice Bar */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold">CardIntel Source Verification & Administrative Workspace</span>
          <span className="text-slate-400 hidden sm:inline">• Core Principle: Zero Financial Fabrication</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-500/40 bg-emerald-950/40">
            <UserCheck className="h-3 w-3 mr-1" />
            Role: Lead Researcher (Admin)
          </Badge>
        </div>
      </div>

      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
