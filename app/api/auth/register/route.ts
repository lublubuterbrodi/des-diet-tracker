import { NextRequest, NextResponse } from "next/server";

import { hashPassword } from "@/lib/password";
import { resend } from "@/lib/resend";
import { generateVerificationToken } from "@/lib/tokens";

import {
  createUser,
  findUserByEmail,
} from "@/repositories/user.repository";

import { createVerificationToken } from "@/repositories/email-verification.repository";

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

    const user = await createUser(
      email,
      passwordHash,
      name,
    );

    const { token, tokenHash } =
      generateVerificationToken();

    await createVerificationToken(
      user.id,
      tokenHash,
    );

    const verificationUrl =
      `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

    await resend.emails.send({
      from: "Diet Tracker <onboarding@resend.dev>",
      to: email,
      subject: "Verify your email",
      html: `
        <h2>Welcome!</h2>

        <p>Click the button below to activate your account.</p>

        <p>
          <a
            href="${verificationUrl}"
            style="
              background:#18181b;
              color:white;
              padding:12px 20px;
              text-decoration:none;
              border-radius:8px;
              display:inline-block;
            "
          >
            Verify email
          </a>
        </p>

        <p>
          Or open this link:
        </p>

        <p>
          ${verificationUrl}
        </p>

        <p>
          This link expires in 24 hours.
        </p>
      `,
    });

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