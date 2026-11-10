"use client";

import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useUI } from "@/store";
import { categories, storeSettings } from "@/data/catalog";

export function StorefrontFooter() {
  const { setView, openCategory } = useUI();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-cream mt-auto">
      <div className="container-luxe py-14 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex flex-col mb-5">
              <span className="text-2xl font-bold tracking-luxe-wide leading-none text-cream">FATAMI</span>
              <span className="text-[10px] tracking-luxe-wide text-taupe mt-1.5">DESIGNS</span>
            </div>
            <p className="text-sm text-cream/55 leading-[1.8] max-w-xs font-light">
              علامة أزياء كويتية فاخرة. نصمم قطعاً خالدة تجمع بين الأصالة والمعاصرة،
              بجودة عالية وأناقة لا تُضاهى.
            </p>
          </div>

          {/* Quick navigation */}
          <div>
            <h4 className="text-xs tracking-luxe text-taupe mb-5 font-medium">تسوقي</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => { useUI.setState({ activeCategoryId: null }); setView("shop"); }}
                  className="text-cream/70 hover:text-cream transition-colors"
                >
                  جميع المنتجات
                </button>
              </li>
              {categories.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => openCategory(c.id)}
                    className="text-cream/70 hover:text-cream transition-colors"
                  >
                    {c.nameAr}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h4 className="text-xs tracking-luxe text-taupe mb-5 font-medium">خدمة العملاء</h4>
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
            <h4 className="text-xs tracking-luxe text-taupe mb-5 font-medium">تواصل</h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-center gap-2.5 text-cream/70">
                <MapPin className="h-4 w-4 shrink-0 text-taupe" />
                <span>الكويت</span>
              </li>
              <li>
                <a href={`https://wa.me/${storeSettings.whatsapp?.replace(/\D/g, "")}`} className="flex items-center gap-2.5 text-cream/70 hover:text-cream transition-colors" dir="ltr">
                  <Phone className="h-4 w-4 shrink-0 text-taupe" /> {storeSettings.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${storeSettings.email}`} className="flex items-center gap-2.5 text-cream/70 hover:text-cream transition-colors" dir="ltr">
                  <Mail className="h-4 w-4 shrink-0 text-taupe" /> {storeSettings.email}
                </a>
              </li>
              <li>
                <a href={`https://instagram.com/${storeSettings.instagram}`} className="flex items-center gap-2.5 text-cream/70 hover:text-cream transition-colors" dir="ltr">
                  <Instagram className="h-4 w-4 shrink-0 text-taupe" /> @{storeSettings.instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment method + copyright */}
        <div className="mt-12 pt-6 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream/40 text-center sm:text-right font-light">
            © {year} FATAMI DESIGNS — جميع الحقوق محفوظة
          </p>
          <div className="flex items-center gap-2.5 text-xs text-cream/40">
            <span className="hidden sm:inline">طريقة الدفع</span>
            <PaymentBadge label="تحويل بنكي" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function PaymentBadge({ label }: { label: string }) {
  return (
    <span className="px-2.5 py-1 border border-cream/20 text-[10px] font-medium text-cream/60 rounded-full">
      {label}
    </span>
  );
}

function FooterLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="text-cream/70 hover:text-cream transition-colors">
      {children}
    </button>
  );
}