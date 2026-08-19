"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Layers,
  ArrowRight,
  FileText,
  CreditCard,
  Network,
  Tag,
  CheckSquare,
  Square,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateIssuerResearchStatus, type MasterIssuerRecord, type MasterResearchStatus } from "@/services/issuer-service";
import { cn } from "@/lib/utils";

interface IssuerDetailViewProps {
  issuer: MasterIssuerRecord;
}

export function IssuerDetailView({ issuer: initialIssuer }: IssuerDetailViewProps) {
  const [issuer, setIssuer] = useState<MasterIssuerRecord>(initialIssuer);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: MasterResearchStatus) => {
    setIsUpdating(true);
    try {
      const res = await updateIssuerResearchStatus(issuer.id, newStatus, `Status updated by researcher to ${newStatus}`);
      if (res.success && res.issuer) {
        setIssuer(res.issuer);
        setNotification(`Research status updated to ${newStatus}`);
        setTimeout(() => setNotification(null), 4000);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Back Link */}
      <div>
        <Link
          href="/admin/coverage"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Universe Registry
        </Link>
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

      {/* Header Profile */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] font-bold border-blue-400 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950/40">
                {issuer.issuerType.replace(/_/g, " ")}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-bold border-slate-300 dark:border-slate-700">
                {issuer.regulatoryStatus.replace(/_/g, " ")}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-bold",
                  issuer.researchStatus === "VERIFIED"
                    ? "border-emerald-400 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
                    : "border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-300",
                )}
              >
                {issuer.researchStatus}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              {issuer.commonName}
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Legal Entity: {issuer.legalName}
            </p>
          </div>

          {/* Quick External Links */}
          <div className="flex items-center gap-2">
            <a
              href={issuer.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "text-xs font-semibold inline-flex items-center gap-1.5",
              )}
            >
              Official Website <ExternalLink className="h-3 w-3" />
            </a>
            {issuer.officialCardPageUrl && (
              <a
                href={issuer.officialCardPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "text-xs bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-semibold inline-flex items-center gap-1.5",
                )}
              >
                Card Catalogue <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Headquarters</span>
            <span className="font-bold text-slate-900 dark:text-white">{issuer.headquarters}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">CIN Number</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{issuer.cin || "N/A"}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">RBI Reference</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{issuer.rbiRegistrationNumber || "Regulated"}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Credit Card Issuing Authority</span>
            <span className={cn("font-bold", issuer.canIssueCreditCards ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
              {issuer.canIssueCreditCards ? "Authorized Legal Issuer" : "Non-Issuing Entity"}
            </span>
          </div>
        </div>
      </div>

      {/* Entity Relationship Graph */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Entity Relationship Graph (Legal Issuer → Brands → Platforms → Co-Brands)
          </h2>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          This mapping decouples legal issuing banks from marketing brands and fintech technology platforms.
        </p>

        {issuer.relationships.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 italic">
            Direct issuer operations without third-party platform or brand intermediaries.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {issuer.relationships.map((rel) => (
              <div
                key={rel.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {rel.relatedEntityName}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-bold border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300">
                    {rel.relationType}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {rel.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discovered Cards Inventory */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Discovered Card Products ({issuer.discoveredCards.length})
            </h2>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            {issuer.discoveredCards.filter((c) => c.isVerified).length} Verified Claims
          </span>
        </div>

        {issuer.discoveredCards.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 italic">
            No credit card products discovered under this entity.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {issuer.discoveredCards.map((card) => (
              <div key={card.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block text-sm">
                    {card.name}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] border-slate-300 dark:border-slate-700">
                      {card.cardType}
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Slug: {card.slug}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-bold",
                      card.isVerified
                        ? "border-emerald-400 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
                        : "border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-300",
                    )}
                  >
                    {card.isVerified ? "Claims Verified" : "Pending Research"}
                  </Badge>
                  <Link
                    href={`/cards/${card.slug}`}
                    className={cn(
                      buttonVariants({ size: "sm", variant: "outline" }),
                      "text-xs h-7 px-2",
                    )}
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Research Checklist & Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Research Verification Checklist */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Research Verification Checklist
            </h2>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { label: "Official Bank Website Verified", checked: issuer.checklist.websiteChecked },
              { label: "Product Catalogue Scanned", checked: issuer.checklist.productCatalogueChecked },
              { label: "Schedule of Charges (SOC) Archived", checked: issuer.checklist.feesChecked },
              { label: "Most Important Terms & Conditions (MITC) Verified", checked: issuer.checklist.mitcChecked },
              { label: "Co-Brand Partnerships Identified", checked: issuer.checklist.coBrandChecked },
              { label: "Business/Corporate Cards Examined", checked: issuer.checklist.businessCardsChecked },
              { label: "Secured / FD-Backed Cards Examined", checked: issuer.checklist.securedCardsChecked },
              { label: "RuPay UPI Functionality Verified", checked: issuer.checklist.rupayUpiChecked },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {item.label}
                </span>
                {item.checked ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Clock className="h-4 w-4 text-slate-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Primary Sources & Citations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Registered Primary Sources ({issuer.sources.length})
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {issuer.sources.map((src, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300">
                    {src.sourceType} • Authority: {src.authorityScore}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    {new Date(src.lastVerifiedAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {src.title}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Publisher: {src.publisher}
                </p>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-semibold mt-1"
                >
                  Open Official Document <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Researcher Action Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Researcher Status Adjudication
        </h2>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <Button
            size="sm"
            onClick={() => handleStatusChange("VERIFIED")}
            disabled={isUpdating}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            Mark as Fully Verified
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange("PARTIALLY_VERIFIED")}
            disabled={isUpdating}
            className="border-blue-300 text-blue-700 dark:border-blue-800 dark:text-blue-300"
          >
            Mark Partially Verified
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange("NEEDS_REVIEW")}
            disabled={isUpdating}
            className="border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-300"
          >
            Flag for Review
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange("NOT_A_CARD_ISSUER")}
            disabled={isUpdating}
            className="border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400"
          >
            Confirm Non-Issuer
          </Button>
        </div>
      </div>
    </div>
  );
}
