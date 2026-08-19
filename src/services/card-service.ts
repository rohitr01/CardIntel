/**
 * CardIntel — Card Service
 *
 * Core card CRUD, multi-faceted filtering, and search operations.
 * Reads from PostgreSQL (Prisma) with transparent fallback to `src/data/demo/cards.ts`
 * when database records are not yet populated.
 *
 * NOTE: Demo records are strictly marked with `demoRecord: true` and are never
 * falsely marked as verified claims.
 */

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { CardFilters } from "@/lib/validators";
import { demoCards, type DemoCard } from "@/data/demo/cards";

// ---------------------------------------------------------------------------
// Full card includes for detail pages
// ---------------------------------------------------------------------------

export const cardDetailInclude = {
  issuer: { select: { id: true, name: true, shortName: true, slug: true, issuerType: true, logoUrl: true } },
  brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
  platform: { select: { id: true, name: true, slug: true, logoUrl: true } },
  coBrandPartner: { select: { id: true, name: true, slug: true, logoUrl: true } },
  network: { select: { id: true, name: true, slug: true, type: true } },
  categories: { include: { category: true } },
  variants: true,
  fees: { orderBy: { feeType: "asc" as const } },
  feeWaivers: true,
  rewardPrograms: { include: { rewardRules: true, valuations: true } },
  rewardRules: { orderBy: { priority: "desc" as const } },
  cashbackRules: true,
  milestoneBenefits: true,
  welcomeBenefits: true,
  redemptionOptions: true,
  transferPartners: true,
  loungeBenefits: true,
  travelBenefits: true,
  fuelBenefits: true,
  railwayBenefits: true,
  hotelBenefits: true,
  forexBenefits: true,
  insuranceBenefits: true,
  upiBenefits: true,
  eligibilityRules: true,
  targetedEligibility: true,
  applicationChannels: true,
  promotionalOffers: { where: { isCurrentlyActive: true } },
  futureChanges: { where: { isApplied: false } },
  claims: {
    include: {
      source: true,
      evidence: true,
    },
  },
} satisfies Prisma.CardProductInclude;

// Lighter include for list pages
export const cardListInclude = {
  issuer: { select: { id: true, name: true, shortName: true, slug: true, issuerType: true, logoUrl: true } },
  network: { select: { id: true, name: true, slug: true, type: true } },
  coBrandPartner: { select: { id: true, name: true, slug: true } },
  categories: { include: { category: { select: { name: true, slug: true, type: true } } } },
  fees: {
    where: { feeType: { in: ["JOINING", "ANNUAL"] } },
    select: { feeType: true, amount: true, gstApplicable: true, fieldState: true },
  },
  feeWaivers: {
    select: { waiverType: true, isLifetimeFree: true, spendThreshold: true, spendPeriod: true },
  },
  upiBenefits: { select: { upiEnabled: true } },
  loungeBenefits: { select: { domesticVisitsPerYear: true, hasPriorityPass: true } },
  forexBenefits: { select: { isZeroForex: true, forexMarkup: true } },
  fuelBenefits: { select: { fuelSurchargeWaiver: true } },
} satisfies Prisma.CardProductInclude;

// ---------------------------------------------------------------------------
// Read Operations (with Demo fallback)
// ---------------------------------------------------------------------------

export async function getCards(filters: CardFilters) {
  try {
    const where = buildCardWhereClause(filters);
    const orderBy = buildCardOrderBy(filters.sort);

    const [cards, total] = await Promise.all([
      db.cardProduct.findMany({
        where,
        include: cardListInclude,
        orderBy,
        skip: ((filters.page || 1) - 1) * (filters.pageSize || 20),
        take: filters.pageSize || 20,
      }),
      db.cardProduct.count({ where }),
    ]);

    if (total > 0) {
      return {
        data: cards,
        total,
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
        totalPages: Math.ceil(total / (filters.pageSize || 20)),
        isDemoData: false,
      };
    }
  } catch (error) {
    console.warn("Database query failed or is unseeded, serving from demo dataset:", error);
  }

  // Fallback to demo dataset
  return getDemoCards(filters);
}

