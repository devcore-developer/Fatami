"use client";

import { Product } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { ArrowLeft } from "lucide-react";
import { useUI } from "@/store";

interface ProductRailProps {
  title: string;
  eyebrow?: string;
  products: Product[];
  viewAllView?: "shop" | "home";
}

export function ProductRail({
  title,
  eyebrow,
  products,
  viewAllView = "shop",
}: ProductRailProps) {
  const { setView } = useUI();
  if (products.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="container-luxe">
        <div className="flex items-end justify-between mb-10">
          <div>
            {eyebrow && (
              <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-2">
                {eyebrow}
              </p>
            )}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              {title}
            </h2>
          </div>
          <button
            onClick={() => setView(viewAllView)}
            className="group inline-flex items-center gap-2 text-xs tracking-luxe uppercase border-b border-foreground pb-1 hover:gap-3 transition-all"
          >
            عرض الكل
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
          {products.slice(0, 4).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
