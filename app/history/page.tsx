"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type DietItem = {
  id: string;
  name: string;
  daily_limit: number;
  unit: string;
};

type FoodLog = {
  id: string;
  diet_item_id: string;
  amount: number;
  created_at: string;
  log_date: string;
};

export default function HistoryPage() {
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
    void fetchHistory();
  }, [fetchHistory]);

  const dates = Array.from(new Set(logs.map((log) => log.log_date)));

  const getLogsByDate = (date: string) => {
    return logs.filter((log) => log.log_date === date);
  };

  const getEatenAmount = (dateLogs: FoodLog[], itemId: string) => {
    return dateLogs
      .filter((log) => log.diet_item_id === itemId)
      .reduce((sum, log) => sum + Number(log.amount), 0);
  };

  if (loading) {
    return <main className="p-6">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-4">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">History</h1>

        <Link
          href="/"
          className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
        >
          Today
        </Link>
      </div>

      {dates.length === 0 ? (
        <div className="rounded-2xl bg-white p-4 text-zinc-500 shadow-sm">
          No history yet.
        </div>
      ) : (
        <div className="space-y-4">
          {dates.map((date) => {
            const dateLogs = getLogsByDate(date);

            return (
              <div key={date} className="rounded-2xl bg-white p-4 shadow-sm">
                <h2 className="mb-3 text-lg font-bold">{date}</h2>

                <div className="space-y-3">
                  {items.map((item) => {
                    const eaten = getEatenAmount(dateLogs, item.id);

                    if (eaten === 0) return null;

                    const progress = Math.min(
                      (eaten / item.daily_limit) * 100,
                      100,
                    );

                    return (
                      <div key={item.id}>
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <p className="min-w-0 flex-1 truncate font-medium">
                            {item.name}
                          </p>

                          <p className="shrink-0 font-bold">
                            {eaten} / {item.daily_limit} {item.unit}
                          </p>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