export async function getCardBySlug(slug: string) {
  try {
    const card = await db.cardProduct.findUnique({
      where: { slug },
      include: cardDetailInclude,
    });
    if (card) return { card, isDemoData: false };
  } catch (error) {
    console.warn(`Database query for slug '${slug}' failed:`, error);
  }

  const demoCard = demoCards.find((c) => c.slug === slug);
  if (demoCard) {
    return { card: demoCard, isDemoData: true };
  }
  return null;
}

export async function getCardById(id: string) {
  try {
    const card = await db.cardProduct.findUnique({
      where: { id },
      include: cardDetailInclude,
    });
    if (card) return { card, isDemoData: false };
  } catch (error) {
    console.warn(`Database query for id '${id}' failed:`, error);
  }

  const demoCard = demoCards.find((c) => c.id === id);
  if (demoCard) {
    return { card: demoCard, isDemoData: true };
  }
  return null;
}

export async function getCardsByIssuer(issuerId: string) {
  try {
    return await db.cardProduct.findMany({
      where: { issuerId, deletedAt: null },
      include: cardListInclude,
      orderBy: { officialName: "asc" },
    });
  } catch {
    return demoCards.filter((c) => c.issuer.slug === issuerId);
  }
}

export async function getCardsForComparison(slugs: string[]) {
  try {
    const cards = await db.cardProduct.findMany({
      where: { slug: { in: slugs }, deletedAt: null },
      include: cardDetailInclude,
    });
    if (cards.length > 0) return cards;
  } catch (error) {
    console.warn("getCardsForComparison database query failed:", error);
  }
  return demoCards.filter((c) => slugs.includes(c.slug));
}

export async function getSimilarCards(slugOrId: string, limit = 4) {
  const currentCard = demoCards.find((c) => c.slug === slugOrId || c.id === slugOrId);
  if (currentCard) {
    return demoCards
      .filter((c) => c.slug !== currentCard.slug)
      .filter(
        (c) =>
          c.issuer.slug === currentCard.issuer.slug ||
          c.categories.some((cat) => currentCard.categories.some((cc) => cc.slug === cat.slug)) ||
          c.network.type === currentCard.network.type,
      )
      .slice(0, limit);
  }
  return demoCards.filter((c) => c.slug !== slugOrId).slice(0, limit);
}

// ---------------------------------------------------------------------------
// Demo Filter Engine (InMemory)
// ---------------------------------------------------------------------------

