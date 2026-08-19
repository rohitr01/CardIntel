/**
 * CardIntel — Issuers API Route
 * GET /api/v1/issuers — List issuers with filtering
 */

import { NextRequest, NextResponse } from "next/server";
import { getIssuers } from "@/services/issuer-service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const result = await getIssuers({
      issuerType: searchParams.get("issuerType") || undefined,
      coverageStatus: searchParams.get("coverageStatus") || undefined,
      canIssueCreditCards:
        searchParams.get("canIssueCreditCards") === "true" ? true : undefined,
      search: searchParams.get("search") || undefined,
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 50,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/issuers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
