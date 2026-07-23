import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@/auth";
import { importUsdaFood } from "@/services/usda-import.service";

const allowedUnits = ["g", "pcs", "ml"];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const fdcId = Number(body.fdcId);
    const dailyLimit = Number(body.dailyLimit);
    const unit = String(body.unit ?? "").trim();

    if (
      !Number.isInteger(fdcId) ||
      fdcId <= 0
    ) {
      return NextResponse.json(
        { error: "Valid fdcId is required" },
        { status: 400 },
      );
    }

    if (
      !Number.isFinite(dailyLimit) ||
      dailyLimit <= 0
    ) {
      return NextResponse.json(
        { error: "Valid daily limit is required" },
        { status: 400 },
      );
    }

    if (!allowedUnits.includes(unit)) {
      return NextResponse.json(
        { error: "Invalid unit" },
        { status: 400 },
      );
    }

    const item = await importUsdaFood(
      session.user.id,
      fdcId,
      dailyLimit,
      unit,
    );

    return NextResponse.json(item, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "USDA product import failed:",
      error,
    );

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