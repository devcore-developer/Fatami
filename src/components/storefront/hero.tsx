"use client";

import { ArrowLeft } from "lucide-react";
import { useUI } from "@/store";
import { images } from "@/data/catalog";

export function Hero() {
  const { setView } = useUI();
  return (
    <section className="relative w-full bg-black text-white overflow-hidden">
      <div className="relative h-[88vh] min-h-[560px] max-h-[820px] w-full">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={images.hero}
            alt="FATAMI DESIGNS - مجموعة جديدة"
            className="w-full h-full object-cover object-center opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />
        </div>

        {/* Content */}
        <div className="relative h-full container-luxe flex flex-col justify-end pb-20 sm:pb-28">
          <div className="max-w-xl animate-fade-up">
            <p className="text-xs sm:text-sm tracking-luxe-wide text-white/70 mb-4 uppercase">
              مجموعة خريف ٢٠٢٦
            </p>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
              الأناقة في أبسط صورها
            </h1>
            <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-8 max-w-lg">
              تصاميم خالدة تجمع بين الفخامة والبساطة. اكتشفي مجموعتنا الجديدة من
              الأزياء النسائية الراقية، المصممة بعناية للمرأة العصرية.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setView("shop")}
                className="group inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 text-sm tracking-luxe uppercase font-medium hover:bg-white/90 transition-colors"
              >
                تسوقي الآن
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </button>
              <button
                onClick={() => useUI.getState().openCategory("cat-abayas")}
                className="inline-flex items-center justify-center border border-white/40 text-white px-8 py-4 text-sm tracking-luxe uppercase font-medium hover:bg-white/10 transition-colors"
              >
                العبايات
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
