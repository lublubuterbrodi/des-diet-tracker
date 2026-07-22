"use client";

import { useState } from "react";
import Link from "next/link";

import type { DietItem } from "./types/types";
import { getFormattedRomaniaDate } from "./utils";

import { DietItemCard } from "./components/DietItemCard";
import { FoodLogModal } from "./components/FoodLogModal";
import ProductSearchModal from "./components/ProductSearchModal";
import { WeightCard } from "./components/WeightCard";
import { WeightModal } from "./components/WeightModal";
import { useTodayDiet } from "./hooks/useTodayDiet";

export default function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  const renderDietItem = (item: DietItem) => (
    <DietItemCard
      key={item.id}
      item={item}
      itemLogs={getItemLogs(item.id)}
      eaten={getEatenAmount(item.id)}
      onAdd={openFoodModal}
      onEdit={editLog}
      onDelete={deleteLog}
    />
  );

  if (loading) {
    return <main className="p-6 text-zinc-900">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-4 text-zinc-900">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{getFormattedRomaniaDate()}</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white"
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
            onClick={resetToday}
            className="rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white"
          >
            Reset day
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
    </main>
  );
}
