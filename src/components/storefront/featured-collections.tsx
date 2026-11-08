"use client";

import { ArrowLeft } from "lucide-react";
import { useUI } from "@/store";
import { useCatalog } from "@/components/storefront/catalog-provider";
import { images } from "@/data/catalog";

export function FeaturedCollections() {
  const { openCategory } = useUI();
  // Use curated collections grouping
  const collections = [
    {
      id: "cat-abayas",
      title: "العبايات",
      subtitle: "فخامة الأصالة",
      image: images.collection1,
      span: "lg:col-span-2 lg:row-span-2",
      h: "h-[420px] lg:h-full",
    },
    {
      id: "cat-dresses",
      title: "الفساتين",
      subtitle: "إطلالة ساحرة",
      image: images.collection2,
      span: "",
      h: "h-[280px]",
    },
    {
      id: "cat-kaftans",
      title: "القفاطين",
      subtitle: "أناقة المناسبات",
      image: images.collection3,
      span: "",
      h: "h-[280px]",
    },
    {
      id: "cat-sets",
      title: "الأطقم",
      subtitle: "تناسق مثالي",
      image: images.kimono1,
      span: "lg:col-span-2",
      h: "h-[280px]",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container-luxe">
        <div className="text-center mb-12 sm:mb-16 animate-fade-up">
          <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-3">
            تشكيلات مختارة
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            مجموعاتنا المميزة
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-4 sm:gap-6">
          {collections.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => openCategory(c.id)}
              className={`group relative overflow-hidden ${c.span} ${c.h} animate-fade-up`}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <img
                src={c.image}
                alt={c.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6">
                <p className="text-xs tracking-luxe uppercase text-white/70 mb-2">
                  {c.subtitle}
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                  {c.title}
                </h3>
                <span className="inline-flex items-center gap-2 text-xs tracking-luxe uppercase border-b border-white/60 pb-1 group-hover:border-white transition-colors">
                  تصفحي
                  <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
