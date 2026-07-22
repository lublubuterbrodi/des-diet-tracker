import { sql } from "@/lib/db";

export async function getAllFoodLogs() {
  return await sql`
    SELECT *
    FROM food_logs
    ORDER BY created_at;
  `;
}

export async function updateUserDietItem(
  foodLogId: string,
  userDietItemId: string
) {
  await sql`
    UPDATE food_logs
    SET user_diet_item_id = ${userDietItemId}
    WHERE id = ${foodLogId};
  `;
}

export async function getFoodLogs(
  userId: string,
  logDate: string
) {
  return await sql`
    SELECT
      id,
      user_diet_item_id,
      amount,
      log_date,
      created_at
    FROM food_logs
    WHERE user_id = ${userId}
      AND log_date = ${logDate}
    ORDER BY created_at ASC;
  `;
}

export async function createFoodLog(
  userId: string,
  userDietItemId: string,
  amount: number,
  logDate: string
) {
  const [log] = await sql`
    INSERT INTO food_logs (
      user_id,
      user_diet_item_id,
      amount,
      log_date
    )
    VALUES (
      ${userId},
      ${userDietItemId},
      ${amount},
      ${logDate}
    )
    RETURNING *;
  `;

  return log;
}

export async function updateFoodLog(
  id: string,
  amount: number,
  userId: string
) {
  const [log] = await sql`
    UPDATE food_logs
    SET amount = ${amount}
    WHERE id = ${id}
      AND user_id = ${userId}
    RETURNING *;
  `;

  return log ?? null;
}

export async function deleteFoodLog(
  id: string,
  userId: string
) {
  await sql`
    DELETE FROM food_logs
    WHERE id = ${id}
      AND user_id = ${userId};
  `;
}

export async function resetFoodLogs(
  userId: string,
  logDate: string
) {
  await sql`
    DELETE FROM food_logs
    WHERE user_id = ${userId}
      AND log_date = ${logDate};
  `;
}

export async function getFoodLogHistory(userId: string) {
  return await sql`
    SELECT
      id,
      user_diet_item_id,
      amount,
      log_date,
      created_at
    FROM food_logs
    WHERE user_id = ${userId}
    ORDER BY log_date DESC, created_at ASC;
  `;
}

export async function getFoodLogById(
  id: string,
  userId: string
) {
  const [log] = await sql`
    SELECT *
    FROM food_logs
    WHERE id = ${id}
      AND user_id = ${userId}
    LIMIT 1;
  `;

  return log ?? null;
}

export async function getFoodLogHistoryWithProducts(
  userId: string
) {
  return await sql`
    SELECT
      fl.id,
      fl.amount,
      fl.log_date,
      fl.created_at,

      udi.id AS user_diet_item_id,
      udi.daily_limit,
      udi.unit,

      p.name

    FROM food_logs fl

    JOIN user_diet_items udi
      ON udi.id = fl.user_diet_item_id

    JOIN products p
      ON p.id = udi.product_id

    WHERE fl.user_id = ${userId}

    ORDER BY fl.log_date DESC,
             fl.created_at ASC;
  `;
}