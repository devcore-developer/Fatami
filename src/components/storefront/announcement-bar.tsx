"use client";

import { Truck } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="bg-charcoal text-cream">
      <div className="container-luxe">
        <div className="flex items-center justify-center gap-2.5 py-2.5">
          <Truck className="h-3.5 w-3.5 text-taupe shrink-0" />
          <p className="text-[11px] sm:text-xs font-light text-cream/90">
            شحن مجاني للطلبات فوق ١٠٠ د.ك داخل الكويت
          </p>
        </div>
      </div>
    </div>
  );
}