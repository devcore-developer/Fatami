// ─── src/components/storefront/header.tsx ───
// بنية الهيدر الصحيحة (بالترتيب):
//   1) شريط الهوية العلوي: اللوجو في المنتصف + "صُنع في الكويت" تحته،
//      البحث والسلة على الشمال وقائمة الموبايل على اليمين — نفس مواضعهما السابقة.
//   2) شريط التنقل: روابط التنقل بنفس التصميم السابق، مباشرة تحت شريط الهوية.
// الهيرو يبدأ مباشرة بعد الهيدر — تم حذف قسم اللوجو المكرر فوق الهيرو نهائياً.

"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useCart, useUI } from "@/store";
import { useCatalog } from "@/components/storefront/catalog-provider";
import { BrandLogo } from "@/components/storefront/brand-logo";
import { CONTACT } from "@/lib/contact";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function StorefrontHeader() {
  const { openCart, itemCount } = useCart();
  const {
    setMenuOpen,
    isMenuOpen,
    setView,
    openCategory,
    setSearchOpen,
    isSearchOpen,
    setSearchQuery,
  } = useUI();
  const { categories } = useCatalog();
  const count = itemCount();
  const [localQuery, setLocalQuery] = useState("");

  // شارة عداد السلة بتظهر بعد أول تثبيت للصفحة في المتصفح فقط — عشان نتفادى
  // تحذير Hydration: السلة بتتقرا من localStorage والمش متاحة للسيرفر وقت الـ SSR
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const goHome = () => setView("home");
  const goShop = () => {
    useUI.setState({ activeCategoryId: null });
    setView("shop");
  };

  // Build nav from actual categories — الرئيسية, جميع المنتجات, then categories, then عن Futami
  const navItems = [
    { label: "الرئيسية", action: goHome },
    { label: "جميع المنتجات", action: goShop },
    ...categories.slice(0, 5).map((c) => ({
      label: c.nameAr,
      action: () => openCategory(c.id),
    })),
    { label: "عن Futami", action: () => setView("about") },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline bg-cream">
      <div className="container-luxe">
        {/* ── 1) Top Branding Bar — اللوجو في النص، مستقل تماماً عن أزرار الجوانب ── */}
        <div className="flex items-center py-2 sm:py-2.5">
          {/* يمين (RTL): قائمة الموبايل — نفس موضعها السابق */}
          <div className="flex items-center flex-1">
            <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="inline-flex items-center justify-center h-10 w-10 -mr-1 hover:bg-beige transition-colors rounded-lg"
                  aria-label="القائمة"
                >
                  <Menu className="h-5 w-5 text-charcoal" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 bg-cream">
                <SheetHeader className="px-6 pt-7 pb-4 border-b border-hairline">
                  <SheetTitle className="text-right text-base font-bold text-charcoal">
                    القائمة
                  </SheetTitle>
                </SheetHeader>
                <nav className="px-6 py-4 space-y-0.5">
                  <MenuLink onClick={() => { goHome(); setMenuOpen(false); }}>
                    الرئيسية
                  </MenuLink>
                  <MenuLink onClick={() => { goShop(); setMenuOpen(false); }}>
                    جميع المنتجات
                  </MenuLink>
                  <div className="pt-4 pb-1.5">
                    <p className="text-[10px] text-muted-brand tracking-luxe uppercase">
                      التشكيلات
                    </p>
                  </div>
                  {categories.map((c) => (
                    <MenuLink
                      key={c.id}
                      onClick={() => {
                        openCategory(c.id);
                        setMenuOpen(false);
                      }}
                    >
                      {c.nameAr}
                    </MenuLink>
                  ))}
                  <div className="pt-4 pb-1.5">
                    <p className="text-[10px] text-muted-brand tracking-luxe uppercase">
                      عن المتجر
                    </p>
                  </div>
                  <MenuLink onClick={() => { setView("contact"); setMenuOpen(false); }}>
                    تواصل معنا
                  </MenuLink>
                  <MenuLink onClick={() => { setView("size-guide"); setMenuOpen(false); }}>
                    دليل المقاسات
                  </MenuLink>
                  <MenuLink onClick={() => { setView("returns"); setMenuOpen(false); }}>
                    الإرجاع والاستبدال
                  </MenuLink>
                  <MenuLink onClick={() => { setView("order-tracking"); setMenuOpen(false); }}>
                    تتبع الطلب
                  </MenuLink>
                </nav>
                <div className="px-6 py-5 border-t border-hairline mt-2">
                  <p className="text-[10px] text-muted-brand mb-2.5 tracking-luxe uppercase">
                    تواصل
                  </p>
                  <a
                    href={`tel:${CONTACT.phoneTel}`}
                    className="block text-sm mb-1.5 text-charcoal hover:text-brown transition-colors"
                    dir="ltr"
                  >
                    {CONTACT.phoneDisplay}
                  </a>
                  <a
                    href={CONTACT.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm mb-1.5 text-charcoal hover:text-brown transition-colors"
                    dir="ltr"
                  >
                    {CONTACT.phoneDisplay} <span className="text-[10px] text-muted-brand">(واتساب)</span>
                  </a>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="block text-sm text-muted-brand hover:text-brown transition-colors"
                    dir="ltr"
                  >
                    {CONTACT.email}
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* المنتصف: اللوجو + "صُنع في الكويت" تحته — في النص على الموبايل والديسكتوب */}
          <button
            onClick={goHome}
            className="flex flex-col items-center justify-center shrink-0 px-2"
            aria-label="Futami DESIGNS"
          >
            <BrandLogo size="sm" />
            <span className="mt-1 text-[9px] sm:text-[10px] font-medium tracking-wide text-brown/80">
              صُنع في الكويت
            </span>
          </button>

          {/* شمال (RTL): البحث + السلة — نفس موضعها السابق */}
          <div className="flex items-center flex-1 justify-end">
            <button
              onClick={() => setSearchOpen(!isSearchOpen)}
              className="inline-flex items-center justify-center h-10 w-10 hover:bg-beige transition-colors rounded-lg"
              aria-label="بحث"
            >
              {isSearchOpen ? <X className="h-5 w-5 text-charcoal" /> : <Search className="h-5 w-5 text-charcoal" />}
            </button>
            <button
              onClick={openCart}
              className="relative inline-flex items-center justify-center h-10 w-10 hover:bg-beige transition-colors rounded-lg"
              aria-label="سلة التسوق"
            >
              <ShoppingBag className="h-5 w-5 text-charcoal" />
              {mounted && count > 0 && (
                <span className="absolute top-0.5 left-0.5 bg-brown text-cream text-[10px] font-medium h-[18px] min-w-[18px] px-1 flex items-center justify-center rounded-full">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {isSearchOpen && (
          <div className="pb-3 animate-fade-up">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchQuery(localQuery);
                setSearchOpen(false);
                goShop();
              }}
              className="relative"
            >
              <input
                autoFocus
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="ابحثي عن منتج..."
                className="w-full h-11 bg-surface border border-hairline px-4 pr-10 text-sm outline-none focus:ring-1 focus:ring-brown rounded-lg"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-brand" />
            </form>
          </div>
        )}

        {/* ── 2) Navigation Bar — مباشرة تحت شريط الهوية، بنفس التصميم والروابط السابقة ── */}
        <nav className="hidden lg:flex items-center justify-center gap-8 h-12 border-t border-hairline">
          {navItems.map((item, i) => (
            <NavBtn key={i} onClick={item.action}>
              {item.label}
            </NavBtn>
          ))}
        </nav>
      </div>
    </header>
  );
}

function NavBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[13px] text-muted-brand hover:text-charcoal transition-colors py-1 px-3 rounded-full hover:bg-beige/60"
    >
      {children}
    </button>
  );
}

function MenuLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="block w-full text-right py-2.5 px-0 text-sm hover:text-brown text-charcoal/85 transition-colors"
    >
      {children}
    </button>
  );
}