"use client";

import { useMemo, useState } from "react";
import { Product } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { useCatalog } from "@/components/storefront/catalog-provider";
import { useUI } from "@/store";
import { SlidersHorizontal, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type SortOption = "newest" | "price-asc" | "price-desc" | "name";

interface ProductGridProps {
  products: Product[];
  initialCategory?: string | null;
}

export function ProductGrid({ products, initialCategory = null }: ProductGridProps) {
  const { openCategory, activeCategoryId } = useUI();
  const { categories } = useCatalog();
  const categoryId = initialCategory ?? activeCategoryId;
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...products];
    if (categoryId) result = result.filter((p) => p.categoryId === categoryId);
    if (selectedSizes.length > 0)
      result = result.filter((p) =>
        p.sizes.some((s) => selectedSizes.includes(s.size) && s.stock > 0)
      );
    result = result.filter((p) => p.price <= maxPrice);

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.nameAr.localeCompare(b.nameAr, "ar"));
        break;
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
    return result;
  }, [products, categoryId, selectedSizes, maxPrice, sortBy]);

  const activeCategory = categoryId
    ? categories.find((c) => c.id === categoryId)
    : null;

  const allSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );

  const resetFilters = () => {
    setSelectedSizes([]);
    setMaxPrice(200);
    openCategory("");
    useUI.setState({ activeCategoryId: null });
  };

  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="container-luxe">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="text-center">
            <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-2">
              المتجر
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold">
              {activeCategory ? activeCategory.nameAr : "جميع المنتجات"}
            </h1>
            {activeCategory && (
              <button
                onClick={resetFilters}
                className="mt-3 text-xs text-muted-foreground hover:text-foreground underline"
              >
                عرض جميع المنتجات
              </button>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 border-y border-border py-3">
            {/* Desktop filters */}
            <div className="hidden md:flex items-center gap-4 flex-wrap">
              <button
                onClick={() => useUI.setState({ activeCategoryId: null })}
                className={`text-xs tracking-luxe uppercase pb-0.5 ${
                  !categoryId
                    ? "border-b border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                الكل
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openCategory(c.id)}
                  className={`text-xs tracking-luxe uppercase pb-0.5 ${
                    categoryId === c.id
                      ? "border-b border-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.nameAr}
                </button>
              ))}
            </div>

            {/* Mobile filter trigger */}
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <button className="md:hidden inline-flex items-center gap-2 text-xs tracking-luxe uppercase">
                  <SlidersHorizontal className="h-4 w-4" />
                  تصفية وترتيب
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle className="text-right">تصفية وترتيب</SheetTitle>
                </SheetHeader>
                <div className="px-4 py-4 space-y-6">
                  <MobileFilters
                    categories={categories}
                    categoryId={categoryId}
                    onSelect={(id) => {
                      openCategory(id);
                      setShowFilters(false);
                    }}
                    allSizes={allSizes}
                    selectedSizes={selectedSizes}
                    toggleSize={toggleSize}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    reset={resetFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {filtered.length} منتج
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs bg-transparent border border-border px-3 py-2 cursor-pointer hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="newest">الأحدث</option>
                <option value="price-asc">السعر: تصاعدي</option>
                <option value="price-desc">السعر: تنازلي</option>
                <option value="name">الاسم</option>
              </select>
            </div>
          </div>

          {/* Desktop size filter chips */}
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground ml-2">المقاس:</span>
            {allSizes.map((s) => (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                className={`h-9 min-w-9 px-3 text-xs tracking-luxe uppercase border transition-colors ${
                  selectedSizes.includes(s)
                    ? "bg-black text-white border-black"
                    : "border-border hover:border-foreground"
                }`}
              >
                {s}
              </button>
            ))}
            {(selectedSizes.length > 0 || categoryId) && (
              <button
                onClick={resetFilters}
                className="text-xs text-muted-foreground hover:text-foreground underline mr-2"
              >
                إعادة ضبط
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground mb-2">لا توجد منتجات مطابقة</p>
            <button
              onClick={resetFilters}
              className="text-sm underline hover:text-foreground"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function MobileFilters({
  categories,
  categoryId,
  onSelect,
  allSizes,
  selectedSizes,
  toggleSize,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  reset,
}: any) {
  return (
    <>
      <div>
        <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-3">
          التشكيلات
        </p>
        <div className="space-y-2">
          <button
            onClick={() => onSelect("")}
            className={`block w-full text-right py-2 text-sm ${
              !categoryId ? "font-bold" : "text-muted-foreground"
            }`}
          >
            الكل
          </button>
          {categories.map((c: any) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`block w-full text-right py-2 text-sm ${
                categoryId === c.id ? "font-bold" : "text-muted-foreground"
              }`}
            >
              {c.nameAr}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-3">
          المقاس
        </p>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((s: string) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={`h-9 min-w-9 px-3 text-xs border ${
                selectedSizes.includes(s)
                  ? "bg-black text-white border-black"
                  : "border-border"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-3">
          السعر الأقصى: {maxPrice} د.ك
        </p>
        <input
          type="range"
          min={20}
          max={200}
          step={5}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-3">
          ترتيب
        </p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full text-sm bg-transparent border border-border px-3 py-2"
        >
          <option value="newest">الأحدث</option>
          <option value="price-asc">السعر: تصاعدي</option>
          <option value="price-desc">السعر: تنازلي</option>
          <option value="name">الاسم</option>
        </select>
      </div>

      <button
        onClick={reset}
        className="w-full py-3 text-xs tracking-luxe uppercase border border-foreground hover:bg-foreground hover:text-background transition-colors"
      >
        إعادة ضبط الفلاتر
      </button>
    </>
  );
}
