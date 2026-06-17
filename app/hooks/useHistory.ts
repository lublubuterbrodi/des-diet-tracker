"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

export function useHistory() {
  const [items, setItems] = useState<DietItem[]>([]);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    const { data: dietItems, error: dietError } = await supabase
      .from("diet_items")
      .select("*")
      .order("created_at", { ascending: true });

    const { data: foodLogs, error: logsError } = await supabase
      .from("food_logs")
      .select("*")
      .not("log_date", "is", null)
      .order("log_date", { ascending: false })
      .order("created_at", { ascending: true });

    if (dietError || logsError) {
      console.error("Diet error:", dietError);
      console.error("Logs error:", logsError);
      setLoading(false);
      return;
    }

    setItems(dietItems || []);
    setLogs(foodLogs || []);
    setLoading(false);
  }, []);

  useEffect(() => {
   const load = async () => {
      await fetchHistory();
   };

   void load();
  }, [fetchHistory]);

  const dates = Array.from(new Set(logs.map((log) => log.log_date)));

  return {
    items,
    logs,
    dates,
    loading,
  };
}