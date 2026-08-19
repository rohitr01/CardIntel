"use client";

import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Search,
  SlidersHorizontal,
  ExternalLink,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ClaimReviewModal } from "@/components/admin/claim-review-modal";
import { verifyClaim, type ClaimQueueItem } from "@/services/admin-service";
import { cn } from "@/lib/utils";

interface ClaimsViewProps {
  initialClaims: ClaimQueueItem[];
}

export function ClaimsView({ initialClaims }: ClaimsViewProps) {
  const [claims, setClaims] = useState<ClaimQueueItem[]>(initialClaims);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<ClaimQueueItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const filteredClaims = claims.filter((c) => {
    if (statusFilter !== "ALL" && c.verificationStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.cardName.toLowerCase().includes(q) ||
        c.fieldName.toLowerCase().includes(q) ||
        c.fieldLabel.toLowerCase().includes(q) ||
        c.claimedValue.toLowerCase().includes(q) ||
        c.sourcePublisher.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleActionComplete = async (
    claimId: string,
    action: string,
    notes: string,
    editedVal?: string,
  ) => {
    const res = await verifyClaim(
      claimId,
      action as any,
      notes,
      editedVal,
      "lead.researcher@cardintel.in",
    );

    if (res.success && res.claim) {
      setClaims((prev) => prev.map((c) => (c.id === claimId ? res.claim! : c)));
      setNotification(`Claim #${claimId} successfully processed (${action}).`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const pendingCount = claims.filter((c) => c.verificationStatus === "PENDING_VERIFICATION").length;
  const verifiedCount = claims.filter((c) => c.verificationStatus === "VERIFIED").length;
  const rejectedCount = claims.filter((c) => c.verificationStatus === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Claim Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Human researcher adjudication for extracted financial claims from bank MITCs & Schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            {pendingCount} Pending Review
          </Badge>
          <Badge variant="outline" className="text-xs border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            {verifiedCount} Verified
          </Badge>
        </div>
      </div>

      {/* Success Notification Alert */}
      {notification && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)}>✕</button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Claims", count: claims.length },
            { id: "PENDING_VERIFICATION", label: "Pending Review", count: pendingCount },
            { id: "VERIFIED", label: "Verified", count: verifiedCount },
            { id: "REJECTED", label: "Rejected", count: rejectedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5",
                statusFilter === tab.id
                  ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950"
                  : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800",
              )}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search by card, field, value..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-white dark:bg-slate-900"
          />
        </div>
      </div>

      {/* Claims Table / List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="p-3.5">Card & Issuer</th>
                <th className="p-3.5">Field</th>
                <th className="p-3.5">Extracted Value</th>
                <th className="p-3.5">Source & Document</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Confidence</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No claims match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr
                    key={claim.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Card & Issuer */}
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {claim.cardName}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {claim.issuerName}
                      </span>
                    </td>

                    {/* Field */}
                    <td className="p-3.5 font-medium">
                      <span className="text-slate-900 dark:text-white block">
                        {claim.fieldLabel}
                      </span>
                      <code className="text-[10px] text-slate-400 font-mono">
                        {claim.fieldName}
                      </code>
                    </td>

                    {/* Extracted Value */}
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                        {claim.claimedValue}
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Current: {claim.currentValue}
                      </span>
                    </td>

                    {/* Source & Document */}
                    <td className="p-3.5 max-w-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300 block truncate">
                        {claim.sourceTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {claim.sourceType} • Score: {claim.sourceAuthorityScore}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold",
                          claim.verificationStatus === "VERIFIED"
                            ? "border-emerald-400 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-950/40"
                            : claim.verificationStatus === "REJECTED"
                            ? "border-rose-300 text-rose-700 bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:bg-rose-950/40"
                            : "border-amber-300 text-amber-800 bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:bg-amber-950/40",
                        )}
                      >
                        {claim.verificationStatus}
                      </Badge>
                    </td>

                    {/* Confidence */}
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {claim.extractionConfidence}%
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedClaim(claim)}
                        className="text-xs h-7 px-2.5 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedClaim && (
        <ClaimReviewModal
          claim={selectedClaim}
          isOpen={!!selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onActionComplete={handleActionComplete}
        />
      )}
    </div>
  );
}
