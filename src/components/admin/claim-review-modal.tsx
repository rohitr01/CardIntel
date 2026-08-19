"use client";

import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  ExternalLink,
  Edit3,
  HelpCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ClaimQueueItem } from "@/services/admin-service";

interface ClaimReviewModalProps {
  claim: ClaimQueueItem;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete: (claimId: string, action: string, notes: string, editedVal?: string) => void;
}

export function ClaimReviewModal({
  claim,
  isOpen,
  onClose,
  onActionComplete,
}: ClaimReviewModalProps) {
  if (!isOpen) return null;

  const [notes, setNotes] = useState("");
  const [editedValue, setEditedValue] = useState(claim.claimedValue);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAction = async (action: "APPROVE" | "REJECT" | "MARK_NOT_DISCLOSED" | "MARK_CONDITIONAL" | "EDIT_AND_APPROVE") => {
    setSubmitting(true);
    try {
      onActionComplete(claim.id, action, notes, isEditing ? editedValue : undefined);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-bold border-emerald-400 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400">
                Claim Review Panel
              </Badge>
              <span className="text-xs text-slate-400">ID: {claim.id}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {claim.cardName} — <span className="text-emerald-600 dark:text-emerald-400">{claim.fieldLabel}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Values Comparison Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <span className="text-[11px] font-semibold text-slate-500 block">
                CURRENT LIVE VALUE
              </span>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {claim.currentValue}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Field State: {claim.fieldState}
              </span>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 block">
                  PROPOSED EXTRACTED VALUE
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Edit3 className="h-3 w-3" />
                  {isEditing ? "Cancel Edit" : "Edit Value"}
                </button>
              </div>

              {isEditing ? (
                <Input
                  value={editedValue}
                  onChange={(e) => setEditedValue(e.target.value)}
                  className="mt-2 text-xs bg-white dark:bg-slate-900"
                />
              ) : (
                <div className="text-sm font-bold text-emerald-900 dark:text-emerald-300 mt-1">
                  {claim.claimedValue}
                </div>
              )}

              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block">
                Confidence: {claim.extractionConfidence}% • Priority: {claim.priority}
              </span>
            </div>
          </div>

          {/* Primary Evidence & Document Citation */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Source Provenance & Evidence Citation
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-semibold border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950/40">
                Tier 1 Authority (Score: {claim.sourceAuthorityScore})
              </Badge>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="text-slate-700 dark:text-slate-300">
                <strong>Document:</strong> {claim.sourceTitle}
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                <strong>Publisher:</strong> {claim.sourcePublisher} ({claim.sourceType})
              </div>
              {claim.evidenceLocator && (
                <div className="text-slate-600 dark:text-slate-400">
                  <strong>Locator:</strong> {claim.evidenceLocator}
                </div>
              )}
            </div>

            {/* Evidence Text Box */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed">
              "{claim.evidenceText}"
            </div>

            <a
              href={claim.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold"
            >
              Open Direct Official Document <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Reviewer Note Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Reviewer Audit Notes / Justification
            </label>
            <Textarea
              placeholder="Provide reason for approval, condition note, or rejection rationale..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs h-20 bg-slate-50 dark:bg-slate-950"
            />
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAction("MARK_NOT_DISCLOSED")}
              disabled={submitting}
              className="text-xs text-slate-700 dark:text-slate-300"
            >
              Mark NOT_DISCLOSED
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAction("MARK_CONDITIONAL")}
              disabled={submitting}
              className="text-xs text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-800"
            >
              Mark CONDITIONAL
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAction("REJECT")}
              disabled={submitting}
              className="text-xs text-rose-600 border-rose-300 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Reject Claim
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => handleAction(isEditing ? "EDIT_AND_APPROVE" : "APPROVE")}
              disabled={submitting}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              {isEditing ? "Save & Approve" : "Approve Claim"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
