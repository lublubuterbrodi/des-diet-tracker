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
    <main className="min-h-screen bg-zinc-100 px-4 py-5 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-6 rounded-2xl bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-zinc-500">
                Daily nutrition
              </p>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {getFormattedRomaniaDate()}
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                + Add product
              </button>

              <Link
                href="/history"
                className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                History
              </Link>

              <button
                type="button"
                onClick={resetToday}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
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
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main dashboard */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Diet */}
          <section className="min-w-0 space-y-5">
            {/* Fruits */}
            {fruitItems.length > 0 && (
              <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Category
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-zinc-900">
                      Fruits / Watermelon
                    </h2>
                  </div>

                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">
                    {fruitItems.length}{" "}
                    {fruitItems.length === 1 ? "product" : "products"}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {fruitItems.map(renderDietItem)}
                </div>
              </div>
            )}

            {/* Meat */}
            {meatItems.length > 0 && (
              <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Category
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-zinc-900">
                      Meat / Fish
                    </h2>
                  </div>

                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">
                    {meatItems.length}{" "}
                    {meatItems.length === 1 ? "product" : "products"}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {meatItems.map(renderDietItem)}
                </div>
              </div>
            )}

            {/* Regular products */}
            {regularItems.length > 0 && (
              <div>
                <div className="mb-3 flex items-end justify-between px-1">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Daily diet
                    </p>

                    <h2 className="mt-1 text-lg font-bold">Other products</h2>
                  </div>

                  <span className="text-sm text-zinc-400">
                    {regularItems.length}{" "}
                    {regularItems.length === 1 ? "product" : "products"}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {regularItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
                    >
                      {renderDietItem(item)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {fruitItems.length === 0 &&
              meatItems.length === 0 &&
              regularItems.length === 0 && (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    Your diet is empty
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                    Add products to create your daily diet and start tracking
                    your nutrition.
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="mt-5 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    + Add your first product
                  </button>
                </div>
              )}
          </section>

          {/* Sidebar */}
          <aside className="order-first lg:order-0">
            <div className="space-y-4 lg:sticky lg:top-6">
              <WeightCard
                weight={weight}
                onOpen={() => setIsWeightModalOpen(true)}
              />

              {/* Desktop helper card */}
              <div className="hidden rounded-2xl bg-white p-5 shadow-sm lg:block">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Quick actions
                </p>

                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="w-full rounded-xl bg-green-600 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    + Add product
                  </button>

                  <Link
                    href="/history"
                    className="w-full rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-200"
                  >
                    View history
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Modals */}
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
      </div>
    </main>
  );
}
