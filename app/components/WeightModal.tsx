type WeightModalProps = {
  weight: string;
  setWeight: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export function WeightModal({
  weight,
  setWeight,
  onClose,
  onSave,
}: WeightModalProps) {
  return (
    <div className="fixed inset-0 flex items-end bg-black/40 p-4">
      <div className="w-full rounded-3xl bg-white p-5">
        <h2 className="text-xl font-bold text-zinc-900">Today&apos;s weight</h2>

        <p className="mt-1 text-sm text-zinc-500">Enter your weight</p>

        <div className="mt-4 flex items-center gap-3">
          <input
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            type="text"
            inputMode="decimal"
            placeholder="45,5"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-lg text-zinc-900 outline-none"
          />

          <span className="text-lg font-medium text-zinc-900">kg</span>
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
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
