"use client";

import { useEffect, useState } from "react";
import type {
  Category,
  KuwaitGovernorate,
  Product,
} from "@/types";

// Client-side data hooks that fetch from the real API (backed by Prisma).
// Falls back to mock data on error so the UI always renders.

import {
  categories as mockCategories,
  products as mockProducts,
  kuwaitGovernorates as mockGovernorates,
} from "@/data/catalog";

async function fetchJson<T>(url: string): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export function useStoreData() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [governorates, setGovernorates] = useState<KuwaitGovernorate[]>(mockGovernorates);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, c, g] = await Promise.all([
        fetchJson<Product[]>("/api/products"),
        fetchJson<Category[]>("/api/categories"),
        fetchJson<KuwaitGovernorate[]>("/api/governorates"),
      ]);
      if (p.success && p.data && p.data.length > 0) setProducts(p.data);
      if (c.success && c.data && c.data.length > 0) setCategories(c.data);
      if (g.success && g.data && g.data.length > 0) setGovernorates(g.data);
      setLoaded(true);
    })();
  }, []);

  return { products, categories, governorates, loaded };
}
