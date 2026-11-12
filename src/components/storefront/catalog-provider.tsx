"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { Category, KuwaitGovernorate, Product } from "@/types";
import {
  categories as mockCategories,
  products as mockProducts,
  kuwaitGovernorates as mockGovernorates,
} from "@/data/catalog";

// Storefront content shape — mirrors Prisma StorefrontContent model
export interface StorefrontContent {
  heroImage?: string | null;
  mobileHeroImage?: string | null;
  heroTitle?: string;
  heroDescription?: string;
  heroCollectionLabel?: string;
  heroPrimaryCtaText?: string;
  heroSecondaryCtaText?: string;
  editorialImage?: string | null;
  editorialTitle?: string;
  editorialDescription?: string;
  editorialCtaText?: string;
}

interface CatalogContextValue {
  products: Product[];
  categories: Category[];
  governorates: KuwaitGovernorate[];
  loaded: boolean;
  storefront: StorefrontContent | null;
  storefrontLoaded: boolean;
  getProductBySlug: (slug: string) => Product | undefined;
  getCategoryById: (id: string) => Category | undefined;
  refresh: () => void;
  refreshStorefront: () => void;
}

const CatalogContext = createContext<CatalogContextValue>({
  products: mockProducts,
  categories: mockCategories,
  governorates: mockGovernorates,
  loaded: false,
  storefront: null,
  storefrontLoaded: false,
  getProductBySlug: (slug) => mockProducts.find((p) => p.slug === slug),
  getCategoryById: (id) => mockCategories.find((c) => c.id === id),
  refresh: () => {},
  refreshStorefront: () => {},
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

export function CatalogProvider({
  children,
  initialStorefront,
}: {
  children: React.ReactNode;
  initialStorefront?: StorefrontContent | null;
}) {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [governorates, setGovernorates] = useState<KuwaitGovernorate[]>(mockGovernorates);
  const [loaded, setLoaded] = useState(false);
  // Start with server-provided storefront content (or null until loaded).
  // This is the key to eliminating the Hero image flash — the initial render
  // uses the persisted values from the server instead of a default image.
  const [storefront, setStorefront] = useState<StorefrontContent | null>(initialStorefront ?? null);
  const [storefrontLoaded, setStorefrontLoaded] = useState(!!initialStorefront);

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

  const refreshStorefront = useCallback(async () => {
    const data = await fetchJson<StorefrontContent>("/api/storefront");
    if (data) setStorefront(data);
    setStorefrontLoaded(true);
  }, []);

  // Hydrate from DB on mount (one-time). Using a ref guard to avoid double-trigger in strict mode.
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // If no initial storefront provided by server, fetch it client-side.
    if (!initialStorefront) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void refreshStorefront();
    }
  }, [load, refreshStorefront, initialStorefront]);

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
        storefront,
        storefrontLoaded,
        getProductBySlug,
        getCategoryById,
        refresh: load,
        refreshStorefront,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}