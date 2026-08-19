# CardIntel — High-Risk Architecture & Financial-Data Audit Report (Opus 4.6 Review)

**Audit Version:** 1.0 (Pre-Phase 3 Gate)  
**Date:** August 2026  
**Auditor:** High-Risk Financial & Architectural Review  
**Subject:** CardIntel Core Calculation Engine, Data Models, Provenance Integrity, and Production Safety.

---

## Executive Summary

> **Core Principle:** *"The software is verified" $\ne$ "the financial dataset is verified."*

This audit reviews the complete implementation across 10 functional subsystems to ensure that the platform is mathematically watertight, compliant with Indian regulatory directives (RBI Master Direction 2022/2024, GST Council), and architecturally prepared to transition from prototype switch-cases to a dynamic, database-driven **Claim $\to$ Evidence $\to$ Source $\to$ Effective-Date** ingestion pipeline in Phase 3.

---

## Issue Classification & Summary Matrix

| Issue ID | Dimension | Finding | Severity | File Reference |
| :--- | :--- | :--- | :--- | :--- |
| **AUD-001** | Reward Engine | Hardcoded card slug branches in `reward-engine.ts` | `HIGH` | [`src/lib/calculator/reward-engine.ts`](file:///c:/Users/ROHITROHAJ/Downloads/NewGen-main/NewGen-main/cardintel/src/lib/calculator/reward-engine.ts#L36-L350) |
| **AUD-002** | Lounge & Milestones | Hardcoded spend conditions in `lounge-engine.ts` & `milestone-engine.ts` | `MEDIUM` | [`src/lib/calculator/lounge-engine.ts`](file:///c:/Users/ROHITROHAJ/Downloads/NewGen-main/NewGen-main/cardintel/src/lib/calculator/lounge-engine.ts#L42), [`milestone-engine.ts`](file:///c:/Users/ROHITROHAJ/Downloads/NewGen-main/NewGen-main/cardintel/src/lib/calculator/milestone-engine.ts#L29) |
| **AUD-003** | Data Isolation | Demo data banner and fallback flag visibility | `MEDIUM` | [`src/services/card-service.ts`](file:///c:/Users/ROHITROHAJ/Downloads/NewGen-main/NewGen-main/cardintel/src/services/card-service.ts#L8) |
| **AUD-004** | GST & Tax Config | GST 18% constant vs configurable tax rate from card schema | `LOW` | [`src/lib/calculator/fee-engine.ts`](file:///c:/Users/ROHITROHAJ/Downloads/NewGen-main/NewGen-main/cardintel/src/lib/calculator/fee-engine.ts#L17) |
| **AUD-005** | Effective Dates | Calculator operates on current rules without historical point-in-time toggle | `LOW` | [`src/lib/calculator/spend-engine.ts`](file:///c:/Users/ROHITROHAJ/Downloads/NewGen-main/NewGen-main/cardintel/src/lib/calculator/spend-engine.ts#L32) |
| **AUD-006** | Currency Precision | Floating-point safety in currency math | `PASSED` | [`src/lib/utils/money.ts`](file:///c:/Users/ROHITROHAJ/Downloads/NewGen-main/NewGen-main/cardintel/src/lib/utils/money.ts#L35) |
| **AUD-007** | Lounge Valuation | Decoupling of subjective lounge rupee estimates | `PASSED` | [`src/lib/calculator/lounge-engine.ts`](file:///c:/Users/ROHITROHAJ/Downloads/NewGen-main/NewGen-main/cardintel/src/lib/calculator/lounge-engine.ts#L60) |
| **AUD-008** | Conflict & NOT_DISCLOSED | Strict decoupling of `NOT_DISCLOSED` from `UNKNOWN` | `PASSED` | [`src/services/admin-service.ts`](file:///c:/Users/ROHITROHAJ/Downloads/NewGen-main/NewGen-main/cardintel/src/services/admin-service.ts#L490) |

---

## Detailed Audit Findings

---

### Issue AUD-001: Hardcoded Card Slug Branches in Reward Engine
* **Severity:** `HIGH`
* **Evidence / File Reference:**
  [`src/lib/calculator/reward-engine.ts:36-350`](file:///c:/Users/ROHITROHAJ/Downloads/NewGen-main/NewGen-main/cardintel/src/lib/calculator/reward-engine.ts#L36-L350)
  ```typescript
  if (card.slug === "hdfc-millennia") { ... }
  else if (card.slug === "sbi-cashback") { ... }
  else if (card.slug === "icici-amazon-pay") { ... }
  else if (card.slug === "tata-neu-infinity-hdfc") { ... }
  else if (card.slug === "axis-airtel") { ... }
  else if (card.slug === "hdfc-infinia-metal") { ... }
  ```
* **Risk Analysis:**
  During Phase 2, card-specific rules were implemented directly in TypeScript to enable deterministic testing. While mathematically exact, this switch-case pattern cannot scale to 500+ Indian credit cards in Phase 3 without code modifications. Moreover, when a bank updates a reward multiplier or category ceiling (e.g. Swiggy cashback devaluations), updating the platform should only require publishing a new approved `Claim` in `/admin`, not deploying a TypeScript code change.
* **Recommended Fix (for Sonnet in Phase 3A):**
  Implement a dynamic `DynamicRewardRuleEvaluator` that iterates over `card.rewardPrograms.rewardRules` and `card.cashbackRules` loaded from Prisma:
  1. Match transaction spend category against rule's MCC or category slug.
  2. Apply multiplier (`rule.pointsPerUnitSpend` / `rule.spendUnit` or `rule.percentage`).
  3. Apply monthly cap (`rule.maxPointsCapPerBillingCycle` or `rule.maxCashbackCap`).
  4. Deduct excluded MCCs (`rule.excludedCategories`).
  5. Convert points to cash using `program.valuations.redemptionRate`.
* **Tests Required:**
  * Test dynamic evaluation of arbitrary reward rules loaded from Prisma without checking `card.slug`.
  * Test rule-based cap exhaustion on dynamic rules.

---

### Issue AUD-002: Hardcoded Lounge & Milestone Spend Conditions
* **Severity:** `MEDIUM`
* **Evidence / File Reference:**
  [`src/lib/calculator/lounge-engine.ts:42`](file:///c:/Users/ROHITROHAJ/Downloads/NewGen-main/NewGen-main/cardintel/src/lib/calculator/lounge-engine.ts#L42):
  ```typescript
  if (card.slug === "hdfc-millennia" && quarterlySpendNum < 100000) {
    spendConditionMet = false;
  }
  ```
  [`src/lib/calculator/milestone-engine.ts:29`](file:///c:/Users/ROHITROHAJ/Downloads/NewGen-main/NewGen-main/cardintel/src/lib/calculator/milestone-engine.ts#L29):
  ```typescript
  if (card.slug === "hdfc-millennia") { ... }
  ```
* **Risk Analysis:**
  If another card (e.g. ICICI Coral or SBI Prime) introduces a quarterly spend condition for lounge access, it would require modifying TypeScript code rather than reading `card.loungeBenefits.spendConditionThreshold`.
* **Recommended Fix:**
  Read `loungeBenefit.spendThresholdAmount` and `loungeBenefit.spendPeriod` directly from the `LoungeBenefit` model. Similarly, ensure `milestone-engine.ts` relies exclusively on the generic `card.milestoneBenefits` array.
* **Tests Required:**
  * Test spend condition gating using `loungeBenefit.spendThresholdAmount` on non-hardcoded card objects.

---

### Issue AUD-003: Demo Sandbox vs Production Database Isolation
* **Severity:** `MEDIUM`
* **Evidence / File Reference:**
  [`src/services/card-service.ts:8-15`](file:///c:/Users/ROHITROHAJ/Downloads/NewGen-main/NewGen-main/cardintel/src/services/card-service.ts#L8-L15)
* **Risk Analysis:**
  `card-service.ts` currently falls back to `demoCards` when the database count is 0. If a database is partially populated with 1 real card, the remaining 9 demo cards would disappear.
* **Recommended Fix:**
  Add an explicit environment flag or source provenance filter (`isProductionVerified = true`) so that when the production database is seeded in Phase 3, the demo fallback is completely disabled and only verified claims are served.
* **Tests Required:**
  * Verify that unverified demo records cannot be returned when `NODE_ENV === "production"` and database is populated.

---

### Issue AUD-004: Configurable GST Rate vs Constant
* **Severity:** `LOW`
* **Evidence / File Reference:**
  [`src/lib/calculator/fee-engine.ts:17`](file:///c:/Users/ROHITROHAJ/Downloads/NewGen-main/NewGen-main/cardintel/src/lib/calculator/fee-engine.ts#L17)
* **Risk Analysis:**
  `gstApplicable ? 18 : 0` assumes the current Indian GST rate of 18%. While 18% is standard across Indian banking services, future regulatory tax amendments would require a code update if not parameterized.
* **Recommended Fix:**
  Keep 18% as the default constant, but read `fee.gstRatePercent` from `Fee` schema when available.
* **Tests Required:**
  * Test fee calculation with custom tax rate (e.g. 0% or 18%).

---

### Issue AUD-005: Historical Versioning & Effective Dates in Calculator
* **Severity:** `LOW`
* **Evidence / File Reference:**
  [`src/lib/calculator/spend-engine.ts`](file:///c:/Users/ROHITROHAJ/Downloads/NewGen-main/NewGen-main/cardintel/src/lib/calculator/spend-engine.ts)
* **Risk Analysis:**
  The calculator currently evaluates the latest active card rules. If a user wants to calculate historical rewards for a past calendar year (e.g. pre-devaluation), the calculator needs to accept an optional `evaluationDate: Date` parameter to select the active claim version as of that date.
* **Recommended Fix:**
  Add an optional `asOfDate?: string` to `ValuationConfig` so that claims with `effectiveFrom <= asOfDate && (effectiveTo == null || effectiveTo > asOfDate)` are selected.
* **Tests Required:**
  * Test calculator evaluation as of a past date before a fee hike.

---

## 3. Subsystem Health & Mathematical Verification

### 3.1 Currency Arithmetic (`src/lib/utils/money.ts`)
* ✅ **Zero Floating-Point Drift**: All additions, subtractions, and multiplications use `Prisma.Decimal`.
* ✅ **Indian Currency Formatter**: Correctly formats amounts with Lakh/Crore separation (`₹1,50,000.00`).
* ✅ **Safe Zero & Negative Handlers**: Safe handling of ₹0 spends and negative net values without division by zero.

### 3.2 Lounge Benefit Separation
* ✅ **Strict Decoupling**: Rupee value is NEVER silently added to cash benefits. Cash-equivalent value is reported separately from optional benefits.
* ✅ **Valuation Tiers**: Conservative (₹0) / Standard (₹500) / Custom.

### 3.3 Data Quality & Provenance Taxonomy
* ✅ **NOT_DISCLOSED vs UNKNOWN**: Strictly decoupled in `/admin/data-quality` and comparison definitions.
* ✅ **Conflict Resolution**: Dedicated human adjudication workflow in `/admin/conflicts` preventing AI hallucination of financial facts.
* ✅ **Immutable Snapshots**: SHA-256 cryptographically hashed captures stored in append-only records.

---

## 4. Remediation Plan (for Sonnet 4.6 Fixes)

1. **Refactor `reward-engine.ts`**:
   Introduce `evaluateGenericRewardRules()` to consume `RewardRule[]` dynamically from Prisma. Keep the existing hardcoded handlers as secondary fallbacks for legacy demo cards.
2. **Refactor `lounge-engine.ts` & `milestone-engine.ts`**:
   Read `spendThresholdAmount` and `spendPeriod` from the model rather than matching `card.slug`.
3. **Add `asOfDate` parameter to Calculator**:
   Allow point-in-time calculation based on effective dates.
4. **Environment Isolation Guard**:
   Add `DATA_ENVIRONMENT` verification to guarantee demo data is never served as canonical production data.

---

## 5. Phase 3 Ingestion Readiness Gate

With the identification of the above 4 structural refactors, the architectural foundation of CardIntel is verified. 

**Next Action:** Proceed to implement the dynamic rule refactors via Sonnet 4.6, re-verify with tests and build, and then initialize **Phase 3: Research & Ingestion Platform** (starting with the Issuer Registry & Coverage Table).
