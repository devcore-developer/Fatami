"use client";

import { ArrowLeft } from "lucide-react";
import { useUI } from "@/store";
import { images } from "@/data/catalog";
import { useEffect, useState } from "react";

interface HeroContent {
  heroImage?: string | null;
  heroTitle?: string;
  heroDescription?: string;
  heroCollectionLabel?: string;
  heroPrimaryCtaText?: string;
  heroSecondaryCtaText?: string;
}

export function Hero() {
  const { setView, openCategory } = useUI();
  const [content, setContent] = useState<HeroContent>({});

  useEffect(() => {
    fetch("/api/storefront")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setContent(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const heroImage = content.heroImage || images.hero;
  const heroTitle = content.heroTitle || "الأناقة في أبسط صورها";
  const heroDescription = content.heroDescription || "تصاميم خالدة تجمع بين الفخامة والبساطة، مصممة بعناية للمرأة العصرية التي تقدّر التفاصيل.";
  const heroCollectionLabel = content.heroCollectionLabel || "مجموعة خريف ٢٠٢٦";
  const heroPrimaryCtaText = content.heroPrimaryCtaText || "تسوقي الآن";
  const heroSecondaryCtaText = content.heroSecondaryCtaText || "العبايات";

  return (
    <section className="relative w-full overflow-hidden bg-cream lg:min-h-[600px]">
      {/* ── Desktop layers (hidden on mobile) ── */}
      <div className="absolute inset-0 z-0 hidden lg:block" aria-hidden="true">
        <img src={heroImage} alt="" className="w-full h-full object-cover object-[75%_center] scale-110 blur-3xl opacity-20" />
      </div>
      <div className="absolute inset-0 z-10 hidden lg:block">
        <img src={heroImage} alt="FATAMI DESIGNS" className="w-full h-full object-cover object-[26%_center] hero-mask-horizontal" />
      </div>
      <div className="absolute inset-0 z-10 hidden lg:block bg-gradient-to-r from-transparent via-transparent to-cream/30 pointer-events-none" />

      {/* ── Mobile: Image on top (portrait ratio), NO overlap with text ── */}
      <div className="lg:hidden relative w-full h-[420px] overflow-hidden">
        <img src={heroImage} alt="FATAMI DESIGNS" className="w-full h-full object-cover object-[center_30%]" />
        {/* Subtle fade at bottom into cream */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-cream" />
      </div>

      {/* ── Text content ── */}
      {/* Desktop: absolute overlay with right-aligned content | Mobile: below image on cream */}
      <div className="relative z-20 container-luxe lg:min-h-[600px] lg:absolute lg:inset-0 lg:flex lg:items-center pt-6 pb-10 lg:py-0">
        <div className="w-full lg:w-[50%] lg:ml-auto">
          <div className="max-w-xl animate-fade-up">
            {/* Collection label */}
            <div className="flex items-center gap-3 mb-4 lg:mb-6">
              <span className="h-px w-10 bg-brown/50" />
              <p className="text-xs tracking-luxe-wide text-brown font-medium">
                {heroCollectionLabel}
              </p>
            </div>

            {/* Main heading */}
            <h1 className="text-[1.75rem] sm:text-4xl lg:text-[4rem] xl:text-[4.5rem] font-bold leading-[1.15] mb-4 lg:mb-6 text-charcoal whitespace-nowrap lg:whitespace-nowrap">
              {heroTitle}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-brand leading-[1.7] mb-6 lg:mb-10 max-w-lg line-clamp-2">
              {heroDescription}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <button
                onClick={() => setView("shop")}
                className="group inline-flex items-center justify-center gap-2.5 bg-charcoal text-cream px-8 py-4 lg:px-10 lg:py-5 text-sm lg:text-base font-medium hover:bg-dark-brown transition-all duration-300 rounded-full"
              >
                {heroPrimaryCtaText}
                <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5 transition-transform duration-300 group-hover:-translate-x-1.5" />
              </button>
              <button
                onClick={() => openCategory("cat-abayas")}
                className="inline-flex items-center justify-center border border-brown text-brown px-8 py-4 lg:px-10 lg:py-5 text-sm lg:text-base font-medium hover:bg-brown hover:text-cream transition-all duration-300 rounded-full"
              >
                {heroSecondaryCtaText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}