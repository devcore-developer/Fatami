"use client";

import { ArrowLeft } from "lucide-react";
import { useUI } from "@/store";
import { images } from "@/data/catalog";

export function FeaturedCollections() {
  const { openCategory } = useUI();

  const collections = [
    {
      id: "cat-abayas",
      title: "العبايات",
      subtitle: "فخامة الأصالة",
      image: images.collection1,
      span: "lg:col-span-2 lg:row-span-2",
      h: "h-[280px] sm:h-[300px] lg:h-full",
    },
    {
      id: "cat-dresses",
      title: "الفساتين",
      subtitle: "إطلالة ساحرة",
      image: images.collection2,
      span: "",
      h: "h-[280px] sm:h-[300px] lg:h-full",
    },
    {
      id: "cat-sets",
      title: "الأطقم",
      subtitle: "تناسق مثالي",
      image: images.kimono1,
      span: "",
      h: "h-[280px] sm:h-[300px] lg:h-full",
    },
    {
      id: "cat-kaftans",
      title: "القفاطين",
      subtitle: "أناقة المناسبات",
      image: images.collection3,
      span: "lg:col-span-2",
      h: "h-[280px] sm:h-[300px] lg:h-full",
    },
  ];

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

        {/* ── Mobile: Cards with text BELOW image (no overlay) ── */}
        <div className="grid grid-cols-2 lg:hidden gap-3">
          {collections.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => openCategory(c.id)}
              className="group overflow-hidden rounded-2xl border border-hairline bg-surface animate-fade-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden bg-beige">
                <img
                  src={c.image}
                  alt={c.title}
                  className="w-full h-full object-cover img-zoom"
                  loading="lazy"
                />
              </div>
              {/* Text below image — clearly visible, no overlay */}
              <div className="p-3 text-center">
                <h3 className="text-sm font-bold text-charcoal mb-0.5">{c.title}</h3>
                <p className="text-[10px] text-muted-brand line-clamp-1">{c.subtitle}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── Desktop: Editorial asymmetric grid with overlay (unchanged) ── */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:grid-rows-2 gap-4 lg:h-[560px]">
          {collections.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => openCategory(c.id)}
              className={`group relative overflow-hidden ${c.span} ${c.h} animate-fade-up rounded-2xl`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <img
                src={c.image}
                alt={c.title}
                className="w-full h-full object-cover img-zoom"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/10 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-7 text-cream">
                <p className="text-xs text-cream/75 mb-1.5 font-light">
                  {c.subtitle}
                </p>
                <h3 className="text-xl lg:text-2xl font-bold mb-3 text-cream">
                  {c.title}
                </h3>
                <span className="inline-flex items-center gap-2 text-xs text-cream/90 border-b border-cream/40 pb-0.5 w-fit group-hover:border-cream group-hover:gap-3 transition-all duration-300">
                  تصفحي
                  <ArrowLeft className="h-3 w-3 transition-transform duration-300 group-hover:-translate-x-1" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}