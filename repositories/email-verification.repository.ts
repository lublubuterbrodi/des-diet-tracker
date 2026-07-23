import { sql } from "@/lib/db";
import crypto from "crypto";

export async function createVerificationToken(
  userId: string,
  tokenHash: string,
) {
  await sql`
    INSERT INTO email_verification_tokens (
      user_id,
      token_hash,
      expires_at
    )
    VALUES (
      ${userId},
      ${tokenHash},
      NOW() + INTERVAL '24 hours'
    );
  `;
}

export async function findVerificationToken(
  tokenHash: string,
) {
  const [token] = await sql`
    SELECT *
    FROM email_verification_tokens
    WHERE token_hash = ${tokenHash}
    LIMIT 1;
  `;

  return token ?? null;
}

export async function deleteVerificationToken(id: string) {
  await sql`
    DELETE
    FROM email_verification_tokens
    WHERE id = ${id};
  `;
}

export function hashVerificationToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}