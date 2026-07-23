"use client";

import { Pencil, Settings2, Trash2, X } from "lucide-react";

import type { DietItem, FoodLog } from "../types/types";

type DietItemCardProps = {
  item: DietItem;
  itemLogs: FoodLog[];
  eaten: number;

  onAdd: (item: DietItem) => void;
  onEdit: (item: DietItem, log: FoodLog) => void;
  onDelete: (logId: string) => void;

  onEditLimit: (item: DietItem) => void;
  onDeleteProduct: (item: DietItem) => void;
};

export function DietItemCard({
  item,
  itemLogs,
  eaten,
  onAdd,
  onEdit,
  onDelete,
  onEditLimit,
  onDeleteProduct,
}: DietItemCardProps) {
  const progress =
    item.daily_limit > 0 ? Math.min((eaten / item.daily_limit) * 100, 100) : 0;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold text-zinc-900">
            {item.name}
          </h2>

          <p className="mt-1 text-lg font-bold text-zinc-900">
            {eaten} / {item.daily_limit} {item.unit}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEditLimit(item)}
            className="rounded-lg border border-zinc-300 p-2 transition hover:bg-zinc-100"
            title="Edit daily limit"
          >
            <Settings2 size={18} />
          </button>

          <button
            onClick={() => onDeleteProduct(item)}
            className="rounded-lg border border-red-300 p-2 text-red-600 transition hover:bg-red-50"
            title="Delete product"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {itemLogs.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {itemLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1 text-sm"
            >
              <span>
                {log.amount} {item.unit}
              </span>

              <button onClick={() => onEdit(item, log)}>
                <Pencil size={12} />
              </button>

              <button onClick={() => onDelete(log.id)}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => onAdd(item)}
        className="mt-5 w-full rounded-xl bg-blue-600 py-2 font-medium text-white transition hover:bg-blue-700"
      >
        + Add
      </button>
    </div>
  );
}
