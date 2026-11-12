// ─── src/components/storefront/whatsapp-float.tsx ───
"use client";

import { WhatsAppIcon } from "@/components/icons/brand-icons";
import { CONTACT } from "@/lib/contact";

// ─── زر الواتساب العائم ───
// ثابت أسفل الشاشة في كل صفحات المتجر، يفتح محادثة واتساب مباشرة
// مع رقم المتجر. اللون الأخضر الرسمي للواتساب مع لمسة hover أنيقة.

export function WhatsAppFloat() {
  return (
    <a
      href={CONTACT.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصلي معنا على واتساب"
      className="fixed bottom-5 left-5 z-40 group"
    >
      {/* فقاعة التسمية — تظهر على hover في الديسكتوب */}
      <span className="hidden sm:flex absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap bg-charcoal text-cream text-xs px-3 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
        تواصلي معنا على واتساب
      </span>

      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform duration-300 group-hover:scale-110">
        <WhatsAppIcon className="h-7 w-7" />
      </span>
    </a>
  );
}