function getDemoCards(filters: CardFilters) {
  let filtered = [...demoCards];

  // Search query (keyword)
  if (filters.q && filters.q.trim()) {
    const q = filters.q.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.officialName.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.issuer.name.toLowerCase().includes(q) ||
        c.network.name.toLowerCase().includes(q) ||
        c.categories.some((cat) => cat.name.toLowerCase().includes(q)) ||
        c.bestFor.some((b) => b.toLowerCase().includes(q)),
    );
  }

  // Banks / Issuers
  const issuers = filters.issuers || (filters.issuerSlug ? [filters.issuerSlug] : []);
  if (issuers.length > 0) {
    filtered = filtered.filter((c) =>
      issuers.some(
        (slug) =>
          c.issuer.slug.toLowerCase().includes(slug.toLowerCase()) ||
          slug.toLowerCase().includes(c.issuer.slug.toLowerCase()),
      ),
    );
  }

  // Co-Brands
  if (filters.coBrands && filters.coBrands.length > 0) {
    filtered = filtered.filter(
      (c) => c.coBrandPartner && filters.coBrands!.includes(c.coBrandPartner.slug),
    );
  }

  // Networks
  const networks = filters.networkTypes || (filters.networkType ? [filters.networkType] : []);
  if (networks.length > 0) {
    filtered = filtered.filter((c) => networks.includes(c.network.type));
  }

  // Categories
  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter((c) =>
      c.categories.some((cat) => filters.categories!.includes(cat.slug)),
    );
  }

  // Statuses
  const statuses = filters.statuses || (filters.status ? [filters.status] : []);
  if (statuses.length > 0) {
    filtered = filtered.filter((c) => statuses.includes(c.status));
  } else {
    // Default to active or invite only
    filtered = filtered.filter((c) => c.status === "ACTIVE" || c.status === "INVITE_ONLY");
  }

  // Lifetime Free
  if (filters.isLifetimeFree) {
    filtered = filtered.filter((c) => c.feeWaiver?.isLifetimeFree === true || c.annualFee.amount === "0.00");
  }

  // Fee Waiver Available
  if (filters.hasFeeWaiver) {
    filtered = filtered.filter(
      (c) => c.feeWaiver?.isLifetimeFree || (c.feeWaiver?.spendThreshold != null),
    );
  }

  // Max Annual Fee
  if (filters.maxAnnualFee) {
    const maxFee = Number(filters.maxAnnualFee);
    filtered = filtered.filter((c) => Number(c.annualFee.amount) <= maxFee);
  }

  // Income Filter
  if (filters.minMonthlyIncome) {
    const reqIncome = Number(filters.minMonthlyIncome);
    filtered = filtered.filter((c) => {
      if (c.eligibility.incomeFieldState === "NOT_DISCLOSED" && filters.includeUndisclosedIncome !== false) {
        return true;
      }
      if (c.eligibility.minMonthlyIncome) {
        return Number(c.eligibility.minMonthlyIncome) <= reqIncome;
      }
      return filters.includeUndisclosedIncome !== false;
    });
  }

  // CIBIL Filter
  if (filters.minCibilScore) {
    const reqCibil = filters.minCibilScore;
    filtered = filtered.filter((c) => {
      if (c.eligibility.cibilFieldState === "NOT_DISCLOSED") {
        return filters.includeUndisclosedCibil !== false;
      }
      if (c.eligibility.minCreditScore) {
        return c.eligibility.minCreditScore <= reqCibil;
      }
      return filters.includeUndisclosedCibil !== false;
    });
  }

  // Employment Type
  if (filters.employmentTypes && filters.employmentTypes.length > 0) {
    filtered = filtered.filter((c) =>
      c.eligibility.employmentTypes.some(
        (e) => e === "ANY" || filters.employmentTypes!.includes(e),
      ),
    );
  }

  // UPI
  if (filters.hasUPI) {
    filtered = filtered.filter((c) => c.upiBenefit?.upiEnabled === true || c.network.type === "RUPAY");
  }

  // Lounge Access
  if (filters.hasLounge) {
    filtered = filtered.filter((c) => c.loungeBenefits.hasLounge);
  }
  if (filters.hasDomesticLounge) {
    filtered = filtered.filter((c) => (c.loungeBenefits.domesticVisitsPerYear ?? 0) > 0 || c.loungeBenefits.domesticUnlimited);
  }
  if (filters.hasIntlLounge) {
    filtered = filtered.filter((c) => (c.loungeBenefits.internationalVisitsPerYear ?? 0) > 0 || c.loungeBenefits.internationalUnlimited);
  }
  if (filters.hasPriorityPass) {
    filtered = filtered.filter((c) => c.loungeBenefits.hasPriorityPass);
  }

  // Forex
  if (filters.isZeroForex) {
    filtered = filtered.filter((c) => c.forexMarkup.isZeroForex);
  }

  // Fuel
  if (filters.hasFuelBenefit) {
    filtered = filtered.filter((c) => c.fuelBenefit?.fuelSurchargeWaiver === true);
  }

  // Metal
  if (filters.isMetal) {
    filtered = filtered.filter((c) => c.isMetal === true);
  }

  // FD-backed / Secured
  if (filters.isFDBacked || filters.securedOrUnsecured === "SECURED") {
    filtered = filtered.filter(
      (c) => c.securedOrUnsecured === "SECURED" || c.eligibility.fdRequired || c.categories.some((cat) => cat.slug === "fd-backed"),
    );
  }

  // Co-branded
  if (filters.hasCoBrand) {
    filtered = filtered.filter((c) => c.coBrandPartner != null);
  }

  // Must-have filters
  if (filters.mustHave && filters.mustHave.length > 0) {
    if (filters.mustHave.includes("upi")) {
      filtered = filtered.filter((c) => c.upiBenefit?.upiEnabled || c.network.type === "RUPAY");
    }
    if (filters.mustHave.includes("lounge")) {
      filtered = filtered.filter((c) => c.loungeBenefits.hasLounge);
    }
    if (filters.mustHave.includes("zero_forex")) {
      filtered = filtered.filter((c) => c.forexMarkup.isZeroForex);
    }
    if (filters.mustHave.includes("ltf")) {
      filtered = filtered.filter((c) => c.feeWaiver?.isLifetimeFree || c.annualFee.amount === "0.00");
    }
  }

  // Exclude filters
  if (filters.exclude && filters.exclude.length > 0) {
    if (filters.exclude.includes("high_annual_fee")) {
      filtered = filtered.filter((c) => Number(c.annualFee.amount) <= 1000);
    }
    if (filters.exclude.includes("high_forex")) {
      filtered = filtered.filter((c) => Number(c.forexMarkup.percentage.replace("%", "")) <= 2.0);
    }
    if (filters.exclude.includes("no_lounge")) {
      filtered = filtered.filter((c) => c.loungeBenefits.hasLounge);
    }
    if (filters.exclude.includes("no_upi")) {
      filtered = filtered.filter((c) => c.upiBenefit?.upiEnabled || c.network.type === "RUPAY");
    }
  }

  // Sort
  filtered.sort((a, b) => {
    switch (filters.sort) {
      case "fee_low":
        return Number(a.annualFee.amount) - Number(b.annualFee.amount);
      case "fee_high":
        return Number(b.annualFee.amount) - Number(a.annualFee.amount);
      case "name":
        return a.officialName.localeCompare(b.officialName);
      default:
        return b.confidenceScore - a.confidenceScore;
    }
  });

  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    data: paginated,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    isDemoData: true,
  };
}

