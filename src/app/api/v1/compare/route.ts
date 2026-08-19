/**
 * CardIntel — Compare API Route
 * GET /api/v1/compare?slugs=card-a,card-b,card-c — Compare up to 5 cards
 */

import { NextRequest, NextResponse } from "next/server";
import { getCardsForComparison } from "@/services/card-service";
import { compareSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const slugsParam = request.nextUrl.searchParams.get("slugs");

    if (!slugsParam) {
      return NextResponse.json(
        { error: "Missing slugs parameter. Provide comma-separated card slugs." },
        { status: 400 },
      );
    }

    const slugs = slugsParam.split(",").map((s) => s.trim()).filter(Boolean);

    const parsed = compareSchema.safeParse({ slugs });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid comparison request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const cards = await getCardsForComparison(parsed.data.slugs);

    if (cards.length < 2) {
      return NextResponse.json(
        { error: "At least 2 valid cards required for comparison" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      data: cards,
      count: cards.length,
    });
  } catch (error) {
    console.error("GET /api/v1/compare error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
