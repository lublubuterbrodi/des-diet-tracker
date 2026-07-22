import { sql } from "@/lib/db";

export async function getDailyWeight(
  userId: string,
  logDate: string
) {
  const [weight] = await sql`
    SELECT
      id,
      weight,
      log_date,
      created_at
    FROM daily_weights
    WHERE user_id = ${userId}
      AND log_date = ${logDate}
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  return weight ?? null;
}

export async function saveDailyWeight(
  userId: string,
  weight: number,
  logDate: string
) {
  const existing = await getDailyWeight(userId, logDate);

  if (existing) {
    const [updated] = await sql`
      UPDATE daily_weights
      SET weight = ${weight}
      WHERE id = ${existing.id}
      RETURNING *;
    `;

    return updated;
  }

  const [created] = await sql`
    INSERT INTO daily_weights (
      user_id,
      weight,
      log_date
    )
    VALUES (
      ${userId},
      ${weight},
      ${logDate}
    )
    RETURNING *;
  `;

  return created;
}