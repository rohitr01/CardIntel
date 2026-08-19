/**
 * CardIntel — Cards API Route
 * GET /api/v1/cards — List cards with multi-faceted filters
 */

import { NextRequest, NextResponse } from "next/server";
import { getCards } from "@/services/card-service";
import { cardFilterSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const sp = request.nextUrl.searchParams;

    const parseArray = (key: string) => {
      const all = sp.getAll(key);
      if (all.length > 0) {
        // If comma separated in a single entry
        return all.flatMap((item) => item.split(",").map((s) => s.trim()).filter(Boolean));
      }
      return undefined;
    };

    const parsed = cardFilterSchema.safeParse({
      ...searchParams,
      categories: parseArray("categories"),
      issuers: parseArray("issuers"),
      coBrands: parseArray("coBrands"),
      networkTypes: parseArray("networkTypes"),
      statuses: parseArray("statuses"),
      employmentTypes: parseArray("employmentTypes"),
      mustHave: parseArray("mustHave"),
      exclude: parseArray("exclude"),
      // Convert string booleans
      isLifetimeFree: sp.has("isLifetimeFree") ? sp.get("isLifetimeFree") === "true" : undefined,
      hasFeeWaiver: sp.has("hasFeeWaiver") ? sp.get("hasFeeWaiver") === "true" : undefined,
      hasUPI: sp.has("hasUPI") ? sp.get("hasUPI") === "true" : undefined,
      hasFuelBenefit: sp.has("hasFuelBenefit") ? sp.get("hasFuelBenefit") === "true" : undefined,
      hasLounge: sp.has("hasLounge") ? sp.get("hasLounge") === "true" : undefined,
      hasDomesticLounge: sp.has("hasDomesticLounge") ? sp.get("hasDomesticLounge") === "true" : undefined,
      hasIntlLounge: sp.has("hasIntlLounge") ? sp.get("hasIntlLounge") === "true" : undefined,
      hasPriorityPass: sp.has("hasPriorityPass") ? sp.get("hasPriorityPass") === "true" : undefined,
      hasForex: sp.has("hasForex") ? sp.get("hasForex") === "true" : undefined,
      isZeroForex: sp.has("isZeroForex") ? sp.get("isZeroForex") === "true" : undefined,
      hasTravelBenefit: sp.has("hasTravelBenefit") ? sp.get("hasTravelBenefit") === "true" : undefined,
      hasRailwayBenefit: sp.has("hasRailwayBenefit") ? sp.get("hasRailwayBenefit") === "true" : undefined,
      hasHotelBenefit: sp.has("hasHotelBenefit") ? sp.get("hasHotelBenefit") === "true" : undefined,
      hasDiningBenefit: sp.has("hasDiningBenefit") ? sp.get("hasDiningBenefit") === "true" : undefined,
      hasShoppingBenefit: sp.has("hasShoppingBenefit") ? sp.get("hasShoppingBenefit") === "true" : undefined,
      hasCoBrand: sp.has("hasCoBrand") ? sp.get("hasCoBrand") === "true" : undefined,
      isFDBacked: sp.has("isFDBacked") ? sp.get("isFDBacked") === "true" : undefined,
      isMetal: sp.has("isMetal") ? sp.get("isMetal") === "true" : undefined,
      isBusiness: sp.has("isBusiness") ? sp.get("isBusiness") === "true" : undefined,
      includeUndisclosedCibil: sp.has("includeUndisclosedCibil") ? sp.get("includeUndisclosedCibil") === "true" : undefined,
      includeUndisclosedIncome: sp.has("includeUndisclosedIncome") ? sp.get("includeUndisclosedIncome") === "true" : undefined,
      potentiallyEligibleOnly: sp.has("potentiallyEligibleOnly") ? sp.get("potentiallyEligibleOnly") === "true" : undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid filters", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await getCards(parsed.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/cards error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
