"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useUI } from "@/store";
import { useCatalog } from "@/components/storefront/catalog-provider";

export function FeaturedCollections() {
  const { openCategory } = useUI();
  const { categories, loaded } = useCatalog();

  // Source: actual DB categories (active only — the public /api/categories
  // endpoint filters them). Adds/removes in Admin are reflected here
  // automatically because the catalog context re-fetches on refresh.
  // Fallback subtitles per slug for nicer editorial copy.
  const subtitleBySlug: Record<string, string> = {
    abayas: "فخامة الأصالة",
    dresses: "إطلالة ساحرة",
    sets: "تناسق مثالي",
    kaftans: "أناقة المناسبات",
    bottoms: "إطلالة يومية",
  };

  const activeCats = categories.filter((c) => c.active !== false).slice(0, 6);

  const collections = activeCats.map((c) => ({
    id: c.id,
    title: c.nameAr,
    subtitle: subtitleBySlug[c.slug] ?? "تشكيلة مميزة",
    image: c.image ?? "",
  }));

  if (!loaded && collections.length === 0) {
    // No flash — just a soft placeholder while categories load.
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-cream">
        <div className="container-luxe">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="h-px w-8 bg-brown/40" />
              <p className="text-xs tracking-luxe text-brown font-medium">مجموعاتنا</p>
              <span className="h-px w-8 bg-brown/40" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-bold text-charcoal">اكتشفي مجموعتنا</h2>
          </div>
        </div>
      </section>
    );
  }

  if (collections.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-cream">
      <div className="container-luxe">
        {/* Section heading */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-8 bg-brown/40" />
            <p className="text-xs tracking-luxe text-brown font-medium">
              مجموعاتنا
            </p>
            <span className="h-px w-8 bg-brown/40" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-bold text-charcoal">
            اكتشفي مجموعتنا
          </h2>
        </div>

        {/* Uniform grid — same aspect ratio on every card, no asymmetric spans.
            Mobile: 2 cols, tablet: 2 cols, desktop: 3 cols. */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {collections.map((c, idx) => (
            <CollectionCard
              key={c.id}
              title={c.title}
              subtitle={c.subtitle}
              image={c.image}
              index={idx}
              onClick={() => openCategory(c.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Single card with consistent aspect ratio + onError fallback ── */
function CollectionCard({
  title,
  subtitle,
  image,
  index,
  onClick,
}: {
  title: string;
  subtitle: string;
  image: string;
  index: number;
  onClick: () => void;
}) {
  // If the image fails to load (404, stale URL, hot-link block) we hide the
  // <img> and fall back to the branded placeholder — no broken image icon.
  const [broken, setBroken] = useState(false);
  const showImage = image && !broken;

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-surface animate-fade-up text-right"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Consistent 4/5 portrait aspect on every card, every breakpoint */}
      <div className="relative aspect-[4/5] overflow-hidden bg-beige">
        {showImage ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover img-zoom"
            loading="lazy"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-brand p-4">
            <span className="text-sm font-bold text-charcoal/80 text-center mb-1">
              {title}
            </span>
            <span className="text-[10px] text-muted-brand text-center">
              {subtitle}
            </span>
          </div>
        )}
        {/* Subtle gradient overlay so the cream/white text reads on any image */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-charcoal/15 to-transparent" />
        {/* Title overlay — sits consistently at the bottom of every card */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-cream">
          <p className="text-[11px] text-cream/75 mb-1 font-light">{subtitle}</p>
          <h3 className="text-base sm:text-lg font-bold mb-2 text-cream">
            {title}
          </h3>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-cream/90 border-b border-cream/40 pb-0.5 group-hover:border-cream group-hover:gap-2.5 transition-all duration-300">
            تصفحي
            <ArrowLeft className="h-3 w-3 transition-transform duration-300 group-hover:-translate-x-1" />
          </span>
        </div>
      </div>
    </button>
  );
}