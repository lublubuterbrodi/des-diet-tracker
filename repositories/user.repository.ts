import { sql } from "@/lib/db";

export async function findUserByEmail(email: string) {
    const [user] = await sql`
        SELECT *
        FROM users
        WHERE email = ${email}
        LIMIT 1
    `;

    return user ?? null;
}

export async function createUser(
    email: string,
    passwordHash: string,
    name: string
) {
    const [user] = await sql`
        INSERT INTO users (
            email,
            password_hash,
            name
        )
        VALUES (
            ${email},
            ${passwordHash},
            ${name}
        )
        RETURNING *
    `;

    return user;
}

export async function verifyUserEmail(userId: string) {
  await sql`
    UPDATE users
    SET email_verified_at = NOW()
    WHERE id = ${userId};
  `;
}

export async function isEmailVerified(userId: string) {
  const [user] = await sql`
    SELECT email_verified_at
    FROM users
    WHERE id = ${userId}
    LIMIT 1;
  `;

  return user?.email_verified_at ?? null;
}