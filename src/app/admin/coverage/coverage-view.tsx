"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles,
  HelpCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type {
  CoverageReportSummary,
  MasterIssuerRecord,
  MasterIssuerType,
  MasterResearchStatus,
} from "@/services/issuer-service";
import { cn } from "@/lib/utils";

interface CoverageViewProps {
  initialReport: CoverageReportSummary;
  initialIssuers: MasterIssuerRecord[];
}

export function CoverageView({ initialReport, initialIssuers }: CoverageViewProps) {
  const [issuers, setIssuers] = useState<MasterIssuerRecord[]>(initialIssuers);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIssuers = issuers.filter((iss) => {
    if (typeFilter !== "ALL" && iss.issuerType !== typeFilter) return false;
    if (statusFilter !== "ALL" && iss.researchStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = iss.legalName.toLowerCase().includes(q) || iss.commonName.toLowerCase().includes(q);
      const matchSlug = iss.slug.toLowerCase().includes(q);
      const matchAlias = iss.aliases.some((a) => a.toLowerCase().includes(q));
      return matchName || matchSlug || matchAlias;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
            <Building2 className="h-3.5 w-3.5" />
            <span>Phase 3A: Master Entity & Issuer Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Issuer Universe & Research Coverage
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Authoritative registry of Indian card-issuing banks, NBFC vehicles, and fintech co-issuance platforms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-bold border-slate-300 dark:border-slate-700">
            {initialReport.totalCandidateEntities} Registered Entities
          </Badge>
        </div>
      </div>

      {/* Dynamic KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Verified Legal Issuers
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {initialReport.verifiedIssuersCount}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              / {initialReport.totalCandidateEntities} Entities
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">100% MITC & SOC verified</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              In Research / Discovery
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {initialReport.inDiscoveryCount + initialReport.partiallyVerifiedCount}
            </span>
            <span className="text-xs text-slate-400">Active pipelines</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">SFBs & Regional Banks</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Non-Issuers Verified
            </span>
            <XCircle className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-700 dark:text-slate-300">
              {initialReport.notCardIssuersCount}
            </span>
            <span className="text-xs text-slate-400">Regulated non-issuers</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">e.g. Payments Banks (PPBL)</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Discovered Cards
            </span>
            <Layers className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {initialReport.totalDiscoveredCards}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ({initialReport.totalVerifiedCards} Verified)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across active registered issuers</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", label: "All Entities" },
              { id: "VERIFIED", label: "Verified Issuers" },
              { id: "PARTIALLY_VERIFIED", label: "Partially Verified" },
              { id: "DISCOVERY", label: "Discovery" },
              { id: "NOT_A_CARD_ISSUER", label: "Non-Issuers" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
                  statusFilter === tab.id
                    ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950"
                    : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search by Bank, CIN, Brand, Alias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs text-slate-500">
          <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            Entity Type:
          </span>
          {[
            { id: "ALL", label: "All Types" },
            { id: "PRIVATE_SECTOR_BANK", label: "Private Bank" },
            { id: "NBFC_CARD_ISSUER", label: "NBFC Issuer (SBI Card/BOBCARD)" },
            { id: "SMALL_FINANCE_BANK", label: "Small Finance Bank (AU SFB)" },
            { id: "FOREIGN_BANK", label: "Foreign Bank" },
            { id: "FINTECH_PLATFORM", label: "Fintech Platform (OneCard)" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setTypeFilter(cat.id)}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors border",
                typeFilter === cat.id
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-bold"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Master Issuer Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="p-3.5">Entity & Legal Name</th>
                <th className="p-3.5">Classification & RBI Reg</th>
                <th className="p-3.5">Relationships</th>
                <th className="p-3.5">Cards Inventory</th>
                <th className="p-3.5">Research Status</th>
                <th className="p-3.5 text-right">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredIssuers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No issuer entities match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredIssuers.map((iss) => (
                  <tr key={iss.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Entity Name */}
                    <td className="p-3.5 max-w-xs">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {iss.commonName}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        {iss.legalName}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-slate-400 font-mono">
                          HQ: {iss.headquarters}
                        </span>
                      </div>
                    </td>

                    {/* Classification */}
                    <td className="p-3.5">
                      <Badge variant="outline" className="text-[10px] font-bold border-slate-300 dark:border-slate-700">
                        {iss.issuerType.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        {iss.regulatoryStatus.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Relationships */}
                    <td className="p-3.5 max-w-xs">
                      {iss.relationships.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">Direct Issuance</span>
                      ) : (
                        <div className="space-y-1">
                          {iss.relationships.slice(0, 2).map((rel) => (
                            <div key={rel.id} className="flex items-center gap-1 text-[11px]">
                              <Badge variant="outline" className="text-[9px] px-1 py-0 border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
                                {rel.relationType}
                              </Badge>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {rel.relatedEntityName}
                              </span>
                            </div>
                          ))}
                          {iss.relationships.length > 2 && (
                            <span className="text-[10px] text-slate-400 block">
                              +{iss.relationships.length - 2} more relationships
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Cards Inventory */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {iss.discoveredCards.length} Cards Discovered
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                        {iss.discoveredCards.filter((c) => c.isVerified).length} Verified Claims
                      </span>
                    </td>

                    {/* Research Status */}
                    <td className="p-3.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold",
                          iss.researchStatus === "VERIFIED"
                            ? "border-emerald-400 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-950/40"
                            : iss.researchStatus === "PARTIALLY_VERIFIED"
                            ? "border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300"
                            : iss.researchStatus === "NOT_A_CARD_ISSUER"
                            ? "border-slate-300 text-slate-600 bg-slate-50 dark:border-slate-700 dark:text-slate-400"
                            : "border-amber-300 text-amber-800 bg-amber-50 dark:border-amber-700 dark:text-amber-300",
                        )}
                      >
                        {iss.researchStatus}
                      </Badge>
                    </td>

                    {/* Detail Link */}
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/admin/issuers/${iss.id}`}
                        className={cn(
                          buttonVariants({ size: "sm", variant: "outline" }),
                          "text-xs h-7 px-2.5 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                        )}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Explore
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
