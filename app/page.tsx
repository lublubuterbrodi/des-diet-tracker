"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Pencil, X } from "lucide-react";
import Link from "next/link";

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

export default function Home() {
  const [items, setItems] = useState<DietItem[]>([]);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState<DietItem | null>(null);
  const [amount, setAmount] = useState("");
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  const getRomaniaDate = () => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Bucharest",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  };

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
    void fetchData();
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

  const openModal = (item: DietItem) => {
    setSelectedItem(item);
    setAmount("");
    setEditingLogId(null);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setAmount("");
    setEditingLogId(null);
  };

  const addFoodLog = async () => {
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

    closeModal();
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

  if (loading) {
    return <main className="p-6">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-4">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Today</h1>

        <div className="flex gap-2">
          <Link
            href="/history"
            className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
          >
            History
          </Link>

          <button
            onClick={resetToday}
            className="rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white"
          >
            Reset day
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const itemLogs = getItemLogs(item.id);
          const eaten = getEatenAmount(item.id);
          const progress = Math.min((eaten / item.daily_limit) * 100, 100);

          return (
            <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-zinc-900">
                  {item.name}
                </h2>

                <div className="flex shrink-0 items-center gap-3">
                  <p className="text-lg font-bold">
                    {eaten} / {item.daily_limit} {item.unit}
                  </p>

                  <button
                    onClick={() => openModal(item)}
                    className="rounded-lg bg-blue-500 px-3 py-2 text-sm text-white"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {itemLogs.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {itemLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1 text-sm"
                    >
                      <span>
                        {log.amount} {item.unit}
                      </span>

                      <button onClick={() => editLog(item, log)}>
                        <Pencil size={12} />
                      </button>

                      <button onClick={() => deleteLog(log.id)}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 flex items-end bg-black/40 p-4">
          <div className="w-full rounded-3xl bg-white p-5">
            <h2 className="text-xl font-bold">
              {editingLogId ? "Edit amount" : selectedItem.name}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">How much did you eat?</p>

            <div className="mt-4 flex items-center gap-3">
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                type="number"
                placeholder="Amount"
                className="w-full rounded-xl border px-4 py-3 text-lg outline-none"
              />

              <span className="text-lg font-medium">{selectedItem.unit}</span>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={closeModal}
                className="w-full rounded-xl bg-zinc-200 py-3 font-medium"
              >
                Cancel
              </button>

              <button
                onClick={addFoodLog}
                className="w-full rounded-xl bg-blue-500 py-3 font-medium text-white"
              >
                {editingLogId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
