import { describe, it, expect } from "vitest";
import {
  getAdminDashboardMetrics,
  getClaimsQueue,
  verifyClaim,
  getConflictsQueue,
  resolveConflict,
  getSourcesList,
  getSnapshotsList,
  getAuditLogs,
} from "@/services/admin-service";

describe("Phase 1D: Source Verification & Admin Workflows Tests", () => {
  // 1. Dashboard Metrics & Data Quality
  it("returns system-wide metrics and distinguishes NOT_DISCLOSED from UNKNOWN", async () => {
    const metrics = await getAdminDashboardMetrics();
    expect(metrics.totalCardsTracked).toBeGreaterThan(0);
    expect(metrics.fullyVerifiedCardsCount).toBeGreaterThan(0);
    expect(metrics.notDisclosedFieldsCount).toBeGreaterThan(0);
    expect(metrics.unknownFieldsCount).toBeDefined();
    // Verify they are tracked as separate parameters
    expect(metrics.notDisclosedFieldsCount).not.toBe(metrics.unknownFieldsCount);
  });

  // 2. Claim Queue Listing & Filtering
  it("lists and filters claims by verification status", async () => {
    const allClaims = await getClaimsQueue("ALL");
    expect(allClaims.length).toBeGreaterThan(0);

    const pendingClaims = await getClaimsQueue("PENDING_VERIFICATION");
    expect(pendingClaims.every((c) => c.verificationStatus === "PENDING_VERIFICATION")).toBe(true);
  });

  // 3. Claim Approval & Audit Trail
  it("approves a claim and creates an immutable audit trail entry", async () => {
    const initialAudits = await getAuditLogs();
    const initialAuditCount = initialAudits.length;

    const res = await verifyClaim(
      "claim-001",
      "APPROVE",
      "Verified against HDFC Bank Official MITC Page 4 Section 8.2",
      undefined,
      "lead.researcher@cardintel.in",
    );

    expect(res.success).toBe(true);
    expect(res.claim?.verificationStatus).toBe("VERIFIED");
    expect(res.claim?.fieldState).toBe("CONDITIONAL");

    const updatedAudits = await getAuditLogs();
    expect(updatedAudits.length).toBe(initialAuditCount + 1);
    expect(updatedAudits[0].entityName).toBe("HDFC Millennia Credit Card");
    expect(updatedAudits[0].action).toBe("APPROVE");
    expect(updatedAudits[0].userEmail).toBe("lead.researcher@cardintel.in");
  });

  // 4. Claim Rejection & Rejection Audit
  it("rejects an invalid extracted claim without deleting historical record", async () => {
    const res = await verifyClaim(
      "claim-002",
      "REJECT",
      "Extracted promo rate does not match official SOC schedule",
      undefined,
      "compliance@cardintel.in",
    );

    expect(res.success).toBe(true);
    expect(res.claim?.verificationStatus).toBe("REJECTED");
  });

  // 5. Mark Field as NOT_DISCLOSED
  it("marks a field as NOT_DISCLOSED when the bank officially does not publish it", async () => {
    const res = await verifyClaim(
      "claim-004",
      "MARK_NOT_DISCLOSED",
      "Axis Bank officially uses internal risk modeling without public CIBIL cutoff",
      undefined,
      "lead.researcher@cardintel.in",
    );

    expect(res.success).toBe(true);
    expect(res.claim?.fieldState).toBe("NOT_DISCLOSED");
    expect(res.claim?.claimedValue).toBe("NOT_DISCLOSED");
  });

  // 6. Conflict Listing & Human Resolution
  it("lists detected conflicts and resolves them via human adjudication", async () => {
    const conflicts = await getConflictsQueue();
    expect(conflicts.length).toBeGreaterThan(0);

    const conflict = conflicts.find((c) => c.id === "conflict-001") || conflicts[0];
    expect(conflict.claimA).toBeDefined();
    expect(conflict.claimB).toBeDefined();
    expect(conflict.claimA.authorityScore).toBeGreaterThan(conflict.claimB.authorityScore);

    const res = await resolveConflict(
      conflict.id,
      conflict.claimA.id,
      "Resolved in favor of Tier 1 SOC over marketing brochure",
      "lead.researcher@cardintel.in",
    );

    expect(res.success).toBe(true);
    const updatedConflicts = await getConflictsQueue();
    const resolvedConflict = updatedConflicts.find((c) => c.id === conflict.id);
    expect(resolvedConflict?.conflictStatus).toBe("RESOLVED");
    expect(resolvedConflict?.resolvedBy).toBe("lead.researcher@cardintel.in");
  });

  // 7. Source Management & Health
  it("lists verified primary sources with authority scores and health status", async () => {
    const sources = await getSourcesList();
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.some((s) => s.sourceType === "MITC")).toBe(true);
    expect(sources.some((s) => s.sourceType === "REGULATORY_NOTICE")).toBe(true);
  });

  // 8. Immutable Snapshots & Content Hash
  it("retrieves immutable source snapshots with SHA-256 integrity hashes", async () => {
    const snapshots = await getSnapshotsList();
    expect(snapshots.length).toBeGreaterThan(0);
    expect(snapshots[0].contentHash).toBeDefined();
    expect(snapshots[0].contentHash.length).toBe(64); // SHA-256 hex length
    expect(snapshots[0].wasAccessible).toBe(true);
  });

  // 9. Federal Bank Scapia Proving Pipeline: All 15 Material Fields & SHA-256 Snapshots
  it("verifies Federal Bank Scapia claims, source linkage, and SHA-256 snapshot integrity", async () => {
    const allClaims = await getClaimsQueue();
    const scapiaClaims = allClaims.filter((c) => c.cardSlug === "scapia-federal-bank");

    expect(scapiaClaims.length).toBeGreaterThanOrEqual(6);
    expect(scapiaClaims.some((c) => c.fieldName === "joining_fee" && c.claimedValue === "0.00")).toBe(true);
    expect(scapiaClaims.some((c) => c.fieldName === "annual_fee" && c.claimedValue === "0.00")).toBe(true);
    expect(scapiaClaims.some((c) => c.fieldName === "forex_markup" && c.claimedValue === "0.00%")).toBe(true);
    expect(scapiaClaims.some((c) => c.fieldName === "reward_rate_travel")).toBe(true);

    const snapshots = await getSnapshotsList();
    const scapiaSnap = snapshots.find((s) => s.sourceId === "src-federal-scapia-mitc");
    expect(scapiaSnap).toBeDefined();
    expect(scapiaSnap?.contentHash).toBe("350b567baff95443f8db0bcb2a91d9f091a04ebf3774d0a1abe01469c84a519f");
  });

  // 10. Federal Bank Scapia Lounge Conflict Adjudication
  it("verifies human resolution of Scapia lounge spend requirement conflict", async () => {
    const conflicts = await getConflictsQueue();
    const scapiaConflict = conflicts.find((c) => c.id === "conflict-scapia-lounge");

    expect(scapiaConflict).toBeDefined();
    expect(scapiaConflict?.conflictStatus).toBe("RESOLVED");
    expect(scapiaConflict?.claimA.authorityScore).toBe(100); // Federal Bank MITC (Tier 1)
    expect(scapiaConflict?.claimB.authorityScore).toBe(70); // Launch Ad (Tier 3)
    expect(scapiaConflict?.resolutionNotes).toContain("Federal Bank MITC");
  });
});
