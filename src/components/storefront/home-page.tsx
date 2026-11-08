"use client";

import { Hero } from "@/components/storefront/hero";
import { FeaturedCollections } from "@/components/storefront/featured-collections";
import { ProductRail } from "@/components/storefront/product-rail";
import { useCatalog } from "@/components/storefront/catalog-provider";
import { useUI } from "@/store";
import { images } from "@/data/catalog";
import { ArrowLeft } from "lucide-react";

export function HomePage() {
  const { products } = useCatalog();
  const newArrivals = products.filter((p) => p.newArrival && p.active).slice(0, 4);
  const bestSellers = products.filter((p) => p.bestSeller && p.active).slice(0, 4);
  const { setView } = useUI();

  return (
    <div className="bg-background">
      <Hero />

      {/* Brand intro strip */}
      <section className="border-y border-border bg-secondary/30 py-8">
        <div className="container-luxe">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <BrandValue text="تصاميم حصرية" />
            <BrandValue text="خامات فاخرة" />
            <BrandValue text="شحن سريع لكل الكويت" />
            <BrandValue text="دفع آمن" />
          </div>
        </div>
      </section>

      <FeaturedCollections />

      <ProductRail
        title="وصل حديثاً"
        eyebrow="اكتشفي الجديد"
        products={newArrivals}
      />

      {/* Editorial banner */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative h-[360px] lg:h-[560px]">
            <img
              src={images.hero2}
              alt="مجموعة FATAMI"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
          </div>
          <div className="flex flex-col justify-center px-8 sm:px-16 py-16 lg:py-24">
            <p className="text-xs tracking-luxe-wide uppercase text-white/60 mb-4">
              إصدار محدود
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              الأناقة الخالدة
              <br />
              تليق بكِ
            </h2>
            <p className="text-white/70 leading-relaxed mb-8 max-w-md">
              اكتشفي مجموعتنا الفاخرة من التصاميم الحصرية، حيث تلتقي الأصالة
              باللمسة العصرية في كل تفصيل.
            </p>
            <button
              onClick={() => setView("shop")}
              className="group inline-flex items-center gap-2 bg-white text-black px-8 py-4 text-sm tracking-luxe uppercase font-medium w-fit hover:bg-white/90 transition-colors"
            >
              تسوقي المجموعة
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      <ProductRail
        title="الأكثر مبيعاً"
        eyebrow="اختيارات عملائنا"
        products={bestSellers}
      />

      {/* Newsletter */}
      <section className="bg-background py-20 border-t border-border">
        <div className="container-narrow text-center">
          <p className="text-xs tracking-luxe-wide uppercase text-muted-foreground mb-3">
            انضمي إلى عائلة FATAMI
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            كوني أول من يعلم
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            اشتركي في نشرتنا لتصلك أحدث الإصدارات والعروض الحصرية أولاً بأول.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("شكراً لاشتراكك!");
            }}
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="بريدك الإلكتروني"
              className="flex-1 h-12 px-4 bg-secondary border-0 focus:ring-1 focus:ring-ring outline-none"
            />
            <button className="h-12 px-8 bg-foreground text-background text-sm tracking-luxe uppercase hover:bg-foreground/90 whitespace-nowrap">
              اشتراك
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function BrandValue({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-sm font-medium tracking-luxe uppercase">{text}</span>
    </div>
  );
}
