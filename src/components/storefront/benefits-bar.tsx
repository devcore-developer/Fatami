"use client";

import { Gem, Truck, Shield, CreditCard } from "lucide-react";

export function BenefitsBar() {
  const benefits = [
    { icon: <Gem className="h-5 w-5" />, text: "تصاميم حصرية", sub: "قطع فريدة" },
    { icon: <Shield className="h-5 w-5" />, text: "خامات فاخرة", sub: "جودة عالية" },
    { icon: <Truck className="h-5 w-5" />, text: "شحن سريع لكل الكويت", sub: "1-3 أيام" },
    { icon: <CreditCard className="h-5 w-5" />, text: "دفع آمن ومشفر", sub: "UPayments" },
  ];
  return (
    <section className="bg-cream -mt-px">
      <div className="container-luxe py-6 sm:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="group flex flex-col items-center text-center gap-3 bg-surface border border-hairline rounded-2xl px-4 py-6 sm:py-7 hover:border-brown/30 hover:shadow-sm transition-all duration-300"
            >
              {/* Circular icon container */}
              <span className="flex items-center justify-center h-12 w-12 rounded-full bg-beige text-brown group-hover:bg-brown group-hover:text-cream transition-colors duration-300">
                {b.icon}
              </span>
              {/* Text */}
              <div>
                <p className="text-xs sm:text-sm font-semibold text-charcoal leading-snug">
                  {b.text}
                </p>
                <p className="text-[10px] sm:text-[11px] text-muted-brand mt-1 font-light">
                  {b.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}