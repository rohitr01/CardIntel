/**
 * CardIntel — Card Detail API Route
 * GET /api/v1/cards/[slug] — Get full card detail
 */

import { NextRequest, NextResponse } from "next/server";
import { getCardBySlug } from "@/services/card-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const card = await getCardBySlug(slug);

    if (!card) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: card });
  } catch (error) {
    console.error("GET /api/v1/cards/[slug] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
