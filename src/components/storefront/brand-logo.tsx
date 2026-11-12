// ─── src/components/storefront/brand-logo.tsx ───
"use client";

import { useCatalog } from "@/components/storefront/catalog-provider";
import { cn } from "@/lib/utils";

// ─── هوية العلامة: اللوجو جنب الكلمة النصية كمجموعة أفقية واحدة ───
// الشكل النهائي: [اللوجو] FATAMI DESIGNS — جنب بعض في سطر واحد،
// واللوجو متوسّط عمودياً بالنسبة للسطرين معاً، بدون أي حاوية أو
// إطار أو خلفية حوالين اللوجو (اتشالت البوردر والصندوق الأبيض).
// اللوجو بحجم صغير متناسب مع الكلمة، وobject-contain بدون تشويه أو قص.
// "صُنع في الكويت" بتظهر تحت المجموعة كلها من الهيدر، والهيدر نفسه ما اتغيرش.

interface BrandLogoProps {
  /** sm للهيدر والفوتر */
  size?: "sm" | "lg";
  /** light للخلفيات الداكنة (الفوتر) */
  tone?: "dark" | "light";
  className?: string;
}

export function BrandLogo({ size = "sm", tone = "dark", className }: BrandLogoProps) {
  const { storefront } = useCatalog();
  const logo = storefront?.logoImage ?? null;

  // ارتفاع اللوجو — صغير ومتناسب مع كتلة الكلمة (سطرَي FATAMI + DESIGNS)
  const logoSize = size === "lg" ? "h-14 sm:h-16" : "h-9 sm:h-10";

  return (
    <span className={cn("flex flex-col items-center leading-none", className)}>
      <span className="flex items-center gap-2.5" dir="ltr">
        {/* اللوجو — قاعد جنب الكلمة مباشرة، بدون حاوية ولا إطار.
            w-auto + object-contain: العرض بيتحسب من أبعاد الصورة الأصلية
            فمفيش تشويه ولا قص، وrounded-lg بيدوّر أطراف الصورة نفسها بشوية
            خفيفة (مش صندوق)، وmix-blend-multiply بيلغي أي خلفية بيضا
            حوالين الرسمة على خلفية الهيدر الفاتحة */}
        {logo && (
          <img
            src={logo}
            alt="FATAMI DESIGNS"
            className={cn(
              logoSize,
              "w-auto object-contain rounded-lg",
              tone === "light" ? "brightness-0 invert" : "mix-blend-multiply"
            )}
          />
        )}

        {/* الكلمة النصية — ثابتة زي ما هي بالظبط */}
        <span className="flex flex-col">
          <span
            className={cn(
              "font-bold tracking-luxe-wide",
              size === "lg" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
              tone === "light" ? "text-cream" : "text-charcoal"
            )}
          >
            FATAMI
          </span>
          <span className="mt-1 text-[9px] sm:text-[10px] tracking-luxe-wide text-taupe">
            DESIGNS
          </span>
        </span>
      </span>
    </span>
  );
}