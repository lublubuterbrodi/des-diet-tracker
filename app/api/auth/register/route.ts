import { NextRequest, NextResponse } from "next/server";

import { hashPassword } from "@/lib/password";

import {
  createUser,
  findUserByEmail,
} from "@/repositories/user.repository";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: "All fields are required",
        },
        {
          status: 400,
        },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error: "Password must contain at least 8 characters",
        },
        {
          status: 400,
        },
      );
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        {
          error: "User already exists",
        },
        {
          status: 409,
        },
      );
    }

    const passwordHash = await hashPassword(password);

    await createUser(
      email,
      passwordHash,
      name,
   );

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}