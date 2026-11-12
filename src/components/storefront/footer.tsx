// ─── src/components/storefront/footer.tsx ───
"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { useUI } from "@/store";
import { useCatalog } from "@/components/storefront/catalog-provider";
import { BrandLogo } from "@/components/storefront/brand-logo";
import { InstagramIcon, TiktokIcon, SnapchatIcon, WhatsAppIcon } from "@/components/icons/brand-icons";
import { CONTACT, SOCIALS } from "@/lib/contact";

export function StorefrontFooter() {
  const { setView, openCategory } = useUI();
  const { categories } = useCatalog();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-cream mt-auto">
      <div className="container-luxe py-14 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <BrandLogo size="sm" tone="light" className="items-start" />
            </div>
            <p className="text-sm text-cream/55 leading-[1.8] max-w-xs font-light">
              علامة أزياء كويتية فاخرة. نصمم قطعاً خالدة تجمع بين الأصالة والمعاصرة،
              بجودة عالية وأناقة لا تُضاهى.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2.5 mt-6">
              {SOCIALS.filter((s) => s.id !== "whatsapp").map((s) => {
                const Icon =
                  s.id === "instagram"
                    ? InstagramIcon
                    : s.id === "tiktok"
                    ? TiktokIcon
                    : SnapchatIcon;
                return (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-cream/70 hover:text-cream hover:border-taupe hover:bg-cream/5 transition-all"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick navigation */}
          <div>
            <h4 className="text-xs tracking-luxe text-taupe mb-5 font-medium">
              تسوقي
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => {
                    useUI.setState({ activeCategoryId: null });
                    setView("shop");
                  }}
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
            <h4 className="text-xs tracking-luxe text-taupe mb-5 font-medium">
              خدمة العملاء
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
            <h4 className="text-xs tracking-luxe text-taupe mb-5 font-medium">
              تواصل
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-center gap-2.5 text-cream/70">
                <MapPin className="h-4 w-4 shrink-0 text-taupe" />
                <span>{CONTACT.location}</span>
              </li>
              <li>
                <a
                  href={CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-cream/70 hover:text-cream transition-colors"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0 text-taupe" />
                  <span dir="ltr">{CONTACT.phoneDisplay}</span>
                  <span className="text-[10px] text-taupe">(واتساب)</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT.phoneTel}`}
                  className="flex items-center gap-2.5 text-cream/70 hover:text-cream transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0 text-taupe" />
                  <span dir="ltr">{CONTACT.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center gap-2.5 text-cream/70 hover:text-cream transition-colors"
                >
                  <Mail className="h-4 w-4 shrink-0 text-taupe" />
                  <span dir="ltr">{CONTACT.email}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment methods + copyright */}
        <div className="mt-12 pt-6 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream/40 text-center sm:text-right font-light">
            © {year} Futami DESIGNS — جميع الحقوق محفوظة
          </p>
          <div className="flex items-center gap-2.5 text-xs text-cream/40">
            <span className="hidden sm:inline">طرق الدفع</span>
            <PaymentBadge label="WAMD" />
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
    <button
      onClick={onClick}
      className="text-cream/70 hover:text-cream transition-colors"
    >
      {children}
    </button>
  );
}