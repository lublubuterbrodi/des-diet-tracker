"use client";

interface ProductSearchResultProps {
  product: {
    fdcId: number;
    description: string;
    brandOwner: string | null;
    foodCategory: string | null;
    imported: boolean;
  };

  onSelect: () => void;
}

export default function ProductSearchResult({
  product,
  onSelect,
}: ProductSearchResultProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-green-500 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-zinc-900">
            {product.description}
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            {product.foodCategory ?? "Unknown category"}
          </p>

          {product.brandOwner && (
            <p className="mt-2 text-xs text-zinc-400">
              Brand: {product.brandOwner}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onSelect}
          disabled={product.imported}
          className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition ${
            product.imported
              ? "bg-emerald-600"
              : "bg-green-600 hover:bg-green-700"
          } disabled:cursor-not-allowed`}
        >
          {product.imported ? "✓ Imported" : "Import"}
        </button>
      </div>
    </div>
  );
}
