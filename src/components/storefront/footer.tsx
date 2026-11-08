"use client";

import { Instagram, Mail, Phone } from "lucide-react";
import { useUI } from "@/store";
import { categories, storeSettings } from "@/data/catalog";

export function StorefrontFooter() {
  const { setView, openCategory } = useUI();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-white mt-auto">
      <div className="container-luxe py-14 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-luxe-wide">FATAMI</span>
              <span className="text-[11px] tracking-luxe-wide text-white/60 mt-1">
                DESIGNS
              </span>
            </div>
            <p className="text-sm text-white/60 mt-4 leading-relaxed max-w-xs">
              علامة أزياء كويتية فاخرة. نصمم قطعاً خالدة تجمع بين الأصالة والمعاصرة،
              بجودة عالية وأناقة لا تُضاهى.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs tracking-luxe uppercase text-white/40 mb-4">
              تسوقي
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => {
                    useUI.setState({ activeCategoryId: null });
                    setView("shop");
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  جميع المنتجات
                </button>
              </li>
              {categories.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => openCategory(c.id)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {c.nameAr}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs tracking-luxe uppercase text-white/40 mb-4">
              المساعدة
            </h4>
            <ul className="space-y-3 text-sm">
              <li><FooterLink onClick={() => setView("size-guide")}>دليل المقاسات</FooterLink></li>
              <li><FooterLink onClick={() => setView("shipping-info")}>الشحن والتوصيل</FooterLink></li>
              <li><FooterLink onClick={() => setView("returns")}>الإرجاع والاستبدال</FooterLink></li>
              <li><FooterLink onClick={() => setView("order-tracking")}>تتبع الطلب</FooterLink></li>
              <li><FooterLink onClick={() => setView("contact")}>تواصل معنا</FooterLink></li>
              <li><FooterLink onClick={() => setView("privacy")}>سياسة الخصوصية</FooterLink></li>
              <li><FooterLink onClick={() => setView("terms")}>الشروط والأحكام</FooterLink></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-luxe uppercase text-white/40 mb-4">
              تواصل
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`https://wa.me/${storeSettings.whatsapp?.replace(/\D/g, "")}`}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                  dir="ltr"
                >
                  <Phone className="h-4 w-4" /> {storeSettings.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${storeSettings.email}`}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                  dir="ltr"
                >
                  <Mail className="h-4 w-4" /> {storeSettings.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://instagram.com/${storeSettings.instagram}`}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                  dir="ltr"
                >
                  <Instagram className="h-4 w-4" /> @{storeSettings.instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 text-center sm:text-right">
            © {year} FATAMI DESIGNS — جميع الحقوق محفوظة
          </p>
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span>الدفع الآمن عبر</span>
            <span className="px-2 py-1 border border-white/20 tracking-luxe">UPAYMENTS</span>
            <button
              onClick={() => useUI.getState().setView("admin")}
              className="text-white/30 hover:text-white/60 transition-colors"
              title="لوحة الإدارة"
            >
              إدارة
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-white/80 hover:text-white transition-colors"
    >
      {children}
    </button>
  );
}
