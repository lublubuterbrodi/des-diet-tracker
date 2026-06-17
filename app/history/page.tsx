"use client";

import Link from "next/link";
import { useState } from "react";
import { HistoryDateCard } from "@/app/components/HistoryDateCard";
import { HistoryModal } from "@/app/components/HistoryModal";
import { useHistory } from "@/app/hooks/useHistory";

export default function HistoryPage() {
  const { items, logs, dates, loading } = useHistory();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
        <div className="space-y-3">
          {dates.map((date) => (
            <HistoryDateCard
              key={date}
              date={date}
              onClick={() => setSelectedDate(date)}
            />
          ))}
        </div>
      )}

      {selectedDate && (
        <HistoryModal
          date={selectedDate}
          items={items}
          logs={logs}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </main>
  );
}
