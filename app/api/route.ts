import { NextRequest, NextResponse } from "next/server";

import { sql } from "@/lib/db";

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get("type");
    const date = request.nextUrl.searchParams.get("date");

    if (type === "today") {
      if (!date || !isValidDate(date)) {
        return NextResponse.json(
          { error: "Valid date is required" },
          { status: 400 },
        );
      }

      const dietItems = await sql`
        SELECT
          id,
          name,
          daily_limit,
          unit,
          created_at
        FROM diet_items
        ORDER BY created_at ASC
      `;

      const foodLogs = await sql`
        SELECT
          id,
          diet_item_id,
          amount,
          log_date,
          created_at
        FROM food_logs
        WHERE log_date = ${date}
        ORDER BY created_at ASC
      `;

      const [dailyWeight] = await sql`
        SELECT
          id,
          weight,
          log_date,
          created_at
        FROM daily_weights
        WHERE log_date = ${date}
        ORDER BY created_at DESC
        LIMIT 1
      `;

      return NextResponse.json({
        dietItems,
        foodLogs,
        dailyWeight: dailyWeight ?? null,
      });
    }

    if (type === "history") {
      const dietItems = await sql`
         SELECT
            id,
            name,
            daily_limit,
            unit,
            created_at
         FROM diet_items
         ORDER BY created_at ASC
      `;

      const foodLogs = await sql`
         SELECT
            id,
            diet_item_id,
            amount,
            log_date,
            created_at
         FROM food_logs
         WHERE log_date IS NOT NULL
         ORDER BY log_date DESC, created_at ASC
      `;

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
    const body = await request.json();
    const action = body.action;

    if (action === "save-food-log") {
      const dietItemId = String(body.dietItemId ?? "");
      const amount = Number(body.amount);
      const logDate = String(body.logDate ?? "");

      if (
        !dietItemId ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !isValidDate(logDate)
      ) {
        return NextResponse.json(
          { error: "Invalid food log data" },
          { status: 400 },
        );
      }

      const [createdLog] = await sql`
        INSERT INTO food_logs (
          diet_item_id,
          amount,
          log_date
        )
        VALUES (
          ${dietItemId},
          ${amount},
          ${logDate}
        )
        RETURNING *
      `;

      return NextResponse.json(createdLog, { status: 201 });
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

      const [existing] = await sql`
        SELECT id
        FROM daily_weights
        WHERE log_date = ${logDate}
        LIMIT 1
      `;

      if (existing) {
        const [updated] = await sql`
          UPDATE daily_weights
          SET weight = ${weight}
          WHERE id = ${existing.id}
          RETURNING *
        `;

        return NextResponse.json(updated);
      }

      const [created] = await sql`
        INSERT INTO daily_weights (
          weight,
          log_date
        )
        VALUES (
          ${weight},
          ${logDate}
        )
        RETURNING *
      `;

      return NextResponse.json(created, { status: 201 });
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
    const body = await request.json();

    const id = String(body.id ?? "");
    const amount = Number(body.amount);

    if (!id || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid update data" },
        { status: 400 },
      );
    }

    const [updatedLog] = await sql`
      UPDATE food_logs
      SET amount = ${amount}
      WHERE id = ${id}
      RETURNING *
    `;

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
    const body = await request.json();
    const action = body.action;

    if (action === "delete-food-log") {
      const id = String(body.id ?? "");

      if (!id) {
        return NextResponse.json(
          { error: "Food log ID is required" },
          { status: 400 },
        );
      }

      await sql`
        DELETE FROM food_logs
        WHERE id = ${id}
      `;

      return NextResponse.json({ success: true });
    }

    if (action === "reset-day") {
      const logDate = String(body.logDate ?? "");

      if (!isValidDate(logDate)) {
        return NextResponse.json(
          { error: "Valid date is required" },
          { status: 400 },
        );
      }

      await sql`
        DELETE FROM food_logs
        WHERE log_date = ${logDate}
      `;

      return NextResponse.json({ success: true });
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