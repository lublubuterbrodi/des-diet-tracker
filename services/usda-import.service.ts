import { getFood } from "./usda.service";

import {
  createProduct,
  getCategoryByName,
  getProductByUsdaId,
} from "@/repositories/product.repository";

import {
  createUserDietItem,
  getByUserAndProduct,
} from "@/repositories/user-diet-item.repository";

import { mapUsdaCategory } from "@/lib/usda-category";

export async function importUsdaFood(
  userId: string,
  fdcId: number,
) {
  const food = await getFood(fdcId);

  let product = await getProductByUsdaId(fdcId);

  if (!product) {
    const categoryName = mapUsdaCategory(food.foodCategory);

    const category = await getCategoryByName(categoryName);

    if (!category) {
      throw new Error(`Category "${categoryName}" not found`);
    }

    product = await createProduct(
      food.description,
      category.id,
      "g",
      food.fdcId,
    );
  }

  let item = await getByUserAndProduct(
    userId,
    product.id,
  );

  if (!item) {
    item = await createUserDietItem(
      userId,
      product.id,
      product.default_unit,
    );
  }

  return item;
}