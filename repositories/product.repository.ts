import { sql } from "@/lib/db";

export async function getCategories() {
  return await sql`
    SELECT *
    FROM product_categories
    ORDER BY name;
  `;
}

export async function searchProducts(search: string) {
  return await sql`
    SELECT
      p.id,
      p.name,
      p.default_unit,
      c.name as category
    FROM products p
    JOIN product_categories c
      ON c.id = p.category_id
    WHERE
      LOWER(p.name)
      LIKE LOWER(${`%${search}%`})
    ORDER BY p.name
    LIMIT 50;
  `;
}

export async function createProduct(
  name: string,
  categoryId: string,
  unit: string,
  usdaFdcId?: number,
) {
  const [product] = await sql`
    INSERT INTO products (
      name,
      category_id,
      default_unit,
      usda_fdc_id
    )
    VALUES (
      ${name},
      ${categoryId},
      ${unit},
      ${usdaFdcId ?? null}
    )
    RETURNING *;
  `;

  return product;
}

export async function getProductByUsdaId(fdcId: number) {
  const [product] = await sql`
    SELECT *
    FROM products
    WHERE usda_fdc_id = ${fdcId}
    LIMIT 1;
  `;

  return product ?? null;
}

export async function getCategoryByName(name: string) {
  const [category] = await sql`
    SELECT *
    FROM product_categories
    WHERE LOWER(name) = LOWER(${name})
    LIMIT 1;
  `;

  return category ?? null;
}

export async function getImportedUsdaIds(fdcIds: number[]) {
  if (fdcIds.length === 0) {
    return [];
  }

  const products = await sql`
    SELECT usda_fdc_id
    FROM products
    WHERE usda_fdc_id = ANY(${fdcIds});
  `;

  return products
    .map((product) => product.usda_fdc_id)
    .filter((id): id is number => id !== null);
}