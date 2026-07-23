"use client";

type DeleteProductModalProps = {
  open: boolean;
  productName: string;
  loading?: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
};

export default function DeleteProductModal({
  open,
  productName,
  loading = false,
  onClose,
  onDelete,
}: DeleteProductModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 p-4"
      onClick={() => {
        if (!loading) {
          onClose();
        }
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h2 className="text-xl font-bold text-zinc-900">Delete product</h2>

        <p className="mt-3 text-zinc-600">
          Remove
          <span className="font-semibold"> {productName}</span> from your diet?
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          All food logs for this product will also be deleted.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            disabled={loading}
            onClick={onClose}
            className="rounded-xl border border-zinc-300 px-4 py-2 hover:bg-zinc-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={onDelete}
            className="rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
