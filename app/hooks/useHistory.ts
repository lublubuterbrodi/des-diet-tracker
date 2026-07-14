"use client";

import { useCallback, useEffect, useState } from "react";

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

type HistoryResponse = {
  dietItems: Array<{
    id: string;
    name: string;
    daily_limit: number | string;
    unit: string;
  }>;

  foodLogs: Array<{
    id: string;
    diet_item_id: string;
    amount: number | string;
    created_at: string;
    log_date: string;
  }>;
};

async function getErrorMessage(
  response: Response,
  fallback: string,
) {
  const result = await response.json().catch(() => null);

  return result?.error ?? fallback;
}

export function useHistory() {
  const [items, setItems] = useState<DietItem[]>([]);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch("/api?type=history", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Could not load history",
          ),
        );
      }

      const data = (await response.json()) as HistoryResponse;

      setItems(
        data.dietItems.map((item) => ({
          ...item,
          daily_limit: Number(item.daily_limit),
        })),
      );

      setLogs(
        data.foodLogs.map((log) => ({
          ...log,
          amount: Number(log.amount),
        })),
      );
    } catch (error) {
      console.error("History loading error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadHistory = async () => {
      try {
        const response = await fetch("/api?type=history", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(
              response,
              "Could not load history",
            ),
          );
        }

        const data = (await response.json()) as HistoryResponse;

        if (controller.signal.aborted) return;

        setItems(
          data.dietItems.map((item) => ({
            ...item,
            daily_limit: Number(item.daily_limit),
          })),
        );

        setLogs(
          data.foodLogs.map((log) => ({
            ...log,
            amount: Number(log.amount),
          })),
        );
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("History loading error:", error);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      controller.abort();
    };
  }, []);

  const dates = Array.from(
    new Set(logs.map((log) => log.log_date)),
  );

  return {
    items,
    logs,
    dates,
    loading,
    fetchHistory,
  };
}