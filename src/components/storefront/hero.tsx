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
    <section className="relative w-full overflow-hidden bg-cream">
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <img
          src={heroImage}
          alt=""
          className="w-full h-full object-cover object-[75%_center] scale-110 blur-3xl opacity-20"
        />
      </div>

      <div className="absolute inset-0 z-10 hidden lg:block">
        <img
          src={heroImage}
          alt="FATAMI DESIGNS — مجموعة خريف ٢٠٢٦"
          className="w-full h-full object-cover object-[26%_center] hero-mask-horizontal"
        />
      </div>

      <div className="absolute inset-0 z-10 lg:hidden h-[320px] sm:h-[400px]">
        <img
          src={heroImage}
          alt="FATAMI DESIGNS — مجموعة خريف ٢٠٢٦"
          className="w-full h-full object-cover object-[30%_center] hero-mask-vertical"
        />
      </div>

      <div className="absolute inset-0 z-10 hidden lg:block bg-gradient-to-r from-transparent via-transparent to-cream/30 pointer-events-none" />

      <div className="relative z-20 container-luxe lg:min-h-[600px] flex items-center pt-4 pb-12 lg:py-0">
        <div className="w-full lg:w-[40%] lg:ml-auto">
          <div className="max-w-md animate-fade-up">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-brown/50" />
              <p className="text-xs tracking-luxe-wide text-brown font-medium">
                {heroCollectionLabel}
              </p>
            </div>

            <h1 className="text-[1.85rem] sm:text-4xl lg:text-[3.25rem] xl:text-[3.75rem] font-bold leading-[1.15] mb-5 text-charcoal">
              {heroTitle}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-muted-brand leading-[1.85] mb-8 max-w-sm">
              {heroDescription}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setView("shop")}
                className="group inline-flex items-center justify-center gap-2.5 bg-charcoal text-cream px-8 py-4 text-sm font-medium hover:bg-dark-brown transition-all duration-300 rounded-full"
              >
                {heroPrimaryCtaText}
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1.5" />
              </button>
              <button
                onClick={() => openCategory("cat-abayas")}
                className="inline-flex items-center justify-center border border-brown text-brown px-8 py-4 text-sm font-medium hover:bg-brown hover:text-cream transition-all duration-300 rounded-full"
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