"use client";

import { useEffect, useState } from "react";

interface ProductSearchResult {
  fdcId: number;
  description: string;
  brandOwner: string | null;
  foodCategory: string | null;
}

export function useProductSearch(query: string) {
  const [products, setProducts] = useState<ProductSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/usda/search?query=${encodeURIComponent(trimmed)}`
        );

        if (!response.ok) {
          throw new Error("Failed to search products");
        }

        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  return {
    products: query.trim().length < 2 ? [] : products,
    loading,
  };
}