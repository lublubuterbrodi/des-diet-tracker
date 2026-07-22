import {
  UsdaSearchFood,
  UsdaSearchResponse,
} from "@/types/usda";

const API_KEY = process.env.USDA_API_KEY!;
const BASE_URL = "https://api.nal.usda.gov/fdc/v1";

export async function searchUsdaFoods(
  query: string,
): Promise<UsdaSearchFood[]> {
  if (!query.trim()) {
    return [];
  }

  const response = await fetch(
    `${BASE_URL}/foods/search?api_key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        pageSize: 25,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("USDA search failed");
  }

  const data: UsdaSearchResponse = await response.json();

  return data.foods;
}

export async function getUsdaFood(fdcId: number) {
  const response = await fetch(
    `${BASE_URL}/food/${fdcId}?api_key=${API_KEY}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("USDA food failed");
  }

  return response.json();
}