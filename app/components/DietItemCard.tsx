import { Pencil, X } from "lucide-react";
import type { DietItem, FoodLog } from "../types";

type DietItemCardProps = {
  item: DietItem;
  itemLogs: FoodLog[];
  eaten: number;
  onAdd: (item: DietItem) => void;
  onEdit: (item: DietItem, log: FoodLog) => void;
  onDelete: (logId: string) => void;
};

export function DietItemCard({
  item,
  itemLogs,
  eaten,
  onAdd,
  onEdit,
  onDelete,
}: DietItemCardProps) {
  const progress = Math.min((eaten / item.daily_limit) * 100, 100);

  return (
    <div>
      <div className="flex items-center gap-3">
        <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-zinc-900">
          {item.name}
        </h2>

        <div className="flex shrink-0 items-center gap-3">
          <p className="text-lg font-bold text-zinc-900">
            {eaten} / {item.daily_limit} {item.unit}
          </p>

          <button
            onClick={() => onAdd(item)}
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
              className="flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-900"
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
    </div>
  );
}
