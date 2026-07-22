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