type WeightCardProps = {
  weight: string;
  onOpen: () => void;
};

export function WeightCard({ weight, onOpen }: WeightCardProps) {
  return (
    <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">Today&apos;s weight</p>
          <p className="text-lg font-bold text-zinc-900">
            {weight ? `${weight} kg` : "Not added"}
          </p>
        </div>

        <button
          onClick={onOpen}
          className="rounded-lg bg-blue-500 px-3 py-2 text-sm text-white"
        >
          {weight ? "Edit" : "+ Add"}
        </button>
      </div>
    </div>
  );
}
