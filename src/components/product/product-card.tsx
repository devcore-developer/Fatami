"use client";

import { Product } from "@/types";
import { useCart, useUI } from "@/store";
import { formatPrice } from "@/lib/format";
import { ShoppingBag } from "lucide-react";

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
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='375'%3E%3Crect width='100%25' height='100%25' fill='%23EFE4DA'/%3E%3Ctext x='50%25' y='50%25' font-size='13' text-anchor='middle' fill='%23B39A88' font-family='sans-serif'%3EFutami%3C/text%3E%3C/svg%3E";
  const primaryUrl = primaryImage?.url ?? placeholderUrl;
  const secondaryUrl = secondaryImage?.url ?? primaryUrl;
  const primaryAlt = primaryImage?.alt ?? product.nameAr;
  const firstAvailableSize = product.sizes?.[0];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  const quickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (firstAvailableSize) addItem(product, firstAvailableSize.size, 1);
  };

  return (
    <article
      className="group cursor-pointer animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
      onClick={() => openProduct(product.slug)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-beige rounded-2xl">
        {/* Primary image */}
        <img
          src={primaryUrl}
          alt={primaryAlt}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out group-hover:opacity-0"
          loading="lazy"
        />
        {/* Secondary image on hover */}
        <img
          src={secondaryUrl}
          alt={primaryAlt}
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {product.newArrival && (
            <span className="bg-surface text-charcoal text-[10px] font-medium px-2.5 py-1 rounded-full shadow-sm">
              جديد
            </span>
          )}
          {hasDiscount && (
            <span className="bg-brown text-cream text-[10px] font-medium px-2.5 py-1 rounded-full shadow-sm">
              تخفيض
            </span>
          )}
        </div>

        {/* Quick add — slides up on hover (desktop) */}
        <button
          onClick={quickAdd}
          className="absolute bottom-0 inset-x-0 bg-charcoal text-cream py-3.5 text-xs font-medium translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex items-center justify-center gap-2 rounded-b-2xl"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          إضافة سريعة
        </button>
      </div>

      {/* Product info */}
      <div className="pt-3.5 pb-1">
        <h3 className="text-sm font-medium mb-1.5 line-clamp-1 leading-snug text-charcoal">
          {product.nameAr}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-charcoal">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-brand line-through font-light">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}