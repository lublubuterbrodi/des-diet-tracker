export type DietItem = {
  id: string;
  name: string;
  daily_limit: number;
  unit: string;
};

export type FoodLog = {
  id: string;
  diet_item_id: string;
   amount: number;
  created_at: string;
  log_date: string;
};