"use client";

import { Product } from "@/types";
import { useCart, useUI } from "@/store";
import { formatPrice } from "@/lib/format";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { openProduct } = useUI();
  const { addItem } = useCart();

  const primaryImage = product.images?.[0];
  const secondaryImage = product.images?.[1] ?? primaryImage;
  const placeholderUrl =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-size='14' text-anchor='middle' fill='%23999' font-family='sans-serif'%3EFATAMI%3C/text%3E%3C/svg%3E";
  const primaryUrl = primaryImage?.url ?? placeholderUrl;
  const secondaryUrl = secondaryImage?.url ?? primaryUrl;
  const primaryAlt = primaryImage?.alt ?? product.nameAr;
  const firstAvailableSize = product.sizes?.find((s) => s.stock > 0);
  const outOfStock = !firstAvailableSize;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  const quickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    addItem(product, firstAvailableSize!.size, 1);
  };

  return (
    <article
      className="group cursor-pointer animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 60, 400)}ms` }}
      onClick={() => openProduct(product.slug)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        {/* Primary image */}
        <img
          src={primaryUrl}
          alt={primaryAlt}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          loading="lazy"
        />
        {/* Secondary image */}
        <img
          src={secondaryUrl}
          alt={primaryAlt}
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {product.newArrival && (
            <span className="bg-white text-black text-[10px] tracking-luxe uppercase px-2.5 py-1 font-medium">
              جديد
            </span>
          )}
          {hasDiscount && (
            <span className="bg-black text-white text-[10px] tracking-luxe uppercase px-2.5 py-1 font-medium">
              تخفيض
            </span>
          )}
          {product.bestSeller && !product.newArrival && (
            <span className="bg-white/90 text-black text-[10px] tracking-luxe uppercase px-2.5 py-1 font-medium">
              الأكثر مبيعاً
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm tracking-luxe uppercase font-medium">
              نفذت الكمية
            </span>
          </div>
        )}

        {/* Quick add button (desktop hover) */}
        {!outOfStock && (
          <button
            onClick={quickAdd}
            className="absolute bottom-0 inset-x-0 bg-black/90 text-white py-3.5 text-xs tracking-luxe uppercase font-medium translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            إضافة سريعة
          </button>
        )}
      </div>

      {/* Info */}
      <div className="pt-4 pb-2 text-center">
        <h3 className="text-sm font-medium mb-1 line-clamp-1">
          {product.nameAr}
        </h3>
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-medium">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
