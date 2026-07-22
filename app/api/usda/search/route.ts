import { NextRequest, NextResponse } from "next/server";

import { searchFoods } from "@/services/usda.service";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("query");

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 },
      );
    }

    const foods = await searchFoods(query);

    return NextResponse.json(foods);
  } catch (error) {
    console.error("USDA search failed:", error);

    return NextResponse.json(
      { error: "Failed to search USDA" },
      { status: 500 },
    );
  }
}