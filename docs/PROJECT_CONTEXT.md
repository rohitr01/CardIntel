# CardIntel — Project Context & Architecture Reference

**Version:** 1.0  
**Project:** CardIntel — India's Credit Card Intelligence Platform  
**Tagline:** Comprehensive, source-verified credit card database, comparison engine, and recommendation platform for India.

---

## 1. Executive Summary & Core Principles

CardIntel is a production-grade credit card intelligence and comparison platform covering the entire spectrum of Indian credit cards:
- All Indian credit card issuers (Public Sector Banks, Private Sector Banks, Foreign Banks, Small Finance Banks, NBFCs, and Fintech/App-led card platforms)
- Co-branded credit cards (Amazon, Flipkart, Swiggy, Tata Neu, IRCTC, Airline partnerships, Hotel chains, Fuel companies, etc.)
- RuPay credit cards with UPI linkage (Scan & Pay, P2M merchant payments)
- Secured & FD-backed credit cards
- Premium, Super-Premium, and Metal cards
- Business, Commercial, and Corporate cards

### Non-Negotiable Core Principles
1. **Accuracy Over Quantity**: Every material financial claim must have verifiable provenance linked directly to official bank MITC documents, official fee schedules, terms & conditions, or regulatory notices.
2. **Deterministic Arithmetic Engine**: All financial arithmetic (fees, GST, cashback, reward points, fee waivers, net annual value, numerical recommendation scoring) is strictly performed by deterministic TypeScript application code using currency-safe `Decimal` arithmetic—**never by an LLM**.
3. **Data Provenance & Claims Pipeline**: `Raw Source → Extraction → Evidence Record → Claim → Normalized Fact → Public View`.
4. **Immutability & Change Tracking**: Historical values are never silently overwritten. Field-level change events, future-effective changes, and promotional offers are tracked separately.
5. **Separation of Lifecycle States**: Discontinued, legacy, invite-only, and active cards are categorized and isolated.

---

## 2. Legal Entity & Data Architecture

The data model reflects the real-world Indian banking structure:

```text
Issuer (Legal entity / Bank / NBFC e.g. HDFC, Federal Bank, SBI Cards)
  ├── Brand (Marketing brand e.g. Sapphiro, Infinia)
  ├── Platform (Fintech app partner e.g. OneCard, Slice, Jupiter)
  ├── CoBrandPartner (Partner entity e.g. Amazon, Flipkart, IRCTC, Marriott)
  └── CardProduct (Core card catalog item)
        ├── CardVariant (Network/Edition variant)
        └── Network (RuPay, Visa, Mastercard, Amex, Diners)
```

### Complete Schema Overview (`prisma/schema/`):
- `main.prisma`: Client & datasource configuration.
- `enums.prisma`: 25+ controlled database enums (`CardStatus`, `IssuerType`, `CardProductType`, `FeeType`, `SpendCategory`, `SourceType`, `FieldState`, etc.).
- `issuer.prisma`: `Issuer`, `Brand`, `Platform`, `CoBrandPartner`, `BankRelationship`, `IssuerResearchChecklist`.
- `card.prisma`: `Network`, `Category`, `CardProduct`, `CardVariant`, `CardCategoryMap`, `CardApplicationChannel`.
- `source.prisma`: `Source`, `SourceSnapshot`, `EvidenceRecord`, `Claim`, `ClaimConflict`, `SourceAuthorityRule`.
- `fee.prisma`: `Fee`, `FeeWaiver`, `TaxConfig`.
- `reward.prisma`: `RewardProgram`, `RewardRule`, `RewardValuation`, `CashbackRule`, `MilestoneBenefit`, `WelcomeBenefit`, `RedemptionOption`, `TransferPartner`.
- `benefit.prisma`: `LoungeBenefit`, `TravelBenefit`, `FuelBenefit`, `RailwayBenefit`, `HotelBenefit`, `ForexBenefit`, `InsuranceBenefit`, `UPIBenefit`.
- `eligibility.prisma`: `EligibilityRule`, `TargetedEligibility`.
- `history.prisma`: `ChangeEvent`, `FutureChange`, `PromotionalOffer`.
- `upi.prisma`: `UPIApp`, `UPICardEligibility`, `UPIRestriction`.
- `admin.prisma`: `User`, `Account`, `Session`, `VerificationToken`, `UserPreference`, `UserFavorite`, `UserComparison`, `ApplicationTracking`, `AuditLog`, `ResearchJob`, `DuplicateCandidate`, `ProductExclusion`, `Synonym`, `MerchantCategory`, `CalculationSnapshot`, `AIUsage`, `AIModelConfig`, `AffiliateConfig`, `SearchQuery`, `RegulatoryNotice`.

---

## 3. Technology Stack & Infrastructure

- **Frontend**: Next.js 16 (App Router, Turbopack, React 19)
- **Language**: TypeScript 5 (strict mode)
- **Styling & UI**: Tailwind CSS v4, shadcn/ui, Radix UI primitives, Lucide React
- **Database**: PostgreSQL (Neon Serverless), Prisma 7 Multi-File Schema, `@prisma/adapter-neon`
- **Authentication**: Auth.js (NextAuth v5 beta) with Google OAuth + Email Magic Link + Mandatory Admin Email Allowlist
- **Validation**: Zod 4 (`src/lib/validators/index.ts`)
- **State/Tables/Charts**: `@tanstack/react-table`, `recharts`
- **Background Jobs & Research**: Trigger.dev (`ResearchJob` queue)
- **Object Storage**: S3-compatible storage (Cloudflare R2 / AWS S3) for immutable source captures & PDFs
- **Testing**: Vitest, React Testing Library, Playwright

---

