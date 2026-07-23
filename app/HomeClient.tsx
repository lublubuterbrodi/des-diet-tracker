"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

import type { DietItem } from "./types/types";
import { getFormattedRomaniaDate } from "./utils";

import DailyLimitModal from "./components/DailyLimitModal";
import DeleteProductModal from "./components/DeleteProductModal";
import { DietItemCard } from "./components/DietItemCard";
import { FoodLogModal } from "./components/FoodLogModal";
import ProductSearchModal from "./components/ProductSearchModal";
import { WeightCard } from "./components/WeightCard";
import { WeightModal } from "./components/WeightModal";
import { useTodayDiet } from "./hooks/useTodayDiet";

export default function HomeClient() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [editingLimitItem, setEditingLimitItem] = useState<DietItem | null>(
    null,
  );

  const [savingLimit, setSavingLimit] = useState(false);
  const [deletingItem, setDeletingItem] = useState<DietItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  const {
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
  } = useTodayDiet();

  async function saveDailyLimit(dailyLimit: number, unit: string) {
    if (!editingLimitItem) return;

    try {
      setSavingLimit(true);

      const response = await fetch(
        `/api/user-diet-items/${editingLimitItem.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dailyLimit,
            unit,
          }),
        },
      );

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error ?? "Could not update daily limit");
      }

      await fetchData();

      setEditingLimitItem(null);

      toast.success("Daily limit updated successfully");
    } catch (error) {
      console.error("Daily limit update failed:", error);

      toast.error(
        error instanceof Error ? error.message : "Could not update daily limit",
      );
    } finally {
      setSavingLimit(false);
    }
  }

  async function deleteProduct() {
    if (!deletingItem) return;

    try {
      setDeletingProduct(true);

      const response = await fetch(`/api/user-diet-items/${deletingItem.id}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error ?? "Could not delete product");
      }

      await fetchData();

      setDeletingItem(null);

      toast.success("Product removed");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error ? error.message : "Could not delete product",
      );
    } finally {
      setDeletingProduct(false);
    }
  }

  const renderDietItem = (item: DietItem) => (
    <DietItemCard
      key={item.id}
      item={item}
      itemLogs={getItemLogs(item.id)}
      eaten={getEatenAmount(item.id)}
      onAdd={openFoodModal}
      onEdit={editLog}
      onDelete={deleteLog}
      onEditLimit={setEditingLimitItem}
      onDeleteProduct={setDeletingItem}
    />
  );

  if (loading) {
    return <main className="p-6 text-zinc-900">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-4 text-zinc-900">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{getFormattedRomaniaDate()}</h1>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            + Product
          </button>

          <Link
            href="/history"
            className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
          >
            History
          </Link>

          <button
            type="button"
            onClick={resetToday}
            className="rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600"
          >
            Reset day
          </button>

          <button
            type="button"
            onClick={() =>
              signOut({
                callbackUrl: "/login",
              })
            }
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200"
          >
            Logout
          </button>
        </div>
      </div>

      <WeightCard weight={weight} onOpen={() => setIsWeightModalOpen(true)} />

      <div className="space-y-3">
        {fruitItems.length > 0 && (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-500">
              Fruits / Watermelon
            </h2>

            <div className="space-y-5">{fruitItems.map(renderDietItem)}</div>
          </div>
        )}

        {meatItems.length > 0 && (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-500">
              Meat / Fish
            </h2>

            <div className="space-y-5">{meatItems.map(renderDietItem)}</div>
          </div>
        )}

        {regularItems.map((item) => (
          <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
            {renderDietItem(item)}
          </div>
        ))}
      </div>

      {isWeightModalOpen && (
        <WeightModal
          weight={weight}
          setWeight={setWeight}
          onClose={() => setIsWeightModalOpen(false)}
          onSave={saveWeight}
        />
      )}

      {selectedItem && (
        <FoodLogModal
          selectedItem={selectedItem}
          amount={amount}
          setAmount={setAmount}
          editingLogId={editingLogId}
          onClose={closeFoodModal}
          onSave={saveFoodLog}
        />
      )}

      <ProductSearchModal
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onImported={async () => {
          await fetchData();
          setIsSearchOpen(false);
        }}
      />

      <DailyLimitModal
        open={editingLimitItem !== null}
        productName={editingLimitItem?.name ?? ""}
        initialLimit={editingLimitItem?.daily_limit ?? ""}
        initialUnit={editingLimitItem?.unit ?? "g"}
        saving={savingLimit}
        title="Edit daily limit"
        submitText="Save changes"
        onClose={() => {
          if (!savingLimit) {
            setEditingLimitItem(null);
          }
        }}
        onSave={saveDailyLimit}
      />

      <DeleteProductModal
        open={deletingItem !== null}
        productName={deletingItem?.name ?? ""}
        loading={deletingProduct}
        onClose={() => {
          if (!deletingProduct) {
            setDeletingItem(null);
          }
        }}
        onDelete={deleteProduct}
      />
    </main>
  );
}
