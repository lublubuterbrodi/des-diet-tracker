import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import { importUsdaFood } from "@/services/usda-import.service";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { fdcId } = await request.json();

    if (!fdcId) {
      return NextResponse.json(
        { error: "fdcId is required" },
        { status: 400 },
      );
    }

    const item = await importUsdaFood(
      session.user.id,
      Number(fdcId),
    );

    return NextResponse.json(item);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to import USDA product",
      },
      {
        status: 500,
      },
    );
  }
}