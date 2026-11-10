"use client";

import { Hero } from "@/components/storefront/hero";
import { BenefitsBar } from "@/components/storefront/benefits-bar";
import { FeaturedCollections } from "@/components/storefront/featured-collections";
import { ProductRail } from "@/components/storefront/product-rail";
import { useCatalog } from "@/components/storefront/catalog-provider";
import { useUI } from "@/store";
import { images } from "@/data/catalog";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export function HomePage() {
  const { products } = useCatalog();
  const bestSellers = products.filter((p) => p.bestSeller && p.active).slice(0, 4);
  const { setView } = useUI();
  const [editorial, setEditorial] = useState<{
    editorialImage?: string | null;
    editorialTitle?: string;
    editorialDescription?: string;
    editorialCtaText?: string;
  }>({});

  useEffect(() => {
    fetch("/api/storefront")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setEditorial(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const editorialImage = editorial.editorialImage || images.hero2;
  const editorialTitle = editorial.editorialTitle || "الأناقة الخالدة تليق بك";
  const editorialDescription = editorial.editorialDescription || "اكتشفي مجموعتنا المميزة من التصاميم العصرية المصممة بعناية وأناقة متقنة";
  const editorialCtaText = editorial.editorialCtaText || "تسوقي المجموعة";

  return (
    <div className="bg-cream">
      <Hero />

      <BenefitsBar />

      <FeaturedCollections />

      <ProductRail
        title="الأكثر مبيعاً"
        eyebrow="اختيارات عملائنا"
        products={bestSellers}
      />

      {/* Editorial charcoal promotional banner */}
      <section className="relative bg-charcoal text-cream overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px] lg:min-h-[480px]">
          {/* Image — left side (desktop) / top (mobile) */}
          <div className="relative h-[300px] sm:h-[360px] lg:h-full order-1">
            <img
              src={editorialImage}
              alt="مجموعة Futami DESIGNS"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          {/* Content — right side (desktop) / below image centered (mobile) */}
          <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-right px-6 sm:px-12 lg:px-16 xl:px-20 py-10 sm:py-12 lg:py-16 order-2">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-taupe/60" />
              <p className="text-xs tracking-luxe-wide text-taupe font-medium">
                إصدار محدود
              </p>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[2.75rem] font-bold mb-5 leading-[1.15] text-cream">
              {editorialTitle}
            </h2>
            <p className="text-cream/65 leading-[1.8] mb-8 max-w-md text-sm sm:text-base font-light">
              {editorialDescription}
            </p>
            <button
              onClick={() => setView("shop")}
              className="group inline-flex items-center gap-2.5 bg-cream text-charcoal px-8 py-4 text-sm font-medium w-fit hover:bg-cream/90 transition-all duration-300 rounded-full"
            >
              {editorialCtaText}
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter — warm beige background */}
      <section className="bg-beige border-t border-hairline">
        <div className="container-narrow py-16 sm:py-20 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-brown/40" />
            <p className="text-xs tracking-luxe-wide text-brown font-medium">
              انضمي إلى عائلة Futami
            </p>
            <span className="h-px w-8 bg-brown/40" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 text-charcoal">
            كوني أول من يعلم
          </h2>
          <p className="text-muted-brand mb-8 max-w-md mx-auto text-base leading-relaxed">
            اشتركي في نشرتنا البريدية لتصلك أحدث المجموعات والعروض الخاصة
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("شكراً لاشتراكك!");
            }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-0 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="أدخلي بريدك الإلكتروني"
              className="flex-1 h-16 sm:h-12 px-6 sm:px-5 bg-surface border border-hairline rounded-full sm:rounded-l-full sm:rounded-r-none text-base sm:text-sm text-charcoal placeholder:text-muted-brand placeholder:text-base outline-none focus:ring-1 focus:ring-brown"
            />
            <button className="h-16 sm:h-12 px-8 bg-charcoal text-cream text-sm font-medium hover:bg-dark-brown transition-colors whitespace-nowrap rounded-full sm:rounded-r-full sm:rounded-l-none">
              اشتركي الآن
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}