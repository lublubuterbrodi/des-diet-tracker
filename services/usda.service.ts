import {
  searchUsdaFoods,
  getUsdaFood,
} from "@/repositories/usda.repository";

import { getImportedUsdaIds } from "@/repositories/product.repository";

export async function searchFoods(query: string) {
  const foods = await searchUsdaFoods(query);

  const importedIds = await getImportedUsdaIds(
    foods.map((food) => food.fdcId),
  );

  const importedSet = new Set(importedIds);

  return foods.map((food) => ({
    fdcId: food.fdcId,
    description: food.description,
    brandOwner: food.brandOwner ?? null,
    foodCategory: food.foodCategory ?? null,
    imported: importedSet.has(food.fdcId),
  }));
}

export async function getFood(fdcId: number) {
  return getUsdaFood(fdcId);
}