"use client";

import { ShoppingBag, Search, Menu, X, User } from "lucide-react";
import { useCart, useUI } from "@/store";
import { storeSettings } from "@/data/catalog";
import { useCatalog } from "@/components/storefront/catalog-provider";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function StorefrontHeader() {
  const { openCart, itemCount } = useCart();
  const { setMenuOpen, isMenuOpen, setView, openCategory, setSearchOpen, isSearchOpen, searchQuery, setSearchQuery } =
    useUI();
  const { categories } = useCatalog();
  const count = itemCount();
  const [localQuery, setLocalQuery] = useState("");

  const goHome = () => setView("home");
  const goShop = () => {
    useUI.setState({ activeCategoryId: null });
    setView("shop");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container-luxe">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
          {/* Right (RTL): menu trigger */}
          <div className="flex items-center gap-2 flex-1">
            <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="inline-flex items-center justify-center h-10 w-10 -mr-2 hover:bg-secondary transition-colors"
                  aria-label="القائمة"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0">
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
                  <SheetTitle className="text-right text-lg tracking-luxe">
                    القائمة
                  </SheetTitle>
                </SheetHeader>
                <nav className="px-6 py-4 space-y-1">
                  <MenuLink onClick={() => { goHome(); setMenuOpen(false); }}>
                    الرئيسية
                  </MenuLink>
                  <MenuLink onClick={() => { goShop(); setMenuOpen(false); }}>
                    جميع المنتجات
                  </MenuLink>
                  <div className="pt-3 pb-1">
                    <p className="text-xs text-muted-foreground tracking-luxe uppercase mb-2">
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
                  <div className="pt-3 pb-1">
                    <p className="text-xs text-muted-foreground tracking-luxe uppercase mb-2">
                      عن المتجر
                    </p>
                  </div>
                  <MenuLink onClick={() => { setView("about"); setMenuOpen(false); }}>
                    عن FATAMI
                  </MenuLink>
                  <MenuLink onClick={() => { setView("contact"); setMenuOpen(false); }}>
                    تواصل معنا
                  </MenuLink>
                  <MenuLink onClick={() => { setView("size-guide"); setMenuOpen(false); }}>
                    دليل المقاسات
                  </MenuLink>
                  <MenuLink onClick={() => { setView("shipping-info"); setMenuOpen(false); }}>
                    الشحن والتوصيل
                  </MenuLink>
                  <MenuLink onClick={() => { setView("returns"); setMenuOpen(false); }}>
                    الإرجاع والاستبدال
                  </MenuLink>
                  <MenuLink onClick={() => { setView("order-tracking"); setMenuOpen(false); }}>
                    تتبع الطلب
                  </MenuLink>
                </nav>
                <div className="px-6 py-4 border-t border-border mt-2">
                  <p className="text-xs text-muted-foreground mb-2 tracking-luxe uppercase">
                    تواصل
                  </p>
                  <p className="text-sm">{storeSettings.phone}</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">{storeSettings.email}</p>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Center: brand */}
          <button
            onClick={goHome}
            className="flex flex-col items-center justify-center shrink-0 group"
            aria-label="FATAMI DESIGNS"
          >
            <span className="text-xl sm:text-2xl font-bold tracking-luxe-wide leading-none">
              FATAMI
            </span>
            <span className="text-[10px] sm:text-[11px] tracking-luxe-wide text-muted-foreground mt-1">
              DESIGNS
            </span>
          </button>

          {/* Left (RTL): actions */}
          <div className="flex items-center gap-1 flex-1 justify-end">
            <button
              onClick={() => setSearchOpen(!isSearchOpen)}
              className="inline-flex items-center justify-center h-10 w-10 hover:bg-secondary transition-colors"
              aria-label="بحث"
            >
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setView("order-tracking")}
              className="hidden sm:inline-flex items-center justify-center h-10 w-10 hover:bg-secondary transition-colors"
              aria-label="الحساب"
            >
              <User className="h-5 w-5" />
            </button>
            <button
              onClick={openCart}
              className="relative inline-flex items-center justify-center h-10 w-10 hover:bg-secondary transition-colors"
              aria-label="سلة التسوق"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -left-0.5 bg-black text-white text-[10px] font-medium h-4 min-w-4 px-1 flex items-center justify-center rounded-full">
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
                className="w-full h-11 bg-secondary border-0 px-4 pr-10 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </form>
          </div>
        )}

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center justify-center gap-8 h-12 border-t border-border">
          <NavBtn onClick={goHome}>الرئيسية</NavBtn>
          <NavBtn onClick={goShop}>جميع المنتجات</NavBtn>
          {categories.slice(0, 5).map((c) => (
            <NavBtn key={c.id} onClick={() => openCategory(c.id)}>
              {c.nameAr}
            </NavBtn>
          ))}
          <NavBtn onClick={() => setView("about")}>عن FATAMI</NavBtn>
        </nav>
      </div>
    </header>
  );
}

function NavBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-sm tracking-luxe uppercase text-foreground/80 hover:text-foreground transition-colors py-1 border-b border-transparent hover:border-foreground"
    >
      {children}
    </button>
  );
}

function MenuLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="block w-full text-right py-2.5 px-3 text-sm hover:bg-secondary transition-colors"
    >
      {children}
    </button>
  );
}
