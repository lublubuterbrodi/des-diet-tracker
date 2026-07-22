export interface UsdaSearchResponse {
  foods: UsdaSearchFood[];
}

export interface UsdaSearchFood {
  fdcId: number;
  description: string;
  brandOwner: string | null;
  foodCategory: string | null;
}