// ---------------------------------------------------------------------------
// Where Clause Builder for PostgreSQL
// ---------------------------------------------------------------------------

function buildCardWhereClause(filters: CardFilters): Prisma.CardProductWhereInput {
  const where: Prisma.CardProductWhereInput = {
    deletedAt: null,
  };

  // Status
  if (filters.statuses && filters.statuses.length > 0) {
    where.status = { in: filters.statuses as any };
  } else if (filters.status) {
    where.status = filters.status as any;
  }

  // Search keyword
  if (filters.q && filters.q.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { officialName: { contains: q, mode: "insensitive" } },
      { shortName: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { issuer: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  // Issuers
  if (filters.issuers && filters.issuers.length > 0) {
    where.issuer = { slug: { in: filters.issuers } };
  } else if (filters.issuerSlug) {
    where.issuer = { slug: filters.issuerSlug };
  }

  // Co-Brands
  if (filters.coBrands && filters.coBrands.length > 0) {
    where.coBrandPartner = { slug: { in: filters.coBrands } };
  }

  // Network
  if (filters.networkTypes && filters.networkTypes.length > 0) {
    where.network = { type: { in: filters.networkTypes as any } };
  } else if (filters.networkType) {
    where.network = { type: filters.networkType as any };
  }

  // Categories
  if (filters.categories && filters.categories.length > 0) {
    where.categories = {
      some: { category: { slug: { in: filters.categories } } },
    };
  }

  // Lifetime Free
  if (filters.isLifetimeFree) {
    where.feeWaivers = { some: { isLifetimeFree: true } };
  }

  // UPI
  if (filters.hasUPI) {
    where.upiBenefits = { some: { upiEnabled: true } };
  }

  // Lounge
  if (filters.hasLounge) {
    where.loungeBenefits = { some: {} };
  }
  if (filters.hasPriorityPass) {
    where.loungeBenefits = { some: { hasPriorityPass: true } };
  }

  // Forex
  if (filters.isZeroForex) {
    where.forexBenefits = { some: { isZeroForex: true } };
  }

  // Fuel
  if (filters.hasFuelBenefit) {
    where.fuelBenefits = { some: { fuelSurchargeWaiver: true } };
  }

  // FD Backed
  if (filters.isFDBacked || filters.securedOrUnsecured === "SECURED") {
    where.securedOrUnsecured = "SECURED";
  }

  return where;
}

function buildCardOrderBy(
  sort?: string,
): Prisma.CardProductOrderByWithRelationInput | Prisma.CardProductOrderByWithRelationInput[] {
  switch (sort) {
    case "fee_low":
      return { officialName: "asc" };
    case "fee_high":
      return { officialName: "desc" };
    case "newest":
      return { createdAt: "desc" };
    case "name":
      return { officialName: "asc" };
    default:
      return { createdAt: "desc" };
  }
}
