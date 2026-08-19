import { describe, it, expect } from "vitest";
import {
  getIssuersCoverageReport,
  getMasterIssuersList,
  getMasterIssuerById,
  updateIssuerResearchStatus,
  detectDuplicateIssuers,
} from "@/services/issuer-service";

describe("Phase 3A: Master Issuer Registry & Entity Hierarchy Tests", () => {
  // 1. Coverage Report Calculation from Real Records
  it("dynamically calculates universe coverage metrics from registered entity records", async () => {
    const report = await getIssuersCoverageReport();
    expect(report.totalCandidateEntities).toBeGreaterThan(0);
    expect(report.verifiedIssuersCount).toBeGreaterThan(0);
    expect(report.totalDiscoveredCards).toBeGreaterThanOrEqual(report.totalVerifiedCards);
    expect(report.overallCoveragePercent).toBeGreaterThanOrEqual(0);
    expect(report.overallCoveragePercent).toBeLessThanOrEqual(100);
  });

  // 2. Entity Hierarchy & Classification
  it("strictly distinguishes Legal Issuers from Fintech Platforms and Co-Brand Partners", async () => {
    const federal = await getMasterIssuerById("federal-bank");
    const oneCard = await getMasterIssuerById("onecard-platform");
    const sbiCard = await getMasterIssuerById("sbi-card");

    // Federal Bank is a Legal Scheduled Commercial Bank Issuer
    expect(federal?.issuerType).toBe("PRIVATE_SECTOR_BANK");
    expect(federal?.canIssueCreditCards).toBe(true);
    expect(federal?.regulatoryStatus).toBe("RBI_SCHEDULED_COMMERCIAL_BANK");

    // OneCard is a Fintech Platform, NOT a direct card issuer
    expect(oneCard?.issuerType).toBe("FINTECH_PLATFORM");
    expect(oneCard?.canIssueCreditCards).toBe(false);
    expect(oneCard?.relationships.some((r) => r.relationType === "LEGAL_ISSUER")).toBe(true);

    // SBI Card is a specialized NBFC Card Issuer subsidiary
    expect(sbiCard?.issuerType).toBe("NBFC_CARD_ISSUER");
    expect(sbiCard?.canIssueCreditCards).toBe(true);
  });

  // 3. Regulated Non-Issuers (Payments Banks)
  it("tracks regulated non-issuers (e.g. Payments Banks) without falsely classifying them as credit card issuers", async () => {
    const paytm = await getMasterIssuerById("paytm-payments-bank");
    expect(paytm).toBeDefined();
    expect(paytm?.issuerType).toBe("NOT_A_CARD_ISSUER");
    expect(paytm?.canIssueCreditCards).toBe(false);
    expect(paytm?.researchStatus).toBe("NOT_A_CARD_ISSUER");
    expect(paytm?.discoveredCards.length).toBe(0);
  });

  // 4. Duplicate & Alias Matching with 3-Character Guard (AUD-3A-002)
  it("detects exact, alias, and fuzzy duplicate entity names with minimum character guard", () => {
    // Exact match
    const exactMatch = detectDuplicateIssuers("HDFC Bank");
    expect(exactMatch.hasPotentialDuplicate).toBe(true);
    expect(exactMatch.matchingIssuers[0].matchType).toBe("EXACT");

    // Alias match
    const aliasMatch = detectDuplicateIssuers("Housing Development Finance Corporation Bank");
    expect(aliasMatch.hasPotentialDuplicate).toBe(true);
    expect(aliasMatch.matchingIssuers.some((m) => m.matchType === "ALIAS")).toBe(true);

    // 2-character short query should not trigger false positive fuzzy match
    const shortQuery = detectDuplicateIssuers("au");
    expect(shortQuery.matchingIssuers.filter((m) => m.matchType === "FUZZY").length).toBe(0);

    // Completely new bank
    const uniqueBank = detectDuplicateIssuers("Suryoday Small Finance Bank");
    expect(uniqueBank.hasPotentialDuplicate).toBe(false);
  });

  // 5. Research Status Transitions with Direct Source Linkage (AUD-3A-003)
  it("updates issuer research status with direct source linkage and audit notes", async () => {
    const res = await updateIssuerResearchStatus(
      "iss-au-small-finance",
      "VERIFIED",
      "Completed MITC and Zenith+ catalogue verification",
      "https://www.aubank.in/mitc-credit-cards",
    );

    expect(res.success).toBe(true);
    expect(res.issuer?.researchStatus).toBe("VERIFIED");
    expect(res.issuer?.researcherNotes).toContain("Zenith+");
    expect(res.issuer?.sources.some((s) => s.url.includes("aubank.in"))).toBe(true);

    const updated = await getMasterIssuerById("iss-au-small-finance");
    expect(updated?.researchStatus).toBe("VERIFIED");
  });

  // 6. Multi-Entity Relationship Graph with History Fields (AUD-3A-001)
  it("maps multi-bank co-issuance relationships for fintech platforms with active history timestamps", async () => {
    const oneCard = await getMasterIssuerById("onecard-platform");
    expect(oneCard?.relationships.length).toBeGreaterThanOrEqual(4);

    // Every relationship must have isActive boolean and effectiveFrom date
    for (const rel of oneCard?.relationships || []) {
      expect(rel.isActive).toBe(true);
      expect(rel.effectiveFrom).toBeDefined();
    }

    const issuersList = oneCard?.relationships.map((r) => r.relatedEntitySlug);
    expect(issuersList).toContain("federal-bank");
    expect(issuersList).toContain("sbm-bank-india");
    expect(issuersList).toContain("south-indian-bank");
  });

  // 7. Filtering by Issuer Category & Status
  it("filters master entities by type and research status", async () => {
    const pvtBanks = await getMasterIssuersList({ issuerType: "PRIVATE_SECTOR_BANK" });
    expect(pvtBanks.every((b) => b.issuerType === "PRIVATE_SECTOR_BANK")).toBe(true);

    const sfbBanks = await getMasterIssuersList({ issuerType: "SMALL_FINANCE_BANK" });
    expect(sfbBanks.some((b) => b.slug === "au-small-finance-bank")).toBe(true);
  });

  // 8. Federal Bank Single-Issuer Universe (Phase 3B Expanded Verification)
  it("verifies the complete Federal Bank universe across direct and co-brand relationships", async () => {
    const federal = await getMasterIssuerById("federal-bank");
    expect(federal).toBeDefined();
    expect(federal?.discoveredCards.length).toBe(5);

    const cardSlugs = federal?.discoveredCards.map((c) => c.slug);
    expect(cardSlugs).toContain("scapia-federal-bank");
    expect(cardSlugs).toContain("onecard-metal");
    expect(cardSlugs).toContain("federal-celesta");
    expect(cardSlugs).toContain("federal-imperio");
    expect(cardSlugs).toContain("federal-signet");

    // All 5 must be verified
    expect(federal?.discoveredCards.every((c) => c.isVerified)).toBe(true);
  });

  // 9. HDFC Bank Universe Discovery (Phase 3B Ingestion Gate)
  it("proves HDFC Bank candidate universe from database records without hardcoding assumptions", async () => {
    const hdfc = await getMasterIssuerById("hdfc-bank");
    expect(hdfc).toBeDefined();

    // Reconciled total discovered candidates: exactly 35 products in manifest (29 active + 6 discontinued)
    expect(hdfc?.discoveredCards.length).toBe(35);

    const activeCards = hdfc?.discoveredCards.filter((c) => c.status === "ACTIVE");
    const discontinuedCards = hdfc?.discoveredCards.filter((c) => c.status === "DISCONTINUED");

    expect(activeCards?.length).toBe(29);
    expect(discontinuedCards?.length).toBe(6);

    // Verify key network variants and co-brands
    const cardSlugs = hdfc?.discoveredCards.map((c) => c.slug);
    expect(cardSlugs).toContain("hdfc-infinia-metal");
    expect(cardSlugs).toContain("hdfc-diners-black-metal");
    expect(cardSlugs).toContain("tata-neu-infinity-hdfc");
    expect(cardSlugs).toContain("swiggy-hdfc");
    expect(cardSlugs).toContain("marriott-bonvoy-hdfc");
    expect(cardSlugs).toContain("hdfc-pixel-play");
    expect(cardSlugs).toContain("hdfc-biz-black");
    expect(cardSlugs).toContain("hdfc-infinia-plastic"); // Discontinued legacy product
    expect(cardSlugs).toContain("hdfc-solitaire"); // Discontinued legacy product
  });

  // 10. Issuer Detailed Metrics Calculation
  it("computes field-proven detailed metrics for HDFC Bank", async () => {
    const { getIssuerDetailedMetrics } = await import("@/services/issuer-service");
    const metrics = await getIssuerDetailedMetrics("hdfc-bank");

    expect(metrics).toBeDefined();
    expect(metrics?.candidateCardsCount).toBe(35);
    expect(metrics?.activeCardsCount).toBe(29);
    expect(metrics?.discontinuedCardsCount).toBe(6);
    expect(metrics?.coBrandCardsCount).toBeGreaterThanOrEqual(8);
  });

  // 11. Cryptographic Snapshot Hash Integrity Check
  it("validates that all source snapshots have genuine non-placeholder SHA-256 digests", async () => {
    const { getSnapshotsList } = await import("@/services/admin-service");
    const { isInvalidOrPlaceholderHash } = await import("@/lib/provenance/snapshot-hasher");

    const snapshots = await getSnapshotsList();
    expect(snapshots.length).toBeGreaterThan(0);

    for (const snap of snapshots) {
      // Must be 64-char valid hex string
      expect(snap.contentHash).toMatch(/^[a-f0-9]{64}$/);
      // Must not be empty-string sha256 or placeholder
      expect(isInvalidOrPlaceholderHash(snap.contentHash)).toBe(false);
    }
  });
});
