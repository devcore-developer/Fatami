"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { Category, KuwaitGovernorate, Product } from "@/types";
import {
  categories as mockCategories,
  products as mockProducts,
  kuwaitGovernorates as mockGovernorates,
} from "@/data/catalog";

interface CatalogContextValue {
  products: Product[];
  categories: Category[];
  governorates: KuwaitGovernorate[];
  loaded: boolean;
  getProductBySlug: (slug: string) => Product | undefined;
  getCategoryById: (id: string) => Category | undefined;
  refresh: () => void;
}

const CatalogContext = createContext<CatalogContextValue>({
  products: mockProducts,
  categories: mockCategories,
  governorates: mockGovernorates,
  loaded: false,
  getProductBySlug: (slug) => mockProducts.find((p) => p.slug === slug),
  getCategoryById: (id) => mockCategories.find((c) => c.id === id),
  refresh: () => {},
});

export function useCatalog() {
  return useContext(CatalogContext);
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? (json.data as T) : null;
  } catch {
    return null;
  }
}

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [governorates, setGovernorates] = useState<KuwaitGovernorate[]>(mockGovernorates);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const [p, c, g] = await Promise.all([
      fetchJson<Product[]>("/api/products"),
      fetchJson<Category[]>("/api/categories"),
      fetchJson<KuwaitGovernorate[]>("/api/governorates"),
    ]);
    if (p && p.length > 0) setProducts(p);
    if (c && c.length > 0) setCategories(c);
    if (g && g.length > 0) setGovernorates(g);
    setLoaded(true);
  }, []);

  // Hydrate from DB on mount (one-time). Using a ref guard to avoid double-trigger in strict mode.
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const getProductBySlug = useCallback(
    (slug: string) => products.find((p) => p.slug === slug),
    [products]
  );
  const getCategoryById = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories]
  );

  return (
    <CatalogContext.Provider
      value={{
        products,
        categories,
        governorates,
        loaded,
        getProductBySlug,
        getCategoryById,
        refresh: load,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}
