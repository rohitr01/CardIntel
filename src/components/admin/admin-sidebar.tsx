"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Camera,
  History,
  CheckCircle2,
  Lock,
  ExternalLink,
  CreditCard,
  Building,
  BarChart3,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  pendingClaimsCount?: number;
  unresolvedConflictsCount?: number;
}

export function AdminSidebar({
  pendingClaimsCount = 4,
  unresolvedConflictsCount = 2,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Issuer Universe & Coverage",
      href: "/admin/coverage",
      icon: Building,
    },
    {
      label: "Verification Queue",
      href: "/admin/claims",
      icon: ShieldCheck,
      badge: pendingClaimsCount > 0 ? pendingClaimsCount : undefined,
      badgeVariant: "emerald",
    },
    {
      label: "Conflict Resolution",
      href: "/admin/conflicts",
      icon: AlertTriangle,
      badge: unresolvedConflictsCount > 0 ? unresolvedConflictsCount : undefined,
      badgeVariant: "amber",
    },
    {
      label: "Source Management",
      href: "/admin/sources",
      icon: FileText,
    },
    {
      label: "Snapshot Repository",
      href: "/admin/snapshots",
      icon: Camera,
    },
    {
      label: "Audit & Change Log",
      href: "/admin/audit",
      icon: History,
    },
    {
      label: "Data Quality Metrics",
      href: "/admin/data-quality",
      icon: BarChart3,
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Workspace Brand Badge */}
        <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
              <Lock className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                CardIntel Admin
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                Researcher Console
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                      isActive
                        ? "bg-white/20 text-white dark:bg-slate-950/30 dark:text-slate-950"
                        : item.badgeVariant === "amber"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer link to public discovery */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <Link
          href="/cards"
          className="flex items-center justify-between text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40"
        >
          <span>View Public Discovery</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </aside>
  );
}
