import type { DietItem } from "../types";

type FoodLogModalProps = {
  selectedItem: DietItem;
  amount: string;
  setAmount: (value: string) => void;
  editingLogId: string | null;
  onClose: () => void;
  onSave: () => void;
};

export function FoodLogModal({
  selectedItem,
  amount,
  setAmount,
  editingLogId,
  onClose,
  onSave,
}: FoodLogModalProps) {
  return (
    <div className="fixed inset-0 flex items-end bg-black/40 p-4">
      <div className="w-full rounded-3xl bg-white p-5">
        <h2 className="text-xl font-bold text-zinc-900">
          {editingLogId ? "Edit amount" : selectedItem.name}
        </h2>

        <p className="mt-1 text-sm text-zinc-500">How much did you eat?</p>

        <div className="mt-4 flex items-center gap-3">
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            placeholder="Amount"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-lg text-zinc-900 outline-none"
          />

          <span className="text-lg font-medium text-zinc-900">
            {selectedItem.unit}
          </span>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-zinc-200 py-3 font-medium text-zinc-900"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="w-full rounded-xl bg-blue-500 py-3 font-medium text-white"
          >
            {editingLogId ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
