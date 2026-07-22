import { sql } from "@/lib/db";

export async function getByUserAndProduct(
  userId: string,
  productId: string
) {
  const [item] = await sql`
    SELECT *
    FROM user_diet_items
    WHERE user_id = ${userId}
      AND product_id = ${productId}
    LIMIT 1;
  `;

  return item ?? null;
}

export async function createUserDietItem(
  userId: string,
  productId: string,
  unit: string
) {
  const [item] = await sql`
    INSERT INTO user_diet_items (
      user_id,
      product_id,
      unit
    )
    VALUES (
      ${userId},
      ${productId},
      ${unit}
    )
    RETURNING *;
  `;

  return item;
}

export async function getUserDietItems(userId: string) {
  return await sql`
    SELECT
      udi.id,
      p.name,
      udi.daily_limit,
      udi.unit,
      udi.created_at
    FROM user_diet_items udi
    JOIN products p
      ON p.id = udi.product_id
    WHERE udi.user_id = ${userId}
    ORDER BY udi.created_at ASC;
  `;
}

export async function getAllUserDietItems(userId: string) {
  return await sql`
    SELECT
      udi.id,
      p.name,
      udi.daily_limit,
      udi.unit,
      udi.created_at
    FROM user_diet_items udi
    JOIN products p
      ON p.id = udi.product_id
    WHERE udi.user_id = ${userId}
    ORDER BY udi.created_at ASC;
  `;
}

export async function getUserDietItemById(
  id: string,
  userId: string
) {
  const [item] = await sql`
    SELECT *
    FROM user_diet_items
    WHERE id = ${id}
      AND user_id = ${userId}
    LIMIT 1;
  `;

  return item ?? null;
}