import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@/auth";

import {
  getUserDietItemById,
   updateUserDietItem,
  deleteUserDietItem,
} from "@/repositories/user-diet-item.repository";

const allowedUnits = ["g", "pcs", "ml"];

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const dailyLimit = Number(body.dailyLimit);
    const unit = String(body.unit ?? "").trim();

    if (!id) {
      return NextResponse.json(
        { error: "Diet item ID is required" },
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

    const existingItem =
      await getUserDietItemById(
        id,
        session.user.id,
      );

    if (!existingItem) {
      return NextResponse.json(
        { error: "Diet item not found" },
        { status: 404 },
      );
    }

    const updatedItem =
      await updateUserDietItem(
        id,
        session.user.id,
        dailyLimit,
        unit,
      );

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error(
      "Diet item update failed:",
      error,
    );

    return NextResponse.json(
      { error: "Failed to update daily limit" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const { id } = await params;

  try {
    await deleteUserDietItem(id, session.user.id);

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Could not delete product",
      },
      {
        status: 500,
      },
    );
  }
}