"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { DietItem, FoodLog } from "../types";
import { getRomaniaDate } from "../utils";

export function useTodayDiet() {
  const [items, setItems] = useState<DietItem[]>([]);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [weight, setWeight] = useState("");
  const [weightId, setWeightId] = useState<string | null>(null);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState<DietItem | null>(null);
  const [amount, setAmount] = useState("");
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const today = getRomaniaDate();

    const { data: dietItems, error: dietError } = await supabase
      .from("diet_items")
      .select("*")
      .order("created_at", { ascending: true });

    const { data: foodLogs, error: logsError } = await supabase
      .from("food_logs")
      .select("*")
      .eq("log_date", today)
      .order("created_at", { ascending: true });

    const { data: dailyWeight, error: weightError } = await supabase
      .from("daily_weights")
      .select("*")
      .eq("log_date", today)
      .maybeSingle();

    if (dietError || logsError || weightError) {
      console.error("Diet error:", dietError);
      console.error("Logs error:", logsError);
      console.error("Weight error:", weightError);
      setLoading(false);
      return;
    }

    setItems(dietItems || []);
    setLogs(foodLogs || []);
    setWeight(dailyWeight ? String(dailyWeight.weight).replace(".", ",") : "");
    setWeightId(dailyWeight?.id || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };

    void loadData();
  }, [fetchData]);

  const getItemLogs = (itemId: string) => {
    return logs.filter((log) => log.diet_item_id === itemId);
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
    const numericWeight = Number(weight.replace(",", "."));

    if (!numericWeight || numericWeight <= 0) {
      alert("Enter a valid weight");
      return;
    }

    const today = getRomaniaDate();

    const { error } = weightId
      ? await supabase
          .from("daily_weights")
          .update({ weight: numericWeight })
          .eq("id", weightId)
      : await supabase.from("daily_weights").insert({
          weight: numericWeight,
          log_date: today,
        });

    if (error) {
      console.error("Weight save error:", error);
      alert("Could not save weight");
      return;
    }

    setIsWeightModalOpen(false);
    void fetchData();
  };

  const saveFoodLog = async () => {
    if (!selectedItem) return;

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    if (editingLogId) {
      const { error } = await supabase
        .from("food_logs")
        .update({ amount: numericAmount })
        .eq("id", editingLogId);

      if (error) {
        console.error("Update error:", error);
        return;
      }
    } else {
      const { error } = await supabase.from("food_logs").insert({
        diet_item_id: selectedItem.id,
        amount: numericAmount,
        log_date: getRomaniaDate(),
      });

      if (error) {
        console.error("Insert error:", error);
        return;
      }
    }

    closeFoodModal();
    void fetchData();
  };

  const deleteLog = async (logId: string) => {
    const { error } = await supabase.from("food_logs").delete().eq("id", logId);

    if (error) {
      console.error("Delete error:", error);
      return;
    }

    void fetchData();
  };

  const editLog = (item: DietItem, log: FoodLog) => {
    setSelectedItem(item);
    setAmount(String(log.amount));
    setEditingLogId(log.id);
  };

  const resetToday = async () => {
    const confirmed = confirm("Delete all today's logs?");

    if (!confirmed) return;

    const today = getRomaniaDate();

    const { error } = await supabase
      .from("food_logs")
      .delete()
      .eq("log_date", today);

    if (error) {
      console.error("Reset error:", error);
      return;
    }

    void fetchData();
  };

  const fruitItems = items.filter((item) =>
    ["Watermelon", "Fresh fruits"].includes(item.name),
  );

  const meatItems = items.filter((item) =>
    ["Meat", "Fish"].includes(item.name),
  );

  const groupedItemIds = [...fruitItems, ...meatItems].map((item) => item.id);

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
  };
}