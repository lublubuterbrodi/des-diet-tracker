const CATEGORY_MAP: Record<string, string> = {
  "Fruits and Fruit Juices": "Fresh fruits",
  "Vegetables and Vegetable Products": "Vegetables",
  "Beef Products": "Meat",
  "Poultry Products": "Meat",
  "Pork Products": "Meat",
  "Lamb, Veal, and Game Products": "Meat",
  "Sausages and Luncheon Meats": "Meat",
  "Finfish and Shellfish Products": "Fish",
  "Dairy and Egg Products": "Milk products",
  "Breakfast Cereals": "Grains",
  "Cereal Grains and Pasta": "Grains",
};

export function mapUsdaCategory(category?: string) {
  return CATEGORY_MAP[category ?? ""] ?? "Other";
}