## 4. Multi-Tier AI Model Routing Architecture

AI models are routed dynamically according to task complexity and cost efficiency:

| Task Type | Primary Model | Purpose |
|---|---|---|
| Architecture, Critical Reviews, High-Risk Conflicts | **Claude Opus 4.6** | Deep reasoning, conflict resolution, policy compliance |
| Primary Code Work & Refactoring | **Claude Sonnet 4.6** | Core engineering, features, business logic |
| Agent Work, Browser Automation, UI Iteration | **Gemini 3.7 Flash** | Fast agent tasks, interactive tool use |
| Web Scraping & PDF / Document Extraction | **Gemini 3.6 Flash** | Parsing MITC, fee schedules, bank product pages |
| Bulk Extraction & Classification | **Gemini 3.5 Flash** | High-throughput metadata tagging and categorizing |
| Normalization & Deduplication | **GPT-OSS 120B** | Entity matching, merchant name & taxonomy standardization |
| Complex Multi-Document Research | **Gemini 3.1 Pro** | Synthesizing cross-bank comparative research & regulatory analysis |

---

## 5. Comprehensive Card Discovery & Filter Architecture

The public card discovery, comparison, and recommendation engine supports deep, multi-faceted filtering:

### 1. Identity & Issuance
- **Bank / Legal Issuer**: Multi-select across 50+ Indian banks & issuers (HDFC, SBI, ICICI, Axis, Kotak, IDFC FIRST, IndusInd, RBL, YES, AU, Federal, PNB, BOBCARD, etc.)
- **Card Brand / App**: Fintech platforms (OneCard, Slice, Scapia, Kiwi, Jupiter, Fi, etc.)
- **Co-Brand Partner**: Amazon, Flipkart, Swiggy, Tata Neu, PhonePe, IndiGo, IRCTC, Marriott, EazyDiner, ixigo, HPCL, BPCL, IndianOil, Myntra, Reliance, Apollo, etc.
- **Network**: RuPay, Visa, Mastercard, American Express, Diners Club

### 2. Eligibility Filters (Exposed in UI)
- **Monthly & Annual Income**: Distinguishing disclosed thresholds from undisclosed requirements
- **Credit Score / CIBIL**: 550+, 600+, 650+, 700+, 750+, 800+, New to Credit (with explicit toggle for undisclosed score requirements—never inventing CIBIL numbers)
- **Employment Type**: Salaried, Self-employed, Business owner, Professional, Student, Defence, Government employee, Retired, Homemaker, NRI
- **Age**: Minimum and maximum age ranges
- **FD / Secured Requirement**: All, Unsecured only, FD-backed only, with minimum FD amount brackets (₹5k, ₹10k, ₹20k, ₹25k, ₹50k, ₹1L+)
- **Existing Customer Requirement**: Required vs Open to All

### 3. Cost & Fees
- **Joining & Annual Fee Brackets**: ₹0 (LTF), ₹0–₹500, ₹500–₹1,000, ₹1,000–₹2,500, ₹2,500–₹5,000, ₹5,000+
- **Lifetime Free (LTF)**
- **Fee Waiver Availability & Spend Thresholds**
- **Forex Markup Fee**: 0% Zero Forex, <1%, 1–2%, 2–3%, 3%+

### 4. Rewards & Benefits
- **Cashback**: Base cashback vs accelerated maximum cashback (1%+, 2%+, 3%+, 5%+, 10%+)
- **Reward Points & Miles**: Earning rates, caps, redemption value, airline/hotel transfer partners
- **UPI**: RuPay + UPI supported, UPI cashback, UPI rewards, UPI + LTF
- **Fuel**: Fuel surcharge waiver, fuel rewards, network-specific (IOCL, HPCL, BPCL)
- **Shopping & Food**: Merchant-specific rules (Amazon, Flipkart, Swiggy, Zomato, etc.)
- **Airport Lounge**: Domestic, International, Priority Pass, unlimited, spend-based vs no-spend condition
- **Railway**: IRCTC discounts, railway lounge access, booking rewards
- **Travel & Hotel**: Free night certificates, status upgrades, flight discounts

### 5. Preference Modes & Filtering Logic
- **Must-Have vs Nice-to-Have**: Hard filters eliminate non-compliant cards before soft scoring
- **Negative / Exclusion Filters**: Exclude annual fees > ₹X, exclude forex > Y%, exclude specific banks or co-brands
- **"Check Cards for Me" Profile Matching**: Automatic eligibility evaluation based on user income, age, employment, CIBIL, and spend profile

---

## 6. Phased Implementation Roadmap

- **Phase 1A — Core Foundation**: Database schema, type-safe Prisma client, Auth.js with Google OAuth & admin allowlist, issuer & card CRUD services, source & claim architecture.
- **Phase 1B — Public Product**: Smart search with synonym expansion, multi-facet card filters, card catalog & detail pages (`/cards`, `/cards/[slug]`), issuer registry (`/issuers`, `/issuers/[slug]`).
- **Phase 1C — Comparison Engine**: Side-by-side comparison matrix (up to 5 cards), feature matrix with best-value highlights, dual comparison modes (select cards vs find cards).
- **Phase 1D — Verification & Administration**: Source snapshot viewer, claim verification queue, conflict resolution workflow, change history feed, and data quality dashboards.
- **Phase 2 — Intelligence**: Deterministic reward calculator, multi-factor recommendation engine with transparent "Why this card?" / "Watch out" explanations.
- **Phase 3 — Research & Automation**: Trigger.dev background pipeline, discovery agents, link health checks, and change detection.
- **Phase 4 — Scale & Polish**: Comprehensive test suite (Vitest + Playwright), programmatic SEO, and performance optimization.