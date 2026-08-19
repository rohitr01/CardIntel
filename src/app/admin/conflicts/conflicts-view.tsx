"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Scale,
  FileText,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { resolveConflict, type ConflictItem } from "@/services/admin-service";
import { cn } from "@/lib/utils";

interface ConflictsViewProps {
  initialConflicts: ConflictItem[];
}

export function ConflictsView({ initialConflicts }: ConflictsViewProps) {
  const [conflicts, setConflicts] = useState<ConflictItem[]>(initialConflicts);
  const [selectedConflict, setSelectedConflict] = useState<ConflictItem | null>(null);
  const [resolutionChoice, setResolutionChoice] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const activeConflicts = conflicts.filter((c) => c.conflictStatus === "DETECTED");
  const resolvedConflicts = conflicts.filter((c) => c.conflictStatus === "RESOLVED");

  const handleResolve = async () => {
    if (!selectedConflict || !resolutionChoice) return;
    setSubmitting(true);
    try {
      const res = await resolveConflict(
        selectedConflict.id,
        resolutionChoice,
        resolutionNotes || `Resolved in favor of claim ${resolutionChoice}`,
        "lead.researcher@cardintel.in",
      );

      if (res.success) {
        setConflicts((prev) =>
          prev.map((c) =>
            c.id === selectedConflict.id
              ? {
                  ...c,
                  conflictStatus: "RESOLVED",
                  resolutionNotes,
                  resolvedAt: new Date().toISOString(),
                  resolvedBy: "lead.researcher@cardintel.in",
                }
              : c,
          ),
        );
        setNotification(`Conflict for ${selectedConflict.cardName} (${selectedConflict.fieldLabel}) resolved successfully.`);
        setSelectedConflict(null);
        setResolutionChoice(null);
        setResolutionNotes("");
        setTimeout(() => setNotification(null), 4000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Source Conflict Resolution
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Reconcile conflicting claims when official schedules, regulatory circulars, and product pages disagree.
          </p>
        </div>

        <Badge variant="outline" className="text-xs border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          {activeConflicts.length} Active Discrepancies
        </Badge>
      </div>

      {notification && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)}>✕</button>
        </div>
      )}

      {/* Conflicts List */}
      <div className="space-y-6">
        {activeConflicts.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              All Source Conflicts Resolved
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              No active discrepancies detected across ingested bank documents.
            </p>
          </div>
        ) : (
          activeConflicts.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-rose-200 bg-white p-5 shadow-sm dark:border-rose-900/50 dark:bg-slate-900 space-y-4"
            >
              {/* Conflict Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold border-rose-300 text-rose-700 bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:bg-rose-950/40">
                      Discrepancy Detected
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">ID: {c.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {c.cardName} — <span className="text-rose-600 dark:text-rose-400">{c.fieldLabel}</span>
                  </h3>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedConflict(c);
                    setResolutionChoice(c.claimA.id);
                  }}
                  className="text-xs bg-slate-900 text-white hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 font-semibold"
                >
                  Adjudicate Conflict
                </Button>
              </div>

              {/* Side-by-Side Sources Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Source A */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      SOURCE A (Authority Score: {c.claimA.authorityScore})
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300">
                      {c.claimA.sourceType}
                    </Badge>
                  </div>

                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Claimed Value: <span className="text-emerald-600 dark:text-emerald-400">{c.claimA.value}</span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <strong>Document:</strong> {c.claimA.sourceTitle}
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                    "{c.claimA.evidenceText}"
                  </div>

                  <a
                    href={c.claimA.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    Open Source A Document <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Source B */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      SOURCE B (Authority Score: {c.claimB.authorityScore})
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-300">
                      {c.claimB.sourceType}
                    </Badge>
                  </div>

                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Claimed Value: <span className="text-amber-600 dark:text-amber-400">{c.claimB.value}</span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <strong>Document:</strong> {c.claimB.sourceTitle}
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                    "{c.claimB.evidenceText}"
                  </div>

                  <a
                    href={c.claimB.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    Open Source B Document <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolution Dialog / Drawer */}
      {selectedConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <Badge variant="outline" className="text-[10px] font-bold border-emerald-400 text-emerald-700 dark:text-emerald-400">
                  Adjudication Decision
                </Badge>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  Resolve Conflict: {selectedConflict.cardName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedConflict(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Selection Radios */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Choose Authoritative Value:
              </label>

              <label
                onClick={() => setResolutionChoice(selectedConflict.claimA.id)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all text-xs",
                  resolutionChoice === selectedConflict.claimA.id
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-semibold"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50",
                )}
              >
                <input
                  type="radio"
                  name="claimChoice"
                  checked={resolutionChoice === selectedConflict.claimA.id}
                  onChange={() => {}}
                  className="mt-0.5"
                />
                <div>
                  <span className="text-slate-900 dark:text-white block font-bold">
                    Source A: {selectedConflict.claimA.value}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {selectedConflict.claimA.sourceTitle} (Authority: {selectedConflict.claimA.authorityScore})
                  </span>
                </div>
              </label>

              <label
                onClick={() => setResolutionChoice(selectedConflict.claimB.id)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all text-xs",
                  resolutionChoice === selectedConflict.claimB.id
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-semibold"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50",
                )}
              >
                <input
                  type="radio"
                  name="claimChoice"
                  checked={resolutionChoice === selectedConflict.claimB.id}
                  onChange={() => {}}
                  className="mt-0.5"
                />
                <div>
                  <span className="text-slate-900 dark:text-white block font-bold">
                    Source B: {selectedConflict.claimB.value}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {selectedConflict.claimB.sourceTitle} (Authority: {selectedConflict.claimB.authorityScore})
                  </span>
                </div>
              </label>
            </div>

            {/* Justification Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Resolution Justification (Recorded in Audit Log)
              </label>
              <Textarea
                placeholder="Explain why this source takes precedence (e.g., Official Schedule of Charges supersedes promo brochure)..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="text-xs h-20"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedConflict(null)}
                className="text-xs"
              >
                Cancel
              </Button>

              <Button
                size="sm"
                onClick={handleResolve}
                disabled={submitting || !resolutionChoice}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Confirm Resolution
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
