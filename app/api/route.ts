import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  getUserDietItems,
  getUserDietItemById,
} from "@/repositories/user-diet-item.repository";

import {
  getFoodLogs,
  getFoodLogHistory,
  createFoodLog,
  updateFoodLog,
  deleteFoodLog,
  resetFoodLogs,
} from "@/repositories/food-log.repository";

import {
  getDailyWeight,
  saveDailyWeight,
} from "@/repositories/daily-weight.repository";

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function getAuthenticatedUserId() {
  const session = await auth();

  return session?.user?.id ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const type = request.nextUrl.searchParams.get("type");
    const date = request.nextUrl.searchParams.get("date");

    if (type === "today") {
      if (!date || !isValidDate(date)) {
        return NextResponse.json(
          { error: "Valid date is required" },
          { status: 400 },
        );
      }

      const [dietItems, foodLogs, dailyWeight] =
        await Promise.all([
          getUserDietItems(userId),
          getFoodLogs(userId, date),
          getDailyWeight(userId, date),
        ]);

      return NextResponse.json({
        dietItems,
        foodLogs,
        dailyWeight,
      });
    }

    if (type === "history") {
      const [dietItems, foodLogs] = await Promise.all([
        getUserDietItems(userId),
        getFoodLogHistory(userId),
      ]);

      return NextResponse.json({
        dietItems,
        foodLogs,
      });
    }

    return NextResponse.json(
      { error: "Unknown request type" },
      { status: 400 },
    );
  } catch (error) {
    console.error("GET /api/data failed:", error);

    return NextResponse.json(
      { error: "Failed to load data" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const action = String(body.action ?? "");

    if (action === "save-food-log") {
      const userDietItemId = String(
        body.userDietItemId ??
        body.dietItemId ??
        "",
      );

      const amount = Number(body.amount);
      const logDate = String(body.logDate ?? "");

      if (
        !userDietItemId ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !isValidDate(logDate)
      ) {
        return NextResponse.json(
          { error: "Invalid food log data" },
          { status: 400 },
        );
      }

      const userDietItem = await getUserDietItemById(
        userDietItemId,
        userId,
      );

      if (!userDietItem) {
        return NextResponse.json(
          { error: "Diet item not found" },
          { status: 404 },
        );
      }

      const createdLog = await createFoodLog(
        userId,
        userDietItemId,
        amount,
        logDate,
      );

      return NextResponse.json(
        createdLog,
        { status: 201 },
      );
    }

    if (action === "save-weight") {
      const weight = Number(body.weight);
      const logDate = String(body.logDate ?? "");

      if (
        !Number.isFinite(weight) ||
        weight <= 0 ||
        !isValidDate(logDate)
      ) {
        return NextResponse.json(
          { error: "Invalid weight data" },
          { status: 400 },
        );
      }

      const savedWeight = await saveDailyWeight(
        userId,
        weight,
        logDate,
      );

      return NextResponse.json(savedWeight);
    }

    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("POST /api/data failed:", error);

    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const id = String(body.id ?? "");
    const amount = Number(body.amount);

    if (
      !id ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid update data" },
        { status: 400 },
      );
    }

    const updatedLog = await updateFoodLog(
      id,
      amount,
      userId,
    );

    if (!updatedLog) {
      return NextResponse.json(
        { error: "Food log not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error("PATCH /api/data failed:", error);

    return NextResponse.json(
      { error: "Failed to update food log" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const action = String(body.action ?? "");

    if (action === "delete-food-log") {
      const id = String(body.id ?? "");

      if (!id) {
        return NextResponse.json(
          { error: "Food log ID is required" },
          { status: 400 },
        );
      }

      await deleteFoodLog(id, userId);

      return NextResponse.json({
        success: true,
      });
    }

    if (action === "reset-day") {
      const logDate = String(body.logDate ?? "");

      if (!isValidDate(logDate)) {
        return NextResponse.json(
          { error: "Valid date is required" },
          { status: 400 },
        );
      }

      await resetFoodLogs(userId, logDate);

      return NextResponse.json({
        success: true,
      });
    }

    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("DELETE /api/data failed:", error);

    return NextResponse.json(
      { error: "Failed to delete data" },
      { status: 500 },
    );
  }
}