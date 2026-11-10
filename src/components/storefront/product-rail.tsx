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
    <section className="py-12 sm:py-16 lg:py-20 bg-surface">
      <div className="container-luxe">
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            {eyebrow && (
              <div className="flex items-center gap-3 mb-2.5">
                <span className="h-px w-8 bg-brown/40" />
                <p className="text-xs tracking-luxe text-brown font-medium">
                  {eyebrow}
                </p>
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-bold text-charcoal">
              {title}
            </h2>
          </div>
          <button
            onClick={() => setView(viewAllView)}
            className="group hidden sm:inline-flex items-center gap-2 text-xs font-medium text-muted-brand hover:text-brown transition-colors pb-1 border-b border-transparent hover:border-brown"
          >
            عرض الكل
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:gap-x-6">
          {products.slice(0, 4).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <button
            onClick={() => setView(viewAllView)}
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-brand border-b border-hairline pb-1"
          >
            عرض الكل
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}