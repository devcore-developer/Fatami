"use client";

import { useUI } from "@/store";
import { useCatalog } from "@/components/storefront/catalog-provider";
import { ProductGrid } from "@/components/product/product-grid";

export function ShopView() {
  const { activeCategoryId, searchQuery } = useUI();
  const { products } = useCatalog();

  let filtered = products.filter((p) => p.active);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.nameAr.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  return (
    <div className="bg-background">
      <ProductGrid products={filtered} initialCategory={activeCategoryId} />
    </div>
  );
}
