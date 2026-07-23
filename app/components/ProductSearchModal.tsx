"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useProductSearch } from "@/app/hooks/useProductSearch";
import { useDebounce } from "@/app/hooks/useDebounce";

import DailyLimitModal from "./DailyLimitModal";
import ProductSearchResult from "./ProductSearchResult";
import ProductSearchSkeleton from "./ProductSearchSkeleton";

type SearchProduct = {
  fdcId: number;
  description: string;
  brandOwner: string | null;
  foodCategory: string | null;
  imported: boolean;
};

interface ProductSearchModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => Promise<void>;
}

export default function ProductSearchModal({
  open,
  onClose,
  onImported,
}: ProductSearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<SearchProduct | null>(
    null,
  );
  const [importing, setImporting] = useState(false);

  const debouncedQuery = useDebounce(query);

  const { products, loading } = useProductSearch(debouncedQuery);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !selectedProduct && !importing) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, selectedProduct, importing, onClose]);

  if (!open) {
    return null;
  }

  async function handleImport(dailyLimit: number, unit: string) {
    if (!selectedProduct) return;

    try {
      setImporting(true);

      const response = await fetch("/api/usda/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fdcId: selectedProduct.fdcId,
          dailyLimit,
          unit,
        }),
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error ?? "Failed to import product");
      }

      toast.success("Product added successfully");

      setSelectedProduct(null);
      setQuery("");

      await onImported();
    } catch (error) {
      console.error("Product import failed:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to import product",
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <div
          className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b p-5">
            <h2 className="text-xl font-bold">Add product</h2>

            <button
              type="button"
              onClick={onClose}
              className="text-2xl text-zinc-500 transition hover:text-black"
            >
              ✕
            </button>
          </div>

          <div className="border-b p-5">
            <input
              autoFocus
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-green-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {query.trim() === "" && (
              <p className="text-center text-zinc-500">
                Start typing to search USDA products.
              </p>
            )}

            {loading && (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ProductSearchSkeleton key={index} />
                ))}
              </div>
            )}

            {!loading && query.trim() !== "" && products.length === 0 && (
              <p className="text-center text-zinc-500">Nothing found.</p>
            )}

            {!loading && (
              <div className="space-y-3">
                {products.map((product) => (
                  <ProductSearchResult
                    key={product.fdcId}
                    product={product}
                    onSelect={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DailyLimitModal
        open={selectedProduct !== null}
        productName={selectedProduct?.description ?? ""}
        initialUnit="g"
        saving={importing}
        title="Set daily limit"
        submitText="Add product"
        onClose={() => {
          if (!importing) {
            setSelectedProduct(null);
          }
        }}
        onSave={handleImport}
      />
    </>
  );
}
