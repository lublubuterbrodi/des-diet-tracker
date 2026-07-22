"use client";

import { useCallback, useEffect, useState } from "react";

import type { DietItem, FoodLog } from "../types/types";
import { getRomaniaDate } from "../utils";

type TodayResponse = {
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

  dailyWeight: {
    id: string;
    weight: number | string;
    log_date: string;
    created_at: string;
  } | null;
};

async function getErrorMessage(
  response: Response,
  fallback: string,
) {
  const result = await response.json().catch(() => null);

  return result?.error ?? fallback;
}

export function useTodayDiet() {
  const [items, setItems] = useState<DietItem[]>([]);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [weight, setWeight] = useState("");
  const [isWeightModalOpen, setIsWeightModalOpen] =
    useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] =
    useState<DietItem | null>(null);
  const [amount, setAmount] = useState("");
  const [editingLogId, setEditingLogId] =
    useState<string | null>(null);

  const applyTodayData = useCallback((data: TodayResponse) => {
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

    setWeight(
      data.dailyWeight
        ? String(data.dailyWeight.weight).replace(".", ",")
        : "",
    );
  }, []);

  const fetchData = useCallback(async () => {
    const today = getRomaniaDate();

    const response = await fetch(
      `/api?type=today&date=${encodeURIComponent(today)}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Could not load today's data",
        ),
      );
    }

    const data = (await response.json()) as TodayResponse;

    applyTodayData(data);
    setLoading(false);
  }, [applyTodayData]);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      try {
        const today = getRomaniaDate();

        const response = await fetch(
          `/api?type=today&date=${encodeURIComponent(today)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(
              response,
              "Could not load today's data",
            ),
          );
        }

        const data = (await response.json()) as TodayResponse;

        if (controller.signal.aborted) return;

        applyTodayData(data);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Data loading error:", error);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      controller.abort();
    };
  }, [applyTodayData]);

  const getItemLogs = (itemId: string) => {
    return logs.filter(
      (log) => log.diet_item_id === itemId,
    );
  };

  const getEatenAmount = (itemId: string) => {
    return getItemLogs(itemId).reduce(
      (sum, log) => sum + Number(log.amount),
      0,
    );
  };

  const openFoodModal = (item: DietItem) => {
    setSelectedItem(item);
    setAmount("");
    setEditingLogId(null);
  };

  const closeFoodModal = () => {
    setSelectedItem(null);
    setAmount("");
    setEditingLogId(null);
  };

  const saveWeight = async () => {
    try {
      const numericWeight = Number(
        weight.replace(",", "."),
      );

      if (
        !Number.isFinite(numericWeight) ||
        numericWeight <= 0
      ) {
        alert("Enter a valid weight");
        return;
      }

      const response = await fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "save-weight",
          weight: numericWeight,
          logDate: getRomaniaDate(),
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Could not save weight",
          ),
        );
      }

      setIsWeightModalOpen(false);
      await fetchData();
    } catch (error) {
      console.error("Weight save error:", error);
      alert("Could not save weight");
    }
  };

  const saveFoodLog = async () => {
    if (!selectedItem) return;

    try {
      const numericAmount = Number(
        amount.replace(",", "."),
      );

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        alert("Enter a valid amount");
        return;
      }

      const response = editingLogId
        ? await fetch("/api", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: editingLogId,
              amount: numericAmount,
            }),
          })
        : await fetch("/api", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "save-food-log",
              dietItemId: selectedItem.id,
              amount: numericAmount,
              logDate: getRomaniaDate(),
            }),
          });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            editingLogId
              ? "Could not update food log"
              : "Could not create food log",
          ),
        );
      }

      closeFoodModal();
      await fetchData();
    } catch (error) {
      console.error("Food log save error:", error);
      alert("Could not save food log");
    }
  };

  const deleteLog = async (logId: string) => {
    try {
      const response = await fetch("/api", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete-food-log",
          id: logId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Could not delete food log",
          ),
        );
      }

      await fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Could not delete food log");
    }
  };

  const editLog = (
    item: DietItem,
    log: FoodLog,
  ) => {
    setSelectedItem(item);
    setAmount(String(log.amount));
    setEditingLogId(log.id);
  };

  const resetToday = async () => {
    const confirmed = confirm(
      "Delete all today's logs?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reset-day",
          logDate: getRomaniaDate(),
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Could not reset today's logs",
          ),
        );
      }

      await fetchData();
    } catch (error) {
      console.error("Reset error:", error);
      alert("Could not reset today's logs");
    }
  };

  const fruitItems = items.filter((item) =>
    ["Watermelon", "Fresh fruits"].includes(item.name),
  );

  const meatItems = items.filter((item) =>
    ["Meat", "Fish"].includes(item.name),
  );

  const groupedItemIds = [
    ...fruitItems,
    ...meatItems,
  ].map((item) => item.id);

  const regularItems = items.filter(
    (item) => !groupedItemIds.includes(item.id),
  );

  return {
    loading,

    weight,
    setWeight,
    isWeightModalOpen,
    setIsWeightModalOpen,
    saveWeight,

    selectedItem,
    amount,
    setAmount,
    editingLogId,
    openFoodModal,
    closeFoodModal,
    saveFoodLog,

    getItemLogs,
    getEatenAmount,
    editLog,
    deleteLog,
    resetToday,

    fruitItems,
    meatItems,
     regularItems,
    
     fetchData,
  };
}